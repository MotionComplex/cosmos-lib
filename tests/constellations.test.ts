import { describe, it, expect } from 'vitest'
import { CONSTELLATIONS } from '../src/data/constellations'
import { Data } from '../src/data'

describe('Constellations', () => {
  it('contains exactly 88 constellations', () => {
    expect(CONSTELLATIONS.length).toBe(88)
  })

  it('all abbreviations are 3 characters', () => {
    for (const c of CONSTELLATIONS) {
      expect(c.abbr).toHaveLength(3)
    }
  })

  it('no duplicate abbreviations', () => {
    const abbrs = CONSTELLATIONS.map(c => c.abbr)
    expect(new Set(abbrs).size).toBe(88)
  })

  it('all have non-empty names and genitives', () => {
    for (const c of CONSTELLATIONS) {
      expect(c.name.length).toBeGreaterThan(0)
      expect(c.genitive.length).toBeGreaterThan(0)
    }
  })

  it('all have valid center coordinates', () => {
    for (const c of CONSTELLATIONS) {
      expect(c.ra).toBeGreaterThanOrEqual(0)
      expect(c.ra).toBeLessThan(360)
      expect(c.dec).toBeGreaterThanOrEqual(-90)
      expect(c.dec).toBeLessThanOrEqual(90)
    }
  })

  it('all have positive area', () => {
    for (const c of CONSTELLATIONS) {
      expect(c.area).toBeGreaterThan(0)
    }
  })

  it('all have stick figure segments', () => {
    for (const c of CONSTELLATIONS) {
      expect(c.stickFigure.length).toBeGreaterThan(0)
      for (const seg of c.stickFigure) {
        expect(seg).toHaveLength(4) // [ra1, dec1, ra2, dec2]
      }
    }
  })

  it('Orion is present with correct data', () => {
    const ori = CONSTELLATIONS.find(c => c.abbr === 'Ori')
    expect(ori).toBeDefined()
    expect(ori!.name).toBe('Orion')
    expect(ori!.genitive).toBe('Orionis')
    expect(ori!.area).toBeCloseTo(594, -1) // 594.12 sq deg
  })

  it('Ursa Major is present', () => {
    const uma = CONSTELLATIONS.find(c => c.abbr === 'UMa')
    expect(uma).toBeDefined()
    expect(uma!.name).toBe('Ursa Major')
  })

  it('Hydra is the largest constellation', () => {
    const sorted = [...CONSTELLATIONS].sort((a, b) => b.area - a.area)
    expect(sorted[0]!.abbr).toBe('Hya')
  })

  it('Crux is the smallest constellation', () => {
    const sorted = [...CONSTELLATIONS].sort((a, b) => a.area - b.area)
    expect(sorted[0]!.abbr).toBe('Cru')
  })

  describe('Data.getConstellation', () => {
    it('finds Orion by abbreviation', () => {
      const ori = Data.getConstellation('Ori')
      expect(ori).toBeDefined()
      expect(ori!.name).toBe('Orion')
    })

    it('case-insensitive lookup', () => {
      expect(Data.getConstellation('ori')).toBeDefined()
      expect(Data.getConstellation('ORI')).toBeDefined()
    })

    it('returns null for invalid abbreviation', () => {
      expect(Data.getConstellation('XXX')).toBeNull()
    })
  })
})
