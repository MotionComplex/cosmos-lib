import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NASA, ESA, resolveSimbad } from '../src/api'

// ── Fetch mock helpers ────────────────────────────────────────────────────────

function mockFetch(body: unknown, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok:   status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  }))
}

function mockFetchError(status: number) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok:         false,
    status,
    statusText: 'Error',
    json:       () => Promise.resolve({}),
  }))
}

// ── Sample API payloads ───────────────────────────────────────────────────────

const NASA_IMAGE_PAYLOAD = {
  collection: {
    items: [
      {
        data: [{
          nasa_id:      'PIA00001',
          title:        'Orion Nebula Hubble',
          description:  'A beautiful nebula.',
          date_created: '2006-01-15T00:00:00Z',
          center:       'GSFC',
          keywords:     ['nebula', 'orion'],
        }],
        links: [{ rel: 'preview', href: 'https://images-assets.nasa.gov/thumb.jpg' }],
        href: 'https://images-assets.nasa.gov/collection/PIA00001',
      },
    ],
  },
}

const APOD_PAYLOAD = {
  title:       'Pillars of Creation',
  date:        '2024-01-15',
  explanation: 'These are the famous pillars.',
  url:         'https://apod.nasa.gov/apod/image/2401/pillars.jpg',
  hdurl:       'https://apod.nasa.gov/apod/image/2401/pillars_hd.jpg',
  media_type:  'image',
  copyright:   'NASA/ESA/Hubble',
}

const ESA_HTML_PAYLOAD = `<html><body><script>
var images = [
  { id: 'heic0601a', title: 'Pillars of Creation', width: 1280, height: 1024, src: 'https://cdn.esahubble.org/archives/images/thumb300y/heic0601a.jpg', url: '/images/heic0601a/', potw: '' }
];
</script></body></html>`

const ESA_HTML_EMPTY = `<html><body><p>No results</p></body></html>`

const SIMBAD_PAYLOAD = {
  data: [['Orion Nebula', 83.822, -5.391, 'RNe']],
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NASA API', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('setApiKey', () => {
    it('does not throw when setting a key', () => {
      expect(() => NASA.setApiKey('test-key-12345')).not.toThrow()
    })
  })

  describe('searchImages', () => {
    it('returns a mapped array of NASAImageResult', async () => {
      mockFetch(NASA_IMAGE_PAYLOAD)
      const results = await NASA.searchImages('orion')
      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({
        nasaId:    'PIA00001',
        title:     'Orion Nebula Hubble',
        center:    'GSFC',
        keywords:  ['nebula', 'orion'],
        previewUrl: 'https://images-assets.nasa.gov/thumb.jpg',
      })
    })

    it('returns empty array when collection has no items', async () => {
      mockFetch({ collection: { items: [] } })
      const results = await NASA.searchImages('nothing')
      expect(results).toHaveLength(0)
    })

    it('throws on non-OK response', async () => {
      mockFetchError(503)
      await expect(NASA.searchImages('orion')).rejects.toThrow('NASA Image API error: 503')
    })

    it('passes mediaType query param', async () => {
      mockFetch(NASA_IMAGE_PAYLOAD)
      await NASA.searchImages('nebula', { mediaType: 'video' })
      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(url).toContain('media_type=video')
    })

    it('passes yearStart and yearEnd when provided', async () => {
      mockFetch(NASA_IMAGE_PAYLOAD)
      await NASA.searchImages('hubble', { yearStart: 2000, yearEnd: 2010 })
      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(url).toContain('year_start=2000')
      expect(url).toContain('year_end=2010')
    })
  })

  describe('apod', () => {
    beforeEach(() => { NASA.setApiKey('DEMO_KEY') })

    it('returns a mapped APODResult', async () => {
      mockFetch(APOD_PAYLOAD)
      const result = await NASA.apod()
      expect(result).toMatchObject({
        title:     'Pillars of Creation',
        date:      '2024-01-15',
        hdUrl:     'https://apod.nasa.gov/apod/image/2401/pillars_hd.jpg',
        mediaType: 'image',
        copyright: 'NASA/ESA/Hubble',
      })
    })

    it('falls back to url when hdurl is missing', async () => {
      const payload = { ...APOD_PAYLOAD, hdurl: undefined }
      mockFetch(payload)
      const result = await NASA.apod()
      expect(result.hdUrl).toBe(APOD_PAYLOAD.url)
    })

    it('uses NASA as default copyright when field is absent', async () => {
      const payload = { ...APOD_PAYLOAD, copyright: undefined }
      mockFetch(payload)
      const result = await NASA.apod()
      expect(result.copyright).toBe('NASA')
    })

    it('passes a date param when given a Date object', async () => {
      mockFetch(APOD_PAYLOAD)
      await NASA.apod(new Date('2024-06-15T12:00:00Z'))
      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(url).toContain('date=2024-06-15')
    })

    it('throws on non-OK response', async () => {
      mockFetchError(429)
      await expect(NASA.apod()).rejects.toThrow('APOD error: 429')
    })
  })

  describe('recentAPOD', () => {
    it('returns an array of APODResult', async () => {
      mockFetch([APOD_PAYLOAD, APOD_PAYLOAD])
      const results = await NASA.recentAPOD(2)
      expect(results).toHaveLength(2)
      expect(results[0]?.title).toBe('Pillars of Creation')
    })

    it('requests the correct count', async () => {
      mockFetch([APOD_PAYLOAD])
      await NASA.recentAPOD(5)
      const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as string
      expect(url).toContain('count=5')
    })
  })

  describe('getAssets', () => {
    it('sorts assets — orig first, then large, medium, small', async () => {
      mockFetch({
        collection: {
          items: [
            { href: 'https://img.nasa.gov/img~small.jpg' },
            { href: 'https://img.nasa.gov/img~orig.jpg' },
            { href: 'https://img.nasa.gov/img~medium.jpg' },
            { href: 'https://img.nasa.gov/img~large.jpg' },
          ],
        },
      })
      const assets = await NASA.getAssets('PIA00001')
      expect(assets[0]).toContain('~orig')
      expect(assets[1]).toContain('~large')
      expect(assets[2]).toContain('~medium')
      expect(assets[3]).toContain('~small')
    })
  })
})

describe('ESA API', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  describe('searchHubble', () => {
    it('returns mapped ESAHubbleResult array', async () => {
      mockFetch(ESA_HTML_PAYLOAD)
      const results = await ESA.searchHubble('pillars')
      expect(results).toHaveLength(1)
      expect(results[0]).toMatchObject({
        id:      'heic0601a',
        title:   'Pillars of Creation',
        credit:  'ESA/Hubble',
      })
    })

    it('builds CDN image and thumb URLs from id', async () => {
      mockFetch(ESA_HTML_PAYLOAD)
      const results = await ESA.searchHubble('pillars')
      expect(results[0]?.imageUrl).toBe('https://cdn.esahubble.org/archives/images/large/heic0601a.jpg')
      expect(results[0]?.thumbUrl).toBe('https://cdn.esahubble.org/archives/images/screen/heic0601a.jpg')
    })

    it('returns empty array when no images var is found', async () => {
      mockFetch(ESA_HTML_EMPTY)
      const results = await ESA.searchHubble('none')
      expect(results).toHaveLength(0)
    })

    it('throws on non-OK response', async () => {
      mockFetchError(404)
      await expect(ESA.searchHubble('test')).rejects.toThrow('ESA Hubble API error: 404')
    })
  })
})

describe('resolveSimbad', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('returns a SimbadResult for a known object', async () => {
    mockFetch(SIMBAD_PAYLOAD)
    const result = await resolveSimbad('M42')
    expect(result).toMatchObject({
      id:   'Orion Nebula',
      ra:   83.822,
      dec:  -5.391,
      type: 'RNe',
    })
  })

  it('returns null when no data rows returned', async () => {
    mockFetch({ data: [] })
    const result = await resolveSimbad('UnknownObject')
    expect(result).toBeNull()
  })

  it('throws on non-OK response', async () => {
    mockFetchError(500)
    await expect(resolveSimbad('M42')).rejects.toThrow('Simbad error: 500')
  })

  it('uses POST method', async () => {
    mockFetch(SIMBAD_PAYLOAD)
    await resolveSimbad('Sirius')
    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(call[1]?.method).toBe('POST')
  })
})
