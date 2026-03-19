# Guide: Image Pipeline

This guide explains how the cosmos-lib image pipeline resolves the best available image for any celestial object, how coordinate-based cutouts guarantee accuracy, and how to use prefetching for instant image loading.

---

## The Problem

Astronomical images are scattered across many sources (Wikimedia, NASA, ESA, MAST archives). Text-based searches (e.g. searching "Andromeda" on the NASA API) can return wrong or unrelated results. The image pipeline solves this by using **coordinate-based cutout services** that fetch images from exact sky positions -- mathematically guaranteeing the image shows the correct object.

---

## Quick Start

```ts
import { Data } from '@motioncomplex/cosmos-lib'

// Just works -- correct object, proper framing, auto-prefetches neighbors
const img = await Data.getImage('m42', 'Orion Nebula', { width: 1200 })

if (img) {
  heroEl.src = img.src
  heroEl.srcset = img.srcset ?? ''
  creditEl.textContent = img.credit
  console.log(img.source) // 'static' | 'panstarrs' | 'dss' | 'nasa' | 'esa'
}
```

No setup, no API keys, no CDN configuration needed.

---

## Source Cascade

`Data.getImage()` tries sources in priority order and returns the first successful result:

```mermaid
flowchart TD
    Call["Data.getImage('m42', 'Orion Nebula', { width: 1200 })"]
    Call --> Cache{"1. Cache"}
    Cache -->|Hit| Done["Return cached result (0ms)"]
    Cache -->|Miss| Wiki{"2. Wikimedia Static"}
    Wiki -->|"Entry exists + HEAD OK"| DoneWiki["Return curated image<br/>with srcset + placeholder"]
    Wiki -->|"No entry or failed"| PS1{"3. Pan-STARRS DR2"}
    PS1 -->|"dec > -30 + valid"| DonePS1["Return color JPEG cutout"]
    PS1 -->|"Out of range or failed"| DSS{"4. DSS (MAST)"}
    DSS -->|"HEAD OK"| DoneDSS["Return grayscale GIF cutout"]
    DSS -->|"Failed"| NASA{"5. NASA/ESA Text Search"}
    NASA -->|"Found"| DoneNASA["Return API result"]
    NASA -->|"Nothing"| Null["Return null"]

    DoneWiki --> Prefetch["Cache + auto-prefetch nearby"]
    DonePS1 --> Prefetch
    DoneDSS --> Prefetch
    DoneNASA --> Prefetch
    Prefetch --> Done2["Return to consumer"]

    style Done fill:#2d6a4f,color:#fff
    style DoneWiki fill:#2d6a4f,color:#fff
    style DonePS1 fill:#2d6a4f,color:#fff
    style DoneDSS fill:#2d6a4f,color:#fff
    style DoneNASA fill:#e9c46a,color:#000
    style Null fill:#d62828,color:#fff
    style Prefetch fill:#457b9d,color:#fff
```

### Source Details

| Source | How it works | Output | Coverage |
|---|---|---|---|
| **Wikimedia Static** | Hand-curated registry of iconic images. HEAD-validates the URL, generates responsive `srcset` and 64px placeholder. | `src` + `srcset` + `placeholder` | ~38 objects (solar system, top Messier, famous stars) |
| **Pan-STARRS DR2** | Fetches a color JPEG (g/r/i composite) from the exact RA/Dec coordinates. FOV is computed from the object's angular size. Uses a precomputed file list to skip the API's file-list step. | `src` only | All objects with dec > -30 (~75% of sky) |
| **DSS (MAST)** | Fetches a grayscale GIF from the Digitized Sky Survey at exact RA/Dec. Full-sky coverage including the southern hemisphere. | `src` only | Full sky |
| **NASA/ESA Text Search** | Searches by object name. Can return incorrect results for ambiguous names. Used only as a last resort for objects without coordinates (or when cutout APIs fail). | `src` only | Any searchable term |

---

## How Objects Are Routed

Different object types take different paths through the cascade:

```mermaid
flowchart LR
    subgraph Solar["Solar System (10)"]
        direction TB
        S1["No fixed RA/Dec"]
        S2["Cutouts skipped"]
        S3["Wikimedia static only"]
        S1 --> S2 --> S3
    end

    subgraph Messier["Messier (110)"]
        direction TB
        M1["RA/Dec + size_arcmin"]
        M2["FOV = size x 1.6"]
        M3["Wikimedia (22) then<br/>Pan-STARRS / DSS"]
        M1 --> M2 --> M3
    end

    subgraph Stars["Stars (166)"]
        direction TB
        ST1["RA/Dec, no angular size"]
        ST2["FOV = 15' default"]
        ST3["Wikimedia (7) then<br/>Pan-STARRS / DSS"]
        ST1 --> ST2 --> ST3
    end

    subgraph Deep["Deep-Sky (4 w/ coords)"]
        direction TB
        D1["RA/Dec + size_arcmin"]
        D2["FOV = size x 1.6"]
        D3["Wikimedia (3) then<br/>Pan-STARRS / DSS"]
        D1 --> D2 --> D3
    end

    style Solar fill:#264653,color:#fff
    style Messier fill:#2a9d8f,color:#fff
    style Stars fill:#e9c46a,color:#000
    style Deep fill:#e76f51,color:#fff
```

---

## Field of View Computation

For coordinate-based cutouts, the FOV determines how much sky is shown around the object. Too small and the object is clipped; too large and it's a tiny dot.

The pipeline computes FOV per-object using `computeFov()`:

```
FOV = clamp(size_arcmin * padding, minFov, maxFov)
```

| Parameter | Default | Description |
|---|---|---|
| `size_arcmin` | From catalog | Object's angular diameter. Available for all 110 Messier objects + 4 deep-sky extras. |
| `padding` | `1.6` | Multiplier to show context around the object. |
| `minFov` | `4'` | Floor for very compact objects (planetary nebulae, black holes). |
| `maxFov` | `120'` | Ceiling for very large objects (Andromeda at 190'). |

When `size_arcmin` is not available (stars, some extras), a type-based default is used:

| Type | Default FOV |
|---|---|
| `star` | 15' |
| `galaxy` | 12' |
| `nebula` | 20' |
| `cluster` | 20' |
| `black-hole` | 8' |

**Examples:**

| Object | size_arcmin | Computed FOV |
|---|---|---|
| M42 (Orion Nebula) | 85' | min(85 x 1.6, 120) = **120'** |
| M57 (Ring Nebula) | 1.4' | max(1.4 x 1.6, 4) = **4'** |
| M31 (Andromeda) | 190' | min(190 x 1.6, 120) = **120'** |
| Sirius (star) | -- | default **15'** |

---

## Performance: Prefetching

Cold image fetches (Pan-STARRS cutouts) take ~2-5 seconds. The library provides two mechanisms to hide this latency.

### Auto-Prefetch (Built-In)

When `Data.getImage()` resolves, it automatically finds nearby objects (within 5 degrees) and prefetches their images in the background. This means spatial browsing (M42 -> M43 -> M78) feels instant after the first image loads.

```ts
// First call: ~2-5s (cold fetch from Pan-STARRS)
const img = await Data.getImage('m42', 'Orion Nebula')
// Background: M43, M78, and 6 other nearby objects are now prefetching

// Second call: instant (M43 was auto-prefetched)
const img2 = await Data.getImage('m43', "De Mairan's Nebula")
```

Auto-prefetch is configurable:

```ts
// Wider radius, more neighbors
Data.getImage('m42', 'Orion Nebula', {
  prefetch: { radius: 10, limit: 12 }
})

// Disable auto-prefetch
Data.getImage('m42', 'Orion Nebula', { prefetch: false })
```

### Explicit Prefetch

For list views or search results, prefetch specific objects before the user taps them:

```ts
// When a filtered list renders, prefetch all visible objects
Data.prefetchImages(filteredObjects.map(o => o.id))

// When user taps any of them: instant
const img = await Data.getImage(obj.id, obj.name)
```

### Prefetch Lifecycle

```mermaid
sequenceDiagram
    participant App as Consumer App
    participant Lib as Data.getImage()
    participant Cache as Cache
    participant API as Pan-STARRS

    Note over App: List view renders
    App->>Lib: prefetchImages(['m1','m2','m3'])
    Lib->>Cache: m1 miss, m2 miss, m3 miss
    Lib->>API: HEAD m1, m2, m3 (concurrent)
    API-->>Lib: URLs valid
    Lib->>Cache: store m1, m2, m3

    Note over App: User taps M2
    App->>Lib: getImage('m2', 'M2')
    Lib->>Cache: m2 HIT
    Cache-->>Lib: cached result
    Lib-->>App: instant (0ms)

    Note over App: User taps M42 (not prefetched)
    App->>Lib: getImage('m42', 'Orion Nebula')
    Lib->>Cache: m42 miss
    Lib->>API: HEAD m42 (~2-5s)
    API-->>Lib: URL valid
    Lib->>Cache: store m42
    Lib-->>App: ObjectImageResult

    Note over Lib: Background: auto-prefetch M43, M78...
    Lib->>API: HEAD m43, m78...
    API-->>Lib: URLs
    Lib->>Cache: store m43, m78

    Note over App: User taps M43
    App->>Lib: getImage('m43', ...)
    Lib->>Cache: m43 HIT (auto-prefetched)
    Lib-->>App: instant (0ms)
```

---

## Advanced: Direct Cutout Access

For consumers who need lower-level control over the cutout process, the library exports the individual cutout functions:

```ts
import { computeFov, tryPanSTARRS, tryDSS } from '@motioncomplex/cosmos-lib'

// Compute FOV for a 20-arcminute globular cluster
const fov = computeFov(20, 'cluster') // => 32 arcmin

// Try Pan-STARRS directly
const ps1 = await tryPanSTARRS('m13', 250.42, 36.46, fov, { outputSize: 2048 })
if (ps1) console.log(ps1.url, ps1.credit)

// Try DSS directly
const dss = await tryDSS(250.42, 36.46, fov)
if (dss) console.log(dss.url, dss.credit)
```

### `computeFov(sizeArcmin, objectType, opts?): number`

| Parameter | Type | Description |
|---|---|---|
| `sizeArcmin` | `number \| undefined` | Angular diameter in arcminutes. |
| `objectType` | `string` | Object type for default FOV lookup. |
| `opts` | `{ padding?, minFov?, maxFov? }` | Override defaults. |

### `tryPanSTARRS(id, ra, dec, fovArcmin, opts?): Promise<CutoutResult | null>`

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Object ID for precomputed file-list lookup. |
| `ra` | `number` | Right Ascension in degrees (J2000). |
| `dec` | `number` | Declination in degrees (J2000). Must be > -30. |
| `fovArcmin` | `number` | Desired field of view in arcminutes. |
| `opts` | `CutoutOptions` | `{ outputSize?, timeout? }` |

### `tryDSS(ra, dec, fovArcmin, opts?): Promise<CutoutResult | null>`

| Parameter | Type | Description |
|---|---|---|
| `ra` | `number` | Right Ascension in degrees (J2000). |
| `dec` | `number` | Declination in degrees (J2000). |
| `fovArcmin` | `number` | Desired field of view in arcminutes. |
| `opts` | `CutoutOptions` | `{ timeout? }` |

Both return:

```ts
interface CutoutResult {
  url: string                    // Direct image URL
  format: 'jpg' | 'gif'         // Pan-STARRS returns JPEG, DSS returns GIF
  credit: string                 // 'Pan-STARRS/STScI' or 'DSS/STScI'
  source: 'panstarrs' | 'dss'
}
```

---

## Precomputed Pan-STARRS File List

Pan-STARRS normally requires two API calls: one to fetch the per-filter file list, then one to request the cutout. The library embeds a precomputed file list (`src/data/ps1-files.ts`) for all 242 catalog objects with dec > -30, eliminating the first call entirely.

This file is generated by `scripts/generate-ps1-filelist.mjs` and committed to the repository. Re-run it when adding new objects to the catalog:

```bash
node scripts/generate-ps1-filelist.mjs
```

The precomputed data is static (Pan-STARRS DR2 survey data does not change) and adds ~15KB gzipped to the bundle.
