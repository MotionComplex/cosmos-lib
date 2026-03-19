import { describe, it, expect } from 'vitest'
import { Units } from '../src/units'

describe('Units', () => {
  // ── Distance ────────────────────────────────────────────────────────────────
  describe('auToKm / kmToAu', () => {
    it('converts 1 AU to ~149,597,870 km', () => {
      expect(Units.auToKm(1)).toBeCloseTo(149_597_870.7, 0)
    })

    it('round-trips AU → km → AU', () => {
      expect(Units.kmToAu(Units.auToKm(5.204))).toBeCloseTo(5.204, 5)
    })
  })

  describe('pcToLy / lyToPc', () => {
    it('converts 1 pc to ~3.2616 ly', () => {
      expect(Units.pcToLy(1)).toBeCloseTo(3.2616, 3)
    })

    it('round-trips pc → ly → pc', () => {
      expect(Units.lyToPc(Units.pcToLy(412))).toBeCloseTo(412, 4)
    })
  })

  describe('degToRad / radToDeg', () => {
    it('converts 180° to π', () => {
      expect(Units.degToRad(180)).toBeCloseTo(Math.PI, 10)
    })

    it('converts π to 180°', () => {
      expect(Units.radToDeg(Math.PI)).toBeCloseTo(180, 10)
    })
  })

  describe('hrsToDeg / degToHrs', () => {
    it('converts 12h to 180°', () => {
      expect(Units.hrsToDeg(12)).toBe(180)
    })

    it('converts 360° to 24h', () => {
      expect(Units.degToHrs(360)).toBe(24)
    })
  })

  // ── Formatting ──────────────────────────────────────────────────────────────
  describe('formatDistance', () => {
    it('formats sub-AU distances in km', () => {
      expect(Units.formatDistance(100_000)).toContain('km')
    })

    it('formats 1 AU correctly', () => {
      const result = Units.formatDistance(149_597_870.7)
      expect(result).toContain('AU')
      expect(result).toContain('1.000')
    })

    it('formats Sirius distance (~8.6 ly)', () => {
      const siriusKm = 8.6 * 9_460_730_472_580.8
      const result   = Units.formatDistance(siriusKm)
      expect(result).toContain('ly')
      expect(result).toContain('8.6')
    })

    it('formats Andromeda (~2.5 million ly) in Mly', () => {
      const andromedaKm = 2_537_000 * 9_460_730_472_580.8
      const result      = Units.formatDistance(andromedaKm)
      expect(result).toContain('Mly')
    })
  })

  describe('formatAngle', () => {
    it('formats 0° correctly', () => {
      expect(Units.formatAngle(0)).toBe("0°0′0.0″")
    })

    it('formats a negative declination', () => {
      const result = Units.formatAngle(-16.716)
      expect(result).toMatch(/^-16°/)
    })

    it('formats a positive angle', () => {
      const result = Units.formatAngle(41.269)
      expect(result).toMatch(/^41°/)
    })
  })

  describe('formatRA', () => {
    it('formats Orion Nebula RA (83.822°) as 5h 35m', () => {
      const result = Units.formatRA(83.822)
      expect(result).toMatch(/^5h 35m/)
    })

    it('formats 0° as 0h', () => {
      expect(Units.formatRA(0)).toMatch(/^0h 0m/)
    })

    it('normalises RA > 360° correctly', () => {
      expect(Units.formatRA(360 + 83.822)).toBe(Units.formatRA(83.822))
    })

    it('handles negative RA by normalising to [0, 360)', () => {
      const result = Units.formatRA(-90)
      expect(result).toBe(Units.formatRA(270))
    })
  })
})
