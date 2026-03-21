# Expanded Star Catalog (Tiered)

The star catalog uses a tiered lazy-loading system to balance bundle size against catalog depth. Tier 0 is always bundled; tiers 1 and 2 are loaded on demand.

```ts
import { Data } from '@motioncomplex/cosmos-lib'
```

---

## Tiers

| Tier | Stars | Magnitude | Size | Loaded |
|------|-------|-----------|------|--------|
| **0** | ~200 | Brightest IAU named stars | ~15 KB | Always bundled |
| **1** | ~9,100 | ≤ 6.5 (naked-eye limit) | ~145 KB | On demand |
| **2** | ~120,000 | ≤ 9+ (binocular/telescope) | ~2.5 MB | On demand |

---

## Loading tiers

```ts
// Load naked-eye stars
const added = await Data.loadStarTier(1)
console.log(`Added ${added} stars`) // ~9110

// Load deep catalog
const added2 = await Data.loadStarTier(2)
console.log(`Added ${added2} stars`) // ~120000

// Check what's loaded
Data.loadedStarTiers() // Set { 0, 1, 2 }
```

Loading is **idempotent** — calling again for an already-loaded tier returns `0` instantly.

### What happens after loading

Loaded stars are automatically integrated into the full catalog:

- `Data.all()` includes the new stars
- `Data.getByType('star')` returns them
- `Data.nearby(center, radius)` finds them
- `Data.search(query)` matches them (by auto-generated HYG IDs)
- Sky map rendering shows them (if within `showMagnitudeLimit`)
- `Planner.whatsUp()` considers them (if within `magnitudeLimit`)

### Star data format

Each tier star has:

| Field | Type | Description |
|-------|------|-------------|
| `ra` | `number` | Right Ascension in degrees (J2000) |
| `dec` | `number` | Declination in degrees (J2000) |
| `mag` | `number` | Apparent visual magnitude |
| `bv` | `number` | B-V color index |

Stars are stored internally as base64-encoded `Float32Array` for minimal transfer size and fast decoding.

---

## Examples

### Progressive loading for a sky map

```ts
import { Data, renderSkyMap } from '@motioncomplex/cosmos-lib'

// Start with default catalog (~420 objects)
renderSkyMap(canvas, Data.all(), { showMagnitudeLimit: 5 })

// User clicks "show more stars"
await Data.loadStarTier(1)
renderSkyMap(canvas, Data.all(), { showMagnitudeLimit: 6.5 })

// User wants the deep catalog
await Data.loadStarTier(2)
renderSkyMap(canvas, Data.all(), { showMagnitudeLimit: 9 })
```

### With loading indicator

```ts
const button = document.querySelector('#load-stars')
button.addEventListener('click', async () => {
  button.textContent = 'Loading...'
  button.disabled = true

  const added = await Data.loadStarTier(1)
  button.textContent = `Loaded ${added.toLocaleString()} stars`

  // Re-render sky map with new data
  skymap.setObjects(Data.all())
})
```

### Check before loading

```ts
if (!Data.loadedStarTiers().has(1)) {
  await Data.loadStarTier(1)
}
```

---

## Bundle size impact

Tier data files are **not** included in the main bundle. They are separate chunks that are only loaded when `Data.loadStarTier()` is called. Your bundler (Vite, webpack, etc.) will code-split them automatically via the dynamic `import()`.

| Import | Size added to main bundle |
|--------|--------------------------|
| `Data.loadStarTier(1)` | 0 (lazy chunk: ~145 KB) |
| `Data.loadStarTier(2)` | 0 (lazy chunk: ~2.5 MB) |

---

## Attribution

Star data is sourced from the **HYG Database v3.8** (public domain).

> David Nash, "HYG Stellar Database", https://github.com/astronexus/HYG-Database
