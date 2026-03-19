import type { ImageRef } from '../types.js'
import { NASA, ESA } from '../api.js'

// ── Static fallback registry ─────────────────────────────────────────────────

/**
 * Curated Wikimedia Commons image entries for the most iconic Messier objects.
 *
 * Each key is an object ID (e.g. `'m42'`) mapping to an array of
 * {@link ImageRef} records with a Wikimedia `filename` and `credit` string.
 * These are guaranteed-available with no API call needed, making them
 * ideal for offline fallbacks and static site generation.
 *
 * Use {@link Data.imageUrls}, {@link Data.progressiveImage}, or
 * {@link Data.imageSrcset} for convenient URL generation from this registry.
 *
 * @example
 * ```ts
 * import { IMAGE_FALLBACKS } from '@motioncomplex/cosmos-lib'
 *
 * const orionImages = IMAGE_FALLBACKS['m42']
 * console.log(orionImages?.[0].filename)
 * // => 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg'
 * console.log(orionImages?.[0].credit)
 * // => 'NASA . ESA . M. Robberto (STScI/ESA)'
 * ```
 */
export const IMAGE_FALLBACKS: Readonly<Record<string, ImageRef[]>> = {
  m1:  [{ filename: 'Crab_Nebula.jpg', credit: 'NASA · ESA · J. Hester & A. Loll (ASU)' }],
  m8:  [{ filename: 'Lagoon_Nebula_from_ESO.jpg', credit: 'ESO/INAF-VST/OmegaCAM' }],
  m16: [{ filename: 'Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m17: [{ filename: 'Omega_Nebula.jpg', credit: 'ESO' }],
  m20: [{ filename: 'Trifid_Nebula_by_Spitzer.jpg', credit: 'NASA/JPL-Caltech' }],
  m27: [{ filename: 'Dumbbell_Nebula_by_HST.jpg', credit: 'NASA · ESA' }],
  m31: [{ filename: 'Andromeda_Galaxy_(with_h-alpha).jpg', credit: 'Adam Evans (CC BY 2.0)' }],
  m42: [{ filename: 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg', credit: 'NASA · ESA · M. Robberto (STScI/ESA)' }],
  m45: [{ filename: 'Pleiades_large.jpg', credit: 'NASA · ESA · AURA/Caltech' }],
  m51: [{ filename: 'Messier51_sRGB.jpg', credit: 'NASA · ESA · S. Beckwith (STScI) · Hubble Heritage Team' }],
  m57: [{ filename: 'M57_The_Ring_Nebula.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m81: [{ filename: 'Messier_81_HST.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m101: [{ filename: 'M101_hires_STScI-PRC2006-10a.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m104: [{ filename: 'M104_ngc4594_sombrero_galaxy_hi-res.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
}

// ── API-powered dynamic image resolution ─────────────────────────────────────

/**
 * A resolved image result from NASA or ESA image APIs.
 *
 * Contains multiple resolution URLs (highest quality first), a thumbnail
 * preview, and attribution metadata. Suitable for progressive loading,
 * fallback chains, or Three.js texture inputs.
 */
export interface ResolvedImage {
  /** Multiple resolution URLs, highest quality first. */
  urls: string[]
  /** Preview/thumbnail URL, or `null` if unavailable. */
  previewUrl: string | null
  /** Image title from the source API. */
  title: string
  /** Attribution/credit string. */
  credit: string
  /** Which API the image came from. */
  source: 'nasa' | 'esa'
}

/**
 * Options for the {@link resolveImages} function.
 */
export interface ResolveImageOptions {
  /** Which API source to search. Defaults to `'nasa'`. */
  source?: 'nasa' | 'esa' | 'all'
  /** Maximum number of results. Defaults to `5`. */
  limit?: number
}

/**
 * Search NASA and/or ESA APIs for images of a celestial object by name.
 *
 * Returns multi-resolution image results that can feed directly into
 * `Media.chainLoad()`, `Media.progressive()`, or `createNebula({ textureUrls })`.
 * Works for any object -- not limited to the static {@link IMAGE_FALLBACKS} registry.
 *
 * @param name - Object name to search (e.g. `'Orion Nebula'`, `'M42'`, `'Sirius'`).
 * @param opts - Search options controlling source and result count.
 * @returns A promise resolving to an array of {@link ResolvedImage} results.
 *
 * @example
 * ```ts
 * import { resolveImages } from '@motioncomplex/cosmos-lib'
 *
 * // Search NASA for Orion Nebula images
 * const images = await resolveImages('Orion Nebula', { limit: 3 })
 * console.log(images[0].title, images[0].urls[0])
 *
 * // Search both NASA and ESA
 * const all = await resolveImages('Crab Nebula', { source: 'all' })
 * ```
 */
export async function resolveImages(
  name: string,
  opts: ResolveImageOptions = {},
): Promise<ResolvedImage[]> {
  const { source = 'nasa', limit = 5 } = opts
  const results: ResolvedImage[] = []

  if (source === 'nasa' || source === 'all') {
    const nasaResults = await NASA.searchImages(name, { pageSize: limit })
    for (const result of nasaResults) {
      if (!result.nasaId) continue
      const assets = await NASA.getAssets(result.nasaId)
      const imageUrls = assets.filter(u => /\.(jpe?g|png|tiff?)$/i.test(u))
      if (imageUrls.length > 0) {
        results.push({
          urls: imageUrls,
          previewUrl: result.previewUrl,
          title: result.title,
          credit: result.center ? `NASA/${result.center}` : 'NASA',
          source: 'nasa',
        })
      }
    }
  }

  if (source === 'esa' || source === 'all') {
    const esaResults = await ESA.searchHubble(name, limit)
    for (const result of esaResults) {
      const urls = [result.imageUrl, result.thumbUrl].filter((u): u is string => u !== null)
      if (urls.length > 0) {
        results.push({
          urls,
          previewUrl: result.thumbUrl,
          title: result.title,
          credit: result.credit || 'ESA/Hubble',
          source: 'esa',
        })
      }
    }
  }

  return results.slice(0, limit)
}
