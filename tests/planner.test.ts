import { describe, it, expect } from 'vitest'
import { Planner } from '../src/planner'
import type { ObserverParams } from '../src/types'

// Lucerne, Switzerland — mid-latitude northern hemisphere
const lucerne: ObserverParams = { lat: 47.05, lng: 8.31 }

// Winter night (good for Orion, Sirius)
const winterNight: ObserverParams = { ...lucerne, date: new Date('2024-01-15T22:00:00Z') }


describe('Planner', () => {
  describe('whatsUp', () => {
    it('returns objects above the horizon', () => {
      const visible = Planner.whatsUp(winterNight)
      expect(visible.length).toBeGreaterThan(0)
      for (const v of visible) {
        expect(v.alt).toBeGreaterThanOrEqual(10)
      }
    })

    it('results are sorted by altitude (highest first)', () => {
      const visible = Planner.whatsUp(winterNight)
      for (let i = 1; i < visible.length; i++) {
        expect(visible[i]!.alt).toBeLessThanOrEqual(visible[i - 1]!.alt)
      }
    })

    it('respects magnitude limit', () => {
      const bright = Planner.whatsUp(winterNight, { magnitudeLimit: 2 })
      for (const v of bright) {
        if (v.object.magnitude !== null) {
          expect(v.object.magnitude).toBeLessThanOrEqual(2)
        }
      }
    })

    it('respects minimum altitude', () => {
      const high = Planner.whatsUp(winterNight, { minAltitude: 30 })
      for (const v of high) {
        expect(v.alt).toBeGreaterThanOrEqual(30)
      }
    })

    it('filters by object type', () => {
      const planets = Planner.whatsUp(winterNight, { types: ['planet'], magnitudeLimit: 10 })
      for (const v of planets) {
        expect(v.object.type).toBe('planet')
      }
    })

    it('filters by tag', () => {
      const messier = Planner.whatsUp(winterNight, { tag: 'messier', magnitudeLimit: 10 })
      for (const v of messier) {
        expect(v.object.tags).toContain('messier')
      }
    })

    it('respects limit option', () => {
      const limited = Planner.whatsUp(winterNight, { limit: 5 })
      expect(limited.length).toBeLessThanOrEqual(5)
    })

    it('includes moon interference data', () => {
      const visible = Planner.whatsUp(winterNight)
      for (const v of visible) {
        expect(v.moonSeparation).toBeTypeOf('number')
        expect(v.moonInterference).toBeGreaterThanOrEqual(0)
        expect(v.moonInterference).toBeLessThanOrEqual(1)
      }
    })

    it('includes alt/az coordinates', () => {
      const visible = Planner.whatsUp(winterNight)
      for (const v of visible) {
        expect(v.az).toBeGreaterThanOrEqual(0)
        expect(v.az).toBeLessThan(360)
      }
    })
  })

  describe('bestWindow', () => {
    it('returns a valid window for a bright winter object', () => {
      const window = Planner.bestWindow('sirius', winterNight)
      expect(window).not.toBeNull()
      if (window) {
        expect(window.peakAltitude).toBeGreaterThan(0)
        expect(window.peak).toBeInstanceOf(Date)
      }
    })

    it('returns null for an unknown object', () => {
      const window = Planner.bestWindow('nonexistent', winterNight)
      expect(window).toBeNull()
    })

    it('peak altitude is reasonable for Sirius from mid-latitude', () => {
      const window = Planner.bestWindow('sirius', winterNight)
      if (window) {
        // Sirius dec ~-16.7°, lat ~47° → max alt ~26°
        expect(window.peakAltitude).toBeGreaterThan(15)
        expect(window.peakAltitude).toBeLessThan(40)
      }
    })
  })

  describe('visibilityCurve', () => {
    it('returns sample points for a known object', () => {
      const curve = Planner.visibilityCurve('sirius', winterNight, 50)
      expect(curve).not.toBeNull()
      if (curve) {
        expect(curve.length).toBe(51) // 50 steps + 1
        for (const p of curve) {
          expect(p.date).toBeInstanceOf(Date)
          expect(p.alt).toBeTypeOf('number')
          expect(p.az).toBeTypeOf('number')
        }
      }
    })

    it('returns null for unknown object', () => {
      expect(Planner.visibilityCurve('nonexistent', winterNight)).toBeNull()
    })

    it('dates span the night', () => {
      const curve = Planner.visibilityCurve('sirius', winterNight, 20)
      if (curve && curve.length >= 2) {
        const first = curve[0]!.date
        const last = curve[curve.length - 1]!.date
        // Should span several hours
        const hours = (last.valueOf() - first.valueOf()) / 3_600_000
        expect(hours).toBeGreaterThan(4)
      }
    })
  })

  describe('planetEvents', () => {
    it('detects at least one event in a year', () => {
      const events = Planner.planetEvents(
        { lat: 47, lng: 8, date: new Date('2024-01-01') },
        { days: 365 },
      )
      expect(events.length).toBeGreaterThan(0)
    })

    it('events have valid structure', () => {
      const events = Planner.planetEvents(
        { lat: 47, lng: 8, date: new Date('2024-01-01') },
      )
      for (const e of events) {
        expect(['opposition', 'conjunction']).toContain(e.type)
        expect(e.date).toBeInstanceOf(Date)
        expect(e.elongation).toBeGreaterThanOrEqual(0)
        expect(e.elongation).toBeLessThanOrEqual(180)
      }
    })

    it('can filter by specific planet', () => {
      const events = Planner.planetEvents(
        { lat: 47, lng: 8, date: new Date('2024-01-01') },
        { planets: ['mars'], days: 730 },
      )
      for (const e of events) {
        expect(e.planet).toBe('mars')
      }
    })

    it('events are sorted by date', () => {
      const events = Planner.planetEvents(
        { lat: 47, lng: 8, date: new Date('2024-01-01') },
      )
      for (let i = 1; i < events.length; i++) {
        expect(events[i]!.date.valueOf()).toBeGreaterThanOrEqual(events[i - 1]!.date.valueOf())
      }
    })
  })

  describe('moonInterference', () => {
    it('returns interference data for a known object', () => {
      const mi = Planner.moonInterference('m42', winterNight)
      expect(mi).not.toBeNull()
      if (mi) {
        expect(mi.separation).toBeGreaterThanOrEqual(0)
        expect(mi.illumination).toBeGreaterThanOrEqual(0)
        expect(mi.illumination).toBeLessThanOrEqual(1)
        expect(mi.score).toBeGreaterThanOrEqual(0)
        expect(mi.score).toBeLessThanOrEqual(1)
      }
    })

    it('returns null for unknown object', () => {
      expect(Planner.moonInterference('nonexistent', winterNight)).toBeNull()
    })

    it('score is lower when Moon illumination is low', () => {
      // Near new moon
      const newMoonDate = new Date('2024-01-11T00:00:00Z') // close to new moon
      const mi = Planner.moonInterference('m42', { ...lucerne, date: newMoonDate })
      if (mi) {
        expect(mi.score).toBeLessThan(0.3) // should be low near new moon
      }
    })
  })

  describe('airmassCurve', () => {
    it('returns airmass points for a known object', () => {
      const am = Planner.airmassCurve('sirius', winterNight, 50)
      expect(am).not.toBeNull()
      if (am) {
        expect(am.length).toBeGreaterThan(0)
        for (const p of am) {
          expect(p.airmass).toBeGreaterThanOrEqual(1)
          expect(p.alt).toBeGreaterThan(0)
        }
      }
    })

    it('airmass is lowest (closest to 1) near peak altitude', () => {
      const am = Planner.airmassCurve('sirius', winterNight, 100)
      if (am && am.length > 0) {
        const minAirmass = Math.min(...am.map(p => p.airmass))
        expect(minAirmass).toBeGreaterThanOrEqual(1)
        expect(minAirmass).toBeLessThan(10) // should be reasonable for a visible object
      }
    })

    it('returns null for unknown object', () => {
      expect(Planner.airmassCurve('nonexistent', winterNight)).toBeNull()
    })
  })
})
