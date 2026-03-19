import type {
  NASAImageResult,
  APODResult,
  ESAHubbleResult,
  SimbadResult,
} from './types.js'

// ── NASA ─────────────────────────────────────────────────────────────────────

/**
 * Options for filtering and paginating NASA Image and Video Library searches.
 *
 * @see {@link NASA.searchImages} for usage.
 */
export interface NASASearchOptions {
  /** Media type filter. Defaults to `'image'`. */
  mediaType?: 'image' | 'video' | 'audio'
  /** Restrict results to items published on or after this year. */
  yearStart?: number
  /** Restrict results to items published on or before this year. */
  yearEnd?: number
  /** Number of results per page. Defaults to `10`. */
  pageSize?: number
  /** 1-based page number for pagination. Defaults to `1`. */
  page?: number
}

let _nasaApiKey = 'DEMO_KEY'

/**
 * Client for the NASA public APIs, including the Image and Video Library
 * and the Astronomy Picture of the Day (APOD) service.
 *
 * By default requests use the `DEMO_KEY` API key, which is subject to
 * strict rate limits. Call {@link NASA.setApiKey} with a free key from
 * {@link https://api.nasa.gov} before making production requests.
 *
 * @example
 * ```ts
 * import { NASA } from 'cosmos-lib'
 *
 * NASA.setApiKey('your-api-key')
 * const results = await NASA.searchImages('pillars of creation')
 * console.log(results[0].title)
 * ```
 */
export const NASA = {
  /**
   * Set the NASA API key used for APOD requests.
   *
   * The default key (`DEMO_KEY`) is heavily rate-limited (30 req/hr,
   * 50 req/day). Register for a free key at {@link https://api.nasa.gov}
   * to raise these limits to 1,000 req/hr.
   *
   * @param key - Your NASA API key.
   *
   * @example
   * ```ts
   * NASA.setApiKey('Ab12Cd34Ef56Gh78Ij90KlMnOpQrStUvWxYz0123')
   * ```
   */
  setApiKey(key: string): void {
    _nasaApiKey = key
  },

  /**
   * Search the NASA Image and Video Library.
   *
   * Queries the public NASA images API and returns an array of
   * {@link NASAImageResult} objects containing metadata and preview URLs.
   *
   * @param query - Free-text search term (e.g. `'pillars of creation'`).
   * @param opts  - Optional filters and pagination settings.
   *
   * @returns An array of search results. An empty array is returned when
   *          the query matches nothing.
   *
   * @throws {Error} If the NASA API responds with a non-2xx status code.
   *
   * @example
   * ```ts
   * const results = await NASA.searchImages('pillars of creation', {
   *   yearStart: 2010,
   *   pageSize: 5,
   * })
   * for (const r of results) {
   *   console.log(r.title, r.previewUrl)
   * }
   * ```
   *
   * @see {@link https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf | NASA Image API docs}
   */
  async searchImages(
    query: string,
    opts: NASASearchOptions = {},
  ): Promise<NASAImageResult[]> {
    const { mediaType = 'image', yearStart, yearEnd, pageSize = 10, page = 1 } = opts
    const params = new URLSearchParams({
      q:          query,
      media_type: mediaType,
      page:       String(page),
      page_size:  String(pageSize),
    })
    if (yearStart) params.set('year_start', String(yearStart))
    if (yearEnd)   params.set('year_end',   String(yearEnd))

    const res = await fetch(`https://images-api.nasa.gov/search?${params.toString()}`)
    if (!res.ok) throw new Error(`NASA Image API error: ${res.status} ${res.statusText}`)
    const json = await res.json() as {
      collection?: {
        items?: Array<{
          data?: Array<{
            nasa_id?: string
            title?: string
            description?: string
            date_created?: string
            center?: string
            keywords?: string[]
          }>
          links?: Array<{ rel: string; href: string }>
          href?: string
        }>
      }
    }

    return (json.collection?.items ?? []).map(item => ({
      nasaId:      item.data?.[0]?.nasa_id      ?? '',
      title:       item.data?.[0]?.title        ?? '',
      description: item.data?.[0]?.description  ?? '',
      date:        item.data?.[0]?.date_created ?? '',
      center:      item.data?.[0]?.center       ?? '',
      keywords:    item.data?.[0]?.keywords     ?? [],
      previewUrl:  item.links?.find(l => l.rel === 'preview')?.href ?? null,
      href:        item.href ?? '',
    }))
  },

  /**
   * Fetch all asset URLs for a given NASA image ID.
   *
   * Returns the full list of available renditions (JPEG, TIFF, etc.)
   * sorted by quality: original, large, medium, small, then thumbnail.
   *
   * @param nasaId - The NASA-assigned identifier (e.g. `'PIA06890'`).
   *
   * @returns An array of absolute URLs sorted from highest to lowest quality.
   *
   * @throws {Error} If the NASA asset endpoint responds with a non-2xx status.
   *
   * @example
   * ```ts
   * const urls = await NASA.getAssets('PIA06890')
   * console.log(urls[0]) // highest quality rendition
   * ```
   */
  async getAssets(nasaId: string): Promise<string[]> {
    const res = await fetch(
      `https://images-api.nasa.gov/asset/${encodeURIComponent(nasaId)}`
    )
    if (!res.ok) throw new Error(`NASA asset fetch error: ${res.status}`)
    const json = await res.json() as { collection?: { items?: Array<{ href: string }> } }

    const rank = (url: string): number => {
      if (url.includes('~orig'))   return 0
      if (url.includes('~large'))  return 1
      if (url.includes('~medium')) return 2
      if (url.includes('~small'))  return 3
      return 4
    }

    return (json.collection?.items ?? [])
      .map(item => item.href)
      .sort((a, b) => rank(a) - rank(b))
  },

  /**
   * Convenience helper that returns the single highest-quality image URL
   * for a NASA asset ID.
   *
   * Internally calls {@link NASA.getAssets} and filters for image file
   * extensions (JPEG, PNG, GIF, TIFF), returning the first match (which
   * is the original-resolution rendition when available).
   *
   * @param nasaId - The NASA-assigned identifier (e.g. `'PIA06890'`).
   *
   * @returns The URL of the best available image, or `null` if no image
   *          renditions exist for the given ID.
   *
   * @throws {Error} If the underlying {@link NASA.getAssets} call fails.
   *
   * @example
   * ```ts
   * const url = await NASA.getBestImageUrl('PIA06890')
   * if (url) {
   *   document.querySelector('img')!.src = url
   * }
   * ```
   */
  async getBestImageUrl(nasaId: string): Promise<string | null> {
    const assets    = await this.getAssets(nasaId)
    const imgAssets = assets.filter(u => /\.(jpe?g|png|gif|tiff?)$/i.test(u))
    return imgAssets[0] ?? null
  },

  /**
   * Fetch the NASA Astronomy Picture of the Day (APOD).
   *
   * Returns a single {@link APODResult} containing the title, explanation,
   * standard and HD image URLs, and copyright information.
   *
   * @param date - An ISO-8601 date string (`'2024-06-15'`) or a `Date`
   *               object. When omitted the API returns today's picture.
   *
   * @returns The APOD entry for the requested date.
   *
   * @throws {Error} If the APOD API responds with a non-2xx status code
   *                 (e.g. 403 for an invalid API key, 404 for a date with
   *                 no entry).
   *
   * @example
   * ```ts
   * // Today's APOD
   * const today = await NASA.apod()
   * console.log(today.title, today.hdUrl)
   *
   * // A specific date
   * const historic = await NASA.apod('1995-06-16')
   * ```
   */
  async apod(date?: string | Date): Promise<APODResult> {
    const params = new URLSearchParams({ api_key: _nasaApiKey })
    if (date) {
      const d = date instanceof Date ? date : new Date(date)
      params.set('date', d.toISOString().slice(0, 10))
    }
    const res = await fetch(`https://api.nasa.gov/planetary/apod?${params.toString()}`)
    if (!res.ok) throw new Error(`APOD error: ${res.status} ${res.statusText}`)
    const json = await res.json() as {
      title: string; date: string; explanation: string
      url: string; hdurl?: string; media_type: string; copyright?: string
    }
    return {
      title:       json.title,
      date:        json.date,
      explanation: json.explanation,
      url:         json.url,
      hdUrl:       json.hdurl ?? json.url,
      mediaType:   json.media_type === 'video' ? 'video' : 'image',
      copyright:   json.copyright ?? 'NASA',
    }
  },

  /**
   * Fetch a random selection of recent APOD entries.
   *
   * Uses the `count` parameter of the APOD API to retrieve multiple
   * randomly-selected entries at once. Thumbnails are requested for
   * video entries.
   *
   * @param count - Number of random entries to return. Defaults to `7`.
   *                The NASA API supports a maximum of `100`.
   *
   * @returns An array of {@link APODResult} objects.
   *
   * @throws {Error} If the APOD API responds with a non-2xx status code.
   *
   * @example
   * ```ts
   * const week = await NASA.recentAPOD()
   * for (const entry of week) {
   *   console.log(`${entry.date}: ${entry.title}`)
   * }
   *
   * // Fetch 20 random entries
   * const batch = await NASA.recentAPOD(20)
   * ```
   */
  async recentAPOD(count = 7): Promise<APODResult[]> {
    const params = new URLSearchParams({
      api_key: _nasaApiKey,
      count:   String(count),
      thumbs:  'true',
    })
    const res = await fetch(`https://api.nasa.gov/planetary/apod?${params.toString()}`)
    if (!res.ok) throw new Error(`APOD error: ${res.status} ${res.statusText}`)
    const json = await res.json() as Array<{
      title: string; date: string; explanation: string
      url: string; hdurl?: string; media_type: string; copyright?: string
    }>
    return json.map(item => ({
      title:       item.title,
      date:        item.date,
      explanation: item.explanation,
      url:         item.url,
      hdUrl:       item.hdurl ?? item.url,
      mediaType:   item.media_type === 'video' ? 'video' : 'image',
      copyright:   item.copyright ?? 'NASA',
    }))
  },
}

// ── ESA ──────────────────────────────────────────────────────────────────────

/**
 * Client for the European Space Agency (ESA) Hubble Space Telescope
 * public image archive.
 *
 * @example
 * ```ts
 * import { ESA } from 'cosmos-lib'
 *
 * const images = await ESA.searchHubble('crab nebula', 5)
 * console.log(images[0].title, images[0].imageUrl)
 * ```
 */
export const ESA = {
  /**
   * Search the ESA Hubble Space Telescope image archive.
   *
   * Queries the ESAHubble public REST API and returns an array of
   * {@link ESAHubbleResult} objects with image metadata and URLs.
   *
   * @param query - Free-text search term (e.g. `'crab nebula'`).
   * @param limit - Maximum number of results to return. Defaults to `10`.
   *
   * @returns An array of matching Hubble image results. Each result
   *          includes both a full-resolution `imageUrl` and a
   *          screen-sized `thumbUrl`.
   *
   * @throws {Error} If the ESA API responds with a non-2xx status code.
   *
   * @example
   * ```ts
   * const results = await ESA.searchHubble('crab nebula', 3)
   * for (const r of results) {
   *   console.log(r.title, r.thumbUrl)
   * }
   * ```
   *
   * @see {@link https://esahubble.org/api/v1/ | ESA Hubble API docs}
   */
  async searchHubble(query: string, limit = 10): Promise<ESAHubbleResult[]> {
    const res = await fetch(
      `https://esahubble.org/api/v1/images/?search=${encodeURIComponent(query)}&limit=${limit}`
    )
    if (!res.ok) throw new Error(`ESA Hubble API error: ${res.status}`)
    const json = await res.json() as {
      results?: Array<{
        id?: string; title?: string; description?: string; credit?: string
        release_date?: string; image_files?: Array<{ file_url?: string }>
        subject_category?: string[]
      }>
    }
    return (json.results ?? []).map(item => {
      const fileUrl = item.image_files?.[0]?.file_url ?? null
      return {
        id:          item.id          ?? '',
        title:       item.title       ?? '',
        description: item.description ?? '',
        credit:      item.credit      ?? '',
        date:        item.release_date ?? '',
        imageUrl:    fileUrl,
        thumbUrl:    fileUrl?.replace('original', 'screen') ?? null,
        tags:        item.subject_category ?? [],
      }
    })
  },
}

// ── Simbad ───────────────────────────────────────────────────────────────────

/**
 * Resolve an astronomical object name through the CDS SIMBAD TAP service.
 *
 * Performs an ADQL query against the SIMBAD database at the Strasbourg
 * Astronomical Data Centre (CDS) and returns the J2000 equatorial
 * coordinates and object type for the first match.
 *
 * @param objectName - Any object identifier recognised by SIMBAD
 *                     (e.g. `'M1'`, `'NGC 6611'`, `'Betelgeuse'`).
 *
 * @returns A {@link SimbadResult} with the main identifier, RA/Dec in
 *          degrees, and the SIMBAD object-type code, or `null` if the
 *          object name could not be resolved.
 *
 * @throws {Error} If the SIMBAD TAP endpoint responds with a non-2xx
 *                 status code.
 *
 * @example
 * ```ts
 * import { resolveSimbad } from 'cosmos-lib'
 *
 * const m1 = await resolveSimbad('M1')
 * if (m1) {
 *   console.log(`RA: ${m1.ra}, Dec: ${m1.dec}, Type: ${m1.type}`)
 * }
 *
 * const star = await resolveSimbad('Betelgeuse')
 * // => { id: '* alf Ori', ra: 88.792..., dec: 7.407..., type: 'LP*' }
 * ```
 */
export async function resolveSimbad(objectName: string): Promise<SimbadResult | null> {
  const body = new URLSearchParams({
    REQUEST: 'doQuery',
    LANG:    'ADQL',
    FORMAT:  'json',
    QUERY:   [
      'SELECT TOP 1 main_id, ra, dec, otype',
      'FROM basic',
      'JOIN ident ON ident.oidref = basic.oid',
      `WHERE id = '${objectName.replace(/'/g, "''")}'`,
    ].join(' '),
  })

  const res = await fetch('https://simbad.cds.unistra.fr/simbad/sim-tap/sync', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })
  if (!res.ok) throw new Error(`Simbad error: ${res.status}`)

  const json = await res.json() as { data?: Array<[string, number, number, string]> }
  const row  = json.data?.[0]
  if (!row) return null
  return { id: row[0], ra: row[1], dec: row[2], type: row[3] }
}
