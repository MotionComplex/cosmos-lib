import type {
  NASAImageResult,
  APODResult,
  ESAHubbleResult,
  SimbadResult,
} from './types.js'

// ── NASA ─────────────────────────────────────────────────────────────────────

export interface NASASearchOptions {
  mediaType?: 'image' | 'video' | 'audio'
  yearStart?: number
  yearEnd?: number
  pageSize?: number
  page?: number
}

let _nasaApiKey = 'DEMO_KEY'

export const NASA = {
  /** Set a NASA API key for higher rate limits. Get one free at https://api.nasa.gov */
  setApiKey(key: string): void {
    _nasaApiKey = key
  },

  /**
   * Search the NASA Image and Video Library.
   * Docs: https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf
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
   * Returns URLs sorted: original → large → medium → small → thumb.
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
   * Convenience: get the highest-quality image URL for a NASA ID.
   * Tries orig → large → medium → small in order.
   */
  async getBestImageUrl(nasaId: string): Promise<string | null> {
    const assets    = await this.getAssets(nasaId)
    const imgAssets = assets.filter(u => /\.(jpe?g|png|gif|tiff?)$/i.test(u))
    return imgAssets[0] ?? null
  },

  /**
   * Astronomy Picture of the Day.
   * @param date  optional ISO date string or Date (defaults to today)
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
   * @param count  number of entries to fetch (default 7)
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

export const ESA = {
  /**
   * Search the ESA Hubble Space Telescope image archive.
   * Docs: https://esahubble.org/api/v1/
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
 * Resolve any object name recognised by CDS Simbad.
 * Returns basic coordinates and type, or null if not found.
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
