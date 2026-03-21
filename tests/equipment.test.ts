import { describe, it, expect } from 'vitest'
import { Equipment } from '../src/equipment'

describe('Equipment', () => {
  describe('database', () => {
    it('has cameras', () => {
      const cameras = Equipment.cameras()
      expect(cameras.length).toBeGreaterThan(20)
      for (const c of cameras) {
        expect(c.sensorWidth).toBeGreaterThan(0)
        expect(c.pixelSize).toBeGreaterThan(0)
      }
    })

    it('has telescopes', () => {
      const scopes = Equipment.telescopes()
      expect(scopes.length).toBeGreaterThan(20)
      for (const t of scopes) {
        expect(t.aperture).toBeGreaterThan(0)
        expect(t.focalLength).toBeGreaterThan(0)
      }
    })

    it('has lenses', () => {
      const lenses = Equipment.lenses()
      expect(lenses.length).toBeGreaterThan(15)
    })

    it('looks up camera by name', () => {
      const cam = Equipment.camera('Sony A7 III')
      expect(cam).not.toBeNull()
      expect(cam!.brand).toBe('Sony')
      expect(cam!.pixelSize).toBeCloseTo(5.93, 1)
    })

    it('looks up telescope by partial name', () => {
      const scope = Equipment.telescope('C8')
      expect(scope).not.toBeNull()
      expect(scope!.brand).toBe('Celestron')
      expect(scope!.focalLength).toBe(2032)
    })

    it('returns null for unknown equipment', () => {
      expect(Equipment.camera('Nonexistent Camera 3000')).toBeNull()
      expect(Equipment.telescope('Fake Scope')).toBeNull()
      expect(Equipment.lens('No Such Lens')).toBeNull()
    })
  })

  describe('rig', () => {
    it('builds a rig from database names', () => {
      const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
      expect(rig.camera.name).toBe('Sony A7 III')
      expect(rig.focalLength).toBe(2032)
    })

    it('computes FOV', () => {
      const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
      const fov = rig.fov()
      expect(fov.width).toBeGreaterThan(0.5)
      expect(fov.width).toBeLessThan(2)
      expect(fov.height).toBeGreaterThan(0.3)
      expect(fov.height).toBeLessThan(fov.width)
    })

    it('computes pixel scale', () => {
      const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
      const ps = rig.pixelScale()
      expect(ps).toBeGreaterThan(0.3)
      expect(ps).toBeLessThan(2)
    })

    it('applies barlow multiplier', () => {
      const rig1 = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
      const rig2 = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8', barlow: 2 })
      expect(rig2.focalLength).toBe(rig1.focalLength * 2)
      expect(rig2.fov().width).toBeLessThan(rig1.fov().width)
    })

    it('applies reducer multiplier', () => {
      const rig1 = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
      const rig2 = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8', barlow: 0.63 })
      expect(rig2.focalLength).toBeLessThan(rig1.focalLength)
      expect(rig2.fov().width).toBeGreaterThan(rig1.fov().width)
    })

    it('works with camera + lens', () => {
      const rig = Equipment.rig({ camera: 'Canon EOS Ra', lens: 'Canon EF 135mm f/2L USM' })
      expect(rig.focalLength).toBe(135)
      expect(rig.fov().width).toBeGreaterThan(10) // wide field
    })

    it('works with custom focal length', () => {
      const rig = Equipment.rig({ camera: 'Sony A7 III', focalLength: 500 })
      expect(rig.focalLength).toBe(500)
    })

    it('throws for unknown camera', () => {
      expect(() => Equipment.rig({ camera: 'No Such Camera', focalLength: 500 }))
        .toThrow('Camera not found')
    })

    it('throws for missing optics', () => {
      expect(() => Equipment.rig({ camera: 'Sony A7 III' }))
        .toThrow('Must provide telescope, lens, or focalLength')
    })
  })

  describe('framing', () => {
    it('returns framing for M42 (large nebula)', () => {
      const rig = Equipment.rig({ camera: 'Sony A7 III', focalLength: 500 })
      const frame = rig.framing('m42')
      expect(frame).not.toBeNull()
      if (frame) {
        expect(frame.objectSize).toBeGreaterThan(0)
        expect(frame.fovWidth).toBeGreaterThan(0)
      }
    })

    it('returns null for unknown object', () => {
      const rig = Equipment.rig({ camera: 'Sony A7 III', focalLength: 500 })
      expect(rig.framing('nonexistent')).toBeNull()
    })
  })

  describe('maxExposure', () => {
    it('calculates NPF rule', () => {
      const rig = Equipment.rig({ camera: 'Sony A7 III', focalLength: 200, aperture: 71 })
      const sec = rig.maxExposure()
      expect(sec).toBeGreaterThan(5)
      expect(sec).toBeLessThan(30)
    })

    it('shorter focal length allows longer exposure', () => {
      const short = Equipment.rig({ camera: 'Sony A7 III', focalLength: 50, aperture: 25 })
      const long = Equipment.rig({ camera: 'Sony A7 III', focalLength: 200, aperture: 71 })
      expect(short.maxExposure()).toBeGreaterThan(long.maxExposure())
    })
  })

  describe('samplingAdvice', () => {
    it('gives advice', () => {
      const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
      const advice = rig.samplingAdvice(2.5)
      expect(['oversampled', 'undersampled', 'optimal']).toContain(advice.status)
      expect(advice.advice.length).toBeGreaterThan(0)
    })
  })

  describe('resolution', () => {
    it('computes Dawes and Rayleigh limits', () => {
      const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
      const res = rig.resolution()
      expect(res.dawesLimit).toBeGreaterThan(0)
      expect(res.raleighLimit).toBeGreaterThan(res.dawesLimit)
    })
  })
})
