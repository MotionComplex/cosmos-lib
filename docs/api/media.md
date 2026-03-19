# Media API

Browser-side utilities for loading, transforming, and optimising astronomical imagery. All methods that load images use the DOM `Image` constructor and are intended for browser environments only.

```ts
import { Media } from '@motioncomplex/cosmos-lib'
```

---

## `Media.chainLoad`

Try a list of image URLs in order and resolve with the first one that loads successfully. Each URL is attempted sequentially; the promise resolves as soon as one succeeds. If every URL fails, the promise rejects.

```ts
chainLoad(urls: string[]): Promise<string>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `urls` | `string[]` | Ordered array of image URLs, most preferred first |

**Returns** the first URL that loaded successfully.

**Throws** `Error` if every URL in the list fails.

```ts
const url = await Media.chainLoad([
  'https://esahubble.org/media/archives/images/original/heic0506a.tif',
  'https://esahubble.org/media/archives/images/large/heic0506a.jpg',
  'https://esahubble.org/media/archives/images/screen/heic0506a.jpg',
])
document.querySelector('img')!.src = url
```

---

## `Media.progressive`

Progressive image loader that shows a blurred placeholder immediately, then upgrades through quality tiers as each resolves. Works on both `<img>` elements (sets `src`) and any other `HTMLElement` (sets `background-image`).

```ts
progressive(
  target: HTMLImageElement | HTMLElement,
  opts: ProgressiveImageOptions,
): Promise<void>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | `HTMLImageElement \| HTMLElement` | DOM element to receive the image |
| `opts` | `ProgressiveImageOptions` | Image source configuration |

### `ProgressiveImageOptions`

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `placeholder` | `string` | No | Tiny blurred base64 or low-res URL shown immediately |
| `src` | `string` | Yes | Medium-quality URL (shown while HD loads) |
| `srcHD` | `string` | No | Full-resolution URL loaded last |

The element receives a CSS `blur(10px) saturate(0.6)` filter while the placeholder is shown, which is removed with a smooth 0.5s transition once the higher-quality image loads.

```ts
const hero = document.getElementById('hero-image')!
await Media.progressive(hero, {
  placeholder: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...',
  src:   'https://cdn.example.com/andromeda-1280.jpg',
  srcHD: 'https://cdn.example.com/andromeda-4k.jpg',
})
```

---

## `Media.preload`

Preload a list of images in the background using concurrent fetches. All URLs are loaded in parallel via `Promise.allSettled`. URLs that fail are silently dropped.

```ts
preload(urls: string[]): Promise<string[]>
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `urls` | `string[]` | Array of image URLs to preload |

**Returns** the subset of `urls` that loaded successfully, preserving original order.

```ts
const loaded = await Media.preload([
  'https://cdn.example.com/m31-thumb.jpg',
  'https://cdn.example.com/m42-thumb.jpg',
  'https://cdn.example.com/m45-thumb.jpg',
])
console.log(`${loaded.length} of 3 images cached`)
```

---

## `Media.wikimediaUrl`

Build a Wikimedia Commons URL for a given filename. Uses the `Special:FilePath` redirect which resolves to the correct CDN path without requiring the internal MD5 hash.

```ts
wikimediaUrl(filename: string, width?: number): string
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filename` | `string` | Yes | Wikimedia Commons filename including extension |
| `width` | `number` | No | Pixel width for server-side thumbnail generation |

```ts
// Original resolution
Media.wikimediaUrl('Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg')
// => 'https://commons.wikimedia.org/wiki/Special:FilePath/Orion_Nebula...'

// 800px thumbnail
Media.wikimediaUrl('Crab_Nebula.jpg', 800)
// => 'https://commons.wikimedia.org/wiki/Special:FilePath/Crab_Nebula.jpg?width=800'
```

---

## `Media.cloudinaryUrl`

Build a Cloudinary URL with on-the-fly resizing and format optimisation.

```ts
cloudinaryUrl(
  cloudName: string,
  publicId: string,
  opts?: CloudinaryOptions,
): string
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `cloudName` | `string` | Yes | Your Cloudinary cloud name |
| `publicId` | `string` | Yes | Image's public ID in your Cloudinary library |
| `opts` | `CloudinaryOptions` | No | Transformation options |

### `CloudinaryOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `w` | `number` | -- | Width in pixels |
| `h` | `number` | -- | Height in pixels |
| `q` | `number \| 'auto'` | `'auto'` | Quality (1-100) or adaptive |
| `f` | `string \| 'auto'` | `'auto'` | Format (e.g. `'webp'`) or automatic |
| `crop` | `string` | `'fill'` | Crop mode (e.g. `'fill'`, `'fit'`) |

```ts
const url = Media.cloudinaryUrl('my-astro-cloud', 'nebulae/m42-mosaic', {
  w: 1280,
  h: 720,
  q: 80,
  f: 'webp',
  crop: 'fill',
})
// => 'https://res.cloudinary.com/my-astro-cloud/image/upload/c_fill,f_webp,q_80,w_1280,h_720/nebulae/m42-mosaic'
```

---

## `Media.srcset`

Generate an HTML `srcset` attribute value for responsive images. Maps each width to a URL via a transformer callback.

```ts
srcset(
  widths: number[],
  transformer: (w: number) => string,
): string
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `widths` | `number[]` | Array of pixel widths (e.g. `[640, 1280, 1920]`) |
| `transformer` | `(w: number) => string` | Function that returns the URL for a given width |

**Returns** a comma-separated `srcset` string (e.g. `'https://...640 640w, https://...1280 1280w'`).

```ts
const set = Media.srcset([640, 1280, 1920], w =>
  Media.cloudinaryUrl('my-cloud', 'galaxy/ngc1300', { w, f: 'webp' }),
)
// Use in an <img> tag:
// <img srcset={set} sizes="100vw" />
```

---

## `Media.optimalSize`

Return the optimal image dimensions (in physical pixels) for a given container element, accounting for `window.devicePixelRatio`. Useful for requesting appropriately sized images on Retina displays.

```ts
optimalSize(element: Element): { width: number; height: number }
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `element` | `Element` | DOM element whose bounding box determines the target dimensions |

**Returns** `{ width, height }` in physical (device) pixels, rounded to the nearest integer.

```ts
const container = document.getElementById('galaxy-viewer')!
const { width, height } = Media.optimalSize(container)
const url = Media.cloudinaryUrl('my-cloud', 'galaxy/ngc1300', {
  w: width,
  h: height,
})
```

---

## Recipes

### Progressive loading with CDN fallbacks

Combine `progressive` with `chainLoad` for a robust image pipeline:

```ts
const hero = document.getElementById('hero')!

// Build progressive options from the catalog
const prog = Data.progressiveImage('m42', 1024)
if (prog) {
  await Media.progressive(hero, prog)
}
```

### Responsive images with Cloudinary

Build a responsive `<img>` with multiple resolutions:

```ts
const container = document.getElementById('viewer')!
const { width } = Media.optimalSize(container)

const img = document.createElement('img')
img.srcset = Media.srcset([640, 1280, 1920, 2560], w =>
  Media.cloudinaryUrl('astro-cdn', 'nebulae/m42', { w, f: 'webp' }),
)
img.sizes = '100vw'
img.src = Media.cloudinaryUrl('astro-cdn', 'nebulae/m42', { w: width, f: 'webp' })
container.appendChild(img)
```

### Wikimedia image with preloading

Preload a batch of Wikimedia thumbnails for a gallery:

```ts
const ids = ['m31', 'm42', 'm45', 'm51', 'm57']
const urls = ids.flatMap(id => Data.imageUrls(id, 400))
const loaded = await Media.preload(urls)
console.log(`${loaded.length} thumbnails ready`)
```
