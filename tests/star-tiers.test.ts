import { describe, it, expect } from 'vitest'
import { Data } from '../src/data/index'

describe('Star Tiers', () => {
  describe('loadedStarTiers', () => {
    it('starts with tier 0', () => {
      const tiers = Data.loadedStarTiers()
      expect(tiers.has(0)).toBe(true)
      expect(tiers.size).toBe(1)
    })
  })

  describe('loadStarTier(1)', () => {
    it('loads ~9110 tier 1 stars', async () => {
      const countBefore = Data.all().length
      const added = await Data.loadStarTier(1)

      expect(added).toBeGreaterThan(9000)
      expect(added).toBeLessThan(10000)
      expect(Data.all().length).toBe(countBefore + added)
    })

    it('marks tier 1 as loaded', () => {
      expect(Data.loadedStarTiers().has(1)).toBe(true)
    })

    it('is idempotent — second call returns 0', async () => {
      const added = await Data.loadStarTier(1)
      expect(added).toBe(0)
    })

    it('tier 1 stars are in the catalog with valid coords', () => {
      const allStars = Data.getByType('star')
      const tier1Stars = allStars.filter(s => s.tags.includes('tier-1'))

      expect(tier1Stars.length).toBeGreaterThan(9000)
      for (const s of tier1Stars.slice(0, 100)) {
        expect(s.ra).toBeGreaterThanOrEqual(0)
        expect(s.ra).toBeLessThan(360)
        expect(s.dec).toBeGreaterThanOrEqual(-90)
        expect(s.dec).toBeLessThanOrEqual(90)
        expect(s.magnitude).toBeGreaterThanOrEqual(1)
        expect(s.magnitude).toBeLessThanOrEqual(7)
      }
    })

    it('tier 1 stars appear in nearby() results', () => {
      // Galactic center region (RA~266, Dec~-29) has high star density
      const nearby = Data.nearby({ ra: 266, dec: -29 }, 20)
      const hasTier1 = nearby.some(r => r.object.tags.includes('tier-1'))
      expect(hasTier1).toBe(true)
    })
  })

  describe('loadStarTier(2)', () => {
    it('loads ~120000 tier 2 stars', async () => {
      const countBefore = Data.all().length
      const added = await Data.loadStarTier(2)

      expect(added).toBeGreaterThan(100000)
      expect(added).toBeLessThan(130000)
      expect(Data.all().length).toBe(countBefore + added)
    })

    it('marks tier 2 as loaded', () => {
      expect(Data.loadedStarTiers().has(2)).toBe(true)
    })

    it('tier 2 stars have fainter magnitudes', () => {
      const tier2Stars = Data.getByType('star').filter(s => s.tags.includes('tier-2'))
      const avgMag = tier2Stars.reduce((sum, s) => sum + (s.magnitude ?? 0), 0) / tier2Stars.length

      // Tier 2 average magnitude should be around 7-9
      expect(avgMag).toBeGreaterThan(7)
      expect(avgMag).toBeLessThan(10)
    })
  })
})
