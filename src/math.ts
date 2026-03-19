import { CONSTANTS } from './constants.js'
import type {
  EquatorialCoord,
  HorizontalCoord,
  GalacticCoord,
  EclipticCoord,
  ObserverParams,
  PlanetName,
  PlanetPosition,
  NutationResult,
  RiseTransitSet,
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

  // ── Kepler solver ────────────────────────────────────────────────────────

  /**
   * Solve Kepler's equation M = E - e·sin(E) for eccentric anomaly E.
   * Newton-Raphson iteration. M in radians, returns E in radians.
   * Converges in 3-6 iterations for all planetary eccentricities.
   * Source: Meeus, "Astronomical Algorithms" (2nd ed.), Chapter 30.
   */
  solveKepler(M: number, e: number, tol = 1e-12): number {
    let E = M + e * Math.sin(M) * (1 + e * Math.cos(M))  // initial guess (Meeus)
    for (let i = 0; i < 30; i++) {
      const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
      E -= dE
      if (Math.abs(dE) < tol) break
    }
    return E
  },

  // ── Planetary positions ───────────────────────────────────────────────────

  /**
   * Planetary ephemeris using J2000 orbital elements with secular rates
   * and iterative Kepler solver. Accurate to ~0.1° within several
   * centuries of J2000. Returns ecliptic longitude, latitude, and
   * heliocentric distance.
   *
   * Elements and secular rates from JPL (Standish 1992) via Meeus Table 31.A.
   */
  planetEcliptic(planet: PlanetName, date: Date = new Date()): PlanetPosition {
    type Elements = {
      a: number; da: number   // semi-major axis (AU) + rate (AU/century)
      e: number; de: number   // eccentricity + rate (/century)
      i: number; di: number   // inclination (deg) + rate (deg/century)
      L: number; dL: number   // mean longitude (deg) + rate (deg/century)
      w: number; dw: number   // longitude of perihelion (deg) + rate (deg/century)
      O: number; dO: number   // longitude of ascending node (deg) + rate (deg/century)
    }

    // J2000 elements + secular rates (per Julian century)
    const ELEMENTS: Record<PlanetName, Elements> = {
      mercury: { a:0.38709927, da:0.00000037,  e:0.20563593, de:0.00001906,  i:7.00497902, di:-0.00594749,  L:252.25032350, dL:149472.67411175, w:77.45779628,  dw:0.16047689,  O:48.33076593,  dO:-0.12534081 },
      venus:   { a:0.72333566, da:0.00000390,  e:0.00677672, de:-0.00004107, i:3.39467605, di:-0.00078890,  L:181.97909950, dL:58517.81538729,  w:131.60246718, dw:0.00268329,  O:76.67984255,  dO:-0.27769418 },
      earth:   { a:1.00000261, da:0.00000562,  e:0.01671123, de:-0.00004392, i:-0.00001531,di:-0.01294668,  L:100.46457166, dL:35999.37244981,  w:102.93768193, dw:0.32327364,  O:0.0,          dO:0.0 },
      mars:    { a:1.52371034, da:0.00001847,  e:0.09339410, de:0.00007882,  i:1.84969142, di:-0.00813131,  L:355.44656299, dL:19140.30268499,  w:336.05637041, dw:0.44441088,  O:49.55953891,  dO:-0.29257343 },
      jupiter: { a:5.20288700, da:-0.00011607, e:0.04838624, de:-0.00013253, i:1.30439695, di:-0.00183714,  L:34.39644051,  dL:3034.74612775,   w:14.72847983,  dw:0.21252668,  O:100.47390909, dO:0.20469106 },
      saturn:  { a:9.53667594, da:-0.00125060, e:0.05386179, de:-0.00050991, i:2.48599187, di:0.00193609,   L:49.95424423,  dL:1222.49362201,   w:92.59887831,  dw:-0.41897216, O:113.66242448, dO:-0.28867794 },
      uranus:  { a:19.18916464,da:-0.00196176, e:0.04725744, de:-0.00004397, i:0.77263783, di:-0.00242939,  L:313.23810451, dL:428.48202785,    w:170.95427630, dw:0.40805281,  O:74.01692503,  dO:0.04240589 },
      neptune: { a:30.06992276,da:0.00026291,  e:0.00859048, de:0.00005105,  i:1.77004347, di:0.00035372,   L:304.87997031, dL:218.45945325,    w:44.96476227,  dw:-0.32241464, O:131.78422574, dO:-0.00508664 },
    }

    const p = ELEMENTS[planet]
    const d = this.j2000Days(date)
    const T = d / 36525 // Julian centuries since J2000

    // Apply secular rates
    const a = p.a  + p.da * T
    const e = p.e  + p.de * T
    const i = p.i  + p.di * T
    const L = p.L  + p.dL * T
    const w = p.w  + p.dw * T
    const O = p.O  + p.dO * T

    // Mean anomaly
    const M = ((L - w) % 360 + 360) % 360
    const Mrad = M * D

    // Solve Kepler's equation for eccentric anomaly
    const E = this.solveKepler(Mrad, e)

    // True anomaly from eccentric anomaly
    const nu = Math.atan2(
      Math.sqrt(1 - e * e) * Math.sin(E),
      Math.cos(E) - e,
    ) * R
    const nuNorm = ((nu % 360) + 360) % 360

    // Heliocentric distance (AU)
    const r = a * (1 - e * Math.cos(E))

    // Argument of perihelion (w - O)
    const argPeri = w - O

    // Ecliptic longitude and latitude (accounting for inclination)
    const nuPlusArg = (nuNorm + argPeri) * D
    const iRad = i * D
    const ORad = O * D

    // Heliocentric ecliptic coordinates
    const lon = Math.atan2(
      Math.sin(nuPlusArg) * Math.cos(iRad),
      Math.cos(nuPlusArg),
    ) * R + O
    const lat = Math.asin(Math.sin(nuPlusArg) * Math.sin(iRad)) * R

    const lonNorm = ((lon % 360) + 360) % 360

    return { lon: lonNorm, lat, r, M, nu: nuNorm }
  },

  // ── Precession ──────────────────────────────────────────────────────────

  /**
   * Precess equatorial coordinates between epochs.
   * Rigorous method using Lieske (1979) polynomials.
   * Source: Meeus, Chapter 21.
   * @param eq    J2000 equatorial coordinates
   * @param jdFrom Julian date of source epoch (default J2000)
   * @param jdTo   Julian date of target epoch
   */
  precess(
    eq: EquatorialCoord,
    jdFrom: number,
    jdTo: number,
  ): EquatorialCoord {
    const T = (jdFrom - 2_451_545.0) / 36525
    const t = (jdTo - jdFrom) / 36525

    // Precession parameters in arcseconds
    const zetaA  = (2306.2181 + 1.39656 * T - 0.000139 * T * T) * t +
                   (0.30188 - 0.000344 * T) * t * t + 0.017998 * t * t * t
    const zA     = (2306.2181 + 1.39656 * T - 0.000139 * T * T) * t +
                   (1.09468 + 0.000066 * T) * t * t + 0.018203 * t * t * t
    const thetaA = (2004.3109 - 0.85330 * T - 0.000217 * T * T) * t -
                   (0.42665 + 0.000217 * T) * t * t - 0.041833 * t * t * t

    const zetaR  = (zetaA / 3600) * D
    const zR     = (zA / 3600) * D
    const thetaR = (thetaA / 3600) * D

    const raR  = eq.ra * D
    const decR = eq.dec * D

    const A = Math.cos(decR) * Math.sin(raR + zetaR)
    const B = Math.cos(thetaR) * Math.cos(decR) * Math.cos(raR + zetaR) -
              Math.sin(thetaR) * Math.sin(decR)
    const C = Math.sin(thetaR) * Math.cos(decR) * Math.cos(raR + zetaR) +
              Math.cos(thetaR) * Math.sin(decR)

    const ra  = (Math.atan2(A, B) + zR) * R
    const dec = Math.asin(Math.max(-1, Math.min(1, C))) * R

    return { ra: ((ra % 360) + 360) % 360, dec }
  },

  // ── Nutation ────────────────────────────────────────────────────────────

  /**
   * Nutation in longitude (dPsi) and obliquity (dEpsilon).
   * First 13 terms of the IAU 1980 nutation series.
   * Source: Meeus, Chapter 22, Table 22.A.
   * Returns values in degrees.
   */
  nutation(jd: number): NutationResult {
    const T = (jd - 2_451_545.0) / 36525

    // Fundamental arguments in degrees
    const Om = ((125.04452 - 1934.136261 * T) % 360 + 360) % 360
    const Ls = ((280.4665  + 36000.7698 * T) % 360 + 360) % 360    // Sun mean longitude
    const Lm = ((218.3165  + 481267.8813 * T) % 360 + 360) % 360   // Moon mean longitude
    const F  = ((93.2720   + 483202.0175 * T) % 360 + 360) % 360   // Moon argument of latitude
    const Dp = ((297.8502  + 445267.1115 * T) % 360 + 360) % 360   // Moon mean elongation

    const OmR = Om * D
    const LsR = Ls * D
    const LmR = Lm * D
    const FR  = F * D
    const DpR = Dp * D

    // IAU 1980 nutation series (13 largest terms)
    // [D, M, M', F, Om, dPsi_sin, dPsi_sinT, dEps_cos, dEps_cosT] (coefficients in 0.0001")
    const terms: number[][] = [
      [ 0, 0, 0, 0, 1, -171996, -174.2, 92025,  8.9],
      [-2, 0, 0, 2, 2,  -13187,   -1.6,  5736, -3.1],
      [ 0, 0, 0, 2, 2,   -2274,   -0.2,   977, -0.5],
      [ 0, 0, 0, 0, 2,    2062,    0.2,  -895,  0.5],
      [ 0, 1, 0, 0, 0,    1426,   -3.4,    54, -0.1],
      [ 0, 0, 1, 0, 0,     712,    0.1,    -7,  0.0],
      [-2, 1, 0, 2, 2,    -517,    1.2,   224, -0.6],
      [ 0, 0, 0, 2, 1,    -386,   -0.4,   200,  0.0],
      [ 0, 0, 1, 2, 2,    -301,    0.0,   129, -0.1],
      [-2,-1, 0, 2, 2,     217,   -0.5,   -95,  0.3],
      [-2, 0, 1, 0, 0,    -158,    0.0,     0,  0.0],
      [-2, 0, 0, 2, 1,     129,    0.1,   -70,  0.0],
      [ 0, 0,-1, 2, 2,     123,    0.0,   -53,  0.0],
    ]

    let dPsi = 0
    let dEps = 0
    for (const t of terms) {
      const arg = t[0]! * DpR + t[1]! * LsR + t[2]! * LmR + t[3]! * FR + t[4]! * OmR
      dPsi += (t[5]! + t[6]! * T) * Math.sin(arg)
      dEps += (t[7]! + t[8]! * T) * Math.cos(arg)
    }

    // Convert from 0.0001" to degrees
    return {
      dPsi: dPsi / (3600 * 10000),
      dEpsilon: dEps / (3600 * 10000),
    }
  },

  /**
   * True obliquity of the ecliptic (mean + nutation correction).
   * Returns degrees.
   */
  trueObliquity(jd: number): number {
    const T = (jd - 2_451_545.0) / 36525
    const meanEps = 23.439291111 - 0.013004167 * T - 1.639e-7 * T * T + 5.036e-7 * T * T * T
    const { dEpsilon } = this.nutation(jd)
    return meanEps + dEpsilon
  },

  /**
   * Greenwich Apparent Sidereal Time in degrees.
   * GMST corrected for nutation (equation of the equinoxes).
   */
  gast(date: Date = new Date()): number {
    const jd = this.toJulian(date)
    const gmst = this.gmst(date)
    const { dPsi } = this.nutation(jd)
    const eps = this.trueObliquity(jd)
    const eqEq = dPsi * Math.cos(eps * D) // equation of the equinoxes (degrees)
    return ((gmst + eqEq) % 360 + 360) % 360
  },

  // ── Atmospheric refraction ──────────────────────────────────────────────

  /**
   * Atmospheric refraction correction in degrees.
   * Saemundsson's formula (Meeus, Chapter 16).
   * @param apparentAlt apparent altitude in degrees
   * @param tempC       temperature in Celsius (default 10)
   * @param pressureMb  pressure in millibars (default 1010)
   */
  refraction(apparentAlt: number, tempC = 10, pressureMb = 1010): number {
    if (apparentAlt < -1) return 0
    const h = Math.max(apparentAlt, -0.5)
    // Saemundsson: R in arcminutes
    const Rarcmin = 1.02 / Math.tan((h + 10.3 / (h + 5.11)) * D) +
                    0.0019279 // small constant term
    const correction = (pressureMb / 1010) * (283 / (273 + tempC))
    return (Rarcmin * correction) / 60 // convert arcminutes to degrees
  },

  // ── Proper motion ───────────────────────────────────────────────────────

  /**
   * Apply proper motion to star coordinates.
   * @param eq          J2000 equatorial coordinates
   * @param pmRA        proper motion in RA (mas/year, includes cos(dec) factor)
   * @param pmDec       proper motion in Dec (mas/year)
   * @param fromEpoch   source epoch in years (e.g. 2000.0)
   * @param toEpoch     target epoch in years
   */
  applyProperMotion(
    eq: EquatorialCoord,
    pmRA: number,
    pmDec: number,
    fromEpoch: number,
    toEpoch: number,
  ): EquatorialCoord {
    const dt = toEpoch - fromEpoch
    // Convert mas/year to degrees/year, then multiply by dt
    const dRA  = (pmRA / (3_600_000 * Math.cos(eq.dec * D))) * dt
    const dDec = (pmDec / 3_600_000) * dt
    const ra  = ((eq.ra + dRA) % 360 + 360) % 360
    const dec = Math.max(-90, Math.min(90, eq.dec + dDec))
    return { ra, dec }
  },

  // ── Rise / Transit / Set ────────────────────────────────────────────────

  /**
   * Compute rise, transit, and set times for a celestial object.
   * Source: Meeus, Chapter 15.
   * @param eq  equatorial coordinates (RA/Dec in degrees, J2000)
   * @param obs observer location and date (date = day of interest)
   * @param h0  standard altitude in degrees (default -0.5667 for stars)
   *            Use -0.8333 for Sun, +0.125 for Moon.
   */
  riseTransitSet(
    eq: EquatorialCoord,
    obs: ObserverParams,
    h0 = -0.5667,
  ): RiseTransitSet {
    const date = obs.date ?? new Date()

    // Midnight UTC on the given date
    const midnight = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ))

    const decR = eq.dec * D
    const latR = obs.lat * D
    const h0R  = h0 * D

    // Hour angle at rise/set
    const cosH0 = (Math.sin(h0R) - Math.sin(latR) * Math.sin(decR)) /
                  (Math.cos(latR) * Math.cos(decR))

    // GMST at 0h UT on the date
    const gmst0 = this.gmst(midnight)

    // Transit time (fraction of day)
    const transitFrac = ((eq.ra - obs.lng - gmst0) / 360 % 1 + 1) % 1

    const transit = new Date(midnight.valueOf() + transitFrac * 86_400_000)

    if (cosH0 > 1) {
      // Object never rises (always below h0)
      return { rise: null, transit, set: null }
    }
    if (cosH0 < -1) {
      // Object never sets (circumpolar above h0)
      return { rise: null, transit, set: null }
    }

    const H0deg = Math.acos(cosH0) * R
    const H0frac = H0deg / 360

    const riseFrac = ((transitFrac - H0frac) % 1 + 1) % 1
    const setFrac  = ((transitFrac + H0frac) % 1 + 1) % 1

    const rise = new Date(midnight.valueOf() + riseFrac * 86_400_000)
    const set  = new Date(midnight.valueOf() + setFrac * 86_400_000)

    return { rise, transit, set }
  },
} as const
