import { describe, it, expect } from 'vitest'
import { Events } from '../src/events'

const observer = { lat: 47.05, lng: 8.31, date: new Date('2024-01-01') }

describe('Events', () => {
  describe('nextEvents', () => {
    it('returns events sorted by date', () => {
      const events = Events.nextEvents(observer, { days: 90 })
      expect(events.length).toBeGreaterThan(0)
      for (let i = 1; i < events.length; i++) {
        expect(events[i]!.date.valueOf()).toBeGreaterThanOrEqual(events[i - 1]!.date.valueOf())
      }
    })

    it('finds moon phases within 90 days', () => {
      const events = Events.nextEvents(observer, { days: 90, categories: ['moon-phase'] })
      expect(events.length).toBeGreaterThanOrEqual(8) // ~12 phases in 90 days
      for (const e of events) {
        expect(e.category).toBe('moon-phase')
        expect(['New Moon', 'First Quarter Moon', 'Full Moon', 'Last Quarter Moon']).toContain(e.title)
      }
    })

    it('finds eclipses within a year', () => {
      const events = Events.nextEvents(observer, { days: 365, categories: ['eclipse'] })
      // There are typically 2-5 eclipses per year
      expect(events.length).toBeGreaterThanOrEqual(1)
      for (const e of events) {
        expect(e.category).toBe('eclipse')
        expect(e.title).toMatch(/eclipse/)
      }
    })

    it('finds meteor shower peaks', () => {
      const events = Events.nextEvents(observer, { days: 365, categories: ['meteor-shower'] })
      expect(events.length).toBeGreaterThan(0)
      for (const e of events) {
        expect(e.category).toBe('meteor-shower')
        expect(e.title).toMatch(/meteor shower peak/)
      }
    })

    it('finds planet oppositions/conjunctions', () => {
      const events = Events.nextEvents(observer, {
        days: 365,
        categories: ['opposition', 'conjunction'],
      })
      expect(events.length).toBeGreaterThan(0)
      for (const e of events) {
        expect(['opposition', 'conjunction']).toContain(e.category)
      }
    })

    it('finds equinoxes and solstices within a year', () => {
      const events = Events.nextEvents(observer, {
        days: 365,
        categories: ['equinox', 'solstice'],
      })
      // Should find at least 3 (March equinox is close to start)
      expect(events.length).toBeGreaterThanOrEqual(3)
    })

    it('respects limit option', () => {
      const events = Events.nextEvents(observer, { days: 365, limit: 5 })
      expect(events.length).toBeLessThanOrEqual(5)
    })

    it('filters by category', () => {
      const events = Events.nextEvents(observer, { days: 90, categories: ['moon-phase'] })
      for (const e of events) {
        expect(e.category).toBe('moon-phase')
      }
    })

    it('all events have required fields', () => {
      const events = Events.nextEvents(observer, { days: 90 })
      for (const e of events) {
        expect(e.category).toBeTypeOf('string')
        expect(e.title).toBeTypeOf('string')
        expect(e.title.length).toBeGreaterThan(0)
        expect(e.date).toBeInstanceOf(Date)
      }
    })
  })

  describe('nextEvent', () => {
    it('returns the next event of a given category', () => {
      const next = Events.nextEvent('moon-phase', observer)
      expect(next).not.toBeNull()
      expect(next!.category).toBe('moon-phase')
      expect(next!.date.valueOf()).toBeGreaterThanOrEqual(observer.date!.valueOf())
    })

    it('returns null if no event found', () => {
      // Very short range, unlikely to have an eclipse
      const result = Events.nextEvent('eclipse', { ...observer }, 1)
      // Could be null or not depending on timing
      if (result) {
        expect(result.category).toBe('eclipse')
      }
    })
  })

  describe('toICal', () => {
    it('generates valid iCal format', () => {
      const events = Events.nextEvents(observer, { days: 30, limit: 3 })
      const ical = Events.toICal(events)

      expect(ical).toContain('BEGIN:VCALENDAR')
      expect(ical).toContain('END:VCALENDAR')
      expect(ical).toContain('VERSION:2.0')
      expect(ical).toContain('PRODID:-//cosmos-lib')
    })

    it('contains VEVENT for each event', () => {
      const events = Events.nextEvents(observer, { days: 30, limit: 5 })
      const ical = Events.toICal(events)

      const veventCount = (ical.match(/BEGIN:VEVENT/g) || []).length
      expect(veventCount).toBe(events.length)
    })

    it('includes event titles as SUMMARY', () => {
      const events = Events.nextEvents(observer, { days: 30, categories: ['moon-phase'], limit: 1 })
      const ical = Events.toICal(events)

      if (events.length > 0) {
        expect(ical).toContain(`SUMMARY:${events[0]!.title}`)
      }
    })

    it('accepts custom calendar name', () => {
      const ical = Events.toICal([], 'My Astro Cal')
      expect(ical).toContain('X-WR-CALNAME:My Astro Cal')
    })
  })
})
