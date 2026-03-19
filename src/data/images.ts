import type { ImageRef } from '../types.js'
import { NASA, ESA } from '../api.js'

// ── Static fallback registry ─────────────────────────────────────────────────
// Curated Wikimedia Commons entries for the most iconic objects.
// Guaranteed availability with no API call needed.

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

export interface ResolvedImage {
  /** Multiple resolution URLs, highest quality first */
  urls: string[]
  /** Preview/thumbnail URL */
  previewUrl: string | null
  title: string
  credit: string
  source: 'nasa' | 'esa'
}

export interface ResolveImageOptions {
  /** Which API source to search. Defaults to 'nasa'. */
  source?: 'nasa' | 'esa' | 'all'
  /** Maximum number of results. Defaults to 5. */
  limit?: number
}

/**
 * Search NASA and/or ESA APIs for images of a celestial object by name.
 * Returns multi-resolution image results that can feed directly into
 * `Media.chainLoad()`, `Media.progressive()`, or `createNebula({ textureUrls })`.
 *
 * @param name  Object name to search (e.g. 'Orion Nebula', 'M42', 'Sirius')
 * @param opts  Search options
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
