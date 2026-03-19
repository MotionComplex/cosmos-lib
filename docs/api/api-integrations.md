# API Integrations

Clients for NASA, ESA, and CDS SIMBAD public astronomy APIs. All methods are asynchronous and return Promises.

```ts
import { NASA, ESA, resolveSimbad } from '@motioncomplex/cosmos-lib'
```

---

## NASA

Client for the NASA Image and Video Library and the Astronomy Picture of the Day (APOD) service.

### API Key Setup

By default, requests use `DEMO_KEY`, which is subject to strict rate limits. Register a free key at [api.nasa.gov](https://api.nasa.gov) before production use.

| Key type | Rate limit |
|---|---|
| `DEMO_KEY` | 30 requests/hour, 50 requests/day |
| Registered key | 1,000 requests/hour |

### `NASA.setApiKey(key: string): void`

Set the NASA API key used for APOD requests. The Image and Video Library search does not require an API key.

| Parameter | Type | Description |
|---|---|---|
| `key` | `string` | Your NASA API key. |

```ts
NASA.setApiKey('Ab12Cd34Ef56Gh78Ij90KlMnOpQrStUvWxYz0123')
```

### `NASA.searchImages(query: string, opts?: NASASearchOptions): Promise<NASAImageResult[]>`

Search the NASA Image and Video Library.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `query` | `string` | | Free-text search term (e.g. `'pillars of creation'`). |
| `opts` | `NASASearchOptions` | `{}` | Optional filters and pagination. |

**Returns:** `Promise<NASAImageResult[]>` -- empty array if no matches.

**Throws:** `Error` if the API responds with a non-2xx status.

```ts
const results = await NASA.searchImages('pillars of creation', {
  yearStart: 2010,
  pageSize: 5,
})
for (const r of results) {
  console.log(r.title, r.previewUrl)
}
```

#### NASASearchOptions

```ts
interface NASASearchOptions {
  mediaType?: 'image' | 'video' | 'audio'  // default: 'image'
  yearStart?: number
  yearEnd?: number
  pageSize?: number   // default: 10
  page?: number       // default: 1 (1-based)
}
```

#### NASAImageResult

```ts
interface NASAImageResult {
  nasaId: string           // NASA-assigned unique identifier
  title: string
  description: string
  date: string             // ISO-8601 date string
  center: string           // originating NASA centre (e.g. 'JPL', 'GSFC')
  keywords: string[]
  previewUrl: string | null
  href: string             // collection asset URL
}
```

### `NASA.getAssets(nasaId: string): Promise<string[]>`

Fetch all asset URLs for a given NASA image ID. Returns the full list of available renditions sorted by quality: original, large, medium, small, then thumbnail.

| Parameter | Type | Description |
|---|---|---|
| `nasaId` | `string` | NASA-assigned identifier (e.g. `'PIA06890'`). |

**Returns:** `Promise<string[]>` -- absolute URLs sorted from highest to lowest quality.

**Throws:** `Error` if the asset endpoint responds with a non-2xx status.

```ts
const urls = await NASA.getAssets('PIA06890')
console.log(urls[0]) // highest quality rendition
```

### `NASA.getBestImageUrl(nasaId: string): Promise<string | null>`

Convenience helper returning the single highest-quality image URL for a NASA asset ID. Filters for image file extensions (JPEG, PNG, GIF, TIFF) and returns the first match.

| Parameter | Type | Description |
|---|---|---|
| `nasaId` | `string` | NASA-assigned identifier. |

**Returns:** `Promise<string | null>` -- the URL of the best available image, or `null` if no image renditions exist.

**Throws:** `Error` if the underlying `getAssets` call fails.

```ts
const url = await NASA.getBestImageUrl('PIA06890')
if (url) {
  document.querySelector('img')!.src = url
}
```

### `NASA.apod(date?: string | Date): Promise<APODResult>`

Fetch the NASA Astronomy Picture of the Day.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `string \| Date` | `undefined` | ISO-8601 date string or `Date` object. Omit for today's picture. |

**Returns:** `Promise<APODResult>`

**Throws:** `Error` on non-2xx status (e.g. 403 for invalid API key, 404 for missing date).

```ts
// Today's APOD
const today = await NASA.apod()
console.log(today.title, today.hdUrl)

// A specific date
const historic = await NASA.apod('1995-06-16')
```

#### APODResult

```ts
interface APODResult {
  title: string
  date: string          // ISO-8601 date string
  explanation: string   // written by a professional astronomer
  url: string           // standard-resolution media URL
  hdUrl: string         // high-definition media URL
  mediaType: 'image' | 'video'
  copyright: string     // copyright holder, or 'NASA' for public-domain
}
```

### `NASA.recentAPOD(count?: number): Promise<APODResult[]>`

Fetch a random selection of recent APOD entries. Thumbnails are requested for video entries.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `count` | `number` | `7` | Number of random entries (max 100). |

**Returns:** `Promise<APODResult[]>`

**Throws:** `Error` on non-2xx status.

```ts
const week = await NASA.recentAPOD()
for (const entry of week) {
  console.log(`${entry.date}: ${entry.title}`)
}

// Fetch 20 random entries
const batch = await NASA.recentAPOD(20)
```

---

## ESA

Client for the ESA Hubble Space Telescope public image archive.

### `ESA.searchHubble(query: string, limit?: number): Promise<ESAHubbleResult[]>`

Search the ESA Hubble image archive.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `query` | `string` | | Free-text search term (e.g. `'crab nebula'`). |
| `limit` | `number` | `10` | Maximum number of results. |

**Returns:** `Promise<ESAHubbleResult[]>`

**Throws:** `Error` on non-2xx status.

```ts
const results = await ESA.searchHubble('crab nebula', 3)
for (const r of results) {
  console.log(r.title, r.thumbUrl)
}
```

#### ESAHubbleResult

```ts
interface ESAHubbleResult {
  id: string
  title: string
  description: string
  credit: string
  date: string              // ISO-8601 date string
  imageUrl: string | null   // full-resolution URL
  thumbUrl: string | null   // screen-sized URL
  tags: string[]
}
```

---

## SIMBAD

### `resolveSimbad(objectName: string): Promise<SimbadResult | null>`

Resolve an astronomical object name through the CDS SIMBAD TAP service. Performs an ADQL query and returns J2000 equatorial coordinates and object type for the first match.

| Parameter | Type | Description |
|---|---|---|
| `objectName` | `string` | Any SIMBAD-recognised identifier (e.g. `'M1'`, `'NGC 6611'`, `'Betelgeuse'`). |

**Returns:** `Promise<SimbadResult | null>` -- `null` if the name could not be resolved.

**Throws:** `Error` on non-2xx status from the SIMBAD TAP endpoint.

```ts
const m1 = await resolveSimbad('M1')
if (m1) {
  console.log(`RA: ${m1.ra}, Dec: ${m1.dec}, Type: ${m1.type}`)
}

const star = await resolveSimbad('Betelgeuse')
// => { id: '* alf Ori', ra: 88.792..., dec: 7.407..., type: 'LP*' }
```

#### SimbadResult

```ts
interface SimbadResult {
  id: string    // SIMBAD main identifier
  ra: number    // right ascension in degrees (J2000)
  dec: number   // declination in degrees (J2000)
  type: string  // SIMBAD object-type code
}
```

---

## Rate Limits & Error Handling

### NASA

- **Image and Video Library** (`searchImages`, `getAssets`, `getBestImageUrl`): no API key required; no published rate limit, but excessive use may be throttled.
- **APOD** (`apod`, `recentAPOD`): requires an API key set via `setApiKey()`. The `DEMO_KEY` allows 30 requests/hour and 50/day. A registered key allows 1,000 requests/hour.

### ESA Hubble

- No API key required. No published rate limit. The public REST API at `esahubble.org` may be slower than NASA's.

### SIMBAD

- No API key required. The CDS TAP service is a public academic resource. Excessive automated queries may be throttled. Queries are sent as HTTP POST requests to `simbad.cds.unistra.fr`.

### Error handling

All API methods throw a standard JavaScript `Error` when the remote service returns a non-2xx HTTP status. The error message includes the status code and status text:

```ts
try {
  const apod = await NASA.apod('invalid-date')
} catch (err) {
  console.error(err.message) // 'APOD error: 400 Bad Request'
}
```

Network failures (DNS, timeout, etc.) will throw the native `fetch` error. Consider wrapping calls in try/catch and providing fallback behavior for offline or degraded-network scenarios.
