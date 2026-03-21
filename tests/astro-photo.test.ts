import { describe, it, expect } from 'vitest'
import { AstroPhoto } from '../src/astro-photo'

const observer = { lat: 47.05, lng: 8.31, date: new Date('2024-08-15') }

describe('AstroPhoto', () => {
  describe('sessionPlan', () => {
    it('returns scored targets', () => {
      const plan = AstroPhoto.sessionPlan(observer, ['m31', 'm45', 'm42'])
      expect(plan.length).toBeGreaterThan(0)
      for (const t of plan) {
        expect(t.score).toBeGreaterThanOrEqual(0)
        expect(t.score).toBeLessThanOrEqual(100)
        expect(t.peakAltitude).toBeGreaterThan(0)
        expect(t.start).toBeInstanceOf(Date)
        expect(t.end).toBeInstanceOf(Date)
      }
    })

    it('sorts by set-time-first', () => {
      const plan = AstroPhoto.sessionPlan(observer, ['m31', 'm45', 'm42'])
      for (let i = 1; i < plan.length; i++) {
        expect(plan[i]!.end.valueOf()).toBeGreaterThanOrEqual(plan[i - 1]!.end.valueOf())
      }
    })

    it('returns empty for unknown objects', () => {
      const plan = AstroPhoto.sessionPlan(observer, ['nonexistent'])
      expect(plan.length).toBe(0)
    })
  })

  describe('imagingWindow', () => {
    it('returns a window for a visible object', () => {
      const w = AstroPhoto.imagingWindow('m31', observer)
      if (w) {
        expect(w.peakAltitude).toBeGreaterThan(0)
        expect(w.transit).toBeInstanceOf(Date)
        expect(w.hours).toBeGreaterThan(0)
      }
    })

    it('returns null for unknown object', () => {
      expect(AstroPhoto.imagingWindow('nonexistent', observer)).toBeNull()
    })
  })

  describe('exposure calculators', () => {
    it('NPF rule', () => {
      const sec = AstroPhoto.maxExposure({ focalLength: 200, aperture: 71, pixelSize: 5.93 })
      expect(sec).toBeGreaterThan(5)
      expect(sec).toBeLessThan(30)
    })

    it('NPF with declination correction', () => {
      const equator = AstroPhoto.maxExposure({ focalLength: 200, pixelSize: 5.93, declination: 0 })
      const pole = AstroPhoto.maxExposure({ focalLength: 200, pixelSize: 5.93, declination: 80 })
      expect(pole).toBeGreaterThan(equator) // slower trailing near pole
    })

    it('rule of 500', () => {
      const sec = AstroPhoto.ruleOf500(200)
      expect(sec).toBe(2.5) // 500/200
    })

    it('rule of 500 with crop factor', () => {
      const ff = AstroPhoto.ruleOf500(200, 1.0)
      const aps = AstroPhoto.ruleOf500(200, 1.5)
      expect(aps).toBeLessThan(ff)
    })

    it('sub-exposure calculator', () => {
      const sec = AstroPhoto.subExposure({ readNoise: 3.5, skyBrightness: 0.5 })
      expect(sec).toBeGreaterThan(10)
    })

    it('total integration', () => {
      const result = AstroPhoto.totalIntegration({ subLength: 300, subSNR: 5, targetSNR: 50 })
      expect(result.subs).toBe(100) // (50/5)^2
      expect(result.hours).toBeCloseTo(8.3, 0) // 100 * 300 / 3600
    })
  })

  describe('milkyWay', () => {
    it('returns galactic center info', () => {
      const mw = AstroPhoto.milkyWay(observer)
      expect(mw.position.ra).toBeCloseTo(266.4, 0)
      expect(mw.position.dec).toBeCloseTo(-29.0, 0)
      expect(mw.altitude).toBeTypeOf('number')
      expect(mw.transit).toBeInstanceOf(Date)
    })

    it('milkyWaySeason returns summer months for mid-latitude', () => {
      const months = AstroPhoto.milkyWaySeason(observer)
      expect(months.length).toBeGreaterThan(0)
      // Core should be visible roughly March-October from 47°N
      expect(months).toContain(6) // June
      expect(months).toContain(7) // July
      expect(months).toContain(8) // August
    })
  })

  describe('polarAlignment', () => {
    it('returns Polaris info for northern hemisphere', () => {
      const pa = AstroPhoto.polarAlignment(observer)
      expect(pa.hemisphere).toBe('north')
      expect(pa.polarisOffset).toBeGreaterThan(0.5)
      expect(pa.polarisOffset).toBeLessThan(1.0)
      expect(pa.polarisAltitude).toBeGreaterThan(40) // ~47° lat
    })

    it('returns southern info for southern hemisphere', () => {
      const pa = AstroPhoto.polarAlignment({ lat: -35, lng: 149 })
      expect(pa.hemisphere).toBe('south')
    })
  })

  describe('golden/blue hour', () => {
    it('returns golden hour times', () => {
      const gh = AstroPhoto.goldenHour(observer)
      if (gh.evening) {
        expect(gh.evening.start).toBeInstanceOf(Date)
        expect(gh.evening.end).toBeInstanceOf(Date)
      }
    })

    it('returns blue hour times', () => {
      const bh = AstroPhoto.blueHour(observer)
      if (bh.evening) {
        expect(bh.evening.start).toBeInstanceOf(Date)
        expect(bh.evening.end).toBeInstanceOf(Date)
      }
    })
  })

  describe('flatFrameWindow', () => {
    it('returns twilight flat window', () => {
      const ff = AstroPhoto.flatFrameWindow(observer)
      if (ff.evening) {
        expect(ff.evening.start).toBeInstanceOf(Date)
        expect(ff.evening.end).toBeInstanceOf(Date)
      }
    })
  })

  describe('utilities', () => {
    it('bortleClass converts SQM', () => {
      expect(AstroPhoto.bortleClass(22.0)).toBe(1) // pristine
      expect(AstroPhoto.bortleClass(19.0)).toBe(6) // suburban
      expect(AstroPhoto.bortleClass(17.0)).toBe(9) // city center
    })

    it('sqmToNELM converts', () => {
      const nelm = AstroPhoto.sqmToNELM(21.5)
      expect(nelm).toBeGreaterThan(5)
      expect(nelm).toBeLessThan(7)
    })
  })
})
