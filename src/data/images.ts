import type { ImageRef, ObjectImageResult, GetImageOptions, ProximityResult, EquatorialCoord } from '../types.js'
import { Media } from '../media.js'
import { NASA, ESA } from '../api.js'
import { tryPanSTARRS, tryDSS, computeFov } from './cutouts.js'
import type { CutoutOptions } from './cutouts.js'

// ── Catalog lookup (injected from index.ts to avoid circular imports) ────────

interface CatalogInfo {
  id: string
  ra: number | null
  dec: number | null
  size_arcmin?: number | undefined
  type: string
  name: string
  aliases: string[]
}

type CatalogLookupFn = (id: string) => CatalogInfo | null
type NearbyFn = (center: EquatorialCoord, radiusDeg: number) => ProximityResult[]

let _catalogLookup: CatalogLookupFn | null = null
let _nearbyFn: NearbyFn | null = null

/** @internal Wire the catalog lookup. Called once from index.ts. */
export function _setCatalogLookup(fn: CatalogLookupFn): void { _catalogLookup = fn }

/** @internal Wire the nearby-search function. Called once from index.ts. */
export function _setNearbyFn(fn: NearbyFn): void { _nearbyFn = fn }

// ── Static fallback registry ─────────────────────────────────────────────────

/**
 * Curated Wikimedia Commons image entries for the most iconic celestial objects.
 *
 * Each key is an object ID (e.g. `'m42'`) mapping to an array of
 * {@link ImageRef} records with a Wikimedia `filename` and `credit` string.
 * These are guaranteed-available with no API call needed, making them
 * ideal for offline fallbacks and static site generation.
 *
 * @example
 * ```ts
 * import { IMAGE_FALLBACKS } from '@motioncomplex/cosmos-lib'
 *
 * const orionImages = IMAGE_FALLBACKS['m42']
 * console.log(orionImages?.[0].filename)
 * // => 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg'
 * ```
 */
export const IMAGE_FALLBACKS: Readonly<Record<string, ImageRef[]>> = {
  // ── Solar system ──────────────────────────────────────────────────────────
  sun:     [{ filename: 'The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg', credit: 'NASA/SDO (AIA)' }],
  mercury: [{ filename: 'Mercury_in_color_-_Prockter07-edit1.jpg', credit: 'NASA/Johns Hopkins APL/Carnegie Inst. Washington' }],
  venus:   [{ filename: 'PIA00271-_Venus_-_3D_Perspective_View_of_Maat_Mons.jpg', credit: 'NASA/JPL' }],
  earth:   [{ filename: 'The_Blue_Marble_(remastered).jpg', credit: 'NASA/Apollo 17' }],
  moon:    [{ filename: 'FullMoon2010.jpg', credit: 'Gregory H. Revera (CC BY-SA 3.0)' }],
  mars:    [{ filename: 'OSIRIS_Mars_true_color.jpg', credit: 'ESA/MPS/UPD/LAM/IAA/RSSD/INTA/UPM/DASP/IDA' }],
  jupiter: [{ filename: 'Jupiter_and_its_shrunken_Great_Red_Spot.jpg', credit: 'NASA · ESA · A. Simon (GSFC)' }],
  saturn:  [{ filename: 'Saturn_during_Equinox.jpg', credit: 'NASA/JPL/Space Science Institute' }],
  uranus:  [{ filename: 'Uranus2.jpg', credit: 'NASA/JPL-Caltech' }],
  neptune: [{ filename: 'Neptune_-_Voyager_2_(29347980845)_flatten_crop.jpg', credit: 'NASA/JPL' }],

  // ── Bright stars ───────────────────────────────────────────────────────────
  sirius:  [{ filename: 'A_Guiding_Star.jpg', credit: 'ESO/J. Girard' }],
  canopus: [{ filename: 'Star_Canopus.superstructures.ajb.jpg', credit: 'Ajepbah (CC BY-SA 3.0)' }],
  vega:    [{ filename: 'Vega_star.jpg', credit: 'Talesofaviewfinder (CC BY-SA 4.0)' }],
  procyon: [{ filename: '4heic0516d.jpg', credit: 'ESA/Hubble · Akira Fujii' }],
  albireo: [{ filename: 'Albireo_double_star.jpg', credit: 'N. B. (CC BY-SA 4.0)' }],
  mintaka: [{ filename: 'Orion_Head_to_Toe.jpg', credit: 'Rogelio Bernal Andreo (CC BY-SA 3.0)' }],
  acrab:   [{ filename: 'Rho_Ophiucus_Widefield.jpg', credit: 'Rogelio Bernal Andreo (CC BY-SA 3.0)' }],

  // ── Messier objects ───────────────────────────────────────────────────────
  m1:   [{ filename: 'Crab_Nebula.jpg', credit: 'NASA · ESA · J. Hester & A. Loll (ASU)' }],
  m8:   [{ filename: 'Lagoon_Nebula_from_ESO.jpg', credit: 'ESO/INAF-VST/OmegaCAM' }],
  m13:  [{ filename: 'Messier_13_Hubble_WikiSky.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m16:  [{ filename: 'Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m17:  [{ filename: 'Omega_Nebula.jpg', credit: 'ESO' }],
  m20:  [{ filename: 'Trifid_Nebula_by_Spitzer.jpg', credit: 'NASA/JPL-Caltech' }],
  m27:  [{ filename: 'Dumbbell_Nebula_by_HST.jpg', credit: 'NASA · ESA' }],
  m31:  [{ filename: 'Andromeda_Galaxy_(with_h-alpha).jpg', credit: 'Adam Evans (CC BY 2.0)' }],
  m33:  [{ filename: 'Triangulum_Galaxy_(full).jpg', credit: 'NASA · ESA · M. Durbin, J. Dalcanton, B.F. Williams (Univ. of Washington)' }],
  m42:  [{ filename: 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg', credit: 'NASA · ESA · M. Robberto (STScI/ESA)' }],
  m45:  [{ filename: 'Pleiades_large.jpg', credit: 'NASA · ESA · AURA/Caltech' }],
  m51:  [{ filename: 'Messier51_sRGB.jpg', credit: 'NASA · ESA · S. Beckwith (STScI) · Hubble Heritage Team' }],
  m57:  [{ filename: 'M57_The_Ring_Nebula.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m63:  [{ filename: 'Messier63_-_HST_-_Potw1901a.jpg', credit: 'ESA/Hubble · NASA' }],
  m78:  [{ filename: 'Messier_78_-_Hubble.jpg', credit: 'ESA/Hubble · NASA/D. Padgett (GSFC)' }],
  m81:  [{ filename: 'Messier_81_HST.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m82:  [{ filename: 'M82_HST_ACS_2006-14-a-large_web.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m83:  [{ filename: 'Messier_83_-_Hubble_-_STScI-PRC2014-04a.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m87:  [{ filename: 'Messier_87_Hubble_WikiSky.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m101: [{ filename: 'M101_hires_STScI-PRC2006-10a.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m104: [{ filename: 'M104_ngc4594_sombrero_galaxy_hi-res.jpg', credit: 'NASA · ESA · Hubble Heritage Team' }],
  m109: [{ filename: 'M109,_NGC_3992_(noao-m109).jpg', credit: 'NOIRLab/NSF/AURA' }],

  // ── Deep-sky extras ───────────────────────────────────────────────────────
  ngc7293: [{ filename: 'Helix_Nebula_-_NGC_7293.jpg', credit: 'NASA · ESA · C.R. O\'Dell (Vanderbilt)' }],
  'omega-cen': [{ filename: 'Omega_Centauri_by_ESO.jpg', credit: 'ESO' }],
  'm87-bh': [{ filename: 'Black_hole_-_Messier_87_crop_max_res.jpg', credit: 'Event Horizon Telescope · CC BY 4.0' }],
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

// ── In-memory cache ──────────────────────────────────────────────────────────

const _imageCache = new Map<string, ObjectImageResult | null>()

function cacheKeyFor(id: string, width: number, source: string): string {
  return `${id}::${width}::${source}`
}

// ── Prefetch ─────────────────────────────────────────────────────────────────

/**
 * Prefetch images for a list of object IDs in the background.
 *
 * Fires off `getObjectImage` for each ID concurrently (with `prefetch: false`
 * to avoid recursive expansion). Results are stored in the in-memory cache
 * so subsequent `Data.getImage()` calls for these objects resolve instantly.
 *
 * Call this when you know which objects the user is likely to view next —
 * e.g. when a list of objects renders or when filtering narrows the results.
 *
 * @param ids - Object IDs to prefetch (e.g. `['m1', 'm2', 'm3']`).
 *
 * @example
 * ```ts
 * // Prefetch when a filtered list renders
 * Data.prefetchImages(filteredObjects.map(o => o.id))
 *
 * // Later, when user taps M2:
 * const img = await Data.getImage('m2', 'M2') // instant from cache
 * ```
 */
export function prefetchImages(ids: string[]): void {
  if (!_catalogLookup) return
  for (const id of ids) {
    const info = _catalogLookup(id)
    if (!info) continue
    const key = cacheKeyFor(id, 1200, 'nasa')
    if (_imageCache.has(key)) continue
    // Fire and forget — don't await
    getObjectImage(id, info.name, { prefetch: false }).catch(() => {})
  }
}

// ── Search term builder ──────────────────────────────────────────────────────

/** Catalog designation patterns (M42, NGC 6405, IC 1805, etc.) */
const CATALOG_RE = /^(m|ngc|ic|sh2|arp|abell)\s*\d/i

/**
 * Build a prioritised list of search terms for NASA/ESA image APIs.
 *
 * Catalog designations (M6, NGC 6405) are strongly preferred over common
 * names ("Butterfly Cluster") because the latter often return
 * non-astronomical results.
 */
function _buildSearchTerms(id: string, name: string): string[] {
  const terms: string[] = []
  const info = _catalogLookup?.(id)

  // 1. Catalog designations from aliases (e.g. "NGC 6405", "M6")
  if (info?.aliases) {
    for (const alias of info.aliases) {
      if (CATALOG_RE.test(alias)) terms.push(alias)
    }
  }

  // 2. The object ID itself if it looks like a catalog designation
  if (CATALOG_RE.test(id)) terms.push(id.toUpperCase())

  // 3. Common name qualified with the object type to disambiguate
  terms.push(`${name} ${info?.type ?? 'astronomy'}`)

  return terms
}

// ── Unified image pipeline ──────────────────────────────────────────────────

/**
 * Unified image pipeline that resolves the best available image for any
 * celestial object, with built-in auto-prefetching of nearby objects.
 *
 * The pipeline runs a cascade of sources in priority order:
 * 1. **In-memory cache** — instant (0ms) for previously resolved images.
 * 2. **Curated Wikimedia static registry** — hand-picked iconic images
 *    served via Wikimedia's thumbnail API with responsive `srcset`.
 *    No network validation — URLs are trusted for zero-latency resolution.
 * 3. **NASA / ESA text search** — high-quality press release imagery.
 * 4. **Pan-STARRS DR2 cutout** *(opt-in, `skipCutouts: false`)* —
 *    coordinate-based color composite. Accurate but raw survey data.
 * 5. **DSS cutout** *(opt-in)* — full-sky grayscale fallback.
 *
 * After resolving, the pipeline automatically prefetches images for nearby
 * objects in the background, so spatial browsing feels instant.
 *
 * @param id   - Object ID (e.g. `'mars'`, `'m42'`, `'sirius'`).
 * @param name - Object display name used for API searches when no
 *               coordinate-based source is available.
 * @param opts - Width, srcset, cutout, and prefetch options.
 * @returns The best available image, or `null` if no image could be found.
 *
 * @example
 * ```ts
 * // Just works — auto-prefetches nearby objects
 * const img = await Data.getImage('m42', 'Orion Nebula', { width: 1200 })
 * if (img) {
 *   heroEl.src = img.src
 *   heroEl.srcset = img.srcset ?? ''
 *   creditEl.textContent = img.credit
 * }
 *
 * // Disable auto-prefetch
 * const img2 = await Data.getImage('m42', 'Orion Nebula', { prefetch: false })
 * ```
 */
export async function getObjectImage(
  id: string,
  name: string,
  opts: GetImageOptions = {},
): Promise<ObjectImageResult | null> {
  const {
    width = 1200,
    srcsetWidths = [640, 1024, 1600],
    source = 'all',
    cutoutTimeout = 15000,
    skipCutouts = true,
    prefetch,
  } = opts

  const cacheKey = cacheKeyFor(id, width, source)

  // ── 1. Cache — instant return ───────────────────────────────────────
  if (_imageCache.has(cacheKey)) {
    return _imageCache.get(cacheKey) ?? null
  }

  let result: ObjectImageResult | null = null

  // ── 2. Curated Wikimedia static registry ────────────────────────────
  // These are hand-picked filenames — trust them without a HEAD check.
  // The Special:FilePath redirect is reliable; if it ever 404s the
  // browser's <img> onerror will handle it gracefully.
  const staticImages = IMAGE_FALLBACKS[id]
  if (staticImages?.length) {
    const img = staticImages[0]!
    result = {
      src: Media.wikimediaUrl(img.filename, width),
      srcset: Media.srcset(srcsetWidths, w => Media.wikimediaUrl(img.filename, w)),
      placeholder: Media.wikimediaUrl(img.filename, 64),
      credit: img.credit,
      source: 'static',
    }
  }

  // ── 3. Pan-STARRS cutout (coordinate-based, color) ──────────────────
  if (!result && !skipCutouts && _catalogLookup) {
    const info = _catalogLookup(id)
    if (info && info.ra !== null && info.dec !== null) {
      const fov = computeFov(info.size_arcmin, info.type)
      const cutoutOpts: CutoutOptions = { outputSize: width, timeout: cutoutTimeout }

      const ps1 = await tryPanSTARRS(id, info.ra, info.dec, fov, cutoutOpts)
      if (ps1) {
        result = {
          src: ps1.url,
          srcset: null,
          placeholder: null,
          credit: ps1.credit,
          source: 'panstarrs',
        }
      }

      // ── 4. DSS cutout (full-sky grayscale fallback) ───────────────
      if (!result) {
        const dss = await tryDSS(info.ra, info.dec, fov, cutoutOpts)
        if (dss) {
          result = {
            src: dss.url,
            srcset: null,
            placeholder: null,
            credit: dss.credit,
            source: 'dss',
          }
        }
      }
    }
  }

  // ── 5. API image search (last resort) ───────────────────────────────
  // Use catalog designations (M6, NGC 6405) rather than common names
  // ("Butterfly Cluster") to avoid non-astronomical results.
  // Try ESA/Hubble first (astronomy-only archive), then NASA (general).
  if (!result) {
    const searchTerms = _buildSearchTerms(id, name)
    // ESA first — purely astronomical imagery, no labs/facilities noise
    const sources: Array<'esa' | 'nasa'> = source === 'nasa' ? ['nasa'] : source === 'esa' ? ['esa'] : ['esa', 'nasa']
    for (const src of sources) {
      if (result) break
      for (const term of searchTerms) {
        try {
          const resolved = await resolveImages(term, { source: src, limit: 1 })
          if (resolved.length > 0) {
            const best = resolved[0]!
            result = {
              src: best.previewUrl ?? best.urls[0]!,
              srcset: null,
              placeholder: null,
              credit: best.credit,
              source: best.source,
            }
            break
          }
        } catch {
          // Network failure — try next term
        }
      }
    }
  }

  // Cache the result (including null for not-found)
  _imageCache.set(cacheKey, result)

  // ── Auto-prefetch nearby objects (non-blocking) ─────────────────────
  if (result && prefetch !== false && _catalogLookup && _nearbyFn) {
    const info = _catalogLookup(id)
    if (info && info.ra !== null && info.dec !== null) {
      const prefetchOpts = typeof prefetch === 'object' ? prefetch : {}
      const { radius = 5, limit = 8 } = prefetchOpts
      const nearby = _nearbyFn({ ra: info.ra, dec: info.dec }, radius)
        .filter(r => r.object.id !== id && !_imageCache.has(cacheKeyFor(r.object.id, width, source)))
        .slice(0, limit)
      for (const n of nearby) {
        getObjectImage(n.object.id, n.object.name, { ...opts, prefetch: false }).catch(() => {})
      }
    }
  }

  return result
}
