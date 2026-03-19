import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Media } from '../src/media'

// ── Image mock helpers ────────────────────────────────────────────────────────

function mockImageSuccess() {
  vi.stubGlobal('Image', class {
    onload:  (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_url: string) { setTimeout(() => this.onload?.(), 0) }
  })
}

function mockImageFailure() {
  vi.stubGlobal('Image', class {
    onload:  (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_url: string) { setTimeout(() => this.onerror?.(), 0) }
  })
}

function mockImageSequence(succeedAt: number) {
  let callCount = 0
  vi.stubGlobal('Image', class {
    onload:  (() => void) | null = null
    onerror: (() => void) | null = null
    set src(_url: string) {
      callCount++
      if (callCount >= succeedAt) {
        setTimeout(() => this.onload?.(), 0)
      } else {
        setTimeout(() => this.onerror?.(), 0)
      }
    }
  })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Media', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('chainLoad', () => {
    it('resolves with the first URL when it loads successfully', async () => {
      mockImageSuccess()
      const url = await Media.chainLoad(['https://example.com/a.jpg', 'https://example.com/b.jpg'])
      expect(url).toBe('https://example.com/a.jpg')
    })

    it('skips failing URLs and resolves with first success', async () => {
      mockImageSequence(3)  // first 2 fail, 3rd succeeds
      const urls = [
        'https://example.com/fail1.jpg',
        'https://example.com/fail2.jpg',
        'https://example.com/success.jpg',
      ]
      const url = await Media.chainLoad(urls)
      expect(url).toBe('https://example.com/success.jpg')
    })

    it('rejects when all URLs fail', async () => {
      mockImageFailure()
      await expect(
        Media.chainLoad(['https://example.com/a.jpg', 'https://example.com/b.jpg'])
      ).rejects.toThrow('All image URLs failed')
    })

    it('rejects immediately with an empty array', async () => {
      mockImageFailure()
      await expect(Media.chainLoad([])).rejects.toThrow()
    })

    it('does not mutate the input array', async () => {
      mockImageSuccess()
      const urls = ['https://example.com/a.jpg']
      const copy = [...urls]
      await Media.chainLoad(urls)
      expect(urls).toEqual(copy)
    })
  })

  describe('preload', () => {
    it('returns all URLs that loaded successfully', async () => {
      mockImageSuccess()
      const result = await Media.preload([
        'https://example.com/a.jpg',
        'https://example.com/b.jpg',
      ])
      expect(result).toHaveLength(2)
    })

    it('returns empty array when all fail', async () => {
      mockImageFailure()
      const result = await Media.preload(['https://example.com/a.jpg'])
      expect(result).toHaveLength(0)
    })

    it('returns only successful URLs in a mixed batch', async () => {
      mockImageSequence(2)  // 1st fails, 2nd succeeds
      const result = await Media.preload([
        'https://example.com/fail.jpg',
        'https://example.com/pass.jpg',
      ])
      expect(result).toHaveLength(1)
      expect(result[0]).toBe('https://example.com/pass.jpg')
    })
  })

  describe('wikimediaUrl', () => {
    it('builds the Special:FilePath URL correctly', () => {
      const url = Media.wikimediaUrl('Orion_Nebula.jpg')
      expect(url).toBe(
        'https://commons.wikimedia.org/wiki/Special:FilePath/Orion_Nebula.jpg'
      )
    })

    it('appends width param when provided', () => {
      const url = Media.wikimediaUrl('Orion_Nebula.jpg', 1920)
      expect(url).toContain('?width=1920')
    })

    it('URL-encodes special characters in filename', () => {
      const url = Media.wikimediaUrl('Andromeda Galaxy (with h-alpha).jpg')
      expect(url).toContain('Andromeda%20Galaxy%20')
    })
  })

  describe('cloudinaryUrl', () => {
    it('builds a correctly formatted URL', () => {
      const url = Media.cloudinaryUrl('mycloudname', 'nebula/orion', { w: 1920, f: 'webp', q: 'auto' })
      expect(url).toContain('mycloudname')
      expect(url).toContain('w_1920')
      expect(url).toContain('f_webp')
      expect(url).toContain('q_auto')
      expect(url).toContain('nebula/orion')
    })

    it('defaults to f_auto and q_auto', () => {
      const url = Media.cloudinaryUrl('mycloud', 'test/img')
      expect(url).toContain('f_auto')
      expect(url).toContain('q_auto')
    })

    it('omits width/height when not provided', () => {
      const url = Media.cloudinaryUrl('mycloud', 'test/img')
      expect(url).not.toContain('w_')
      expect(url).not.toContain('h_')
    })
  })

  describe('srcset', () => {
    it('generates a valid srcset string', () => {
      const result = Media.srcset([640, 1280, 1920], w => `https://cdn.example.com/img.jpg?w=${w}`)
      expect(result).toBe(
        'https://cdn.example.com/img.jpg?w=640 640w, ' +
        'https://cdn.example.com/img.jpg?w=1280 1280w, ' +
        'https://cdn.example.com/img.jpg?w=1920 1920w'
      )
    })

    it('returns empty string for empty widths array', () => {
      expect(Media.srcset([], w => `https://cdn.example.com/img.jpg?w=${w}`)).toBe('')
    })
  })
})
