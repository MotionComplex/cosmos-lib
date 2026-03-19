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

/**
 * Core coordinate-transformation and ephemeris math module for cosmos-lib.
 *
 * Provides functions for time conversions, coordinate transforms (equatorial,
 * horizontal, ecliptic, galactic), angular separation, photometry, Keplerian
 * orbit solving, planetary ephemerides, precession, nutation, atmospheric
 * refraction, proper motion, and rise/transit/set calculations.
 *
 * All angular inputs and outputs are in **degrees** unless explicitly noted
 * otherwise (e.g. Kepler solver uses radians internally).
 *
 * @remarks
 * Many algorithms are drawn from Jean Meeus, "Astronomical Algorithms" (2nd ed., Willmann-Bell, 1998).
 * Orbital elements come from JPL (Standish 1992). The IAU 1980 nutation series and
 * Lieske (1979) precession polynomials are used where noted.
 */
export const AstroMath = {
  // ── Time ──────────────────────────────────────────────────────────────────

  /**
   * Convert a JavaScript Date to a Julian Date number.
   *
   * The Julian Date is a continuous count of days since the beginning of the
   * Julian period (January 1, 4713 BC, 12:00 TT).
   *
   * @param date - The JavaScript Date to convert. Defaults to the current date/time.
   * @returns The Julian Date as a floating-point number.
   *
   * @example
   * ```ts
   * // J2000.0 epoch: 2000-01-01T12:00:00Z
   * AstroMath.toJulian(new Date('2000-01-01T12:00:00Z'))
   * // => 2451545.0
   * ```
   */
  toJulian(date: Date = new Date()): number {
    return date.valueOf() / 86_400_000 + 2_440_587.5
  },

  /**
   * Convert a Julian Date number back to a JavaScript Date.
   *
   * @param jd - The Julian Date to convert.
   * @returns A JavaScript Date representing the same instant.
   *
   * @example
   * ```ts
   * AstroMath.fromJulian(2451545.0)
   * // => Date('2000-01-01T12:00:00.000Z')
   * ```
   */
  fromJulian(jd: number): Date {
    return new Date((jd - 2_440_587.5) * 86_400_000)
  },

  /**
   * Compute the number of days elapsed since the J2000.0 epoch
   * (2000-01-01T12:00:00 TT, JD 2451545.0).
   *
   * @param date - The observation date. Defaults to the current date/time.
   * @returns Fractional days since J2000.0 (negative for dates before the epoch).
   *
   * @example
   * ```ts
   * // One Julian century after J2000.0
   * AstroMath.j2000Days(new Date('2100-01-01T12:00:00Z'))
   * // => ~36525.0
   * ```
   */
  j2000Days(date: Date = new Date()): number {
    return this.toJulian(date) - CONSTANTS.J2000
  },

  /**
   * Greenwich Mean Sidereal Time (GMST) in degrees.
   *
   * Accurate to ~0.1 s over several centuries around J2000.
   *
   * @param date - The observation date. Defaults to the current date/time.
   * @returns GMST in degrees, normalised to the range [0, 360).
   *
   * @remarks
   * Uses the linear approximation from Meeus, "Astronomical Algorithms", Chapter 12.
   * For higher accuracy near the current epoch, see {@link gast} which includes
   * the nutation correction (equation of the equinoxes).
   *
   * @example
   * ```ts
   * // GMST at J2000.0 epoch
   * AstroMath.gmst(new Date('2000-01-01T12:00:00Z'))
   * // => 280.46061837
   * ```
   */
  gmst(date: Date = new Date()): number {
    const d = this.j2000Days(date)
    return ((280.46061837 + 360.98564736629 * d) % 360 + 360) % 360
  },

  /**
   * Local Sidereal Time (LST) in degrees.
   *
   * LST equals GMST plus the observer's geographic longitude.
   *
   * @param date - The observation date/time.
   * @param longitudeDeg - Observer's geographic longitude in degrees (east positive, west negative).
   * @returns LST in degrees, normalised to the range [0, 360).
   *
   * @example
   * ```ts
   * // LST for an observer in London (lng = -0.1) at J2000.0
   * AstroMath.lst(new Date('2000-01-01T12:00:00Z'), -0.1)
   * // => ~280.36
   * ```
   */
  lst(date: Date, longitudeDeg: number): number {
    return ((this.gmst(date) + longitudeDeg) % 360 + 360) % 360
  },

  // ── Coordinate transforms ─────────────────────────────────────────────────

  /**
   * Convert equatorial coordinates (RA/Dec) to horizontal coordinates (Altitude/Azimuth).
   *
   * Azimuth is measured from North (0) through East (90), South (180), West (270).
   * All angles are in degrees.
   *
   * @param eq - Equatorial coordinates with `ra` (right ascension) and `dec` (declination) in degrees.
   * @param obs - Observer parameters including `lat` (latitude), `lng` (longitude), and optional `date`.
   * @returns Horizontal coordinates with `alt` (altitude) and `az` (azimuth) in degrees.
   *
   * @remarks
   * Based on the standard spherical-trigonometry transformation.
   * See Meeus, "Astronomical Algorithms", Chapter 13.
   *
   * @example
   * ```ts
   * // Sirius (RA=101.287, Dec=-16.716) as seen from London (lat=51.5, lng=-0.1)
   * const sirius = { ra: 101.287, dec: -16.716 }
   * const london = { lat: 51.5, lng: -0.1, date: new Date('2024-01-15T22:00:00Z') }
   * AstroMath.equatorialToHorizontal(sirius, london)
   * // => { alt: <altitude>, az: <azimuth> }
   * ```
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
   * Convert horizontal coordinates (Altitude/Azimuth) to equatorial coordinates (RA/Dec).
   *
   * This is the inverse of {@link equatorialToHorizontal}. All angles are in degrees.
   *
   * @param hor - Horizontal coordinates with `alt` (altitude) and `az` (azimuth) in degrees.
   * @param obs - Observer parameters including `lat` (latitude), `lng` (longitude), and optional `date`.
   * @returns Equatorial coordinates with `ra` (right ascension) and `dec` (declination) in degrees.
   *
   * @remarks
   * See Meeus, "Astronomical Algorithms", Chapter 13.
   *
   * @example
   * ```ts
   * // An object at alt=25, az=180 (due south) from Lucerne (lat=47.05, lng=8.31)
   * const hor = { alt: 25, az: 180 }
   * const lucerne = { lat: 47.05, lng: 8.31, date: new Date('2024-03-20T21:00:00Z') }
   * AstroMath.horizontalToEquatorial(hor, lucerne)
   * // => { ra: <right ascension>, dec: <declination> }
   * ```
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
   * Convert ecliptic coordinates to equatorial coordinates (J2000 epoch).
   *
   * Uses the mean obliquity of the ecliptic at J2000.0 (23.4393 degrees).
   * All angles are in degrees.
   *
   * @param ecl - Ecliptic coordinates with `lon` (ecliptic longitude) and `lat` (ecliptic latitude) in degrees.
   * @returns Equatorial coordinates with `ra` in [0, 360) and `dec` in [-90, 90] degrees.
   *
   * @remarks
   * See Meeus, "Astronomical Algorithms", Chapter 13. Uses the standard rotation
   * matrix for the obliquity of the ecliptic.
   *
   * @example
   * ```ts
   * // Convert the ecliptic coordinates of the vernal equinox
   * AstroMath.eclipticToEquatorial({ lon: 0, lat: 0 })
   * // => { ra: 0, dec: 0 }
   *
   * // A point on the ecliptic at lon=90
   * AstroMath.eclipticToEquatorial({ lon: 90, lat: 0 })
   * // => { ra: ~90, dec: ~23.44 }
   * ```
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
   * Convert galactic coordinates to equatorial coordinates (J2000 epoch).
   *
   * Uses the standard IAU galactic coordinate system with the North Galactic
   * Pole at RA=192.85948, Dec=27.12825 and the ascending node of the galactic
   * plane at l=122.93192.
   *
   * @param gal - Galactic coordinates with `l` (galactic longitude) and `b` (galactic latitude) in degrees.
   * @returns Equatorial coordinates with `ra` in [0, 360) and `dec` in [-90, 90] degrees.
   *
   * @remarks
   * Implements the standard IAU (1958) galactic coordinate transformation.
   * See Meeus, "Astronomical Algorithms", Chapter 13, and
   * Blaauw et al. (1960), MNRAS 121, 123.
   *
   * @example
   * ```ts
   * // Galactic centre (l=0, b=0) -> equatorial
   * AstroMath.galacticToEquatorial({ l: 0, b: 0 })
   * // => { ra: ~266.4, dec: ~-28.9 } (near Sagittarius A*)
   * ```
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
   * Compute the great-circle angular separation between two equatorial positions.
   *
   * Uses the haversine formula for numerical stability at small angular distances.
   *
   * @param a - First equatorial position with `ra` and `dec` in degrees.
   * @param b - Second equatorial position with `ra` and `dec` in degrees.
   * @returns Angular separation in degrees, in the range [0, 180].
   *
   * @remarks
   * The haversine formula avoids the floating-point cancellation issues that
   * affect the simpler cosine formula at small separations.
   * See Meeus, "Astronomical Algorithms", Chapter 17.
   *
   * @example
   * ```ts
   * // Angular separation between Sirius and Betelgeuse
   * const sirius     = { ra: 101.287, dec: -16.716 }
   * const betelgeuse = { ra: 88.793, dec: 7.407 }
   * AstroMath.angularSeparation(sirius, betelgeuse)
   * // => ~27.07 degrees
   * ```
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

  /**
   * Compute apparent magnitude from absolute magnitude and distance.
   *
   * Uses the distance modulus formula: m = M + 5 * log10(d / 10).
   *
   * @param absoluteMag - Absolute magnitude (M) of the object.
   * @param distancePc - Distance to the object in parsecs.
   * @returns Apparent magnitude (m) as seen from the observer.
   *
   * @example
   * ```ts
   * // Sirius: absolute magnitude M=1.42, distance=2.64 pc
   * AstroMath.apparentMagnitude(1.42, 2.64)
   * // => ~-1.46 (apparent magnitude)
   * ```
   */
  apparentMagnitude(absoluteMag: number, distancePc: number): number {
    return absoluteMag + 5 * Math.log10(distancePc / 10)
  },

  /**
   * Compute absolute magnitude from apparent magnitude and distance.
   *
   * Uses the inverse distance modulus formula: M = m - 5 * log10(d / 10).
   *
   * @param apparentMag - Apparent magnitude (m) of the object.
   * @param distancePc - Distance to the object in parsecs.
   * @returns Absolute magnitude (M), i.e. apparent magnitude at 10 parsecs.
   *
   * @example
   * ```ts
   * // Sirius: apparent magnitude m=-1.46, distance=2.64 pc
   * AstroMath.absoluteMagnitude(-1.46, 2.64)
   * // => ~1.42 (absolute magnitude)
   * ```
   */
  absoluteMagnitude(apparentMag: number, distancePc: number): number {
    return apparentMag - 5 * Math.log10(distancePc / 10)
  },

  /**
   * Convert stellar parallax to distance.
   *
   * By definition, 1 parsec is the distance at which 1 AU subtends 1 arcsecond.
   *
   * @param parallaxArcsec - Trigonometric parallax in arcseconds. Must be positive.
   * @returns Distance in parsecs.
   *
   * @example
   * ```ts
   * // Sirius parallax: 0.37921 arcsec
   * AstroMath.parallaxToDistance(0.37921)
   * // => ~2.637 parsecs
   * ```
   */
  parallaxToDistance(parallaxArcsec: number): number {
    return 1 / parallaxArcsec
  },

  // ── Kepler solver ────────────────────────────────────────────────────────

  /**
   * Solve Kepler's equation `M = E - e * sin(E)` for the eccentric anomaly E.
   *
   * Uses Newton-Raphson iteration with Meeus's initial-guess formula.
   * Converges in 3-6 iterations for all planetary eccentricities (e < 1).
   *
   * @param M - Mean anomaly in **radians**.
   * @param e - Orbital eccentricity (0 <= e < 1 for elliptical orbits).
   * @param tol - Convergence tolerance in radians. Defaults to 1e-12.
   * @returns Eccentric anomaly E in **radians**.
   *
   * @remarks
   * Source: Meeus, "Astronomical Algorithms" (2nd ed.), Chapter 30.
   * The initial guess uses `E0 = M + e * sin(M) * (1 + e * cos(M))`,
   * which provides rapid convergence for moderate eccentricities.
   * The iteration is capped at 30 steps as a safety limit.
   *
   * @example
   * ```ts
   * // Earth's orbit: e=0.0167, mean anomaly = 1.0 rad
   * AstroMath.solveKepler(1.0, 0.0167)
   * // => ~1.0166 radians
   *
   * // Mars's orbit: e=0.0934, mean anomaly = pi/2 rad
   * AstroMath.solveKepler(Math.PI / 2, 0.0934)
   * // => ~1.6521 radians
   * ```
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
   * Compute heliocentric ecliptic position of a planet.
   *
   * Uses J2000 orbital elements with linear secular rates and an iterative
   * Kepler solver. Accurate to ~0.1 degrees within several centuries of J2000.
   *
   * @param planet - Planet name: `'mercury'` | `'venus'` | `'earth'` | `'mars'` | `'jupiter'` | `'saturn'` | `'uranus'` | `'neptune'`.
   * @param date - The observation date. Defaults to the current date/time.
   * @returns A {@link PlanetPosition} object with heliocentric ecliptic `lon` (degrees),
   *   `lat` (degrees), `r` (distance in AU), `M` (mean anomaly in degrees),
   *   and `nu` (true anomaly in degrees).
   *
   * @remarks
   * Orbital elements and secular rates are from JPL (Standish 1992) via
   * Meeus, "Astronomical Algorithms", Table 31.A. The Kepler equation is solved
   * iteratively by {@link solveKepler}. This method returns **heliocentric**
   * coordinates; for geocentric positions, subtract Earth's position.
   *
   * @example
   * ```ts
   * // Mars position on 2024-07-04
   * const mars = AstroMath.planetEcliptic('mars', new Date('2024-07-04T00:00:00Z'))
   * // => { lon: <ecliptic longitude>, lat: <ecliptic latitude>, r: <AU>, M: <mean anomaly>, nu: <true anomaly> }
   *
   * // Jupiter position at J2000.0
   * const jupiter = AstroMath.planetEcliptic('jupiter', new Date('2000-01-01T12:00:00Z'))
   * // => { lon: ~34.4, lat: ~-1.3, r: ~5.03, ... }
   * ```
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
   * Precess equatorial coordinates from one epoch to another.
   *
   * Uses the rigorous rotation-matrix method with Lieske (1979) precession
   * polynomials for the three precession parameters (zeta_A, z_A, theta_A).
   *
   * @param eq - Equatorial coordinates at the source epoch, with `ra` and `dec` in degrees.
   * @param jdFrom - Julian Date of the source epoch (e.g. 2451545.0 for J2000.0).
   * @param jdTo - Julian Date of the target epoch.
   * @returns Equatorial coordinates at the target epoch, with `ra` in [0, 360) and `dec` in degrees.
   *
   * @remarks
   * Source: Meeus, "Astronomical Algorithms", Chapter 21.
   * The Lieske (1979) polynomials are accurate to ~0.1 arcsecond over a few
   * centuries around J2000.0. For longer time spans, use the Capitaine et al.
   * (2003) IAU 2006 precession model.
   *
   * @example
   * ```ts
   * // Precess Sirius from J2000.0 to J2050.0
   * const sirius = { ra: 101.287, dec: -16.716 }
   * const j2000 = 2451545.0
   * const j2050 = 2451545.0 + 50 * 365.25
   * AstroMath.precess(sirius, j2000, j2050)
   * // => { ra: ~101.61, dec: ~-16.79 }
   * ```
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
   * Compute nutation in longitude (dPsi) and nutation in obliquity (dEpsilon).
   *
   * Evaluates the first 13 terms of the IAU 1980 nutation series, which capture
   * the dominant periodic terms with amplitudes down to ~0.01 arcsecond.
   *
   * @param jd - Julian Date of the observation.
   * @returns A {@link NutationResult} with `dPsi` (nutation in longitude) and
   *   `dEpsilon` (nutation in obliquity), both in degrees.
   *
   * @remarks
   * Source: Meeus, "Astronomical Algorithms", Chapter 22, Table 22.A.
   * The five fundamental arguments are the Moon's mean elongation (D),
   * Sun's mean anomaly (M), Moon's mean anomaly (M'), Moon's argument of
   * latitude (F), and the longitude of the ascending node of the Moon's
   * orbit (Omega). Coefficients are in units of 0.0001 arcsecond.
   *
   * @example
   * ```ts
   * // Nutation at J2000.0
   * const jd = 2451545.0
   * AstroMath.nutation(jd)
   * // => { dPsi: ~-0.00385, dEpsilon: ~-0.00165 } (degrees)
   * ```
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
   * Compute the true obliquity of the ecliptic (mean obliquity + nutation in obliquity).
   *
   * The mean obliquity polynomial is from Laskar (1986).
   *
   * @param jd - Julian Date of the observation.
   * @returns True obliquity of the ecliptic in degrees.
   *
   * @remarks
   * Combines the mean obliquity (a polynomial in T) with the nutation correction
   * from {@link nutation}. See Meeus, "Astronomical Algorithms", Chapter 22.
   *
   * @example
   * ```ts
   * // True obliquity at J2000.0
   * AstroMath.trueObliquity(2451545.0)
   * // => ~23.439 degrees (mean obliquity plus small nutation correction)
   * ```
   */
  trueObliquity(jd: number): number {
    const T = (jd - 2_451_545.0) / 36525
    const meanEps = 23.439291111 - 0.013004167 * T - 1.639e-7 * T * T + 5.036e-7 * T * T * T
    const { dEpsilon } = this.nutation(jd)
    return meanEps + dEpsilon
  },

  /**
   * Greenwich Apparent Sidereal Time (GAST) in degrees.
   *
   * GAST equals GMST corrected by the equation of the equinoxes
   * (nutation in longitude projected onto the equator).
   *
   * @param date - The observation date. Defaults to the current date/time.
   * @returns GAST in degrees, normalised to the range [0, 360).
   *
   * @remarks
   * The equation of the equinoxes is `dPsi * cos(epsilon)`, where dPsi is the
   * nutation in longitude and epsilon is the true obliquity. This correction
   * is typically on the order of a few arcseconds.
   * See Meeus, "Astronomical Algorithms", Chapter 12.
   *
   * @example
   * ```ts
   * // GAST at J2000.0
   * AstroMath.gast(new Date('2000-01-01T12:00:00Z'))
   * // => ~280.46 degrees (GMST + small nutation correction)
   * ```
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
   * Compute atmospheric refraction correction for a given apparent altitude.
   *
   * Uses Saemundsson's formula with pressure and temperature scaling.
   * Returns zero for objects well below the horizon (apparent altitude < -1 degree).
   *
   * @param apparentAlt - Apparent (observed) altitude of the object in degrees.
   * @param tempC - Air temperature in degrees Celsius. Defaults to 10.
   * @param pressureMb - Atmospheric pressure in millibars. Defaults to 1010.
   * @returns Refraction correction in degrees (always non-negative). Add this value
   *   to the true altitude to obtain the apparent altitude, or subtract it from
   *   the apparent altitude to obtain the true altitude.
   *
   * @remarks
   * Saemundsson's formula as presented in Meeus, "Astronomical Algorithms", Chapter 16.
   * The formula is valid for altitudes above about -0.5 degrees. For objects below -1
   * degree, the function returns 0 as the refraction model is not meaningful there.
   * At the horizon (alt ~0), the refraction is approximately 0.57 degrees (~34 arcminutes).
   *
   * @example
   * ```ts
   * // Refraction at the horizon (apparent altitude = 0) with standard conditions
   * AstroMath.refraction(0)
   * // => ~0.57 degrees (~34 arcminutes)
   *
   * // Refraction at 45 degrees altitude from Lucerne (500m elevation, ~955 mbar, 5 C)
   * AstroMath.refraction(45, 5, 955)
   * // => ~0.016 degrees (~58 arcseconds)
   * ```
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
   * Apply proper motion to propagate star coordinates to a different epoch.
   *
   * This is a linear approximation that is accurate for time spans of a few
   * hundred years for most stars.
   *
   * @param eq - Equatorial coordinates at the source epoch, with `ra` and `dec` in degrees.
   * @param pmRA - Proper motion in right ascension in milliarcseconds per year.
   *   This must already include the cos(dec) factor (i.e. `pmRA*` as given in most
   *   modern catalogues like Hipparcos/Gaia).
   * @param pmDec - Proper motion in declination in milliarcseconds per year.
   * @param fromEpoch - Source epoch as a Besselian/Julian year (e.g. 2000.0 for J2000).
   * @param toEpoch - Target epoch as a Besselian/Julian year (e.g. 2025.0).
   * @returns Equatorial coordinates at the target epoch, with `ra` in [0, 360) and `dec` clamped to [-90, 90].
   *
   * @remarks
   * The pmRA value is divided by cos(dec) internally to convert from great-circle
   * motion to coordinate motion before applying the linear offset.
   * For very fast-moving stars (e.g. Barnard's Star) or long time intervals,
   * consider using a full 6D space-motion propagation instead.
   *
   * @example
   * ```ts
   * // Propagate Sirius from J2000.0 to J2025.0
   * // Sirius: pmRA = -546.01 mas/yr, pmDec = -1223.14 mas/yr
   * const sirius = { ra: 101.287, dec: -16.716 }
   * AstroMath.applyProperMotion(sirius, -546.01, -1223.14, 2000.0, 2025.0)
   * // => { ra: ~101.283, dec: ~-16.724 }
   * ```
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
   * Compute rise, transit (culmination), and set times for a celestial object.
   *
   * Calculates the UTC times at which the object crosses the standard altitude
   * (rise/set) and reaches its highest point above the horizon (transit) on the
   * given date. If the object is circumpolar or never rises, `rise` and `set`
   * are returned as `null` while `transit` is still provided.
   *
   * @param eq - Equatorial coordinates of the object with `ra` and `dec` in degrees (J2000).
   * @param obs - Observer parameters including `lat` (latitude in degrees), `lng` (longitude
   *   in degrees, east positive), and optional `date` (the day of interest; defaults to now).
   * @param h0 - Standard altitude in degrees that defines the rise/set event. Defaults to
   *   -0.5667 (accounting for atmospheric refraction for point sources / stars).
   *   Common values:
   *   - Stars: -0.5667 (default)
   *   - Sun (upper limb): -0.8333
   *   - Moon (upper limb): +0.125
   * @returns A {@link RiseTransitSet} object with `rise`, `transit`, and `set` as
   *   JavaScript Date objects (or `null` for rise/set if the object is circumpolar
   *   or never rises above h0).
   *
   * @remarks
   * Source: Meeus, "Astronomical Algorithms", Chapter 15.
   * This implementation assumes fixed RA/Dec over the course of the day, which is
   * adequate for stars and adequate as a first approximation for planets. For the
   * Sun and Moon, whose coordinates change significantly during a day, an iterative
   * approach with interpolated coordinates yields better accuracy.
   *
   * @example
   * ```ts
   * // Rise/transit/set of Sirius from London on 2024-01-15
   * const sirius = { ra: 101.287, dec: -16.716 }
   * const london = { lat: 51.5, lng: -0.1, date: new Date('2024-01-15T00:00:00Z') }
   * const rts = AstroMath.riseTransitSet(sirius, london)
   * // => { rise: Date(~17:08 UTC), transit: Date(~00:02 UTC), set: Date(~06:56 UTC) }
   *
   * // Sun rise/set from Lucerne on the March equinox
   * const sunEquinox = { ra: 0, dec: 0 }
   * const lucerne = { lat: 47.05, lng: 8.31, date: new Date('2024-03-20T00:00:00Z') }
   * AstroMath.riseTransitSet(sunEquinox, lucerne, -0.8333)
   * // => { rise: Date(~05:30 UTC), transit: Date(~11:25 UTC), set: Date(~17:20 UTC) }
   * ```
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
