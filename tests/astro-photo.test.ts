import { describe, it, expect } from 'vitest'
import { AstroPhoto } from '../src/astro-photo'
import { Equipment } from '../src/equipment'

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

  describe('rigPlan', () => {
    const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Sky-Watcher Esprit 100ED' })

    it('returns auto-discovered targets with all required fields', () => {
      const plan = AstroPhoto.rigPlan(rig, observer)
      expect(plan).not.toBeNull()
      if (!plan) return
      expect(plan.targets.length).toBeGreaterThan(0)
      for (const t of plan.targets) {
        expect(t.objectId).toBeTypeOf('string')
        expect(t.name).toBeTypeOf('string')
        expect(t.start).toBeInstanceOf(Date)
        expect(t.end).toBeInstanceOf(Date)
        expect(t.transit).toBeInstanceOf(Date)
        expect(t.peakAltitude).toBeGreaterThan(0)
        expect(t.airmassRange[0]).toBeGreaterThan(0)
        expect(t.moonSeparation).toBeGreaterThanOrEqual(0)
        expect(t.moonInterference).toBeGreaterThanOrEqual(0)
        expect(t.moonInterference).toBeLessThanOrEqual(1)
        expect(t.framing).toBeDefined()
        expect(t.framing.fillPercent).toBeGreaterThanOrEqual(0)
        expect(t.maxExposure).toBeGreaterThan(0)
        expect(t.score).toBeGreaterThanOrEqual(0)
        expect(t.score).toBeLessThanOrEqual(100)
        expect(t.source).toBe('auto')
      }
    })

    it('includes explicit targets even with poor framing', () => {
      // M31 is large (~180 arcmin) — may not fit well in every rig
      const plan = AstroPhoto.rigPlan(rig, observer, { targets: ['m31'] })
      expect(plan).not.toBeNull()
      if (!plan) return
      const m31 = plan.targets.find(t => t.objectId === 'm31')
      expect(m31).toBeDefined()
      expect(m31!.source).toBe('explicit')
    })

    it('deduplicates auto and explicit targets', () => {
      const plan = AstroPhoto.rigPlan(rig, observer, { targets: ['m31'] })
      if (!plan) return
      const m31s = plan.targets.filter(t => t.objectId === 'm31')
      expect(m31s.length).toBeLessThanOrEqual(1)
      if (m31s.length > 0) {
        expect(m31s[0]!.source).toBe('explicit')
      }
    })

    it('sorts by set-time-first', () => {
      const plan = AstroPhoto.rigPlan(rig, observer)
      if (!plan) return
      for (let i = 1; i < plan.targets.length; i++) {
        expect(plan.targets[i]!.end.valueOf()).toBeGreaterThanOrEqual(plan.targets[i - 1]!.end.valueOf())
      }
    })

    it('returns darkness window and rig metadata', () => {
      const plan = AstroPhoto.rigPlan(rig, observer)
      expect(plan).not.toBeNull()
      if (!plan) return
      expect(plan.darkness.start).toBeInstanceOf(Date)
      expect(plan.darkness.end).toBeInstanceOf(Date)
      expect(plan.darknessHours).toBeGreaterThan(0)
      expect(plan.rig.focalLength).toBeGreaterThan(0)
      expect(plan.rig.fov.width).toBeGreaterThan(0)
      expect(plan.rig.fov.height).toBeGreaterThan(0)
      expect(plan.rig.pixelScale).toBeGreaterThan(0)
      expect(plan.rig.isTracked).toBe(false) // no tracker in this rig
    })

    it('respects autoLimit option', () => {
      const plan = AstroPhoto.rigPlan(rig, observer, { autoLimit: 3 })
      if (!plan) return
      const autoTargets = plan.targets.filter(t => t.source === 'auto')
      expect(autoTargets.length).toBeLessThanOrEqual(3)
    })

    it('returns null when no darkness available', () => {
      // High arctic in summer — no astronomical darkness
      const arcticObserver = { lat: 70, lng: 25, date: new Date('2024-06-21') }
      const plan = AstroPhoto.rigPlan(rig, arcticObserver)
      expect(plan).toBeNull()
    })

    it('includes capture settings with ISO, sub-exposure, subs, and calibration', () => {
      const plan = AstroPhoto.rigPlan(rig, observer)
      expect(plan).not.toBeNull()
      if (!plan) return
      expect(plan.targets.length).toBeGreaterThan(0)
      for (const t of plan.targets) {
        expect(t.capture).toBeDefined()
        expect(t.capture.focalRatio).toBeGreaterThan(0)
        // Sony A7 III has recommendedISO
        expect(t.capture.iso).toBe(800)
        expect(t.capture.gain).toBeNull()
        expect(t.capture.subExposure).toBeGreaterThan(0)
        expect(t.capture.subExposure).toBeLessThanOrEqual(t.maxExposure)
        expect(t.capture.subs).toBeGreaterThan(0)
        expect(t.capture.totalIntegration).toBeGreaterThan(0)
        expect(t.capture.calibration.darks).toBe(30)
        expect(t.capture.calibration.flats).toBe(30)
        expect(t.capture.calibration.bias).toBe(50)
        expect(t.capture.calibration.darkNote).toContain('ISO 800')
        expect(t.capture.calibration.flatNote.length).toBeGreaterThan(0)
      }
    })

    it('uses skySite semantic label for sky brightness', () => {
      const darkPlan = AstroPhoto.rigPlan(rig, observer, { skySite: 'pristine' })
      const cityPlan = AstroPhoto.rigPlan(rig, observer, { skySite: 'city-center' })
      if (!darkPlan || !cityPlan) return
      if (darkPlan.targets.length === 0 || cityPlan.targets.length === 0) return
      // Under dark skies, sub-exposures should be longer (less sky noise to overwhelm read noise)
      const darkSub = darkPlan.targets[0]!.capture.subExposure
      const citySub = cityPlan.targets[0]!.capture.subExposure
      expect(darkSub).toBeGreaterThan(citySub)
    })

    it('bortle param overrides skySite', () => {
      const plan1 = AstroPhoto.rigPlan(rig, observer, { bortle: 2 })
      const plan2 = AstroPhoto.rigPlan(rig, observer, { bortle: 2, skySite: 'city-center' })
      if (!plan1 || !plan2) return
      if (plan1.targets.length === 0 || plan2.targets.length === 0) return
      // Same bortle → same sub-exposure regardless of skySite
      expect(plan1.targets[0]!.capture.subExposure).toBe(plan2.targets[0]!.capture.subExposure)
    })

    it('provides capture settings for dedicated camera with gain instead of ISO', () => {
      const astroRig = Equipment.rig({ camera: 'ZWO ASI2600MC Pro', telescope: 'Sky-Watcher Esprit 100ED' })
      const plan = AstroPhoto.rigPlan(astroRig, observer)
      if (!plan) return
      if (plan.targets.length === 0) return
      const t = plan.targets[0]!
      expect(t.capture.iso).toBeNull()
      expect(t.capture.gain).toBe(100)
      expect(t.capture.calibration.darkNote).toContain('Gain 100')
    })
  })
})
