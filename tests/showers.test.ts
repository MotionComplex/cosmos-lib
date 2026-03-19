import { describe, it, expect } from 'vitest'
import { METEOR_SHOWERS } from '../src/data/showers'
import { Data } from '../src/data'

describe('Meteor Showers', () => {
  it('contains 20+ showers', () => {
    expect(METEOR_SHOWERS.length).toBeGreaterThan(20)
  })

  it('all showers have required fields', () => {
    for (const s of METEOR_SHOWERS) {
      expect(s.id).toBeTruthy()
      expect(s.name).toBeTruthy()
      expect(s.code).toHaveLength(3)
      expect(s.radiantRA).toBeGreaterThanOrEqual(0)
      expect(s.radiantRA).toBeLessThan(360)
      expect(s.radiantDec).toBeGreaterThanOrEqual(-90)
      expect(s.radiantDec).toBeLessThanOrEqual(90)
      expect(s.zhr).toBeGreaterThan(0)
      expect(s.speed).toBeGreaterThan(0)
    }
  })

  it('Perseids are included with ZHR ~100', () => {
    const perseids = METEOR_SHOWERS.find(s => s.name === 'Perseids')
    expect(perseids).toBeDefined()
    expect(perseids!.zhr).toBeCloseTo(100, -1)
    expect(perseids!.parentBody).toBe('109P/Swift-Tuttle')
  })

  it('Geminids are the strongest shower (ZHR 150)', () => {
    const geminids = METEOR_SHOWERS.find(s => s.name === 'Geminids')
    expect(geminids).toBeDefined()
    expect(geminids!.zhr).toBe(150)
    expect(geminids!.parentBody).toBe('3200 Phaethon')
  })

  describe('Data.getActiveShowers', () => {
    it('finds Perseids in mid-August', () => {
      const active = Data.getActiveShowers(new Date('2024-08-12T00:00:00Z'))
      const names = active.map(s => s.name)
      expect(names).toContain('Perseids')
    })

    it('finds Geminids in mid-December', () => {
      const active = Data.getActiveShowers(new Date('2024-12-14T00:00:00Z'))
      const names = active.map(s => s.name)
      expect(names).toContain('Geminids')
    })
  })
})
