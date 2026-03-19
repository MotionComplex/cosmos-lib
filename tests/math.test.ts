import { describe, it, expect, beforeEach } from 'vitest'
import { AstroMath } from '../src/math'

// Fixed reference date: 2000-01-01 12:00:00 UTC (J2000.0 epoch)
const J2000_DATE = new Date('2000-01-01T12:00:00Z')

describe('AstroMath', () => {
  // ── Julian date ─────────────────────────────────────────────────────────────
  describe('toJulian / fromJulian', () => {
    it('J2000.0 epoch → JD 2451545.0', () => {
      expect(AstroMath.toJulian(J2000_DATE)).toBeCloseTo(2_451_545.0, 1)
    })

    it('round-trips Date → JD → Date', () => {
      const now = new Date('2024-06-15T12:00:00Z')
      const jd  = AstroMath.toJulian(now)
      expect(AstroMath.fromJulian(jd).valueOf()).toBeCloseTo(now.valueOf(), -2)
    })
  })

  describe('j2000Days', () => {
    it('returns 0 at J2000 epoch', () => {
      expect(AstroMath.j2000Days(J2000_DATE)).toBeCloseTo(0, 1)
    })

    it('returns positive value for dates after J2000', () => {
      expect(AstroMath.j2000Days(new Date('2010-01-01T12:00:00Z'))).toBeGreaterThan(0)
    })
  })

  // ── Sidereal time ───────────────────────────────────────────────────────────
  describe('gmst', () => {
    it('returns a value in [0, 360)', () => {
      const g = AstroMath.gmst(J2000_DATE)
      expect(g).toBeGreaterThanOrEqual(0)
      expect(g).toBeLessThan(360)
    })

    it('at J2000.0 GMST ≈ 280.46° (IAU value)', () => {
      // GMST at J2000.0 is 280.46061837°
      expect(AstroMath.gmst(J2000_DATE)).toBeCloseTo(280.461, 0)
    })
  })

  describe('lst', () => {
    it('returns a value in [0, 360)', () => {
      const lst = AstroMath.lst(J2000_DATE, 0)
      expect(lst).toBeGreaterThanOrEqual(0)
      expect(lst).toBeLessThan(360)
    })

    it('differs from GMST by longitude', () => {
      const gmst = AstroMath.gmst(J2000_DATE)
      const lst  = AstroMath.lst(J2000_DATE, 45)
      expect((lst - gmst + 360) % 360).toBeCloseTo(45, 5)
    })
  })

  // ── Coordinate transforms ───────────────────────────────────────────────────
  describe('equatorialToHorizontal', () => {
    it('returns altitude and azimuth as numbers', () => {
      const result = AstroMath.equatorialToHorizontal(
        { ra: 101.287, dec: -16.716 },
        { lat: 51.5, lng: 0, date: J2000_DATE },
      )
      expect(typeof result.alt).toBe('number')
      expect(typeof result.az).toBe('number')
    })

    it('altitude is in [-90, 90]', () => {
      const result = AstroMath.equatorialToHorizontal(
        { ra: 101.287, dec: -16.716 },
        { lat: 51.5, lng: 0, date: J2000_DATE },
      )
      expect(result.alt).toBeGreaterThanOrEqual(-90)
      expect(result.alt).toBeLessThanOrEqual(90)
    })

    it('azimuth is in [0, 360)', () => {
      const result = AstroMath.equatorialToHorizontal(
        { ra: 200, dec: 10 },
        { lat: 40, lng: -74, date: new Date('2024-06-15T03:00:00Z') },
      )
      expect(result.az).toBeGreaterThanOrEqual(0)
      expect(result.az).toBeLessThan(360)
    })

    it('object on meridian (HA=0) has azimuth near 0° or 180°', () => {
      // When hour angle = 0 (object on meridian), az is N or S depending on dec vs lat
      const obs  = { lat: 51.5, lng: 0, date: J2000_DATE }
      const lst  = AstroMath.lst(J2000_DATE, 0)
      // Object with RA = LST is on the meridian
      const result = AstroMath.equatorialToHorizontal({ ra: lst, dec: 30 }, obs)
      expect(result.az % 180).toBeCloseTo(0, 0)
    })
  })

  describe('horizontalToEquatorial', () => {
    it('round-trips equatorial → horizontal → equatorial', () => {
      const original = { ra: 101.287, dec: -16.716 }
      const obs      = { lat: 48.8566, lng: 2.3522, date: new Date('2024-03-21T22:00:00Z') }

      const hor    = AstroMath.equatorialToHorizontal(original, obs)
      const result = AstroMath.horizontalToEquatorial(hor, obs)

      expect(result.ra).toBeCloseTo(original.ra, 1)
      expect(result.dec).toBeCloseTo(original.dec, 1)
    })
  })

  // ── Ecliptic ────────────────────────────────────────────────────────────────
  describe('eclipticToEquatorial', () => {
    it('converts the vernal equinox (0°, 0°) to RA=0, Dec=0', () => {
      const result = AstroMath.eclipticToEquatorial({ lon: 0, lat: 0 })
      expect(result.ra).toBeCloseTo(0, 3)
      expect(result.dec).toBeCloseTo(0, 3)
    })

    it('summer solstice (lon=90°, lat=0°) has positive declination', () => {
      const result = AstroMath.eclipticToEquatorial({ lon: 90, lat: 0 })
      expect(result.dec).toBeCloseTo(23.44, 1)
    })
  })

  // ── Galactic ─────────────────────────────────────────────────────────────────
  describe('galacticToEquatorial', () => {
    it('Galactic center (l=0, b=0) → RA ≈ 266.4°, Dec ≈ -29.0°', () => {
      const result = AstroMath.galacticToEquatorial({ l: 0, b: 0 })
      expect(result.ra).toBeCloseTo(266.4, 0)
      expect(result.dec).toBeCloseTo(-29.0, 0)
    })

    it('Galactic North Pole (b=90) → Dec ≈ 27.1°', () => {
      const result = AstroMath.galacticToEquatorial({ l: 0, b: 90 })
      expect(result.dec).toBeCloseTo(27.13, 1)
    })
  })

  // ── Angular separation ───────────────────────────────────────────────────────
  describe('angularSeparation', () => {
    it('same point returns 0°', () => {
      expect(
        AstroMath.angularSeparation({ ra: 83.8, dec: -5.4 }, { ra: 83.8, dec: -5.4 })
      ).toBeCloseTo(0, 8)
    })

    it('antipodal points return 180°', () => {
      expect(
        AstroMath.angularSeparation({ ra: 0, dec: 90 }, { ra: 0, dec: -90 })
      ).toBeCloseTo(180, 5)
    })

    it('Betelgeuse to Rigel separation ≈ 18.6°', () => {
      // Betelgeuse: RA=88.793, Dec=7.407 | Rigel: RA=78.634, Dec=-8.202
      const sep = AstroMath.angularSeparation(
        { ra: 88.793, dec: 7.407 },
        { ra: 78.634, dec: -8.202 },
      )
      expect(sep).toBeCloseTo(18.6, 0)
    })

    it('is symmetric', () => {
      const a = { ra: 100, dec: 20 }
      const b = { ra: 150, dec: -10 }
      expect(AstroMath.angularSeparation(a, b)).toBeCloseTo(
        AstroMath.angularSeparation(b, a), 8
      )
    })
  })

  // ── Photometry ───────────────────────────────────────────────────────────────
  describe('apparentMagnitude', () => {
    it('at 10 pc apparent = absolute', () => {
      expect(AstroMath.apparentMagnitude(5.0, 10)).toBeCloseTo(5.0, 5)
    })

    it('at 100 pc adds 5 magnitudes', () => {
      expect(AstroMath.apparentMagnitude(5.0, 100)).toBeCloseTo(10.0, 5)
    })

    it('Sun: absolute ≈ 4.83, distance ≈ 1 AU → apparent ≈ -26.74', () => {
      const distancePc = 1 / 206_265   // 1 AU in parsecs
      expect(AstroMath.apparentMagnitude(4.83, distancePc)).toBeCloseTo(-26.74, 0)
    })
  })

  describe('absoluteMagnitude', () => {
    it('round-trips with apparentMagnitude', () => {
      const abs    = 4.83
      const dist   = 412
      const app    = AstroMath.apparentMagnitude(abs, dist)
      expect(AstroMath.absoluteMagnitude(app, dist)).toBeCloseTo(abs, 5)
    })
  })

  describe('parallaxToDistance', () => {
    it('Sirius: 0.3792 arcsec → ~2.64 pc', () => {
      expect(AstroMath.parallaxToDistance(0.37921)).toBeCloseTo(2.637, 2)
    })

    it('1 arcsec → 1 parsec', () => {
      expect(AstroMath.parallaxToDistance(1)).toBe(1)
    })
  })

  // ── Planetary positions ───────────────────────────────────────────────────────
  describe('planetEcliptic', () => {
    it('returns a valid position for each planet', () => {
      const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'] as const
      for (const planet of planets) {
        const pos = AstroMath.planetEcliptic(planet, J2000_DATE)
        expect(pos.r).toBeGreaterThan(0)
        expect(pos.lon).toBeGreaterThanOrEqual(0)
        expect(pos.lon).toBeLessThan(360)
      }
    })

    it("Earth's distance from Sun is close to 1 AU at J2000", () => {
      const pos = AstroMath.planetEcliptic('earth', J2000_DATE)
      expect(pos.r).toBeCloseTo(1.0, 1)
    })

    it("Jupiter's distance is between 4.9 and 5.5 AU", () => {
      const pos = AstroMath.planetEcliptic('jupiter', J2000_DATE)
      expect(pos.r).toBeGreaterThan(4.9)
      expect(pos.r).toBeLessThan(5.5)
    })

    it('computes ecliptic latitude (not zero) for inclined planets', () => {
      const mercury = AstroMath.planetEcliptic('mercury', J2000_DATE)
      // Mercury has 7° inclination — lat should be non-trivial at most epochs
      // Just verify it's not always zero anymore
      const dates = [
        new Date('2024-03-15T00:00:00Z'),
        new Date('2024-06-15T00:00:00Z'),
        new Date('2024-09-15T00:00:00Z'),
      ]
      const lats = dates.map(d => AstroMath.planetEcliptic('mercury', d).lat)
      const anyNonZero = lats.some(lat => Math.abs(lat) > 0.1)
      expect(anyNonZero).toBe(true)
    })
  })

  // ── Kepler solver ───────────────────────────────────────────────────────────
  describe('solveKepler', () => {
    it('returns M for circular orbit (e=0)', () => {
      const M = 1.5 // radians
      const E = AstroMath.solveKepler(M, 0)
      expect(E).toBeCloseTo(M, 10)
    })

    it('converges for Mercury eccentricity (e=0.2056)', () => {
      const M = Math.PI / 4
      const E = AstroMath.solveKepler(M, 0.2056)
      // Verify: E - e*sin(E) = M
      const residual = E - 0.2056 * Math.sin(E) - M
      expect(Math.abs(residual)).toBeLessThan(1e-10)
    })

    it('converges for high eccentricity (e=0.9)', () => {
      const M = 0.5
      const E = AstroMath.solveKepler(M, 0.9)
      const residual = E - 0.9 * Math.sin(E) - M
      expect(Math.abs(residual)).toBeLessThan(1e-10)
    })
  })

  // ── Precession ──────────────────────────────────────────────────────────────
  describe('precess', () => {
    it('no change when precessing to same epoch', () => {
      const eq = { ra: 41.0540, dec: 49.2277 }
      const result = AstroMath.precess(eq, 2_451_545.0, 2_451_545.0)
      expect(result.ra).toBeCloseTo(eq.ra, 5)
      expect(result.dec).toBeCloseTo(eq.dec, 5)
    })

    it('Theta Persei: J2000 → 2028-11-13 (Meeus Example 21.b)', () => {
      // Theta Persei at J2000: RA = 2h 44m 11.986s = 41.04994°, Dec = +49°13'42.48" = 49.22847°
      const eq = { ra: 41.04994, dec: 49.22847 }
      const jdFrom = 2_451_545.0 // J2000
      const jdTo   = 2_462_088.69 // 2028-11-13.19 TDT

      const result = AstroMath.precess(eq, jdFrom, jdTo)
      // Expected: RA ≈ 41.547° (2h 46m 11.331s), Dec ≈ 49.3520° (+49°21'07.1")
      expect(result.ra).toBeCloseTo(41.55, 0)
      expect(result.dec).toBeCloseTo(49.35, 0)
    })
  })

  // ── Nutation ────────────────────────────────────────────────────────────────
  describe('nutation', () => {
    it('returns small values near J2000', () => {
      const n = AstroMath.nutation(2_451_545.0)
      // dPsi and dEpsilon should be on the order of arcseconds (< 0.01°)
      expect(Math.abs(n.dPsi)).toBeLessThan(0.01)
      expect(Math.abs(n.dEpsilon)).toBeLessThan(0.01)
    })

    it('Meeus Example 22.a: 1987 April 10', () => {
      // JD = 2446895.5 (1987 Apr 10, 0h TDT)
      const n = AstroMath.nutation(2_446_895.5)
      // Expected: dPsi ≈ -3.788" = -0.001052°, dEpsilon ≈ 9.443" = 0.002623°
      expect(n.dPsi * 3600).toBeCloseTo(-3.8, 0) // arcseconds
      expect(n.dEpsilon * 3600).toBeCloseTo(9.4, 0) // arcseconds
    })
  })

  // ── True obliquity ──────────────────────────────────────────────────────────
  describe('trueObliquity', () => {
    it('near 23.44° at J2000', () => {
      const eps = AstroMath.trueObliquity(2_451_545.0)
      expect(eps).toBeCloseTo(23.44, 1)
    })
  })

  // ── GAST ────────────────────────────────────────────────────────────────────
  describe('gast', () => {
    it('is close to GMST (within ~1°)', () => {
      const gmst = AstroMath.gmst(J2000_DATE)
      const gast = AstroMath.gast(J2000_DATE)
      expect(Math.abs(gast - gmst)).toBeLessThan(0.1)
    })
  })

  // ── Atmospheric refraction ──────────────────────────────────────────────────
  describe('refraction', () => {
    it('at the horizon (0°) refraction ≈ 29 arcminutes (Saemundsson)', () => {
      const r = AstroMath.refraction(0)
      expect(r * 60).toBeCloseTo(29, -1) // ~29 arcminutes (Saemundsson formula)
    })

    it('at 90° altitude refraction ≈ 0', () => {
      const r = AstroMath.refraction(90)
      expect(r).toBeCloseTo(0, 2)
    })

    it('refraction decreases with altitude', () => {
      const r0  = AstroMath.refraction(0)
      const r10 = AstroMath.refraction(10)
      const r45 = AstroMath.refraction(45)
      expect(r0).toBeGreaterThan(r10)
      expect(r10).toBeGreaterThan(r45)
    })
  })

  // ── Proper motion ───────────────────────────────────────────────────────────
  describe('applyProperMotion', () => {
    it('no change when dt=0', () => {
      const eq = { ra: 101.287, dec: -16.716 }
      const result = AstroMath.applyProperMotion(eq, -546.01, -1223.07, 2000, 2000)
      expect(result.ra).toBeCloseTo(eq.ra, 8)
      expect(result.dec).toBeCloseTo(eq.dec, 8)
    })

    it('Sirius: proper motion over 50 years shifts coordinates', () => {
      // Sirius: pmRA = -546.01 mas/yr, pmDec = -1223.07 mas/yr
      const eq = { ra: 101.287, dec: -16.716 }
      const result = AstroMath.applyProperMotion(eq, -546.01, -1223.07, 2000, 2050)
      // Over 50 years, dec shifts by -1223.07 * 50 / 3600000 ≈ -0.017°
      expect(result.dec).toBeLessThan(eq.dec)
      expect(result.dec).toBeCloseTo(eq.dec - 0.017, 2)
    })
  })

  // ── Rise/Transit/Set ────────────────────────────────────────────────────────
  describe('riseTransitSet', () => {
    it('returns rise, transit, set for a normal case', () => {
      // Sirius from London
      const rts = AstroMath.riseTransitSet(
        { ra: 101.287, dec: -16.716 },
        { lat: 51.5, lng: -0.1278, date: new Date('2024-01-15T12:00:00Z') },
      )
      expect(rts.rise).toBeInstanceOf(Date)
      expect(rts.transit).toBeInstanceOf(Date)
      expect(rts.set).toBeInstanceOf(Date)
    })

    it('rise and set occur on the same day', () => {
      const rts = AstroMath.riseTransitSet(
        { ra: 101.287, dec: -16.716 },
        { lat: 51.5, lng: -0.1278, date: new Date('2024-01-15T12:00:00Z') },
      )
      if (rts.rise && rts.set) {
        // Both should be within 24 hours of midnight
        const midnight = new Date('2024-01-15T00:00:00Z').valueOf()
        expect(rts.rise.valueOf()).toBeGreaterThanOrEqual(midnight)
        expect(rts.rise.valueOf()).toBeLessThan(midnight + 86_400_000)
        expect(rts.set.valueOf()).toBeGreaterThanOrEqual(midnight)
        expect(rts.set.valueOf()).toBeLessThan(midnight + 86_400_000)
      }
    })

    it('circumpolar object (Polaris from London) has null rise/set', () => {
      // Polaris: dec ≈ 89.26° — always above horizon from lat 51.5
      const rts = AstroMath.riseTransitSet(
        { ra: 37.95, dec: 89.26 },
        { lat: 51.5, lng: -0.1278, date: new Date('2024-06-15T12:00:00Z') },
      )
      // Circumpolar — cosH0 < -1 → never sets
      expect(rts.rise).toBeNull()
      expect(rts.set).toBeNull()
    })
  })
})
