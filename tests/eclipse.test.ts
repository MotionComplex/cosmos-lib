import { describe, it, expect } from 'vitest'
import { Eclipse } from '../src/eclipse'

describe('Eclipse', () => {
  describe('nextSolar', () => {
    it('returns an eclipse event', () => {
      const event = Eclipse.nextSolar(new Date('2024-01-01T00:00:00Z'))
      expect(event).not.toBeNull()
      expect(event!.type).toBe('solar')
      expect(['total', 'annular', 'partial']).toContain(event!.subtype)
      expect(event!.magnitude).toBeGreaterThan(0)
      expect(event!.date).toBeInstanceOf(Date)
    })

    it('finds a solar eclipse in 2024', () => {
      // 2024-04-08 total solar eclipse and 2024-10-02 annular
      const event = Eclipse.nextSolar(new Date('2024-03-01T00:00:00Z'))
      expect(event).not.toBeNull()
      // Should be within a few days of April 8
      const monthDay = event!.date.getUTCMonth() + 1
      expect(monthDay).toBeGreaterThanOrEqual(3) // March or later
      expect(monthDay).toBeLessThanOrEqual(5) // by May at latest
    })
  })

  describe('nextLunar', () => {
    it('returns a lunar eclipse event', () => {
      const event = Eclipse.nextLunar(new Date('2024-01-01T00:00:00Z'))
      expect(event).not.toBeNull()
      expect(event!.type).toBe('lunar')
      expect(['total', 'partial', 'penumbral']).toContain(event!.subtype)
    })
  })

  describe('search', () => {
    it('finds eclipses in a date range', () => {
      const results = Eclipse.search(
        new Date('2024-01-01T00:00:00Z'),
        new Date('2025-01-01T00:00:00Z'),
      )
      expect(results.length).toBeGreaterThan(0)
      // There should be multiple eclipses in any given year
    })

    it('results are sorted by date', () => {
      const results = Eclipse.search(
        new Date('2024-01-01T00:00:00Z'),
        new Date('2026-01-01T00:00:00Z'),
      )
      for (let i = 1; i < results.length; i++) {
        expect(results[i]!.date.valueOf()).toBeGreaterThan(results[i - 1]!.date.valueOf())
      }
    })

    it('can filter by type', () => {
      const solar = Eclipse.search(
        new Date('2024-01-01T00:00:00Z'),
        new Date('2026-01-01T00:00:00Z'),
        'solar',
      )
      expect(solar.every(e => e.type === 'solar')).toBe(true)

      const lunar = Eclipse.search(
        new Date('2024-01-01T00:00:00Z'),
        new Date('2026-01-01T00:00:00Z'),
        'lunar',
      )
      expect(lunar.every(e => e.type === 'lunar')).toBe(true)
    })
  })
})
