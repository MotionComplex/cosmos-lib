import type { ProgressiveImageOptions, CloudinaryOptions } from './types.js';
export declare const Media: {
    /**
     * Try a list of image URLs in order.
     * Resolves with the first URL that loads successfully.
     * Rejects only if every URL fails.
     */
    readonly chainLoad: (urls: string[]) => Promise<string>;
    /**
     * Progressive image loader — shows a blurred placeholder immediately,
     * then upgrades through quality levels as each resolves.
     *
     * Works on both <img> elements and any element with a background-image.
     */
    readonly progressive: (target: HTMLImageElement | HTMLElement, opts: ProgressiveImageOptions) => Promise<void>;
    /**
     * Preload a list of images in the background.
     * Returns the URLs that successfully loaded.
     */
    readonly preload: (urls: string[]) => Promise<string[]>;
    /**
     * Build a Wikimedia Commons URL for a given filename.
     * Uses the Special:FilePath redirect, which resolves the correct CDN path
     * without requiring the internal MD5 hash.
     *
     * @param filename  e.g. 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg'
     * @param width     optional pixel width for thumbnail generation
     */
    readonly wikimediaUrl: (filename: string, width?: number) => string;
    /**
     * Build a Cloudinary URL with on-the-fly resizing and format optimisation.
     *
     * @param cloudName  your Cloudinary cloud name
     * @param publicId   image public ID
     * @param opts       transformation options
     */
    readonly cloudinaryUrl: (cloudName: string, publicId: string, opts?: CloudinaryOptions) => string;
    /**
     * Generate a `srcset` attribute value for responsive images.
     *
     * @param widths       array of pixel widths
     * @param transformer  function that takes a width and returns the URL for that size
     *
     * @example
     * Media.srcset([640, 1280, 1920], w => `https://cdn.example.com/img?w=${w}`)
     * // → "https://cdn.example.com/img?w=640 640w, ..."
     */
    readonly srcset: (widths: number[], transformer: (w: number) => string) => string;
    /**
     * Return the optimal image dimensions (in physical pixels) for a given
     * container element, accounting for devicePixelRatio.
     */
    readonly optimalSize: (element: Element) => {
        width: number;
        height: number;
    };
    readonly _loadImage: (url: string) => Promise<string>;
};
