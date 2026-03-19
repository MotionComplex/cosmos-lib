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
  })
})
