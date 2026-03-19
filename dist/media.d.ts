import type { ProgressiveImageOptions, CloudinaryOptions } from './types.js';
/**
 * Browser-side utilities for loading, transforming, and optimising
 * astronomical imagery.
 *
 * All methods that load images use the DOM `Image` constructor and are
 * therefore intended for browser environments only.
 *
 * @example
 * ```ts
 * import { Media } from 'cosmos-lib'
 *
 * // Load the best available image from a priority list
 * const url = await Media.chainLoad([
 *   'https://cdn.example.com/nebula-hd.jpg',
 *   'https://cdn.example.com/nebula-sd.jpg',
 * ])
 * document.querySelector('img')!.src = url
 * ```
 */
export declare const Media: {
    /**
     * Try a list of image URLs in order and resolve with the first one
     * that loads successfully.
     *
     * Each URL is attempted sequentially; when an image fires its `load`
     * event the promise resolves immediately with that URL. If every URL
     * fires an `error` event the promise is rejected.
     *
     * @param urls - Ordered array of image URLs to attempt, from most
     *               preferred to least preferred.
     *
     * @returns The first URL that loaded successfully.
     *
     * @throws {Error} If every URL in the list fails to load.
     *
     * @example
     * ```ts
     * const url = await Media.chainLoad([
     *   'https://esahubble.org/media/archives/images/original/heic0506a.tif',
     *   'https://esahubble.org/media/archives/images/large/heic0506a.jpg',
     *   'https://esahubble.org/media/archives/images/screen/heic0506a.jpg',
     * ])
     * ```
     */
    readonly chainLoad: (urls: string[]) => Promise<string>;
    /**
     * Progressive image loader that shows a blurred placeholder immediately,
     * then upgrades through quality tiers as each resolves.
     *
     * Works on both `<img>` elements (sets `src`) and any other
     * `HTMLElement` (sets `background-image`). A CSS blur filter is applied
     * while the placeholder is shown, then removed with a smooth transition
     * once the full-quality image is ready.
     *
     * @param target - The DOM element to receive the image. Can be an
     *                 `HTMLImageElement` or any `HTMLElement` with a
     *                 background-image style.
     * @param opts   - Image source configuration. See
     *                 {@link ProgressiveImageOptions}.
     *
     * @returns Resolves when the highest available quality tier has been
     *          applied (or all tiers have been attempted).
     *
     * @example
     * ```ts
     * const hero = document.getElementById('hero-image')!
     * await Media.progressive(hero, {
     *   placeholder: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...',
     *   src:   'https://cdn.example.com/andromeda-1280.jpg',
     *   srcHD: 'https://cdn.example.com/andromeda-4k.jpg',
     * })
     * ```
     */
    readonly progressive: (target: HTMLImageElement | HTMLElement, opts: ProgressiveImageOptions) => Promise<void>;
    /**
     * Preload a list of images in the background using concurrent fetches.
     *
     * All URLs are loaded in parallel via `Promise.allSettled`. URLs that
     * fail to load are silently dropped; only successfully loaded URLs are
     * returned.
     *
     * @param urls - Array of image URLs to preload.
     *
     * @returns The subset of `urls` that loaded successfully, preserving
     *          original order.
     *
     * @example
     * ```ts
     * const loaded = await Media.preload([
     *   'https://cdn.example.com/m31-thumb.jpg',
     *   'https://cdn.example.com/m42-thumb.jpg',
     *   'https://cdn.example.com/m45-thumb.jpg',
     * ])
     * console.log(`${loaded.length} of 3 images cached`)
     * ```
     */
    readonly preload: (urls: string[]) => Promise<string[]>;
    /**
     * Build a Wikimedia Commons URL for a given filename.
     *
     * Uses the `Special:FilePath` redirect, which resolves to the correct
     * CDN path without requiring the internal MD5 hash. When a `width` is
     * provided, the Wikimedia thumbnail API generates a resized version
     * server-side.
     *
     * @param filename - The Wikimedia Commons filename, including extension
     *                   (e.g. `'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg'`).
     * @param width    - Optional pixel width for on-the-fly thumbnail
     *                   generation. Omit to get the original-resolution file.
     *
     * @returns A fully-qualified Wikimedia Commons URL.
     *
     * @example
     * ```ts
     * // Original resolution
     * Media.wikimediaUrl('Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg')
     * // => 'https://commons.wikimedia.org/wiki/Special:FilePath/Orion_Nebula...'
     *
     * // 800px thumbnail
     * Media.wikimediaUrl('Crab_Nebula.jpg', 800)
     * // => 'https://commons.wikimedia.org/wiki/Special:FilePath/Crab_Nebula.jpg?width=800'
     * ```
     */
    readonly wikimediaUrl: (filename: string, width?: number) => string;
    /**
     * Build a Cloudinary URL with on-the-fly resizing and format optimisation.
     *
     * Constructs a Cloudinary delivery URL using the `image/upload` path
     * with the specified transformations. Defaults to `crop: 'fill'`,
     * `quality: 'auto'`, and `format: 'auto'` when not overridden.
     *
     * @param cloudName - Your Cloudinary cloud name (e.g. `'my-astro-cloud'`).
     * @param publicId  - The image's public ID in your Cloudinary media
     *                    library (e.g. `'nebulae/m42-mosaic'`).
     * @param opts      - Transformation options. See {@link CloudinaryOptions}.
     *
     * @returns A fully-qualified Cloudinary delivery URL with transformations.
     *
     * @example
     * ```ts
     * const url = Media.cloudinaryUrl('my-astro-cloud', 'nebulae/m42-mosaic', {
     *   w: 1280,
     *   h: 720,
     *   q: 80,
     *   f: 'webp',
     *   crop: 'fill',
     * })
     * // => 'https://res.cloudinary.com/my-astro-cloud/image/upload/c_fill,f_webp,q_80,w_1280,h_720/nebulae/m42-mosaic'
     * ```
     */
    readonly cloudinaryUrl: (cloudName: string, publicId: string, opts?: CloudinaryOptions) => string;
    /**
     * Generate an HTML `srcset` attribute value for responsive images.
     *
     * Maps each width to a URL via the `transformer` callback and joins
     * them into a comma-separated descriptor string suitable for use in
     * an `<img srcset="...">` or `<source srcset="...">` attribute.
     *
     * @param widths      - Array of pixel widths to include (e.g.
     *                      `[640, 1280, 1920]`).
     * @param transformer - A function that receives a width in pixels and
     *                      returns the corresponding image URL.
     *
     * @returns A `srcset`-formatted string (e.g.
     *          `'https://cdn.example.com/img?w=640 640w, ...`).
     *
     * @example
     * ```ts
     * const set = Media.srcset([640, 1280, 1920], w =>
     *   Media.cloudinaryUrl('my-cloud', 'galaxy/ngc1300', { w, f: 'webp' }),
     * )
     * // Use in an <img> tag:
     * // <img srcset={set} sizes="100vw" />
     * ```
     */
    readonly srcset: (widths: number[], transformer: (w: number) => string) => string;
    /**
     * Return the optimal image dimensions (in physical pixels) for a given
     * container element, accounting for `window.devicePixelRatio`.
     *
     * Multiplies the element's CSS layout size by the device pixel ratio so
     * that images are sharp on high-DPI (Retina) displays. Falls back to a
     * ratio of `1` when `devicePixelRatio` is unavailable.
     *
     * @param element - The DOM element whose bounding box determines the
     *                  target dimensions.
     *
     * @returns An object with `width` and `height` in physical (device)
     *          pixels, rounded to the nearest integer.
     *
     * @example
     * ```ts
     * const container = document.getElementById('galaxy-viewer')!
     * const { width, height } = Media.optimalSize(container)
     * const url = Media.cloudinaryUrl('my-cloud', 'galaxy/ngc1300', {
     *   w: width,
     *   h: height,
     * })
     * ```
     */
    readonly optimalSize: (element: Element) => {
        width: number;
        height: number;
    };
    /**
     * Load a single image by URL using the DOM `Image` constructor.
     *
     * @internal This is an implementation detail used by {@link Media.chainLoad},
     * {@link Media.progressive}, and {@link Media.preload}. It is not part of
     * the public API and may change without notice.
     *
     * @param url - The image URL to load.
     * @returns Resolves with the URL on successful load; rejects on error.
     */
    readonly _loadImage: (url: string) => Promise<string>;
};
