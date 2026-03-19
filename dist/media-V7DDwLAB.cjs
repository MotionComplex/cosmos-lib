"use strict";
const Media = {
  /**
   * Try a list of image URLs in order.
   * Resolves with the first URL that loads successfully.
   * Rejects only if every URL fails.
   */
  chainLoad(urls) {
    return new Promise((resolve, reject) => {
      const attempt = (remaining) => {
        const [head, ...tail] = remaining;
        if (head === void 0) {
          reject(new Error("All image URLs failed to load."));
          return;
        }
        const img = new Image();
        img.onload = () => resolve(head);
        img.onerror = () => attempt(tail);
        img.src = head;
      };
      attempt([...urls]);
    });
  },
  /**
   * Progressive image loader — shows a blurred placeholder immediately,
   * then upgrades through quality levels as each resolves.
   *
   * Works on both <img> elements and any element with a background-image.
   */
  async progressive(target, opts) {
    const { placeholder, src, srcHD } = opts;
    const set = (url, blur) => {
      if (target instanceof HTMLImageElement) {
        target.src = url;
      } else {
        target.style.backgroundImage = `url('${url}')`;
      }
      target.style.filter = blur ? "blur(10px) saturate(0.6)" : "";
      target.style.transition = "filter 0.5s ease";
    };
    if (placeholder) set(placeholder, true);
    try {
      await this._loadImage(src);
      set(src, false);
    } catch {
    }
    if (srcHD) {
      try {
        await this._loadImage(srcHD);
        set(srcHD, false);
      } catch {
      }
    }
  },
  /**
   * Preload a list of images in the background.
   * Returns the URLs that successfully loaded.
   */
  async preload(urls) {
    const results = await Promise.allSettled(urls.map((u) => this._loadImage(u)));
    return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  },
  /**
   * Build a Wikimedia Commons URL for a given filename.
   * Uses the Special:FilePath redirect, which resolves the correct CDN path
   * without requiring the internal MD5 hash.
   *
   * @param filename  e.g. 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg'
   * @param width     optional pixel width for thumbnail generation
   */
  wikimediaUrl(filename, width) {
    const base = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
    return width ? `${base}?width=${width}` : base;
  },
  /**
   * Build a Cloudinary URL with on-the-fly resizing and format optimisation.
   *
   * @param cloudName  your Cloudinary cloud name
   * @param publicId   image public ID
   * @param opts       transformation options
   */
  cloudinaryUrl(cloudName, publicId, opts = {}) {
    const { w, h, q = "auto", f = "auto", crop = "fill" } = opts;
    const transforms = [
      `c_${crop}`,
      `f_${f}`,
      `q_${q}`,
      w ? `w_${w}` : null,
      h ? `h_${h}` : null
    ].filter((t) => t !== null).join(",");
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
  },
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
  srcset(widths, transformer) {
    return widths.map((w) => `${transformer(w)} ${w}w`).join(", ");
  },
  /**
   * Return the optimal image dimensions (in physical pixels) for a given
   * container element, accounting for devicePixelRatio.
   */
  optimalSize(element) {
    const rect = element.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    return {
      width: Math.round(rect.width * dpr),
      height: Math.round(rect.height * dpr)
    };
  },
  // ── Private ────────────────────────────────────────────────────────────────
  _loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }
};
exports.Media = Media;
//# sourceMappingURL=media-V7DDwLAB.cjs.map
