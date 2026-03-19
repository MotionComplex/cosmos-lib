import { CONSTANTS } from './constants.js'
import type {
  EquatorialCoord,
  HorizontalCoord,
  GalacticCoord,
  EclipticCoord,
  ObserverParams,
  PlanetName,
  PlanetPosition,
} from './types.js'

const D = CONSTANTS.DEG_TO_RAD
const R = CONSTANTS.RAD_TO_DEG

export const AstroMath = {
  // ── Time ──────────────────────────────────────────────────────────────────

  /** JavaScript Date → Julian Date Number */
  toJulian(date: Date = new Date()): number {
    return date.valueOf() / 86_400_000 + 2_440_587.5
  },

  /** Julian Date → JavaScript Date */
  fromJulian(jd: number): Date {
    return new Date((jd - 2_440_587.5) * 86_400_000)
  },

  /** Days since J2000.0 */
  j2000Days(date: Date = new Date()): number {
    return this.toJulian(date) - CONSTANTS.J2000
  },

  /**
   * Greenwich Mean Sidereal Time in degrees.
   * Accurate to ~0.1 s over several centuries around J2000.
   */
  gmst(date: Date = new Date()): number {
    const d = this.j2000Days(date)
    return ((280.46061837 + 360.98564736629 * d) % 360 + 360) % 360
  },

  /**
   * Local Sidereal Time in degrees.
   * @param date        observation time
   * @param longitudeDeg observer's geographic longitude (east positive)
   */
  lst(date: Date, longitudeDeg: number): number {
    return ((this.gmst(date) + longitudeDeg) % 360 + 360) % 360
  },

  // ── Coordinate transforms ─────────────────────────────────────────────────

  /**
   * Equatorial (RA/Dec) → Horizontal (Altitude/Azimuth).
   * All angles in degrees.
   */
  equatorialToHorizontal(
    eq: EquatorialCoord,
    obs: ObserverParams,
  ): HorizontalCoord {
    const date = obs.date ?? new Date()
    const ha   = ((this.lst(date, obs.lng) - eq.ra) % 360 + 360) % 360

    const haR  = ha  * D
    const decR = eq.dec * D
    const latR = obs.lat * D

    const sinAlt = Math.sin(decR) * Math.sin(latR) +
                   Math.cos(decR) * Math.cos(latR) * Math.cos(haR)
    const alt    = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * R

    const altR   = alt * D
    const cosAz  = (Math.sin(decR) - Math.sin(altR) * Math.sin(latR)) /
                   (Math.cos(altR) * Math.cos(latR))
    let az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * R
    if (Math.sin(haR) > 0) az = 360 - az

    return { alt, az }
  },

  /**
   * Horizontal (Altitude/Azimuth) → Equatorial (RA/Dec).
   * All angles in degrees.
   */
  horizontalToEquatorial(
    hor: HorizontalCoord,
    obs: ObserverParams,
  ): EquatorialCoord {
    const date = obs.date ?? new Date()
    const altR = hor.alt * D
    const azR  = hor.az  * D
    const latR = obs.lat * D

    const sinDec = Math.sin(altR) * Math.sin(latR) +
                   Math.cos(altR) * Math.cos(latR) * Math.cos(azR)
    const dec    = Math.asin(Math.max(-1, Math.min(1, sinDec))) * R

    const decR   = dec * D
    const cosHA  = (Math.sin(altR) - Math.sin(decR) * Math.sin(latR)) /
                   (Math.cos(decR) * Math.cos(latR))
    let ha = Math.acos(Math.max(-1, Math.min(1, cosHA))) * R
    if (Math.sin(azR) > 0) ha = 360 - ha

    const ra = ((this.lst(date, obs.lng) - ha) % 360 + 360) % 360
    return { ra, dec }
  },

  /**
   * Ecliptic → Equatorial (J2000).
   * All angles in degrees.
   */
  eclipticToEquatorial(ecl: EclipticCoord): EquatorialCoord {
    const eps  = CONSTANTS.ECLIPTIC_OBL * D
    const lonR = ecl.lon * D
    const latR = ecl.lat * D

    const ra = Math.atan2(
      Math.sin(lonR) * Math.cos(eps) - Math.tan(latR) * Math.sin(eps),
      Math.cos(lonR),
    ) * R

    const dec = Math.asin(
      Math.sin(latR) * Math.cos(eps) +
      Math.cos(latR) * Math.sin(eps) * Math.sin(lonR),
    ) * R

    return { ra: ((ra % 360) + 360) % 360, dec }
  },

  /**
   * Galactic → Equatorial (J2000).
   * Standard IAU transformation.
   * All angles in degrees.
   */
  galacticToEquatorial(gal: GalacticCoord): EquatorialCoord {
    const NGP_RA  = 192.85948
    const NGP_DEC = 27.12825
    const LON_ASC = 122.93192

    const bR  = gal.b * D
    const la  = (LON_ASC - gal.l) * D
    const ndR = NGP_DEC * D

    const sinDec = Math.sin(bR) * Math.sin(ndR) +
                   Math.cos(bR) * Math.cos(ndR) * Math.cos(la)
    const dec    = Math.asin(Math.max(-1, Math.min(1, sinDec))) * R

    const ra = Math.atan2(
      Math.cos(bR) * Math.sin(la),
      Math.sin(bR) * Math.cos(ndR) - Math.cos(bR) * Math.sin(ndR) * Math.cos(la),
    ) * R + NGP_RA

    return { ra: ((ra % 360) + 360) % 360, dec }
  },

  // ── Angular separation ────────────────────────────────────────────────────

  /**
   * Great-circle angular separation between two equatorial coordinates.
   * Uses the haversine formula for numerical stability at small angles.
   * Returns degrees.
   */
  angularSeparation(a: EquatorialCoord, b: EquatorialCoord): number {
    const d1  = a.dec * D
    const d2  = b.dec * D
    const dra = (b.ra - a.ra) * D
    const hav = Math.sin((d2 - d1) / 2) ** 2 +
                Math.cos(d1) * Math.cos(d2) * Math.sin(dra / 2) ** 2
    return 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, hav)))) * R
  },

  // ── Photometry ────────────────────────────────────────────────────────────

  /** Absolute magnitude + distance (parsecs) → apparent magnitude */
  apparentMagnitude(absoluteMag: number, distancePc: number): number {
    return absoluteMag + 5 * Math.log10(distancePc / 10)
  },

  /** Apparent magnitude + distance (parsecs) → absolute magnitude */
  absoluteMagnitude(apparentMag: number, distancePc: number): number {
    return apparentMag - 5 * Math.log10(distancePc / 10)
  },

  /** Parallax in arcseconds → distance in parsecs */
  parallaxToDistance(parallaxArcsec: number): number {
    return 1 / parallaxArcsec
  },

  // ── Planetary positions ───────────────────────────────────────────────────

  /**
   * Simplified planetary mean-longitude ephemeris (J2000 orbital elements).
   * Accurate to ~1° within a few centuries of J2000.
   * Returns ecliptic longitude/latitude and heliocentric distance.
   */
  planetEcliptic(planet: PlanetName, date: Date = new Date()): PlanetPosition {
    type Elements = {
      a: number; e: number; i: number
      L: number; w: number; O: number; n: number
    }
    const ELEMENTS: Record<PlanetName, Elements> = {
      mercury: { a:0.38710, e:0.20563, i:7.005, L:252.251, w:77.456,  O:48.331,  n:4.09234 },
      venus:   { a:0.72333, e:0.00677, i:3.395, L:181.980, w:131.533, O:76.680,  n:1.60214 },
      earth:   { a:1.00000, e:0.01671, i:0.000, L:100.464, w:102.937, O:0.0,     n:0.98561 },
      mars:    { a:1.52366, e:0.09341, i:1.850, L:355.433, w:336.041, O:49.558,  n:0.52403 },
      jupiter: { a:5.20336, e:0.04839, i:1.303, L:34.351,  w:14.331,  O:100.464, n:0.08309 },
      saturn:  { a:9.53707, e:0.05415, i:2.485, L:50.077,  w:93.057,  O:113.665, n:0.03346 },
      uranus:  { a:19.1913, e:0.04717, i:0.773, L:314.055, w:173.005, O:74.006,  n:0.01172 },
      neptune: { a:30.0690, e:0.00859, i:1.770, L:304.349, w:48.124,  O:131.784, n:0.00600 },
    }

    const p = ELEMENTS[planet]
    const d = this.j2000Days(date)

    // Mean anomaly
    const M    = ((p.L + p.n * d - p.w) % 360 + 360) % 360
    const Mrad = M * D

    // Equation of centre (first two terms of series expansion)
    const C = (2 * p.e - p.e ** 3 / 4) * Math.sin(Mrad) +
              1.25 * p.e ** 2 * Math.sin(2 * Mrad)
    const nu = M + C * R

    // Heliocentric distance (AU)
    const r = p.a * (1 - p.e ** 2) / (1 + p.e * Math.cos(nu * D))

    // Ecliptic longitude (degrees)
    const lon = ((nu + p.w) % 360 + 360) % 360

    return { lon, lat: 0, r, M, nu }
  },
} as const
