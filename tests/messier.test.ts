import { describe, it, expect } from 'vitest'
import { MESSIER_CATALOG } from '../src/data/messier'
import { Data } from '../src/data'

describe('Messier Catalog', () => {
  it('contains exactly 110 objects', () => {
    expect(MESSIER_CATALOG.length).toBe(110)
  })

  it('M numbers are 1 through 110', () => {
    const numbers = MESSIER_CATALOG.map(m => m.messier).sort((a, b) => a - b)
    for (let i = 0; i < 110; i++) {
      expect(numbers[i]).toBe(i + 1)
    }
  })

  it('all objects have valid RA/Dec', () => {
    for (const m of MESSIER_CATALOG) {
      expect(m.ra).toBeGreaterThanOrEqual(0)
      expect(m.ra).toBeLessThan(360)
      expect(m.dec).toBeGreaterThanOrEqual(-90)
      expect(m.dec).toBeLessThanOrEqual(90)
    }
  })

  it('all objects have a type and subtype', () => {
    for (const m of MESSIER_CATALOG) {
      expect(['nebula', 'cluster', 'galaxy']).toContain(m.type)
      expect(m.subtype).toBeTruthy()
    }
  })

  it('all objects have 3-letter constellation codes', () => {
    for (const m of MESSIER_CATALOG) {
      expect(m.constellation).toHaveLength(3)
    }
  })

  it('M1 is the Crab Nebula', () => {
    const m1 = Data.getMessier(1)
    expect(m1).toBeDefined()
    expect(m1!.name).toBe('Crab Nebula')
    expect(m1!.type).toBe('nebula')
    expect(m1!.constellation).toBe('Tau')
  })

  it('M31 is the Andromeda Galaxy', () => {
    const m31 = Data.getMessier(31)
    expect(m31).toBeDefined()
    expect(m31!.name).toBe('Andromeda Galaxy')
    expect(m31!.type).toBe('galaxy')
  })

  it('M42 is the Orion Nebula', () => {
    const m42 = Data.getMessier(42)
    expect(m42).toBeDefined()
    expect(m42!.name).toBe('Orion Nebula')
  })

  it('M45 is the Pleiades', () => {
    const m45 = Data.getMessier(45)
    expect(m45).toBeDefined()
    expect(m45!.name).toBe('Pleiades')
  })

  it('returns null for invalid Messier number', () => {
    expect(Data.getMessier(0)).toBeNull()
    expect(Data.getMessier(111)).toBeNull()
  })
})
