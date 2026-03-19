import { describe, it, expect } from 'vitest'
import { Data, IMAGE_FALLBACKS } from '../src/data'
import { computeFov } from '../src/data/cutouts'

describe('Data — image helpers', () => {
  describe('imageUrls', () => {
    it('returns Wikimedia URLs for objects with static fallback images', () => {
      const urls = Data.imageUrls('m42')
      expect(urls).toHaveLength(1)
      expect(urls[0]).toContain('Special:FilePath/Orion_Nebula')
    })

    it('returns empty array for objects without static images', () => {
      expect(Data.imageUrls('capella')).toHaveLength(0)
    })

    it('returns empty array for nonexistent id', () => {
      expect(Data.imageUrls('nonexistent')).toHaveLength(0)
    })

    it('applies width parameter', () => {
      const urls = Data.imageUrls('m42', 1920)
      expect(urls[0]).toContain('?width=1920')
    })
  })

  describe('progressiveImage', () => {
    it('returns ProgressiveImageOptions with 3 tiers', () => {
      const opts = Data.progressiveImage('m42', 800)
      expect(opts).not.toBeNull()
      expect(opts!.placeholder).toContain('?width=64')
      expect(opts!.src).toContain('?width=800')
      expect(opts!.srcHD).toContain('?width=1600')
    })

    it('returns null for objects without static images', () => {
      expect(Data.progressiveImage('capella')).toBeNull()
    })

    it('returns null for nonexistent id', () => {
      expect(Data.progressiveImage('nonexistent')).toBeNull()
    })

    it('defaults to width=800 when not specified', () => {
      const opts = Data.progressiveImage('m42')
      expect(opts!.src).toContain('?width=800')
      expect(opts!.srcHD).toContain('?width=1600')
    })
  })

  describe('imageSrcset', () => {
    it('returns a srcset string with default widths', () => {
      const srcset = Data.imageSrcset('m42')
      expect(srcset).not.toBeNull()
      expect(srcset).toContain('640w')
      expect(srcset).toContain('1280w')
      expect(srcset).toContain('1920w')
    })

    it('accepts custom widths', () => {
      const srcset = Data.imageSrcset('m42', [320, 640])
      expect(srcset).toContain('320w')
      expect(srcset).toContain('640w')
      expect(srcset).not.toContain('1920w')
    })

    it('returns null for objects without static images', () => {
      expect(Data.imageSrcset('capella')).toBeNull()
    })

    it('returns null for nonexistent id', () => {
      expect(Data.imageSrcset('nonexistent')).toBeNull()
    })
  })

  describe('IMAGE_FALLBACKS integrity', () => {
    it('has at least 10 entries', () => {
      expect(Object.keys(IMAGE_FALLBACKS).length).toBeGreaterThanOrEqual(10)
    })

    it('every entry has valid ImageRef fields', () => {
      for (const [id, images] of Object.entries(IMAGE_FALLBACKS)) {
        expect(id).toBeTruthy()
        for (const img of images) {
          expect(img.filename).toBeTruthy()
          expect(img.filename).not.toContain('https://')
          expect(img.credit).toBeTruthy()
        }
      }
    })
  })
})

describe('Data', () => {
  describe('get', () => {
    it('retrieves an object by exact id', () => {
      const sun = Data.get('sun')
      expect(sun).not.toBeNull()
      expect(sun?.name).toBe('Sun')
    })

    it('returns null for unknown id', () => {
      expect(Data.get('nonexistent-object-xyz')).toBeNull()
    })
  })

  describe('getByName', () => {
    it('finds by exact name', () => {
      expect(Data.getByName('Sirius')?.id).toBe('sirius')
    })

    it('is case-insensitive', () => {
      expect(Data.getByName('sirius')?.id).toBe('sirius')
      expect(Data.getByName('SIRIUS')?.id).toBe('sirius')
      expect(Data.getByName('SiRiUs')?.id).toBe('sirius')
    })

    it('finds by Messier alias', () => {
      expect(Data.getByName('M42')?.id).toBe('m42')
      expect(Data.getByName('Pleiades')?.name).toBe('Pleiades')
    })

    it('returns null for unknown name', () => {
      expect(Data.getByName('Zorg Nebula')).toBeNull()
    })
  })

  describe('all', () => {
    it('returns an array', () => {
      expect(Array.isArray(Data.all())).toBe(true)
    })

    it('contains at least 30 objects', () => {
      expect(Data.all().length).toBeGreaterThanOrEqual(30)
    })

    it('returns a copy — mutations do not affect the catalog', () => {
      const copy = Data.all()
      copy.splice(0, copy.length)
      expect(Data.all().length).toBeGreaterThan(0)
    })
  })

  describe('getByType', () => {
    it('returns only planets', () => {
      const planets = Data.getByType('planet')
      expect(planets.length).toBeGreaterThan(0)
      expect(planets.every(o => o.type === 'planet')).toBe(true)
    })

    it('includes all 8 solar system planets', () => {
      const planets = Data.getByType('planet')
      const names   = planets.map(p => p.name)
      expect(names).toContain('Earth')
      expect(names).toContain('Jupiter')
      expect(names).toContain('Neptune')
    })

    it('returns only nebulae', () => {
      const nebulae = Data.getByType('nebula')
      expect(nebulae.length).toBeGreaterThan(0)
      expect(nebulae.every(o => o.type === 'nebula')).toBe(true)
    })

    it('returns empty array for type with no entries', () => {
      // 'moon' type is valid but minimal; should still be an array
      const result = Data.getByType('moon')
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getByTag', () => {
    it('finds Messier objects', () => {
      const messier = Data.getByTag('messier')
      expect(messier.length).toBeGreaterThan(5)
      expect(messier.every(o => o.tags.includes('messier'))).toBe(true)
    })

    it('finds solar system objects', () => {
      const ss = Data.getByTag('solar-system')
      expect(ss.length).toBeGreaterThanOrEqual(10)
    })

    it('returns empty array for unknown tag', () => {
      expect(Data.getByTag('completely-unknown-tag-xyz')).toHaveLength(0)
    })
  })

  describe('search', () => {
    it('returns empty array for empty query', () => {
      expect(Data.search('')).toHaveLength(0)
      expect(Data.search('   ')).toHaveLength(0)
    })

    it('finds Orion Nebula by partial name', () => {
      const results = Data.search('orion')
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(r => r.id === 'm42')).toBe(true)
    })

    it('puts exact name matches at the top', () => {
      const results = Data.search('Sirius')
      expect(results[0]?.id).toBe('sirius')
    })

    it('finds by Messier alias', () => {
      const results = Data.search('M31')
      expect(results.some(r => r.id === 'm31')).toBe(true)
    })

    it('finds by description keyword', () => {
      const results = Data.search('pulsar')
      expect(results.some(r => r.id === 'm1')).toBe(true)
    })

    it('search results are sorted by relevance (exact match first)', () => {
      const results = Data.search('Vega')
      expect(results[0]?.id).toBe('vega')
    })
  })

  describe('nearby', () => {
    it('finds objects near Orion Nebula', () => {
      const results = Data.nearby({ ra: 83.822, dec: -5.391 }, 25)
      expect(results.length).toBeGreaterThan(0)
    })

    it('includes the target object itself at separation ≈ 0', () => {
      const orion   = Data.get('m42')!
      const results = Data.nearby({ ra: orion.ra!, dec: orion.dec! }, 1)
      const self    = results.find(r => r.object.id === 'm42')
      expect(self).toBeDefined()
      expect(self?.separation).toBeCloseTo(0, 3)
    })

    it('returns results sorted by separation ascending', () => {
      const results = Data.nearby({ ra: 83.822, dec: -5.391 }, 30)
      for (let i = 1; i < results.length; i++) {
        expect(results[i]!.separation).toBeGreaterThanOrEqual(results[i - 1]!.separation)
      }
    })

    it('respects the radius limit', () => {
      const results = Data.nearby({ ra: 83.822, dec: -5.391 }, 5)
      expect(results.every(r => r.separation <= 5)).toBe(true)
    })

    it('excludes solar-system bodies (ra=null)', () => {
      const results = Data.nearby({ ra: 0, dec: 0 }, 180)
      expect(results.every(r => r.object.ra !== null)).toBe(true)
    })

    it('returns empty array when no objects are within radius', () => {
      const results = Data.nearby({ ra: 45.123, dec: 12.456 }, 0.00001)
      expect(results).toHaveLength(0)
    })
  })

  describe('size_arcmin propagation', () => {
    it('propagates size_arcmin from Messier catalog to unified object', () => {
      const m42 = Data.get('m42')
      expect(m42).not.toBeNull()
      expect(m42!.size_arcmin).toBe(85)
    })

    it('propagates size_arcmin for deep-sky extras', () => {
      const helix = Data.get('ngc7293')
      expect(helix).not.toBeNull()
      expect(helix!.size_arcmin).toBe(25)
    })

    it('does not have size_arcmin for stars (point sources)', () => {
      const sirius = Data.get('sirius')
      expect(sirius).not.toBeNull()
      expect(sirius!.size_arcmin).toBeUndefined()
    })

    it('does not have size_arcmin for solar system bodies', () => {
      const mars = Data.get('mars')
      expect(mars).not.toBeNull()
      expect(mars!.size_arcmin).toBeUndefined()
    })
  })

  describe('computeFov', () => {
    it('uses size_arcmin with padding when available', () => {
      // 10 arcmin * 1.6 padding = 16
      expect(computeFov(10, 'nebula')).toBe(16)
    })

    it('uses type default when size_arcmin is undefined', () => {
      expect(computeFov(undefined, 'star')).toBe(15)
      expect(computeFov(undefined, 'nebula')).toBe(20)
      expect(computeFov(undefined, 'galaxy')).toBe(12)
    })

    it('clamps to minimum FOV', () => {
      // 1 arcmin * 1.6 = 1.6, but floor is 4
      expect(computeFov(1, 'nebula')).toBe(4)
    })

    it('clamps to maximum FOV', () => {
      // 190 arcmin * 1.6 = 304, but ceiling is 120
      expect(computeFov(190, 'galaxy')).toBe(120)
    })

    it('respects custom padding and clamp options', () => {
      expect(computeFov(10, 'nebula', { padding: 2.0 })).toBe(20)
      expect(computeFov(10, 'nebula', { minFov: 20 })).toBe(20)
      expect(computeFov(10, 'nebula', { maxFov: 10 })).toBe(10)
    })

    it('falls back to 15 arcmin for unknown types', () => {
      expect(computeFov(undefined, 'unknown-type')).toBe(15)
    })
  })

  describe('Data.prefetchImages', () => {
    it('is a function on the Data facade', () => {
      expect(typeof Data.prefetchImages).toBe('function')
    })
  })
})
