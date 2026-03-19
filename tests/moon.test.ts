import { describe, it, expect } from 'vitest'
import { Moon } from '../src/moon'

const J2000_DATE = new Date('2000-01-01T12:00:00Z')

describe('Moon', () => {
  describe('position', () => {
    it('returns valid equatorial coordinates', () => {
      const pos = Moon.position(J2000_DATE)
      expect(pos.ra).toBeGreaterThanOrEqual(0)
      expect(pos.ra).toBeLessThan(360)
      expect(pos.dec).toBeGreaterThanOrEqual(-30)
      expect(pos.dec).toBeLessThanOrEqual(30)
    })

    it('distance is roughly 356,000–407,000 km (perigee to apogee)', () => {
      const pos = Moon.position(J2000_DATE)
      expect(pos.distance_km).toBeGreaterThan(350000)
      expect(pos.distance_km).toBeLessThan(410000)
    })

    it('ecliptic latitude is within ±6°', () => {
      const pos = Moon.position(J2000_DATE)
      expect(pos.eclipticLat).toBeGreaterThan(-6)
      expect(pos.eclipticLat).toBeLessThan(6)
    })

    it('parallax is roughly 0.9–1.0°', () => {
      const pos = Moon.position(J2000_DATE)
      expect(pos.parallax).toBeGreaterThan(0.85)
      expect(pos.parallax).toBeLessThan(1.05)
    })

    it('position at known date: 1992-04-12 (Meeus example)', () => {
      // Meeus Example 47.a: 1992 April 12, 0h TDT
      // Expected: lon ≈ 133.162°, lat ≈ -3.229°, dist ≈ 368409.7 km
      const date = new Date('1992-04-12T00:00:00Z')
      const pos = Moon.position(date)
      expect(pos.eclipticLon).toBeCloseTo(133.2, 0)
      expect(pos.eclipticLat).toBeCloseTo(-3.2, 0)
      expect(pos.distance_km).toBeCloseTo(368410, -3) // within ~1000 km
    })
  })

  describe('phase', () => {
    it('returns phase in [0, 1)', () => {
      const p = Moon.phase(J2000_DATE)
      expect(p.phase).toBeGreaterThanOrEqual(0)
      expect(p.phase).toBeLessThan(1)
    })

    it('illumination is in [0, 1]', () => {
      const p = Moon.phase(J2000_DATE)
      expect(p.illumination).toBeGreaterThanOrEqual(0)
      expect(p.illumination).toBeLessThanOrEqual(1)
    })

    it('age is in [0, 29.53] days', () => {
      const p = Moon.phase(J2000_DATE)
      expect(p.age).toBeGreaterThanOrEqual(0)
      expect(p.age).toBeLessThan(30)
    })

    it('returns a valid phase name', () => {
      const validNames = [
        'new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous',
        'full', 'waning-gibbous', 'last-quarter', 'waning-crescent',
      ]
      const p = Moon.phase(J2000_DATE)
      expect(validNames).toContain(p.name)
    })

    it('known full moon: 2024-01-25 is near full', () => {
      // Full moon was 2024-01-25 ~17:54 UTC
      const fullMoon = new Date('2024-01-25T18:00:00Z')
      const p = Moon.phase(fullMoon)
      expect(p.illumination).toBeGreaterThan(0.95)
    })

    it('known new moon: 2024-01-11 is near new', () => {
      // New moon was 2024-01-11 ~11:57 UTC
      const newMoon = new Date('2024-01-11T12:00:00Z')
      const p = Moon.phase(newMoon)
      expect(p.illumination).toBeLessThan(0.05)
    })
  })

  describe('nextPhase', () => {
    it('returns a Date', () => {
      const d = Moon.nextPhase(new Date('2024-01-01T00:00:00Z'), 'full')
      expect(d).toBeInstanceOf(Date)
    })

    it('next full moon after 2024-01-01 is near 2024-01-25', () => {
      const d = Moon.nextPhase(new Date('2024-01-01T00:00:00Z'), 'full')
      // Should be within ~1 day of Jan 25
      const diffDays = Math.abs(d.valueOf() - new Date('2024-01-25T18:00:00Z').valueOf()) / 86_400_000
      expect(diffDays).toBeLessThan(1.5)
    })

    it('next new moon after 2024-01-12 is near 2024-02-09', () => {
      const d = Moon.nextPhase(new Date('2024-01-12T00:00:00Z'), 'new')
      // New moon Feb 9, 2024 ~22:59 UTC
      const diffDays = Math.abs(d.valueOf() - new Date('2024-02-09T23:00:00Z').valueOf()) / 86_400_000
      expect(diffDays).toBeLessThan(1.5)
    })
  })

  describe('riseTransitSet', () => {
    it('returns rise/transit/set for a mid-latitude observer', () => {
      const rts = Moon.riseTransitSet({
        lat: 51.5,
        lng: -0.1278,
        date: new Date('2024-06-15T12:00:00Z'),
      })
      expect(rts.transit).toBeInstanceOf(Date)
      // Rise and set may be null depending on the day, but transit should always exist
    })
  })

  describe('libration', () => {
    it('returns l and b within reasonable ranges', () => {
      const lib = Moon.libration(J2000_DATE)
      expect(lib.l).toBeGreaterThan(-8)
      expect(lib.l).toBeLessThan(8)
      expect(lib.b).toBeGreaterThan(-7)
      expect(lib.b).toBeLessThan(7)
    })
  })
})
