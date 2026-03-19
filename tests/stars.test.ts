import { describe, it, expect } from 'vitest'
import { BRIGHT_STARS } from '../src/data/stars'
import { Data } from '../src/data'

describe('Bright Star Catalog', () => {
  it('contains a substantial number of stars', () => {
    expect(BRIGHT_STARS.length).toBeGreaterThan(100)
  })

  it('all stars have required fields', () => {
    for (const star of BRIGHT_STARS) {
      expect(star.id).toBeTruthy()
      expect(star.name).toBeTruthy()
      expect(star.con).toHaveLength(3)
      expect(star.ra).toBeGreaterThanOrEqual(0)
      expect(star.ra).toBeLessThan(360)
      expect(star.dec).toBeGreaterThanOrEqual(-90)
      expect(star.dec).toBeLessThanOrEqual(90)
      expect(star.spec).toBeTruthy()
      expect(typeof star.mag).toBe('number')
      expect(typeof star.bv).toBe('number')
    }
  })

  it('Sirius is the brightest star', () => {
    const sirius = BRIGHT_STARS.find(s => s.name === 'Sirius')
    expect(sirius).toBeDefined()
    expect(sirius!.mag).toBeCloseTo(-1.46, 1)
    expect(sirius!.con).toBe('CMa')
    expect(sirius!.ra).toBeCloseTo(101.287, 1)
    expect(sirius!.dec).toBeCloseTo(-16.716, 1)
  })

  it('Polaris is included', () => {
    const polaris = BRIGHT_STARS.find(s => s.name === 'Polaris')
    expect(polaris).toBeDefined()
    expect(polaris!.con).toBe('UMi')
    expect(polaris!.dec).toBeGreaterThan(89) // near the pole
  })

  it('Proxima Centauri is included (faintest named star)', () => {
    const proxima = BRIGHT_STARS.find(s => s.name === 'Proxima Centauri')
    expect(proxima).toBeDefined()
    expect(proxima!.mag).toBeGreaterThan(11)
  })

  describe('Data.getStarByName', () => {
    it('finds Sirius case-insensitively', () => {
      expect(Data.getStarByName('sirius')).toBeDefined()
      expect(Data.getStarByName('SIRIUS')).toBeDefined()
    })

    it('returns null for unknown star', () => {
      expect(Data.getStarByName('nonexistent')).toBeNull()
    })
  })

  describe('Data.getStarsByConstellation', () => {
    it('finds stars in Orion', () => {
      const oriStars = Data.getStarsByConstellation('Ori')
      expect(oriStars.length).toBeGreaterThanOrEqual(3) // Betelgeuse, Rigel, Bellatrix at minimum
    })
  })

  describe('Data.nearbyStars', () => {
    it('finds stars near Orion belt', () => {
      const results = Data.nearbyStars({ ra: 84, dec: -1 }, 5)
      expect(results.length).toBeGreaterThan(0)
      // Mintaka, Alnilam, Alnitak should all be within 5°
    })
  })
})
