import { M as R } from "./media-DVOcIMa1.js";
const S = {
  /** One Astronomical Unit in kilometres (IAU 2012 exact definition). */
  AU_TO_KM: 1495978707e-1,
  /** One light-year in kilometres. */
  LY_TO_KM: 94607304725808e-1,
  /** One parsec in light-years. */
  PC_TO_LY: 3.261563777,
  /** One parsec in kilometres. */
  PC_TO_KM: 3085677581e4,
  /** Speed of light in km/s (exact, SI definition). */
  C_KM_S: 299792.458,
  /** Newtonian gravitational constant in m^3 kg^-1 s^-2 (CODATA 2018). */
  G: 6674e-14,
  /** Solar mass in kilograms. */
  SOLAR_MASS_KG: 1989e27,
  /** Solar radius in kilometres. */
  SOLAR_RADIUS_KM: 695700,
  /** Earth mass in kilograms. */
  EARTH_MASS_KG: 5972e21,
  /** Mean Earth radius in kilometres (IUGG). */
  EARTH_RADIUS_KM: 6371,
  /** Julian Date of the J2000.0 epoch (2000-01-01T12:00:00 TT). */
  J2000: 2451545,
  /** Mean obliquity of the ecliptic at J2000.0, in degrees. */
  ECLIPTIC_OBL: 23.4392911,
  /** Conversion factor: degrees to radians. */
  DEG_TO_RAD: Math.PI / 180,
  /** Conversion factor: radians to degrees. */
  RAD_TO_DEG: 180 / Math.PI
}, Is = {
  // ── Distance ───────────────────────────────────────────────────────────────
  /**
   * Convert Astronomical Units to kilometres.
   * @param au - Distance in AU.
   * @returns Distance in kilometres.
   */
  auToKm: (n) => n * S.AU_TO_KM,
  /**
   * Convert kilometres to Astronomical Units.
   * @param km - Distance in kilometres.
   * @returns Distance in AU.
   */
  kmToAu: (n) => n / S.AU_TO_KM,
  /**
   * Convert light-years to parsecs.
   * @param ly - Distance in light-years.
   * @returns Distance in parsecs.
   */
  lyToPc: (n) => n / S.PC_TO_LY,
  /**
   * Convert parsecs to light-years.
   * @param pc - Distance in parsecs.
   * @returns Distance in light-years.
   */
  pcToLy: (n) => n * S.PC_TO_LY,
  /**
   * Convert parsecs to kilometres.
   * @param pc - Distance in parsecs.
   * @returns Distance in kilometres.
   */
  pcToKm: (n) => n * S.PC_TO_KM,
  /**
   * Convert light-years to kilometres.
   * @param ly - Distance in light-years.
   * @returns Distance in kilometres.
   */
  lyToKm: (n) => n * S.LY_TO_KM,
  /**
   * Convert kilometres to light-years.
   * @param km - Distance in kilometres.
   * @returns Distance in light-years.
   */
  kmToLy: (n) => n / S.LY_TO_KM,
  // ── Angular ────────────────────────────────────────────────────────────────
  /**
   * Convert degrees to radians.
   * @param d - Angle in degrees.
   * @returns Angle in radians.
   */
  degToRad: (n) => n * S.DEG_TO_RAD,
  /**
   * Convert radians to degrees.
   * @param r - Angle in radians.
   * @returns Angle in degrees.
   */
  radToDeg: (n) => n * S.RAD_TO_DEG,
  /**
   * Convert arcseconds to degrees.
   * @param a - Angle in arcseconds.
   * @returns Angle in degrees.
   */
  arcsecToDeg: (n) => n / 3600,
  /**
   * Convert degrees to arcseconds.
   * @param d - Angle in degrees.
   * @returns Angle in arcseconds.
   */
  degToArcsec: (n) => n * 3600,
  /**
   * Convert Right Ascension from hours to degrees.
   * @param h - RA in hours (0–24).
   * @returns RA in degrees (0–360).
   */
  hrsToDeg: (n) => n * 15,
  /**
   * Convert Right Ascension from degrees to hours.
   * @param d - RA in degrees (0–360).
   * @returns RA in hours (0–24).
   */
  degToHrs: (n) => n / 15,
  /**
   * Format a distance in kilometres into a human-readable string,
   * automatically choosing the most appropriate unit (km, AU, ly, or Mly).
   *
   * @param km - Distance in kilometres.
   * @returns Formatted string with unit suffix.
   *
   * @example
   * ```ts
   * Units.formatDistance(384_400)               // '0.002570 AU'
   * Units.formatDistance(9_460_730_472_580 * 8.6) // '8.600 ly'
   * ```
   */
  formatDistance(n) {
    const s = n / S.AU_TO_KM;
    if (s < 0.01) return `${n.toFixed(0)} km`;
    if (s < 1e3) return `${s.toPrecision(4)} AU`;
    const e = n / S.LY_TO_KM;
    return e < 1e6 ? `${e.toPrecision(4)} ly` : `${(e / 1e6).toPrecision(4)} Mly`;
  },
  /**
   * Format decimal degrees as d°m′s″ (signed).
   *
   * @param deg - Angle in decimal degrees.
   * @returns Formatted DMS string.
   *
   * @example
   * ```ts
   * Units.formatAngle(-16.716)  // '-16°42′57.6″'
   * Units.formatAngle(83.822)   // '83°49′19.2″'
   * ```
   */
  formatAngle(n) {
    const s = n < 0 ? "-" : "", e = Math.abs(n), i = Math.floor(e), t = Math.floor((e - i) * 60), r = ((e - i) * 60 - t) * 60;
    return `${s}${i}°${t}′${r.toFixed(1)}″`;
  },
  /**
   * Format Right Ascension from decimal degrees into hours/minutes/seconds.
   *
   * @param deg - RA in decimal degrees (0–360).
   * @returns Formatted string like `'5h 35m 17.3s'`.
   *
   * @example
   * ```ts
   * Units.formatRA(83.822)  // '5h 35m 17.3s'
   * Units.formatRA(0)       // '0h 0m 0.0s'
   * ```
   */
  formatRA(n) {
    const s = (n % 360 + 360) % 360, e = Math.floor(s / 15), i = Math.floor((s / 15 - e) * 60), t = ((s / 15 - e) * 60 - i) * 60;
    return `${e}h ${i}m ${t.toFixed(1)}s`;
  }
}, _ = S.DEG_TO_RAD, D = S.RAD_TO_DEG, M = {
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
  toJulian(n = /* @__PURE__ */ new Date()) {
    return n.valueOf() / 864e5 + 24405875e-1;
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
  fromJulian(n) {
    return new Date((n - 24405875e-1) * 864e5);
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
  j2000Days(n = /* @__PURE__ */ new Date()) {
    return this.toJulian(n) - S.J2000;
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
  gmst(n = /* @__PURE__ */ new Date()) {
    return ((280.46061837 + 360.98564736629 * this.j2000Days(n)) % 360 + 360) % 360;
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
  lst(n, s) {
    return ((this.gmst(n) + s) % 360 + 360) % 360;
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
  equatorialToHorizontal(n, s) {
    const e = s.date ?? /* @__PURE__ */ new Date(), t = ((this.lst(e, s.lng) - n.ra) % 360 + 360) % 360 * _, r = n.dec * _, l = s.lat * _, c = Math.sin(r) * Math.sin(l) + Math.cos(r) * Math.cos(l) * Math.cos(t), o = Math.asin(Math.max(-1, Math.min(1, c))) * D, g = o * _, v = (Math.sin(r) - Math.sin(g) * Math.sin(l)) / (Math.cos(g) * Math.cos(l));
    let k = Math.acos(Math.max(-1, Math.min(1, v))) * D;
    return Math.sin(t) > 0 && (k = 360 - k), { alt: o, az: k };
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
  horizontalToEquatorial(n, s) {
    const e = s.date ?? /* @__PURE__ */ new Date(), i = n.alt * _, t = n.az * _, r = s.lat * _, l = Math.sin(i) * Math.sin(r) + Math.cos(i) * Math.cos(r) * Math.cos(t), c = Math.asin(Math.max(-1, Math.min(1, l))) * D, o = c * _, g = (Math.sin(i) - Math.sin(o) * Math.sin(r)) / (Math.cos(o) * Math.cos(r));
    let v = Math.acos(Math.max(-1, Math.min(1, g))) * D;
    return Math.sin(t) > 0 && (v = 360 - v), { ra: ((this.lst(e, s.lng) - v) % 360 + 360) % 360, dec: c };
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
  eclipticToEquatorial(n) {
    const s = S.ECLIPTIC_OBL * _, e = n.lon * _, i = n.lat * _, t = Math.atan2(
      Math.sin(e) * Math.cos(s) - Math.tan(i) * Math.sin(s),
      Math.cos(e)
    ) * D, r = Math.asin(
      Math.sin(i) * Math.cos(s) + Math.cos(i) * Math.sin(s) * Math.sin(e)
    ) * D;
    return { ra: (t % 360 + 360) % 360, dec: r };
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
  galacticToEquatorial(n) {
    const s = 192.85948, e = 27.12825, i = 122.93192, t = n.b * _, r = (i - n.l) * _, l = e * _, c = Math.sin(t) * Math.sin(l) + Math.cos(t) * Math.cos(l) * Math.cos(r), o = Math.asin(Math.max(-1, Math.min(1, c))) * D;
    return { ra: ((Math.atan2(
      Math.cos(t) * Math.sin(r),
      Math.sin(t) * Math.cos(l) - Math.cos(t) * Math.sin(l) * Math.cos(r)
    ) * D + s) % 360 + 360) % 360, dec: o };
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
  angularSeparation(n, s) {
    const e = n.dec * _, i = s.dec * _, t = (s.ra - n.ra) * _, r = Math.sin((i - e) / 2) ** 2 + Math.cos(e) * Math.cos(i) * Math.sin(t / 2) ** 2;
    return 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, r)))) * D;
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
  apparentMagnitude(n, s) {
    return n + 5 * Math.log10(s / 10);
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
  absoluteMagnitude(n, s) {
    return n - 5 * Math.log10(s / 10);
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
  parallaxToDistance(n) {
    return 1 / n;
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
  solveKepler(n, s, e = 1e-12) {
    let i = n + s * Math.sin(n) * (1 + s * Math.cos(n));
    for (let t = 0; t < 30; t++) {
      const r = (i - s * Math.sin(i) - n) / (1 - s * Math.cos(i));
      if (i -= r, Math.abs(r) < e) break;
    }
    return i;
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
  planetEcliptic(n, s = /* @__PURE__ */ new Date()) {
    const i = {
      mercury: { a: 0.38709927, da: 37e-8, e: 0.20563593, de: 1906e-8, i: 7.00497902, di: -594749e-8, L: 252.2503235, dL: 149472.67411175, w: 77.45779628, dw: 0.16047689, O: 48.33076593, dO: -0.12534081 },
      venus: { a: 0.72333566, da: 39e-7, e: 677672e-8, de: -4107e-8, i: 3.39467605, di: -7889e-7, L: 181.9790995, dL: 58517.81538729, w: 131.60246718, dw: 268329e-8, O: 76.67984255, dO: -0.27769418 },
      earth: { a: 1.00000261, da: 562e-8, e: 0.01671123, de: -4392e-8, i: -1531e-8, di: -0.01294668, L: 100.46457166, dL: 35999.37244981, w: 102.93768193, dw: 0.32327364, O: 0, dO: 0 },
      mars: { a: 1.52371034, da: 1847e-8, e: 0.0933941, de: 7882e-8, i: 1.84969142, di: -813131e-8, L: 355.44656299, dL: 19140.30268499, w: 336.05637041, dw: 0.44441088, O: 49.55953891, dO: -0.29257343 },
      jupiter: { a: 5.202887, da: -11607e-8, e: 0.04838624, de: -13253e-8, i: 1.30439695, di: -183714e-8, L: 34.39644051, dL: 3034.74612775, w: 14.72847983, dw: 0.21252668, O: 100.47390909, dO: 0.20469106 },
      saturn: { a: 9.53667594, da: -12506e-7, e: 0.05386179, de: -50991e-8, i: 2.48599187, di: 193609e-8, L: 49.95424423, dL: 1222.49362201, w: 92.59887831, dw: -0.41897216, O: 113.66242448, dO: -0.28867794 },
      uranus: { a: 19.18916464, da: -196176e-8, e: 0.04725744, de: -4397e-8, i: 0.77263783, di: -242939e-8, L: 313.23810451, dL: 428.48202785, w: 170.9542763, dw: 0.40805281, O: 74.01692503, dO: 0.04240589 },
      neptune: { a: 30.06992276, da: 26291e-8, e: 859048e-8, de: 5105e-8, i: 1.77004347, di: 35372e-8, L: 304.87997031, dL: 218.45945325, w: 44.96476227, dw: -0.32241464, O: 131.78422574, dO: -508664e-8 }
    }[n], r = this.j2000Days(s) / 36525, l = i.a + i.da * r, c = i.e + i.de * r, o = i.i + i.di * r, g = i.L + i.dL * r, v = i.w + i.dw * r, k = i.O + i.dO * r, a = ((g - v) % 360 + 360) % 360, y = a * _, u = this.solveKepler(y, c), f = (Math.atan2(
      Math.sqrt(1 - c * c) * Math.sin(u),
      Math.cos(u) - c
    ) * D % 360 + 360) % 360, b = l * (1 - c * Math.cos(u)), p = v - k, m = (f + p) * _, A = o * _, h = Math.atan2(
      Math.sin(m) * Math.cos(A),
      Math.cos(m)
    ) * D + k, C = Math.asin(Math.sin(m) * Math.sin(A)) * D;
    return { lon: (h % 360 + 360) % 360, lat: C, r: b, M: a, nu: f };
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
  precess(n, s, e) {
    const i = (s - 2451545) / 36525, t = (e - s) / 36525, r = (2306.2181 + 1.39656 * i - 139e-6 * i * i) * t + (0.30188 - 344e-6 * i) * t * t + 0.017998 * t * t * t, l = (2306.2181 + 1.39656 * i - 139e-6 * i * i) * t + (1.09468 + 66e-6 * i) * t * t + 0.018203 * t * t * t, c = (2004.3109 - 0.8533 * i - 217e-6 * i * i) * t - (0.42665 + 217e-6 * i) * t * t - 0.041833 * t * t * t, o = r / 3600 * _, g = l / 3600 * _, v = c / 3600 * _, k = n.ra * _, a = n.dec * _, y = Math.cos(a) * Math.sin(k + o), u = Math.cos(v) * Math.cos(a) * Math.cos(k + o) - Math.sin(v) * Math.sin(a), d = Math.sin(v) * Math.cos(a) * Math.cos(k + o) + Math.cos(v) * Math.sin(a), f = (Math.atan2(y, u) + g) * D, b = Math.asin(Math.max(-1, Math.min(1, d))) * D;
    return { ra: (f % 360 + 360) % 360, dec: b };
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
  nutation(n) {
    const s = (n - 2451545) / 36525, e = ((125.04452 - 1934.136261 * s) % 360 + 360) % 360, i = ((280.4665 + 36000.7698 * s) % 360 + 360) % 360, t = ((218.3165 + 481267.8813 * s) % 360 + 360) % 360, r = ((93.272 + 483202.0175 * s) % 360 + 360) % 360, l = ((297.8502 + 445267.1115 * s) % 360 + 360) % 360, c = e * _, o = i * _, g = t * _, v = r * _, k = l * _, a = [
      [0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9],
      [-2, 0, 0, 2, 2, -13187, -1.6, 5736, -3.1],
      [0, 0, 0, 2, 2, -2274, -0.2, 977, -0.5],
      [0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5],
      [0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1],
      [0, 0, 1, 0, 0, 712, 0.1, -7, 0],
      [-2, 1, 0, 2, 2, -517, 1.2, 224, -0.6],
      [0, 0, 0, 2, 1, -386, -0.4, 200, 0],
      [0, 0, 1, 2, 2, -301, 0, 129, -0.1],
      [-2, -1, 0, 2, 2, 217, -0.5, -95, 0.3],
      [-2, 0, 1, 0, 0, -158, 0, 0, 0],
      [-2, 0, 0, 2, 1, 129, 0.1, -70, 0],
      [0, 0, -1, 2, 2, 123, 0, -53, 0]
    ];
    let y = 0, u = 0;
    for (const d of a) {
      const f = d[0] * k + d[1] * o + d[2] * g + d[3] * v + d[4] * c;
      y += (d[5] + d[6] * s) * Math.sin(f), u += (d[7] + d[8] * s) * Math.cos(f);
    }
    return {
      dPsi: y / (3600 * 1e4),
      dEpsilon: u / (3600 * 1e4)
    };
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
  trueObliquity(n) {
    const s = (n - 2451545) / 36525, e = 23.439291111 - 0.013004167 * s - 1639e-10 * s * s + 5036e-10 * s * s * s, { dEpsilon: i } = this.nutation(n);
    return e + i;
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
  gast(n = /* @__PURE__ */ new Date()) {
    const s = this.toJulian(n), e = this.gmst(n), { dPsi: i } = this.nutation(s), t = this.trueObliquity(s), r = i * Math.cos(t * _);
    return ((e + r) % 360 + 360) % 360;
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
  refraction(n, s = 10, e = 1010) {
    if (n < -1) return 0;
    const i = Math.max(n, -0.5), t = 1.02 / Math.tan((i + 10.3 / (i + 5.11)) * _) + 19279e-7, r = e / 1010 * (283 / (273 + s));
    return t * r / 60;
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
  applyProperMotion(n, s, e, i, t) {
    const r = t - i, l = s / (36e5 * Math.cos(n.dec * _)) * r, c = e / 36e5 * r, o = ((n.ra + l) % 360 + 360) % 360, g = Math.max(-90, Math.min(90, n.dec + c));
    return { ra: o, dec: g };
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
  riseTransitSet(n, s, e = -0.5667) {
    const i = s.date ?? /* @__PURE__ */ new Date(), t = new Date(Date.UTC(
      i.getUTCFullYear(),
      i.getUTCMonth(),
      i.getUTCDate()
    )), r = n.dec * _, l = s.lat * _, c = e * _, o = (Math.sin(c) - Math.sin(l) * Math.sin(r)) / (Math.cos(l) * Math.cos(r)), g = this.gmst(t), v = ((n.ra - s.lng - g) / 360 % 1 + 1) % 1, k = new Date(t.valueOf() + v * 864e5);
    if (o > 1)
      return { rise: null, transit: k, set: null };
    if (o < -1)
      return { rise: null, transit: k, set: null };
    const y = Math.acos(o) * D / 360, u = ((v - y) % 1 + 1) % 1, d = ((v + y) % 1 + 1) % 1, f = new Date(t.valueOf() + u * 864e5), b = new Date(t.valueOf() + d * 864e5);
    return { rise: f, transit: k, set: b };
  }
};
function ys(n, s = 6e4, e = 128) {
  const i = /* @__PURE__ */ new Map();
  return (t = /* @__PURE__ */ new Date()) => {
    const r = Math.round(t.getTime() / s), l = i.get(r);
    if (l !== void 0) return l;
    const c = n(t);
    return i.size >= e && i.delete(i.keys().next().value), i.set(r, c), c;
  };
}
const Z = S.DEG_TO_RAD, ws = ys((n) => {
  const s = M.planetEcliptic("earth", n), e = ((s.lon + 180) % 360 + 360) % 360, i = -s.lat, t = M.toJulian(n), { dPsi: r } = M.nutation(t), l = e + r, c = M.trueObliquity(t) * Z, o = l * Z, g = i * Z, v = Math.atan2(
    Math.sin(o) * Math.cos(c) - Math.tan(g) * Math.sin(c),
    Math.cos(o)
  ) * (180 / Math.PI), k = Math.asin(
    Math.sin(g) * Math.cos(c) + Math.cos(g) * Math.sin(c) * Math.sin(o)
  ) * (180 / Math.PI);
  return {
    ra: (v % 360 + 360) % 360,
    dec: k,
    distance_AU: s.r,
    eclipticLon: l
  };
}), Rs = {
  /**
   * Geocentric equatorial position of the Sun.
   *
   * Computes the Sun's right ascension, declination, distance, and ecliptic longitude
   * for the given date. The position includes nutation corrections and uses the true
   * obliquity of the ecliptic for the equatorial conversion.
   *
   * @remarks
   * Accuracy is approximately 0.01° for dates within a few centuries of J2000.0 (2000-01-01 12:00 TT).
   * The algorithm derives geocentric solar coordinates by inverting the heliocentric Earth
   * position from VSOP87 theory.
   *
   * @param date - The date and time for which to compute the Sun's position. Defaults to the current date/time.
   * @returns The Sun's geocentric equatorial position including RA (0-360°), declination, distance in AU, and ecliptic longitude.
   *
   * @example
   * ```ts
   * import { Sun } from '@motioncomplex/cosmos-lib'
   *
   * // Sun position at the 2024 vernal equinox
   * const pos = Sun.position(new Date('2024-03-20T03:06:00Z'))
   * console.log(`RA: ${pos.ra.toFixed(4)}°`)        // ~0° (vernal equinox point)
   * console.log(`Dec: ${pos.dec.toFixed(4)}°`)       // ~0° at equinox
   * console.log(`Distance: ${pos.distance_AU} AU`)   // ~0.996 AU
   * console.log(`Ecliptic Lon: ${pos.eclipticLon.toFixed(4)}°`) // ~0° at equinox
   * ```
   */
  position(n = /* @__PURE__ */ new Date()) {
    return ws(n);
  },
  /**
   * Solar noon (transit) for a given observer.
   *
   * Computes the time at which the Sun crosses the observer's local meridian,
   * reaching its highest altitude for the day.
   *
   * @remarks
   * Uses the standard solar altitude of -0.8333° which accounts for atmospheric
   * refraction (34 arc-minutes) and the Sun's mean semi-diameter (16 arc-minutes).
   *
   * @param obs - Observer location and optional date. If `obs.date` is omitted, the current date/time is used.
   * @returns A `Date` representing the moment of solar noon (local meridian transit).
   *
   * @example
   * ```ts
   * import { Sun } from '@motioncomplex/cosmos-lib'
   *
   * // Solar noon in London on the vernal equinox
   * const noon = Sun.solarNoon({ lat: 51.5, lng: -0.1, date: new Date('2024-03-20') })
   * console.log('Solar noon:', noon.toISOString()) // ~12:10 UTC
   * ```
   */
  solarNoon(n) {
    const s = n.date ?? /* @__PURE__ */ new Date(), e = this.position(s);
    return M.riseTransitSet(e, n, -0.8333).transit;
  },
  /**
   * Equation of time in minutes.
   *
   * Computes the difference between apparent solar time and mean solar time.
   * A positive value means the true Sun is ahead of the mean Sun (sundial reads
   * later than clock time), and a negative value means it trails behind.
   *
   * @remarks
   * The equation of time arises from the eccentricity of Earth's orbit and
   * the obliquity of the ecliptic. It varies between approximately -14 and +16 minutes
   * over the course of a year. The computation uses the Sun's mean longitude (L0)
   * and apparent right ascension, converting the angular difference to minutes of time
   * at 4 minutes per degree.
   *
   * @param date - The date and time for the calculation. Defaults to the current date/time.
   * @returns The equation of time in minutes. Positive means the apparent Sun is ahead of mean time.
   *
   * @example
   * ```ts
   * import { Sun } from '@motioncomplex/cosmos-lib'
   *
   * // EoT at the vernal equinox 2024 (should be near -7 minutes)
   * const eot = Sun.equationOfTime(new Date('2024-03-20'))
   * console.log(`Equation of Time: ${eot.toFixed(2)} minutes`)
   *
   * // EoT varies through the year; check the November maximum
   * const eotNov = Sun.equationOfTime(new Date('2024-11-03'))
   * console.log(`EoT in November: ${eotNov.toFixed(2)} minutes`) // ~+16 min
   * ```
   */
  equationOfTime(n = /* @__PURE__ */ new Date()) {
    const s = this.position(n);
    let r = ((280.46646 + 36000.76983 * ((M.toJulian(n) - 2451545) / 36525)) % 360 + 360) % 360 - 57183e-7 - s.ra;
    return r = ((r + 180) % 360 + 360) % 360 - 180, r * 4;
  },
  /**
   * Complete twilight times for an observer.
   *
   * Returns sunrise/sunset plus civil, nautical, and astronomical twilight
   * boundaries for the given observer location and date. Each twilight boundary
   * corresponds to the Sun's centre reaching a specific altitude below the horizon.
   *
   * @remarks
   * Standard solar altitudes used for each twilight type:
   * - **Sunrise/Sunset**: -0.8333° (accounts for refraction and solar semi-diameter)
   * - **Civil twilight**: -6° (sufficient light for outdoor activities without artificial lighting)
   * - **Nautical twilight**: -12° (horizon still discernible at sea)
   * - **Astronomical twilight**: -18° (sky fully dark for astronomical observations)
   *
   * At polar latitudes, some or all twilight phases may not occur on a given date.
   * In such cases the corresponding fields will be `null`.
   *
   * @param obs - Observer location and optional date. If `obs.date` is omitted, the current date/time is used.
   * @returns An object containing all nine twilight timestamps, from astronomical dawn through astronomical dusk.
   *
   * @example
   * ```ts
   * import { Sun } from '@motioncomplex/cosmos-lib'
   *
   * // Twilight times in London on the 2024 vernal equinox
   * const tw = Sun.twilight({ lat: 51.5, lng: -0.1, date: new Date('2024-03-20') })
   * console.log('Astronomical dawn:', tw.astronomicalDawn?.toISOString())
   * console.log('Sunrise:', tw.sunrise?.toISOString())
   * console.log('Solar noon:', tw.solarNoon.toISOString())
   * console.log('Sunset:', tw.sunset?.toISOString())
   * console.log('Astronomical dusk:', tw.astronomicalDusk?.toISOString())
   * ```
   */
  twilight(n) {
    const s = n.date ?? /* @__PURE__ */ new Date(), e = this.position(s), i = M.riseTransitSet(e, n, -0.8333), t = M.riseTransitSet(e, n, -6), r = M.riseTransitSet(e, n, -12), l = M.riseTransitSet(e, n, -18);
    return {
      astronomicalDawn: l.rise,
      nauticalDawn: r.rise,
      civilDawn: t.rise,
      sunrise: i.rise,
      solarNoon: i.transit,
      sunset: i.set,
      civilDusk: t.set,
      nauticalDusk: r.set,
      astronomicalDusk: l.set
    };
  }
}, z = S.DEG_TO_RAD, O = S.RAD_TO_DEG, xs = [
  [0, 0, 1, 0, 6288774, -20905355],
  [2, 0, -1, 0, 1274027, -3699111],
  [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925],
  [0, 1, 0, 0, -185116, 48888],
  [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158],
  [2, -1, -1, 0, 57066, -152138],
  [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586],
  [0, 1, -1, 0, -40923, -129620],
  [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755],
  [2, 0, 0, -2, 15327, 10321],
  [0, 0, 1, 2, -12528, 0],
  [0, 0, 1, -2, 10980, 79661],
  [4, 0, -1, 0, 10675, -34782],
  [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636],
  [2, 1, -1, 0, -7888, 24208],
  [2, 1, 0, 0, -6766, 30824],
  [1, 0, -1, 0, -5163, -8379],
  [1, 1, 0, 0, 4987, -16675],
  [2, -1, 1, 0, 4036, -12831],
  [2, 0, 2, 0, 3994, -10445],
  [4, 0, 0, 0, 3861, -11650],
  [2, 0, -3, 0, 3665, 14403],
  [0, 1, -2, 0, -2689, -7003],
  [2, 0, -1, 2, -2602, 0],
  [2, -1, -2, 0, 2390, 10056],
  [1, 0, 1, 0, -2348, 6322],
  [2, -2, 0, 0, 2236, -9884],
  [0, 1, 2, 0, -2120, 5751],
  [0, 2, 0, 0, -2069, 0],
  [2, -2, -1, 0, 2048, -4950],
  [2, 0, 1, -2, -1773, 4130],
  [2, 0, 0, 2, -1595, 0],
  [4, -1, -1, 0, 1215, -3958],
  [0, 0, 2, 2, -1110, 0],
  [3, 0, -1, 0, -892, 3258],
  [2, 1, 1, 0, -810, 2616],
  [4, -1, -2, 0, 759, -1897],
  [0, 2, -1, 0, -713, -2117],
  [2, 2, -1, 0, -700, 2354],
  [2, 1, -2, 0, 691, 0],
  [2, -1, 0, -2, 596, 0],
  [4, 0, 1, 0, 549, -1423],
  [0, 0, 4, 0, 537, -1117],
  [4, -1, 0, 0, 520, -1571],
  [1, 0, -2, 0, -487, -1739]
], Ts = [
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573],
  [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822],
  [2, -1, 0, -1, 8216],
  [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200],
  [2, 1, 0, -1, -3359],
  [2, -1, -1, 1, 2463],
  [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065],
  [0, 1, -1, -1, -1870],
  [4, 0, -1, -1, 1828],
  [0, 1, 0, 1, -1794],
  [0, 0, 0, 3, -1749],
  [0, 1, -1, 1, -1565],
  [1, 0, 0, 1, -1491],
  [0, 1, 1, 1, -1475],
  [0, 1, 1, -1, -1410],
  [0, 1, 0, -1, -1344],
  [1, 0, 0, -1, -1335],
  [0, 0, 3, 1, 1107],
  [4, 0, 0, -1, 1021],
  [4, 0, -1, 1, 833]
], ss = 29.530588861, Ls = ys((n) => {
  const s = M.toJulian(n), e = (s - 2451545) / 36525, i = ((218.3164477 + 481267.88123421 * e - 15786e-7 * e * e + e * e * e / 538841 - e * e * e * e / 65194e3) % 360 + 360) % 360, t = ((297.8501921 + 445267.1114034 * e - 18819e-7 * e * e + e * e * e / 545868 - e * e * e * e / 113065e3) % 360 + 360) % 360, r = ((357.5291092 + 35999.0502909 * e - 1536e-7 * e * e + e * e * e / 2449e4) % 360 + 360) % 360, l = ((134.9633964 + 477198.8675055 * e + 87414e-7 * e * e + e * e * e / 69699 - e * e * e * e / 14712e3) % 360 + 360) % 360, c = ((93.272095 + 483202.0175233 * e - 36539e-7 * e * e - e * e * e / 3526e3 + e * e * e * e / 86331e4) % 360 + 360) % 360, o = 1 - 2516e-6 * e - 74e-7 * e * e, g = o * o, v = t * z, k = r * z, a = l * z, y = c * z;
  let u = 0, d = 0;
  for (const I of xs) {
    const $ = I[0] * v + I[1] * k + I[2] * a + I[3] * y;
    let N = 1;
    const B = Math.abs(I[1]);
    B === 1 ? N = o : B === 2 && (N = g), u += I[4] * N * Math.sin($), d += I[5] * N * Math.cos($);
  }
  let f = 0;
  for (const I of Ts) {
    const $ = I[0] * v + I[1] * k + I[2] * a + I[3] * y;
    let N = 1;
    const B = Math.abs(I[1]);
    B === 1 ? N = o : B === 2 && (N = g), f += I[4] * N * Math.sin($);
  }
  const b = (119.75 + 131.849 * e) * z, p = (53.09 + 479264.29 * e) * z, m = (313.45 + 481266.484 * e) * z;
  u += 3958 * Math.sin(b) + 1962 * Math.sin((i - c) * z) + 318 * Math.sin(p), f += -2235 * Math.sin(i * z) + 382 * Math.sin(m) + 175 * Math.sin(b - y) + 175 * Math.sin(b + y) + 127 * Math.sin((i - l) * z) - 115 * Math.sin((i + l) * z);
  const A = i + u / 1e6, h = f / 1e6, C = 385000.56 + d / 1e3, { dPsi: x } = M.nutation(s), j = A + x, G = M.trueObliquity(s) * z, V = j * z, Q = h * z, Ss = Math.atan2(
    Math.sin(V) * Math.cos(G) - Math.tan(Q) * Math.sin(G),
    Math.cos(V)
  ) * O, Cs = Math.asin(
    Math.sin(Q) * Math.cos(G) + Math.cos(Q) * Math.sin(G) * Math.sin(V)
  ) * O, Ds = Math.asin(6378.14 / C) * O;
  return {
    ra: (Ss % 360 + 360) % 360,
    dec: Cs,
    distance_km: C,
    eclipticLon: (j % 360 + 360) % 360,
    eclipticLat: h,
    parallax: Ds
  };
}, 6e4, 64), E = {
  /**
   * Geocentric equatorial and ecliptic position of the Moon.
   *
   * Computes the Moon's right ascension, declination, distance, ecliptic
   * longitude/latitude, and horizontal parallax for the given date using
   * Meeus' lunar theory with the ELP 2000-82 series truncated to the
   * dominant terms.
   *
   * @remarks
   * The algorithm computes five fundamental arguments (L', D, M, M', F) and
   * evaluates trigonometric series from Meeus Tables 47.A (60 terms for
   * longitude and distance) and 47.B (30 terms for latitude). Eccentricity
   * corrections are applied to terms involving the Sun's mean anomaly M.
   * Three additive corrections (A1, A2, A3) from Meeus p. 338 are included.
   * Nutation is applied to the ecliptic longitude before converting to
   * equatorial coordinates using the true obliquity.
   *
   * @param date - The date and time for which to compute the Moon's position. Defaults to the current date/time.
   * @returns The Moon's geocentric position including RA (0-360°), declination, distance in km,
   *   ecliptic longitude (0-360°), ecliptic latitude, and horizontal parallax in degrees.
   *
   * @example
   * ```ts
   * import { Moon } from '@motioncomplex/cosmos-lib'
   *
   * // Moon position at the 2024 vernal equinox
   * const pos = Moon.position(new Date('2024-03-20T03:06:00Z'))
   * console.log(`RA: ${pos.ra.toFixed(4)}°`)
   * console.log(`Dec: ${pos.dec.toFixed(4)}°`)
   * console.log(`Distance: ${pos.distance_km.toFixed(0)} km`)
   * console.log(`Ecliptic Lon: ${pos.eclipticLon.toFixed(4)}°`)
   * console.log(`Ecliptic Lat: ${pos.eclipticLat.toFixed(4)}°`)
   * console.log(`Parallax: ${pos.parallax.toFixed(4)}°`)
   * ```
   */
  position(n = /* @__PURE__ */ new Date()) {
    return Ls(n);
  },
  /**
   * Moon phase information for a given date.
   *
   * Computes the lunar phase angle, illuminated fraction, age (days since
   * new moon), and a human-readable phase name based on the difference
   * in ecliptic longitude between the Moon and the Sun.
   *
   * @remarks
   * The phase is determined from the elongation of the Moon from the Sun
   * in ecliptic longitude. The illuminated fraction is derived using the
   * cosine of the phase angle: `(1 - cos(phaseAngle)) / 2`. Phase names
   * are divided into eight equal segments of 0.125 (45°) each, centered
   * on the four principal phases.
   *
   * @param date - The date and time for which to compute the phase. Defaults to the current date/time.
   * @returns An object containing the phase cycle position (0-1), illuminated fraction (0-1),
   *   age in days (0-29.5), and the human-readable phase name.
   *
   * @example
   * ```ts
   * import { Moon } from '@motioncomplex/cosmos-lib'
   *
   * // Phase at vernal equinox 2024
   * const p = Moon.phase(new Date('2024-03-20'))
   * console.log(`Phase: ${p.name}`)                          // e.g. 'waxing-gibbous'
   * console.log(`Illumination: ${(p.illumination * 100).toFixed(0)}%`)
   * console.log(`Age: ${p.age.toFixed(1)} days`)
   * console.log(`Cycle: ${(p.phase * 100).toFixed(1)}%`)     // 0% = new, 50% = full
   * ```
   */
  phase(n = /* @__PURE__ */ new Date()) {
    const s = this.position(n), e = ((M.planetEcliptic("earth", n).lon + 180) % 360 + 360) % 360;
    let i = s.eclipticLon - e;
    i = (i % 360 + 360) % 360;
    const t = i / 360, r = (1 - Math.cos(i * z)) / 2, l = t * ss;
    let c;
    return t < 0.0625 ? c = "new" : t < 0.1875 ? c = "waxing-crescent" : t < 0.3125 ? c = "first-quarter" : t < 0.4375 ? c = "waxing-gibbous" : t < 0.5625 ? c = "full" : t < 0.6875 ? c = "waning-gibbous" : t < 0.8125 ? c = "last-quarter" : t < 0.9375 ? c = "waning-crescent" : c = "new", { phase: t, illumination: r, age: l, name: c };
  },
  /**
   * Find the next occurrence of a specific phase after the given date.
   *
   * Uses an initial estimate based on the current phase position within the
   * synodic month, then refines iteratively using bisection to achieve
   * approximately 1-minute precision (up to 20 refinement iterations).
   *
   * @remarks
   * The algorithm first estimates the time to the target phase from the current
   * phase fraction, then iteratively corrects the estimate by measuring the
   * phase error and adjusting by the proportional fraction of a synodic month.
   * Wrap-around near the 0/1 boundary (new moon) is handled explicitly.
   * Convergence threshold is 0.0001 phase units, corresponding to roughly
   * 4 minutes of time.
   *
   * @param date - Start date from which to search forward. Defaults to the current date/time.
   * @param targetPhase - The phase to find: `'new'`, `'first-quarter'`, `'full'`, or `'last-quarter'`. Defaults to `'full'`.
   * @returns A `Date` representing the approximate moment of the next occurrence of the target phase.
   *
   * @example
   * ```ts
   * import { Moon } from '@motioncomplex/cosmos-lib'
   *
   * // Find the next full moon after the 2024 vernal equinox
   * const fullMoon = Moon.nextPhase(new Date('2024-03-20'), 'full')
   * console.log('Next full moon:', fullMoon.toISOString()) // 2024-03-25
   *
   * // Find the next new moon from today
   * const newMoon = Moon.nextPhase(new Date('2024-03-20'), 'new')
   * console.log('Next new moon:', newMoon.toISOString()) // 2024-04-08
   * ```
   */
  nextPhase(n = /* @__PURE__ */ new Date(), s = "full") {
    const i = {
      new: 0,
      "first-quarter": 0.25,
      full: 0.5,
      "last-quarter": 0.75
    }[s], t = this.phase(n);
    let r = i - t.phase;
    r <= 0 && (r += 1);
    let l = new Date(n.valueOf() + r * ss * 864e5);
    for (let c = 0; c < 20; c++) {
      const o = this.phase(l);
      let g = i - o.phase;
      if (g > 0.5 && (g -= 1), g < -0.5 && (g += 1), Math.abs(g) < 1e-4) break;
      l = new Date(l.valueOf() + g * ss * 864e5);
    }
    return l;
  },
  /**
   * Rise, transit, and set times for the Moon.
   *
   * Computes the times at which the Moon rises above the horizon, transits
   * the local meridian, and sets below the horizon for the given observer
   * location and date.
   *
   * @remarks
   * Uses the Moon's standard altitude of +0.125°, which accounts for the
   * Moon's mean horizontal parallax (approximately 0.95°) minus atmospheric
   * refraction (34 arc-minutes) minus the Moon's mean semi-diameter (about 16
   * arc-minutes). Rise and set times will be `null` if the Moon is circumpolar
   * (always above the horizon) or never rises at the given location and date.
   *
   * @param obs - Observer location and optional date. If `obs.date` is omitted, the current date/time is used.
   * @returns An object with `rise`, `transit`, and `set` times. `rise` and `set` may be `null` at polar latitudes.
   *
   * @example
   * ```ts
   * import { Moon } from '@motioncomplex/cosmos-lib'
   *
   * // Moonrise and moonset in London
   * const rts = Moon.riseTransitSet({ lat: 51.5, lng: -0.1, date: new Date('2024-03-20') })
   * console.log('Moonrise:', rts.rise?.toISOString())
   * console.log('Moon transit:', rts.transit.toISOString())
   * console.log('Moonset:', rts.set?.toISOString())
   * ```
   */
  riseTransitSet(n) {
    const s = n.date ?? /* @__PURE__ */ new Date(), e = this.position(s);
    return M.riseTransitSet(e, n, 0.125);
  },
  /**
   * Optical libration angles (simplified).
   *
   * Returns the apparent tilt of the Moon's face as seen from Earth, caused
   * by the geometry of the Moon's orbit relative to its rotational axis.
   * Optical libration allows observers to see slightly more than 50% of
   * the Moon's surface over time.
   *
   * @remarks
   * This is a simplified calculation of the optical libration only (physical
   * libration is not included). The mean inclination of the lunar equator to
   * the ecliptic is taken as I = 1.5424°. The computation uses the Moon's
   * argument of latitude (F), the longitude of the ascending node (Om), and
   * the current ecliptic position. Based on Meeus, "Astronomical Algorithms",
   * Chapter 53.
   *
   * Libration in longitude (`l`) reveals the eastern or western limb of the
   * Moon, while libration in latitude (`b`) reveals the northern or southern
   * limb. Both values are in degrees, with typical ranges of approximately
   * +/-7.9° for longitude and +/-6.9° for latitude.
   *
   * @param date - The date and time for which to compute the libration. Defaults to the current date/time.
   * @returns An object with `l` (libration in longitude, degrees) and `b` (libration in latitude, degrees).
   *
   * @example
   * ```ts
   * import { Moon } from '@motioncomplex/cosmos-lib'
   *
   * // Libration at the 2024 vernal equinox
   * const lib = Moon.libration(new Date('2024-03-20'))
   * console.log(`Libration in longitude: ${lib.l.toFixed(2)}°`)
   * console.log(`Libration in latitude: ${lib.b.toFixed(2)}°`)
   * ```
   */
  libration(n = /* @__PURE__ */ new Date()) {
    const i = ((125.04452 - 1934.136261 * ((M.toJulian(n) - 2451545) / 36525)) % 360 + 360) % 360, t = this.position(n), r = 1.5424, l = t.eclipticLon - i, c = -Math.asin(
      Math.sin(l * z) * Math.cos(t.eclipticLat * z) * Math.sin(r * z) - Math.sin(t.eclipticLat * z) * Math.cos(r * z)
    ) * O;
    Math.atan2(
      Math.sin(l * z) * Math.cos(r * z) + Math.tan(t.eclipticLat * z) * Math.sin(r * z),
      Math.cos(l * z)
    ) * O;
    const o = Math.asin(
      -Math.sin(t.eclipticLat * z) * Math.sin(r * z) - Math.cos(t.eclipticLat * z) * Math.sin(r * z) * Math.sin(l * z)
    ) * O;
    return { l: c, b: o };
  }
}, Ns = {
  /**
   * Find the next solar eclipse after the given date.
   *
   * Iterates through upcoming new moons (up to 26 lunations, approximately
   * 2 years) and checks each one for a solar eclipse condition.
   *
   * @param date - Start date from which to search forward. Defaults to the current date/time.
   * @returns An {@link EclipseEvent} describing the next solar eclipse, or `null` if none is found within approximately 2 years.
   *
   * @example
   * ```ts
   * import { Eclipse } from '@motioncomplex/cosmos-lib'
   *
   * const next = Eclipse.nextSolar(new Date('2024-03-20'))
   * if (next) {
   *   console.log(`Next solar eclipse: ${next.subtype} on ${next.date.toISOString()}`)
   *   console.log(`Magnitude: ${next.magnitude.toFixed(3)}`)
   * }
   * ```
   */
  nextSolar(n = /* @__PURE__ */ new Date()) {
    let s = new Date(n);
    for (let e = 0; e < 26; e++) {
      const i = E.nextPhase(s, "new"), t = this._checkSolarEclipse(i);
      if (t) return t;
      s = new Date(i.valueOf() + 864e5);
    }
    return null;
  },
  /**
   * Find the next lunar eclipse after the given date.
   *
   * Iterates through upcoming full moons (up to 26 lunations, approximately
   * 2 years) and checks each one for a lunar eclipse condition.
   *
   * @param date - Start date from which to search forward. Defaults to the current date/time.
   * @returns An {@link EclipseEvent} describing the next lunar eclipse, or `null` if none is found within approximately 2 years.
   *
   * @example
   * ```ts
   * import { Eclipse } from '@motioncomplex/cosmos-lib'
   *
   * const next = Eclipse.nextLunar(new Date('2024-03-20'))
   * if (next) {
   *   console.log(`Next lunar eclipse: ${next.subtype} on ${next.date.toISOString()}`)
   *   console.log(`Magnitude: ${next.magnitude.toFixed(3)}`)
   * }
   * ```
   */
  nextLunar(n = /* @__PURE__ */ new Date()) {
    let s = new Date(n);
    for (let e = 0; e < 26; e++) {
      const i = E.nextPhase(s, "full"), t = this._checkLunarEclipse(i);
      if (t) return t;
      s = new Date(i.valueOf() + 864e5);
    }
    return null;
  },
  /**
   * Search for all eclipses in a date range.
   *
   * Scans the interval from `startDate` to `endDate` in steps of approximately
   * 15 days, checking both new moons (solar) and full moons (lunar) for eclipse
   * conditions. Results are sorted chronologically and deduplicated (eclipses
   * found within 1 day of each other are treated as the same event).
   *
   * @remarks
   * The search advances by 15-day increments to ensure both new and full moons
   * within each lunation are tested. When `type` is specified, only that eclipse
   * type is checked, improving performance for targeted searches. Deduplication
   * uses a 1-day threshold to handle cases where the same eclipse is detected
   * from adjacent search windows.
   *
   * @param startDate - The beginning of the search window (inclusive).
   * @param endDate - The end of the search window (exclusive).
   * @param type - Optional filter: `'solar'` to search only for solar eclipses, `'lunar'` for only lunar eclipses, or omit for both.
   * @returns An array of {@link EclipseEvent} objects sorted by date, with duplicates removed.
   *
   * @example
   * ```ts
   * import { Eclipse } from '@motioncomplex/cosmos-lib'
   *
   * // Find all eclipses in 2024
   * const all = Eclipse.search(new Date('2024-01-01'), new Date('2025-01-01'))
   * console.log(`Found ${all.length} eclipses in 2024`)
   * all.forEach(e => console.log(`${e.type} ${e.subtype} — ${e.date.toISOString()}`))
   *
   * // Only solar eclipses in a 5-year span
   * const solar = Eclipse.search(
   *   new Date('2024-01-01'),
   *   new Date('2029-01-01'),
   *   'solar',
   * )
   * solar.forEach(e => console.log(`${e.subtype} solar eclipse: ${e.date.toISOString()}`))
   * ```
   */
  search(n, s, e) {
    const i = [];
    let t = new Date(n);
    const r = s.valueOf();
    for (; t.valueOf() < r; ) {
      if (e !== "lunar") {
        const l = E.nextPhase(t, "new");
        if (l.valueOf() > r) break;
        const c = this._checkSolarEclipse(l);
        c && i.push(c);
      }
      if (e !== "solar") {
        const l = E.nextPhase(t, "full");
        if (l.valueOf() <= r) {
          const c = this._checkLunarEclipse(l);
          c && i.push(c);
        }
      }
      t = new Date(t.valueOf() + 15 * 864e5);
    }
    return i.sort((l, c) => l.date.valueOf() - c.date.valueOf()), i.filter(
      (l, c) => c === 0 || Math.abs(l.date.valueOf() - i[c - 1].date.valueOf()) > 864e5
    );
  },
  /**
   * Check if a new moon produces a solar eclipse.
   *
   * Computes the Moon's ecliptic latitude and angular separation from the Sun
   * at the instant of new moon. If the Moon is within 1.5° of the ecliptic plane
   * and the angular separation is less than 1.5 times the sum of the apparent
   * solar and lunar radii, an eclipse is predicted. The subtype (total, annular,
   * or partial) is determined by comparing the apparent radii and the separation.
   *
   * @internal
   * @param newMoon - The date/time of the new moon to test.
   * @returns An {@link EclipseEvent} if a solar eclipse occurs at this new moon, or `null` otherwise.
   */
  _checkSolarEclipse(n) {
    const s = E.position(n), e = M.planetEcliptic("earth", n), i = ((e.lon + 180) % 360 + 360) % 360;
    if (Math.abs(s.eclipticLat) > 1.5) return null;
    const r = e.r * 1495978707e-1, l = Math.atan2(696e3, r) * (180 / Math.PI), c = Math.atan2(1737.4, s.distance_km) * (180 / Math.PI), o = M.angularSeparation(
      s,
      M.eclipticToEquatorial({ lon: i, lat: 0 })
    ), g = l + c;
    if (o > g * 1.5) return null;
    let v, k;
    if (c >= l && o < c - l)
      v = "total", k = 1;
    else if (c < l && o < l - c)
      v = "annular", k = c / l;
    else if (o < g)
      v = "partial", k = (g - o) / (2 * l);
    else
      return null;
    return { type: "solar", subtype: v, date: n, magnitude: k };
  },
  /**
   * Check if a full moon produces a lunar eclipse.
   *
   * Computes the Moon's ecliptic latitude at the instant of full moon and
   * compares it against the angular radii of Earth's umbral and penumbral
   * shadow cones at the Moon's distance. The subtype (total, partial, or
   * penumbral) is determined by where the Moon's latitude falls relative
   * to the umbral and penumbral boundaries.
   *
   * @remarks
   * The umbral cone angular radius is approximated as 2.6 times the Earth's
   * angular radius at the Moon's distance, and the penumbral cone as 4.3 times.
   * These are simplified multipliers; a full calculation would use solar parallax
   * and Earth's atmospheric extension.
   *
   * @internal
   * @param fullMoon - The date/time of the full moon to test.
   * @returns An {@link EclipseEvent} if a lunar eclipse occurs at this full moon, or `null` otherwise.
   */
  _checkLunarEclipse(n) {
    const s = E.position(n), e = Math.abs(s.eclipticLat), i = Math.atan2(6371, s.distance_km) * (180 / Math.PI), t = i * 2.6, r = i * 4.3, l = Math.atan2(1737.4, s.distance_km) * (180 / Math.PI);
    if (e > r + l) return null;
    let c, o;
    if (e < t - l)
      c = "total", o = (t - e) / (2 * l);
    else if (e < t + l)
      c = "partial", o = (t + l - e) / (2 * l);
    else if (e < r + l)
      c = "penumbral", o = (r + l - e) / (2 * l);
    else
      return null;
    return { type: "lunar", subtype: c, date: n, magnitude: Math.min(o, 1) };
  }
}, Ps = [
  {
    id: "sun",
    name: "Sun",
    aliases: ["Sol", "☉"],
    type: "star",
    subtype: "G-dwarf",
    ra: null,
    dec: null,
    magnitude: -26.74,
    distance: { value: 1, unit: "AU" },
    diameter_km: 1392700,
    mass_kg: 1989e27,
    surface_temp_K: 5778,
    spectral: "G2V",
    description: "The G-type main-sequence star at the centre of our solar system. Its core reaches 15 million °C, fusing hydrogen into helium.",
    tags: ["solar-system", "star"]
  },
  {
    id: "mercury",
    name: "Mercury",
    aliases: ["☿"],
    type: "planet",
    subtype: "terrestrial",
    ra: null,
    dec: null,
    magnitude: -0.4,
    distance: { value: 0.387, unit: "AU" },
    diameter_km: 4880,
    mass_kg: 33e22,
    moons: 0,
    description: "Smallest planet; surface temperatures swing from −180 °C to 430 °C.",
    tags: ["solar-system", "planet", "terrestrial"]
  },
  {
    id: "venus",
    name: "Venus",
    aliases: ["Morning Star", "Evening Star"],
    type: "planet",
    subtype: "terrestrial",
    ra: null,
    dec: null,
    magnitude: -4.4,
    distance: { value: 0.723, unit: "AU" },
    diameter_km: 12104,
    mass_kg: 487e22,
    moons: 0,
    description: "Hottest planet; dense CO₂ atmosphere causes a runaway greenhouse effect at 465 °C.",
    tags: ["solar-system", "planet", "terrestrial"]
  },
  {
    id: "earth",
    name: "Earth",
    aliases: ["Terra", "Gaia"],
    type: "planet",
    subtype: "terrestrial",
    ra: null,
    dec: null,
    magnitude: -3.86,
    distance: { value: 1, unit: "AU" },
    diameter_km: 12742,
    mass_kg: 5972e21,
    moons: 1,
    description: "Only confirmed habitable world; 71% ocean coverage.",
    tags: ["solar-system", "planet", "terrestrial"]
  },
  {
    id: "moon",
    name: "Moon",
    aliases: ["Luna"],
    type: "moon",
    ra: null,
    dec: null,
    magnitude: -12.6,
    distance: { value: 384400, unit: "km" },
    diameter_km: 3474,
    description: "Earth's only natural satellite; first extraterrestrial body visited by humans.",
    tags: ["solar-system", "moon"]
  },
  {
    id: "mars",
    name: "Mars",
    aliases: ["Red Planet"],
    type: "planet",
    subtype: "terrestrial",
    ra: null,
    dec: null,
    magnitude: -2.94,
    distance: { value: 1.524, unit: "AU" },
    diameter_km: 6779,
    mass_kg: 639e21,
    moons: 2,
    description: "Home to Olympus Mons and Valles Marineris; evidence of ancient liquid water.",
    tags: ["solar-system", "planet", "terrestrial"]
  },
  {
    id: "jupiter",
    name: "Jupiter",
    aliases: ["♃"],
    type: "planet",
    subtype: "gas-giant",
    ra: null,
    dec: null,
    magnitude: -2.94,
    distance: { value: 5.204, unit: "AU" },
    diameter_km: 139820,
    mass_kg: 1898e24,
    moons: 95,
    description: "Largest planet; Great Red Spot storm has persisted for 350+ years.",
    tags: ["solar-system", "planet", "gas-giant"]
  },
  {
    id: "saturn",
    name: "Saturn",
    aliases: ["♄"],
    type: "planet",
    subtype: "gas-giant",
    ra: null,
    dec: null,
    magnitude: 0.46,
    distance: { value: 9.537, unit: "AU" },
    diameter_km: 116460,
    mass_kg: 568e24,
    moons: 146,
    description: "Famous ring system stretches 282,000 km; lower density than water.",
    tags: ["solar-system", "planet", "gas-giant"]
  },
  {
    id: "uranus",
    name: "Uranus",
    aliases: ["♅"],
    type: "planet",
    subtype: "ice-giant",
    ra: null,
    dec: null,
    magnitude: 5.68,
    distance: { value: 19.19, unit: "AU" },
    diameter_km: 50724,
    mass_kg: 868e23,
    moons: 28,
    description: "Ice giant rotating at 98° tilt; faint ring system discovered in 1977.",
    tags: ["solar-system", "planet", "ice-giant"]
  },
  {
    id: "neptune",
    name: "Neptune",
    aliases: ["♆"],
    type: "planet",
    subtype: "ice-giant",
    ra: null,
    dec: null,
    magnitude: 7.83,
    distance: { value: 30.07, unit: "AU" },
    diameter_km: 49244,
    mass_kg: 102e24,
    moons: 16,
    description: "Windiest planet at 2,100 km/h; found by mathematical prediction before observation.",
    tags: ["solar-system", "planet", "ice-giant"]
  }
], Gs = [
  {
    id: "ngc7293",
    name: "Helix Nebula",
    aliases: ["NGC 7293", "Eye of God"],
    type: "nebula",
    subtype: "planetary",
    ra: 337.411,
    dec: -20.839,
    magnitude: 7.6,
    size_arcmin: 25,
    distance: { value: 215, unit: "pc" },
    description: "Largest planetary nebula on sky by angular diameter; often called the 'Eye of God'.",
    tags: ["nebula", "planetary"]
  },
  {
    id: "milky-way",
    name: "Milky Way",
    aliases: ["Galaxy", "Via Lactea"],
    type: "galaxy",
    subtype: "barred-spiral",
    ra: null,
    dec: null,
    magnitude: null,
    distance: { value: 0, unit: "kpc" },
    description: "Our home galaxy; 100,000+ ly across, 200–400 billion stars.",
    tags: ["galaxy", "spiral", "local-group", "home"]
  },
  {
    id: "omega-cen",
    name: "Omega Centauri",
    aliases: ["NGC 5139", "ω Cen"],
    type: "cluster",
    subtype: "globular",
    ra: 201.697,
    dec: -47.48,
    magnitude: 3.9,
    size_arcmin: 36,
    distance: { value: 5.2, unit: "kpc" },
    description: "Largest globular cluster in the Milky Way; may be a stripped galaxy core.",
    tags: ["cluster", "globular"]
  },
  {
    id: "sgr-a-star",
    name: "Sagittarius A*",
    aliases: ["Sgr A*", "SgrA*"],
    type: "black-hole",
    subtype: "supermassive",
    ra: 266.417,
    dec: -29.008,
    magnitude: null,
    size_arcmin: 0.5,
    distance: { value: 8.178, unit: "kpc" },
    description: "Supermassive black hole at Milky Way center; first imaged by EHT in 2022.",
    tags: ["black-hole", "supermassive", "galactic-center"]
  },
  {
    id: "m87-bh",
    name: "M87 Black Hole",
    aliases: ["Pōwehi"],
    type: "black-hole",
    subtype: "supermassive",
    ra: 187.706,
    dec: 12.391,
    magnitude: null,
    size_arcmin: 1.5,
    distance: { value: 16.4, unit: "Mpc" },
    description: "First ever directly imaged black hole (EHT 2019); 6.5 billion solar masses.",
    tags: ["black-hole", "supermassive"]
  }
], U = [
  { id: "sirius", name: "Sirius", con: "CMa", hr: 2491, ra: 101.287, dec: -16.716, mag: -1.46, spec: "A1V", pmRa: -546.01, pmDec: -1223.07, bv: -0.01 },
  { id: "canopus", name: "Canopus", con: "Car", hr: 2326, ra: 95.988, dec: -52.696, mag: -0.74, spec: "F0Ib", pmRa: 19.99, pmDec: 23.67, bv: 0.15 },
  { id: "arcturus", name: "Arcturus", con: "Boo", hr: 5340, ra: 213.915, dec: 19.182, mag: -0.05, spec: "K1.5III", pmRa: -1093.45, pmDec: -1999.4, bv: 1.23 },
  { id: "rigil-kentaurus", name: "Rigil Kentaurus", con: "Cen", hr: 5459, ra: 219.902, dec: -60.834, mag: -0.01, spec: "G2V", pmRa: -3679.25, pmDec: 473.67, bv: 0.71 },
  { id: "vega", name: "Vega", con: "Lyr", hr: 7001, ra: 279.235, dec: 38.784, mag: 0.03, spec: "A0Va", pmRa: 200.94, pmDec: 286.23, bv: 0 },
  { id: "capella", name: "Capella", con: "Aur", hr: 1708, ra: 79.172, dec: 45.998, mag: 0.08, spec: "G8III", pmRa: 75.52, pmDec: -427.13, bv: 0.8 },
  { id: "rigel", name: "Rigel", con: "Ori", hr: 1713, ra: 78.634, dec: -8.202, mag: 0.13, spec: "B8Ia", pmRa: 1.87, pmDec: -0.56, bv: -0.03 },
  { id: "procyon", name: "Procyon", con: "CMi", hr: 2943, ra: 114.827, dec: 5.225, mag: 0.34, spec: "F5IV-V", pmRa: -714.59, pmDec: -1036.8, bv: 0.42 },
  { id: "achernar", name: "Achernar", con: "Eri", hr: 472, ra: 24.429, dec: -57.237, mag: 0.46, spec: "B6Vep", pmRa: 88.02, pmDec: -40.08, bv: -0.16 },
  { id: "betelgeuse", name: "Betelgeuse", con: "Ori", hr: 2061, ra: 88.793, dec: 7.407, mag: 0.5, spec: "M1-2Ia", pmRa: 24.95, pmDec: 9.56, bv: 1.85 },
  { id: "hadar", name: "Hadar", con: "Cen", hr: 5267, ra: 210.956, dec: -60.373, mag: 0.61, spec: "B1III", pmRa: -33.27, pmDec: -23.16, bv: -0.23 },
  { id: "altair", name: "Altair", con: "Aql", hr: 7557, ra: 297.696, dec: 8.868, mag: 0.77, spec: "A7V", pmRa: 536.23, pmDec: 385.29, bv: 0.22 },
  { id: "acrux", name: "Acrux", con: "Cru", hr: 4730, ra: 186.65, dec: -63.099, mag: 0.76, spec: "B0.5IV", pmRa: -35.37, pmDec: -14.73, bv: -0.24 },
  { id: "aldebaran", name: "Aldebaran", con: "Tau", hr: 1457, ra: 68.98, dec: 16.509, mag: 0.86, spec: "K5III", pmRa: 62.78, pmDec: -189.36, bv: 1.54 },
  { id: "antares", name: "Antares", con: "Sco", hr: 6134, ra: 247.352, dec: -26.432, mag: 0.96, spec: "M1.5Iab", pmRa: -10.16, pmDec: -23.21, bv: 1.83 },
  { id: "spica", name: "Spica", con: "Vir", hr: 5056, ra: 201.298, dec: -11.161, mag: 0.97, spec: "B1III-IV", pmRa: -42.35, pmDec: -31.73, bv: -0.23 },
  { id: "pollux", name: "Pollux", con: "Gem", hr: 2990, ra: 116.329, dec: 28.026, mag: 1.14, spec: "K0IIIb", pmRa: -625.69, pmDec: -45.95, bv: 1 },
  { id: "fomalhaut", name: "Fomalhaut", con: "PsA", hr: 8728, ra: 344.413, dec: -29.622, mag: 1.16, spec: "A3V", pmRa: 329.22, pmDec: -164.22, bv: 0.09 },
  { id: "deneb", name: "Deneb", con: "Cyg", hr: 7924, ra: 310.358, dec: 45.28, mag: 1.25, spec: "A2Ia", pmRa: 1.56, pmDec: 1.55, bv: 0.09 },
  { id: "mimosa", name: "Mimosa", con: "Cru", hr: 4853, ra: 191.93, dec: -59.689, mag: 1.25, spec: "B0.5III", pmRa: -48.24, pmDec: -12.82, bv: -0.23 },
  { id: "regulus", name: "Regulus", con: "Leo", hr: 3982, ra: 152.093, dec: 11.967, mag: 1.35, spec: "B8IVn", pmRa: -248.73, pmDec: 5.59, bv: -0.11 },
  { id: "adhara", name: "Adhara", con: "CMa", hr: 2618, ra: 104.656, dec: -28.972, mag: 1.5, spec: "B2Iab", pmRa: 2.63, pmDec: 2.29, bv: -0.21 },
  { id: "shaula", name: "Shaula", con: "Sco", hr: 6527, ra: 263.402, dec: -37.104, mag: 1.63, spec: "B2IV", pmRa: -8.9, pmDec: -29.95, bv: -0.22 },
  { id: "gacrux", name: "Gacrux", con: "Cru", hr: 4763, ra: 187.791, dec: -57.113, mag: 1.64, spec: "M3.5III", pmRa: 27.94, pmDec: -264.33, bv: 1.59 },
  { id: "bellatrix", name: "Bellatrix", con: "Ori", hr: 1790, ra: 81.283, dec: 6.35, mag: 1.64, spec: "B2III", pmRa: -8.11, pmDec: -12.88, bv: -0.22 },
  { id: "elnath", name: "Elnath", con: "Tau", hr: 1791, ra: 81.573, dec: 28.608, mag: 1.65, spec: "B7III", pmRa: 23.28, pmDec: -174.22, bv: -0.13 },
  { id: "miaplacidus", name: "Miaplacidus", con: "Car", hr: 3685, ra: 138.3, dec: -69.717, mag: 1.68, spec: "A1III", pmRa: -157.66, pmDec: 108.91, bv: -0.01 },
  { id: "alnilam", name: "Alnilam", con: "Ori", hr: 1903, ra: 84.053, dec: -1.202, mag: 1.69, spec: "B0Ia", pmRa: 1.49, pmDec: -1.06, bv: -0.18 },
  { id: "alnair", name: "Alnair", con: "Gru", hr: 8425, ra: 332.058, dec: -46.961, mag: 1.74, spec: "B7IV", pmRa: 127.6, pmDec: -147.91, bv: -0.07 },
  { id: "alnitak", name: "Alnitak", con: "Ori", hr: 1948, ra: 85.19, dec: -1.943, mag: 1.77, spec: "O9.5Ibe", pmRa: 3.19, pmDec: 2.03, bv: -0.21 },
  { id: "alioth", name: "Alioth", con: "UMa", hr: 4905, ra: 193.507, dec: 55.96, mag: 1.77, spec: "A1III-IVp", pmRa: 111.74, pmDec: -8.99, bv: -0.02 },
  { id: "dubhe", name: "Dubhe", con: "UMa", hr: 4301, ra: 165.932, dec: 61.751, mag: 1.79, spec: "K0III", pmRa: -136.46, pmDec: -35.25, bv: 1.07 },
  { id: "mirfak", name: "Mirfak", con: "Per", hr: 1017, ra: 51.081, dec: 49.861, mag: 1.8, spec: "F5Ib", pmRa: 24.11, pmDec: -26.01, bv: 0.48 },
  { id: "wezen", name: "Wezen", con: "CMa", hr: 2693, ra: 107.098, dec: -26.393, mag: 1.84, spec: "F8Ia", pmRa: -2.75, pmDec: 3.33, bv: 0.67 },
  { id: "sargas", name: "Sargas", con: "Sco", hr: 6553, ra: 264.33, dec: -42.998, mag: 1.87, spec: "F1III", pmRa: 6.06, pmDec: -0.95, bv: 0.4 },
  { id: "kaus-australis", name: "Kaus Australis", con: "Sgr", hr: 6879, ra: 276.043, dec: -34.384, mag: 1.85, spec: "B9.5III", pmRa: -39.61, pmDec: -124.05, bv: -0.03 },
  { id: "avior", name: "Avior", con: "Car", hr: 3307, ra: 125.629, dec: -59.509, mag: 1.86, spec: "K3III", pmRa: -25.34, pmDec: 22.72, bv: 1.28 },
  { id: "alkaid", name: "Alkaid", con: "UMa", hr: 5191, ra: 206.885, dec: 49.313, mag: 1.86, spec: "B3V", pmRa: -121.23, pmDec: -15.56, bv: -0.19 },
  { id: "menkalinan", name: "Menkalinan", con: "Aur", hr: 2088, ra: 89.882, dec: 44.947, mag: 1.9, spec: "A2IV", pmRa: -56.41, pmDec: -0.88, bv: 0.08 },
  { id: "atria", name: "Atria", con: "TrA", hr: 6217, ra: 252.166, dec: -69.028, mag: 1.92, spec: "K2IIb-III", pmRa: 17.85, pmDec: -32.92, bv: 1.44 },
  { id: "alhena", name: "Alhena", con: "Gem", hr: 2421, ra: 99.428, dec: 16.399, mag: 1.93, spec: "A1.5IV+", pmRa: -2.04, pmDec: -66.92, bv: 0 },
  { id: "peacock", name: "Peacock", con: "Pav", hr: 7790, ra: 306.412, dec: -56.735, mag: 1.94, spec: "B2IV", pmRa: 7.71, pmDec: -86.15, bv: -0.2 },
  { id: "mirzam", name: "Mirzam", con: "CMa", hr: 2294, ra: 95.675, dec: -17.956, mag: 1.98, spec: "B1II-III", pmRa: -3.45, pmDec: -0.47, bv: -0.24 },
  { id: "alphard", name: "Alphard", con: "Hya", hr: 3748, ra: 141.897, dec: -8.659, mag: 1.98, spec: "K3II-III", pmRa: -14.49, pmDec: 33.25, bv: 1.44 },
  { id: "polaris", name: "Polaris", con: "UMi", hr: 424, ra: 37.954, dec: 89.264, mag: 2.02, spec: "F7Ib-II", pmRa: 44.22, pmDec: -11.74, bv: 0.6 },
  { id: "hamal", name: "Hamal", con: "Ari", hr: 617, ra: 31.793, dec: 23.463, mag: 2, spec: "K2III", pmRa: 190.73, pmDec: -148.08, bv: 1.15 },
  { id: "diphda", name: "Diphda", con: "Cet", hr: 188, ra: 10.897, dec: -17.987, mag: 2.02, spec: "K0III", pmRa: 232.79, pmDec: 32.71, bv: 1.02 },
  { id: "nunki", name: "Nunki", con: "Sgr", hr: 7121, ra: 283.816, dec: -26.297, mag: 2.02, spec: "B2.5V", pmRa: 13.87, pmDec: -52.65, bv: -0.2 },
  { id: "mizar", name: "Mizar", con: "UMa", hr: 5054, ra: 200.981, dec: 54.925, mag: 2.04, spec: "A2V", pmRa: 121.23, pmDec: -22.01, bv: 0.02 },
  { id: "saiph", name: "Saiph", con: "Ori", hr: 2004, ra: 86.939, dec: -9.67, mag: 2.06, spec: "B0.5Ia", pmRa: 1.55, pmDec: -1.2, bv: -0.18 },
  { id: "alpheratz", name: "Alpheratz", con: "And", hr: 15, ra: 2.097, dec: 29.091, mag: 2.06, spec: "B8IVpMn", pmRa: 135.68, pmDec: -162.95, bv: -0.11 },
  { id: "tiaki", name: "Tiaki", con: "Gru", hr: 8636, ra: 340.667, dec: -46.885, mag: 2.11, spec: "M5III", pmRa: 135.44, pmDec: -4.55, bv: 1.62 },
  { id: "mirach", name: "Mirach", con: "And", hr: 337, ra: 17.433, dec: 35.621, mag: 2.06, spec: "M0IIIa", pmRa: 175.59, pmDec: -112.23, bv: 1.58 },
  { id: "kochab", name: "Kochab", con: "UMi", hr: 5563, ra: 222.676, dec: 74.156, mag: 2.08, spec: "K4III", pmRa: -32.29, pmDec: 11.91, bv: 1.47 },
  { id: "rasalhague", name: "Rasalhague", con: "Oph", hr: 6556, ra: 263.734, dec: 12.56, mag: 2.08, spec: "A5III", pmRa: 110.08, pmDec: -222.61, bv: 0.15 },
  { id: "algol", name: "Algol", con: "Per", hr: 936, ra: 47.042, dec: 40.956, mag: 2.12, spec: "B8V", pmRa: 2.39, pmDec: -1.44, bv: -0.05 },
  { id: "almach", name: "Almach", con: "And", hr: 603, ra: 30.975, dec: 42.33, mag: 2.14, spec: "K3IIb", pmRa: 43.08, pmDec: -50.85, bv: 1.37 },
  { id: "denebola", name: "Denebola", con: "Leo", hr: 4534, ra: 177.265, dec: 14.572, mag: 2.14, spec: "A3Va", pmRa: -499.02, pmDec: -113.78, bv: 0.09 },
  { id: "naos", name: "Naos", con: "Pup", hr: 3165, ra: 120.896, dec: -40.003, mag: 2.25, spec: "O5Iaf", pmRa: -30.82, pmDec: 16.77, bv: -0.27 },
  { id: "sadr", name: "Sadr", con: "Cyg", hr: 7796, ra: 305.557, dec: 40.257, mag: 2.2, spec: "F8Ib", pmRa: 2.43, pmDec: -0.93, bv: 0.67 },
  { id: "schedar", name: "Schedar", con: "Cas", hr: 168, ra: 10.127, dec: 56.537, mag: 2.23, spec: "K0IIIa", pmRa: 50.36, pmDec: -32.17, bv: 1.17 },
  { id: "aspidiske", name: "Aspidiske", con: "Car", hr: 3699, ra: 139.273, dec: -59.275, mag: 2.25, spec: "A8Ib", pmRa: -19.03, pmDec: 13.11, bv: 0.18 },
  { id: "eltanin", name: "Eltanin", con: "Dra", hr: 6705, ra: 269.152, dec: 51.489, mag: 2.23, spec: "K5III", pmRa: -8.52, pmDec: -23.05, bv: 1.52 },
  { id: "mintaka", name: "Mintaka", con: "Ori", hr: 1852, ra: 83.002, dec: -0.299, mag: 2.23, spec: "O9.5II", pmRa: 1.67, pmDec: 0.56, bv: -0.21 },
  { id: "caph", name: "Caph", con: "Cas", hr: 21, ra: 2.294, dec: 59.15, mag: 2.27, spec: "F2III", pmRa: 523.39, pmDec: -179.77, bv: 0.34 },
  { id: "izar", name: "Izar", con: "Boo", hr: 5506, ra: 221.247, dec: 27.074, mag: 2.37, spec: "K0II-III", pmRa: -51.26, pmDec: 20.03, bv: 0.97 },
  { id: "dschubba", name: "Dschubba", con: "Sco", hr: 5953, ra: 240.083, dec: -22.622, mag: 2.32, spec: "B0.3IV", pmRa: -10.21, pmDec: -36.9, bv: -0.12 },
  { id: "larawag", name: "Larawag", con: "Sco", hr: 6241, ra: 252.968, dec: -34.293, mag: 2.29, spec: "K2.5III", pmRa: -614.89, pmDec: -191.64, bv: 1.15 },
  { id: "merak", name: "Merak", con: "UMa", hr: 4295, ra: 165.46, dec: 56.382, mag: 2.37, spec: "A1IVn", pmRa: 81.66, pmDec: 33.74, bv: 0.03 },
  { id: "ankaa", name: "Ankaa", con: "Phe", hr: 99, ra: 6.571, dec: -42.306, mag: 2.39, spec: "K0III", pmRa: 233.05, pmDec: -356.3, bv: 1.09 },
  { id: "enif", name: "Enif", con: "Peg", hr: 8308, ra: 326.046, dec: 9.875, mag: 2.39, spec: "K2Ib", pmRa: 30.02, pmDec: 1.38, bv: 1.52 },
  { id: "scheat", name: "Scheat", con: "Peg", hr: 8775, ra: 345.944, dec: 28.083, mag: 2.42, spec: "M2.5II-III", pmRa: 187.76, pmDec: 137.61, bv: 1.67 },
  { id: "sabik", name: "Sabik", con: "Oph", hr: 6378, ra: 257.595, dec: -15.725, mag: 2.43, spec: "A2.5Va", pmRa: 41.16, pmDec: 97.65, bv: 0.06 },
  { id: "phecda", name: "Phecda", con: "UMa", hr: 4554, ra: 178.458, dec: 53.695, mag: 2.44, spec: "A0Ve", pmRa: -12.88, pmDec: 11.01, bv: 0.04 },
  { id: "aludra", name: "Aludra", con: "CMa", hr: 2827, ra: 111.024, dec: -29.303, mag: 2.45, spec: "B5Ia", pmRa: -3.02, pmDec: 6.89, bv: -0.09 },
  { id: "markab", name: "Markab", con: "Peg", hr: 8781, ra: 346.19, dec: 15.205, mag: 2.49, spec: "B9III", pmRa: 61.1, pmDec: -42.56, bv: -0.04 },
  { id: "aljanah", name: "Aljanah", con: "Cyg", hr: 7949, ra: 311.553, dec: 33.97, mag: 2.48, spec: "K0III", pmRa: 355.66, pmDec: 330.6, bv: 1.03 },
  { id: "markeb", name: "Markeb", con: "Vel", hr: 3734, ra: 140.528, dec: -55.011, mag: 2.5, spec: "B1.5IV", pmRa: -8.48, pmDec: 5.31, bv: -0.22 },
  { id: "menkar", name: "Menkar", con: "Cet", hr: 911, ra: 45.57, dec: 4.09, mag: 2.53, spec: "M1.5IIIa", pmRa: -11.81, pmDec: -78.76, bv: 1.64 },
  { id: "zosma", name: "Zosma", con: "Leo", hr: 4357, ra: 168.527, dec: 20.524, mag: 2.56, spec: "A4V", pmRa: -135.54, pmDec: -112.74, bv: 0.12 },
  { id: "arneb", name: "Arneb", con: "Lep", hr: 1865, ra: 83.183, dec: -17.822, mag: 2.58, spec: "F0Ib", pmRa: 3.27, pmDec: 1.54, bv: 0.21 },
  { id: "girtab", name: "Girtab", con: "Sco", hr: 6580, ra: 265.622, dec: -39.03, mag: 2.41, spec: "B1.5III", pmRa: -6.88, pmDec: -14.58, bv: -0.2 },
  { id: "zubeneschamali", name: "Zubeneschamali", con: "Lib", hr: 5685, ra: 229.252, dec: -9.383, mag: 2.61, spec: "B8V", pmRa: -98.1, pmDec: -19.65, bv: -0.11 },
  { id: "zubenelgenubi", name: "Zubenelgenubi", con: "Lib", hr: 5531, ra: 222.72, dec: -16.042, mag: 2.75, spec: "A3IV", pmRa: -105.69, pmDec: -69, bv: 0.15 },
  { id: "phact", name: "Phact", con: "Col", hr: 1862, ra: 84.912, dec: -34.074, mag: 2.64, spec: "B7IVe", pmRa: -2.01, pmDec: -22.31, bv: -0.12 },
  { id: "acrab", name: "Acrab", con: "Sco", hr: 5984, ra: 241.359, dec: -19.806, mag: 2.62, spec: "B1V", pmRa: -6.19, pmDec: -24.04, bv: -0.07 },
  { id: "alderamin", name: "Alderamin", con: "Cep", hr: 8162, ra: 319.645, dec: 62.586, mag: 2.51, spec: "A8V", pmRa: 149.91, pmDec: 48.27, bv: 0.22 },
  { id: "yed-prior", name: "Yed Prior", con: "Oph", hr: 6056, ra: 243.586, dec: -3.694, mag: 2.74, spec: "M0.5III", pmRa: -41.16, pmDec: -142.18, bv: 1.59 },
  { id: "unukalhai", name: "Unukalhai", con: "Ser", hr: 5854, ra: 236.067, dec: 6.426, mag: 2.65, spec: "K2IIIb", pmRa: 134.66, pmDec: 44.14, bv: 1.17 },
  { id: "chertan", name: "Chertan", con: "Leo", hr: 4359, ra: 168.56, dec: 15.43, mag: 2.56, spec: "A2IV", pmRa: -58.6, pmDec: -80.26, bv: 0 },
  { id: "porrima", name: "Porrima", con: "Vir", hr: 4825, ra: 190.415, dec: -1.449, mag: 2.74, spec: "F0V", pmRa: -616.67, pmDec: 60.66, bv: 0.36 },
  { id: "ruchbah", name: "Ruchbah", con: "Cas", hr: 403, ra: 21.454, dec: 60.235, mag: 2.68, spec: "A5III-IV", pmRa: 297.26, pmDec: -49.89, bv: 0.13 },
  { id: "muphrid", name: "Muphrid", con: "Boo", hr: 5235, ra: 208.671, dec: 18.398, mag: 2.68, spec: "G0IV", pmRa: -60.95, pmDec: -357.17, bv: 0.58 },
  { id: "hassaleh", name: "Hassaleh", con: "Aur", hr: 1577, ra: 74.249, dec: 33.166, mag: 2.69, spec: "K3II", pmRa: 3.63, pmDec: -18.47, bv: 1.53 },
  { id: "alkaphrah", name: "Alkaphrah", con: "UMa", hr: 3594, ra: 133.848, dec: 47.157, mag: 3.01, spec: "K1III", pmRa: -78.61, pmDec: -96.72, bv: 1.14 },
  { id: "wazn", name: "Wazn", con: "Col", hr: 2040, ra: 87.74, dec: -35.768, mag: 3.12, spec: "K1III", pmRa: -1.69, pmDec: 2.15, bv: 1.16 },
  { id: "algieba", name: "Algieba", con: "Leo", hr: 4057, ra: 154.993, dec: 19.842, mag: 2.28, spec: "K1-IIIFe", pmRa: 310.77, pmDec: -152.88, bv: 1.14 },
  { id: "thuban", name: "Thuban", con: "Dra", hr: 5291, ra: 211.097, dec: 64.376, mag: 3.65, spec: "A0III", pmRa: -56.52, pmDec: 17.19, bv: -0.05 },
  { id: "rastaban", name: "Rastaban", con: "Dra", hr: 6536, ra: 262.608, dec: 52.301, mag: 2.79, spec: "G2II", pmRa: -15.19, pmDec: 12.28, bv: 0.98 },
  { id: "suhail", name: "Suhail", con: "Vel", hr: 3634, ra: 136.999, dec: -43.433, mag: 2.21, spec: "K4Ib-II", pmRa: -24.01, pmDec: 13.52, bv: 1.66 },
  { id: "alsephina", name: "Alsephina", con: "Vel", hr: 3485, ra: 131.176, dec: -54.709, mag: 1.96, spec: "WC8", pmRa: -7.64, pmDec: 9.89, bv: -0.26 },
  { id: "tureis", name: "Tureis", con: "Pup", hr: 3185, ra: 121.886, dec: -24.304, mag: 2.81, spec: "K1III", pmRa: -2.51, pmDec: 4.19, bv: 1.24 },
  { id: "navi", name: "Navi", con: "Cas", hr: 264, ra: 14.177, dec: 60.717, mag: 2.47, spec: "B0IVe", pmRa: 25.65, pmDec: -3.82, bv: -0.15 },
  { id: "rukbat", name: "Rukbat", con: "Sgr", hr: 7348, ra: 290.972, dec: -40.616, mag: 3.97, spec: "B8V", pmRa: -3.45, pmDec: -3.82, bv: -0.1 },
  { id: "wezen", name: "Wezen", con: "CMa", hr: 2693, ra: 107.098, dec: -26.393, mag: 1.84, spec: "F8Ia", pmRa: -2.75, pmDec: 3.33, bv: 0.67 },
  { id: "mebsuta", name: "Mebsuta", con: "Gem", hr: 2473, ra: 100.983, dec: 25.131, mag: 3.06, spec: "G8Ib", pmRa: -8.1, pmDec: -19.08, bv: 1.4 },
  { id: "alhena", name: "Alhena", con: "Gem", hr: 2421, ra: 99.428, dec: 16.399, mag: 1.93, spec: "A1.5IV+", pmRa: -2.04, pmDec: -66.92, bv: 0 },
  { id: "megrez", name: "Megrez", con: "UMa", hr: 4660, ra: 183.857, dec: 57.033, mag: 3.31, spec: "A3V", pmRa: 103.56, pmDec: 7.81, bv: 0.08 },
  { id: "muscida", name: "Muscida", con: "UMa", hr: 3323, ra: 127.566, dec: 60.718, mag: 3.36, spec: "G4III-IV", pmRa: -133.76, pmDec: -107.36, bv: 0.86 },
  { id: "tarazed", name: "Tarazed", con: "Aql", hr: 7525, ra: 296.565, dec: 10.614, mag: 2.72, spec: "K3II", pmRa: 15.72, pmDec: -3.08, bv: 1.52 },
  { id: "alshat", name: "Alshat", con: "Cap", hr: 7776, ra: 305.253, dec: -12.508, mag: 3.57, spec: "B9V", pmRa: 33.29, pmDec: -1.54, bv: -0.04 },
  { id: "dabih", name: "Dabih", con: "Cap", hr: 7776, ra: 305.253, dec: -14.781, mag: 3.08, spec: "K0II", pmRa: 17.68, pmDec: -2.15, bv: 0.79 },
  { id: "algedi", name: "Algedi", con: "Cap", hr: 7754, ra: 304.514, dec: -12.545, mag: 3.57, spec: "G2Ib", pmRa: 60.5, pmDec: -1.78, bv: 0.79 },
  { id: "nashira", name: "Nashira", con: "Cap", hr: 8278, ra: 325.023, dec: -16.662, mag: 3.68, spec: "F0p", pmRa: 188.96, pmDec: -21.73, bv: 0.32 },
  { id: "sadalsuud", name: "Sadalsuud", con: "Aqr", hr: 8232, ra: 322.89, dec: -5.571, mag: 2.91, spec: "G0Ib", pmRa: 18.77, pmDec: -8.21, bv: 0.83 },
  { id: "sadalmelik", name: "Sadalmelik", con: "Aqr", hr: 8414, ra: 331.446, dec: -0.32, mag: 2.96, spec: "G2Ib", pmRa: 17.9, pmDec: -9.94, bv: 0.97 },
  { id: "skat", name: "Skat", con: "Aqr", hr: 8709, ra: 343.987, dec: -15.821, mag: 3.27, spec: "A3V", pmRa: 93.3, pmDec: -24.93, bv: 0.05 },
  { id: "acamar", name: "Acamar", con: "Eri", hr: 897, ra: 44.565, dec: -40.305, mag: 2.88, spec: "A1III", pmRa: -53.53, pmDec: -16.34, bv: 0.04 },
  { id: "cursa", name: "Cursa", con: "Eri", hr: 1666, ra: 76.963, dec: -5.086, mag: 2.79, spec: "A3IV", pmRa: -83.39, pmDec: -75.68, bv: 0.13 },
  { id: "ran", name: "Ran", con: "Eri", hr: 1084, ra: 53.233, dec: -9.458, mag: 3.73, spec: "K2V", pmRa: -975.17, pmDec: 19.49, bv: 0.88 },
  { id: "zaurak", name: "Zaurak", con: "Eri", hr: 1231, ra: 59.507, dec: -13.509, mag: 2.95, spec: "M1IIIb", pmRa: 61.78, pmDec: -109.21, bv: 1.59 },
  { id: "propus", name: "Propus", con: "Gem", hr: 2216, ra: 93.719, dec: 22.507, mag: 3.31, spec: "M3III", pmRa: 20.01, pmDec: -13.28, bv: 1.59 },
  { id: "tejat", name: "Tejat", con: "Gem", hr: 2286, ra: 95.74, dec: 22.514, mag: 2.88, spec: "M3IIIab", pmRa: -11.69, pmDec: -12.17, bv: 1.64 },
  { id: "wasat", name: "Wasat", con: "Gem", hr: 2777, ra: 110.031, dec: 21.982, mag: 3.53, spec: "F0IV", pmRa: -18.85, pmDec: -8.14, bv: 0.34 },
  { id: "alhena", name: "Alhena", con: "Gem", hr: 2421, ra: 99.428, dec: 16.399, mag: 1.93, spec: "A0IV", pmRa: -2.04, pmDec: -66.92, bv: 0 },
  { id: "alchiba", name: "Alchiba", con: "Crv", hr: 4623, ra: 182.103, dec: -24.729, mag: 4.02, spec: "F2V", pmRa: -159.58, pmDec: 21.86, bv: 0.32 },
  { id: "gienah", name: "Gienah", con: "Crv", hr: 4662, ra: 183.952, dec: -17.542, mag: 2.59, spec: "B8III", pmRa: -159.89, pmDec: 22.31, bv: -0.11 },
  { id: "kraz", name: "Kraz", con: "Crv", hr: 4786, ra: 188.597, dec: -23.397, mag: 2.65, spec: "G5II", pmRa: -0.46, pmDec: -56.01, bv: 0.89 },
  { id: "algorab", name: "Algorab", con: "Crv", hr: 4757, ra: 187.466, dec: -16.515, mag: 2.95, spec: "A0V", pmRa: -210.49, pmDec: -138.74, bv: -0.05 },
  { id: "minkar", name: "Minkar", con: "Crv", hr: 4630, ra: 182.531, dec: -22.62, mag: 3.02, spec: "K2III", pmRa: -71.52, pmDec: 10.92, bv: 1.33 },
  { id: "alkes", name: "Alkes", con: "Crt", hr: 4287, ra: 164.944, dec: -18.299, mag: 4.08, spec: "K1III", pmRa: -111.34, pmDec: -223.82, bv: 1.12 },
  { id: "subra", name: "Subra", con: "Leo", hr: 3852, ra: 148.191, dec: 9.892, mag: 3.52, spec: "A0", pmRa: -18.12, pmDec: -6.99, bv: 0.09 },
  { id: "rasalas", name: "Rasalas", con: "Leo", hr: 3905, ra: 148.191, dec: 26.007, mag: 3.88, spec: "K2III", pmRa: -173.72, pmDec: -61.36, bv: 1.22 },
  { id: "adhafera", name: "Adhafera", con: "Leo", hr: 4031, ra: 154.173, dec: 23.417, mag: 3.44, spec: "F0III", pmRa: -16.07, pmDec: -46.88, bv: 0.3 },
  { id: "alterf", name: "Alterf", con: "Leo", hr: 3773, ra: 142.93, dec: 22.968, mag: 4.31, spec: "K2III", pmRa: -42.6, pmDec: 24.43, bv: 1.27 },
  { id: "alula-australis", name: "Alula Australis", con: "UMa", hr: 4377, ra: 169.545, dec: 31.529, mag: 3.79, spec: "G1V", pmRa: -541.67, pmDec: 595.72, bv: 0.59 },
  { id: "tania-borealis", name: "Tania Borealis", con: "UMa", hr: 4295, ra: 154.274, dec: 42.914, mag: 3.45, spec: "A7IV", pmRa: -22.09, pmDec: -68.51, bv: 0.14 },
  { id: "talitha", name: "Talitha", con: "UMa", hr: 3569, ra: 134.802, dec: 48.042, mag: 3.14, spec: "A7V", pmRa: -445.49, pmDec: -223.36, bv: 0.19 },
  { id: "cor-caroli", name: "Cor Caroli", con: "CVn", hr: 4915, ra: 194.007, dec: 38.318, mag: 2.81, spec: "A0spe", pmRa: -233.4, pmDec: 54.33, bv: -0.12 },
  { id: "chara", name: "Chara", con: "CVn", hr: 4785, ra: 188.436, dec: 41.357, mag: 4.26, spec: "G0V", pmRa: -704.75, pmDec: 292.74, bv: 0.59 },
  { id: "nekkar", name: "Nekkar", con: "Boo", hr: 5602, ra: 225.486, dec: 40.391, mag: 3.5, spec: "G8IIIa", pmRa: -40.04, pmDec: 28.82, bv: 0.94 },
  { id: "seginus", name: "Seginus", con: "Boo", hr: 5435, ra: 218.02, dec: 38.308, mag: 3.03, spec: "A7III", pmRa: -100.84, pmDec: 154.34, bv: 0.19 },
  { id: "princeps", name: "Princeps", con: "Boo", hr: 5681, ra: 228.876, dec: 33.315, mag: 3.47, spec: "G8III", pmRa: -60.12, pmDec: -115.32, bv: 0.94 },
  { id: "alkalurops", name: "Alkalurops", con: "Boo", hr: 5733, ra: 231.124, dec: 37.377, mag: 4.31, spec: "A7IVn", pmRa: -56.25, pmDec: 0.7, bv: 0.21 },
  { id: "gemma", name: "Gemma", con: "CrB", hr: 5793, ra: 233.672, dec: 26.715, mag: 2.23, spec: "A0V", pmRa: 120.38, pmDec: -89.44, bv: -0.02 },
  { id: "nusakan", name: "Nusakan", con: "CrB", hr: 5747, ra: 231.957, dec: 29.106, mag: 3.68, spec: "F0p", pmRa: -181.47, pmDec: 86.22, bv: 0.28 },
  { id: "kornephoros", name: "Kornephoros", con: "Her", hr: 6148, ra: 247.555, dec: 21.49, mag: 2.77, spec: "G7IIIa", pmRa: -98.82, pmDec: -15.47, bv: 0.94 },
  { id: "marsic", name: "Marsic", con: "Her", hr: 6008, ra: 242.019, dec: 17.047, mag: 3.9, spec: "A3IV", pmRa: -22.49, pmDec: 37.22, bv: 0.08 },
  { id: "sarin", name: "Sarin", con: "Her", hr: 6410, ra: 258.762, dec: 24.839, mag: 3.14, spec: "A3IV", pmRa: -16.12, pmDec: -35.17, bv: 0.07 },
  { id: "maasym", name: "Maasym", con: "Her", hr: 6526, ra: 262.685, dec: 26.11, mag: 3.75, spec: "K4III", pmRa: 14.77, pmDec: -1.74, bv: 1.44 },
  { id: "sheliak", name: "Sheliak", con: "Lyr", hr: 7106, ra: 282.52, dec: 33.363, mag: 3.52, spec: "B7Ve", pmRa: 1.1, pmDec: -4.46, bv: -0.06 },
  { id: "sulafat", name: "Sulafat", con: "Lyr", hr: 7178, ra: 284.736, dec: 32.69, mag: 3.24, spec: "B9III", pmRa: -2.82, pmDec: 1.77, bv: -0.05 },
  { id: "albireo", name: "Albireo", con: "Cyg", hr: 7417, ra: 292.68, dec: 27.96, mag: 3.08, spec: "K3II", pmRa: -7.17, pmDec: -5.63, bv: 1.09 },
  { id: "ruchba", name: "Ruchba", con: "Cyg", hr: 7528, ra: 296.244, dec: 45.131, mag: 2.87, spec: "B9.5III", pmRa: 2.36, pmDec: -0.87, bv: -0.02 },
  { id: "azelfafage", name: "Azelfafage", con: "Cyg", hr: 8301, ra: 326.236, dec: 46.741, mag: 4.56, spec: "M3III", pmRa: 26.69, pmDec: 3.04, bv: 1.58 },
  { id: "algenib", name: "Algenib", con: "Peg", hr: 39, ra: 3.309, dec: 15.184, mag: 2.83, spec: "B2IV", pmRa: 4.7, pmDec: -8.24, bv: -0.22 },
  { id: "matar", name: "Matar", con: "Peg", hr: 8650, ra: 340.751, dec: 30.221, mag: 2.95, spec: "G2II-III", pmRa: -10.3, pmDec: -4.54, bv: 0.86 },
  { id: "homam", name: "Homam", con: "Peg", hr: 8634, ra: 340.366, dec: 10.831, mag: 3.41, spec: "B8.5III", pmRa: 69.42, pmDec: -25.53, bv: -0.08 },
  { id: "biham", name: "Biham", con: "Peg", hr: 8450, ra: 332.55, dec: 6.198, mag: 3.53, spec: "G8III", pmRa: 58.88, pmDec: -11.67, bv: 0.92 },
  { id: "sadachbia", name: "Sadachbia", con: "Aqr", hr: 8518, ra: 335.414, dec: -1.387, mag: 3.84, spec: "A0V", pmRa: 125.79, pmDec: -12.63, bv: -0.05 },
  { id: "baten-kaitos", name: "Baten Kaitos", con: "Cet", hr: 539, ra: 27.865, dec: -10.335, mag: 3.74, spec: "K0III", pmRa: -18.57, pmDec: -39.28, bv: 1.02 },
  { id: "deneb-algedi", name: "Deneb Algedi", con: "Cap", hr: 8322, ra: 326.76, dec: -16.127, mag: 2.87, spec: "A7mIII", pmRa: 81.95, pmDec: -2.39, bv: 0.32 },
  { id: "rotanev", name: "Rotanev", con: "Del", hr: 7882, ra: 309.387, dec: 14.595, mag: 3.63, spec: "F5III", pmRa: 118.07, pmDec: -46.85, bv: 0.44 },
  { id: "sualocin", name: "Sualocin", con: "Del", hr: 7906, ra: 309.91, dec: 15.912, mag: 3.77, spec: "B9IV", pmRa: 54.8, pmDec: 8.44, bv: -0.03 },
  { id: "proxima-centauri", name: "Proxima Centauri", con: "Cen", hr: 0, ra: 217.429, dec: -62.68, mag: 11.13, spec: "M5.5Ve", pmRa: -3775.4, pmDec: 765.54, bv: 1.9 }
], us = [
  // ────────────────────────────────────────────────────────────────
  // 1. Andromeda
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "And",
    name: "Andromeda",
    genitive: "Andromedae",
    ra: 8,
    dec: 37,
    area: 722,
    brightestStar: "Alpheratz",
    stickFigure: [
      // Alpheratz (α And) → δ And
      [2.065, 29.09, 9.83, 30.86],
      // δ And → Mirach (β And)
      [9.83, 30.86, 17.43, 35.62],
      // Mirach → Almach (γ And)
      [17.43, 35.62, 30.97, 42.33],
      // Mirach → μ And (branch to M31 area)
      [17.43, 35.62, 14.18, 38.5],
      // μ And → ν And
      [14.18, 38.5, 12.45, 41.08]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 2. Antlia
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Ant",
    name: "Antlia",
    genitive: "Antliae",
    ra: 152,
    dec: -33,
    area: 239,
    brightestStar: "Alpha Antliae",
    stickFigure: [
      // α Ant → ε Ant
      [156.79, -31.07, 148.52, -35.95],
      // ε Ant → ι Ant
      [148.52, -35.95, 153.68, -37.14]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 3. Apus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Aps",
    name: "Apus",
    genitive: "Apodis",
    ra: 247,
    dec: -75,
    area: 206,
    brightestStar: "Alpha Apodis",
    stickFigure: [
      // α Aps → δ1 Aps
      [220.6, -79.04, 243.36, -78.69],
      // δ1 Aps → β Aps
      [243.36, -78.69, 247.21, -77.52],
      // β Aps → γ Aps
      [247.21, -77.52, 248.04, -78.9]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 4. Aquarius
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Aqr",
    name: "Aquarius",
    genitive: "Aquarii",
    ra: 334,
    dec: -13,
    area: 980,
    brightestStar: "Sadalsuud",
    stickFigure: [
      // Sadalmelik (α Aqr) → Sadalsuud (β Aqr)
      [331.45, -0.32, 322.89, -5.57],
      // Sadalmelik → θ Aqr
      [331.45, -0.32, 334.21, -7.78],
      // θ Aqr → Skat (δ Aqr)
      [334.21, -7.78, 343.66, -15.82],
      // Skat → 88 Aqr
      [343.66, -15.82, 349, -21.17],
      // Skat → λ Aqr
      [343.66, -15.82, 343.15, -7.58],
      // Sadalsuud → ζ Aqr (water jar)
      [322.89, -5.57, 330.36, -0.02],
      // ζ Aqr → η Aqr
      [330.36, -0.02, 330.72, -0.12],
      // Skat → τ² Aqr (water stream)
      [343.66, -15.82, 339.19, -13.59],
      // ψ¹ Aqr → ψ² Aqr → ψ³ Aqr (tail)
      [348.97, -9.09, 349.29, -9.18]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 5. Aquila
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Aql",
    name: "Aquila",
    genitive: "Aquilae",
    ra: 295,
    dec: 2,
    area: 652,
    brightestStar: "Altair",
    stickFigure: [
      // Altair (α Aql) → Alshain (β Aql)
      [297.7, 8.87, 298.83, 6.41],
      // Altair → Tarazed (γ Aql)
      [297.7, 8.87, 296.56, 10.61],
      // Tarazed → δ Aql
      [296.56, 10.61, 289.44, 3.11],
      // δ Aql → ζ Aql
      [289.44, 3.11, 286.35, 13.86],
      // Alshain → θ Aql
      [298.83, 6.41, 300.28, -0.82],
      // θ Aql → η Aql
      [300.28, -0.82, 298.12, 1.01],
      // δ Aql → λ Aql
      [289.44, 3.11, 286.56, -4.88]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 6. Ara
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Ara",
    name: "Ara",
    genitive: "Arae",
    ra: 259,
    dec: -55,
    area: 237,
    brightestStar: "Beta Arae",
    stickFigure: [
      // β Ara → α Ara
      [261.33, -55.53, 262.77, -49.88],
      // α Ara → ε1 Ara
      [262.77, -49.88, 254.65, -53.16],
      // ε1 Ara → ζ Ara
      [254.65, -53.16, 253.06, -55.99],
      // ζ Ara → η Ara
      [253.06, -55.99, 252.45, -59.04],
      // β Ara → γ Ara
      [261.33, -55.53, 263.4, -56.38],
      // γ Ara → δ Ara
      [263.4, -56.38, 262.7, -60.68],
      // δ Ara → η Ara
      [262.7, -60.68, 252.45, -59.04]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 7. Aries
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Ari",
    name: "Aries",
    genitive: "Arietis",
    ra: 32,
    dec: 21,
    area: 441,
    brightestStar: "Hamal",
    stickFigure: [
      // Hamal (α Ari) → Sheratan (β Ari)
      [31.79, 23.46, 28.66, 20.81],
      // Sheratan → Mesarthim (γ Ari)
      [28.66, 20.81, 28.38, 19.29],
      // Hamal → 41 Ari
      [31.79, 23.46, 39.95, 27.26]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 8. Auriga
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Aur",
    name: "Auriga",
    genitive: "Aurigae",
    ra: 90,
    dec: 42,
    area: 657,
    brightestStar: "Capella",
    stickFigure: [
      // Capella (α Aur) → Menkalinan (β Aur)
      [79.17, 46, 89.88, 44.95],
      // Menkalinan → θ Aur
      [89.88, 44.95, 89.93, 37.21],
      // θ Aur → Elnath (β Tau, shared)
      [89.93, 37.21, 81.57, 28.61],
      // Elnath → ι Aur
      [81.57, 28.61, 74.25, 33.17],
      // ι Aur → Capella
      [74.25, 33.17, 79.17, 46],
      // Capella → ε Aur
      [79.17, 46, 75.49, 43.82],
      // ε Aur → ζ Aur
      [75.49, 43.82, 75.62, 41.08],
      // ζ Aur → η Aur
      [75.62, 41.08, 76.63, 41.23]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 9. Boötes
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Boo",
    name: "Boötes",
    genitive: "Boötis",
    ra: 218,
    dec: 33,
    area: 907,
    brightestStar: "Arcturus",
    stickFigure: [
      // Arcturus (α Boo) → ε Boo (Izar)
      [213.92, 19.18, 221.25, 27.07],
      // Izar → δ Boo
      [221.25, 27.07, 218.02, 33.31],
      // δ Boo → β Boo (Nekkar)
      [218.02, 33.31, 218.46, 40.39],
      // Nekkar → γ Boo (Seginus)
      [218.46, 40.39, 218.02, 38.31],
      // Arcturus → η Boo (Muphrid)
      [213.92, 19.18, 208.67, 18.4],
      // Arcturus → ζ Boo
      [213.92, 19.18, 220.29, 13.73],
      // δ Boo → ρ Boo
      [218.02, 33.31, 213, 30.37],
      // ρ Boo → Arcturus
      [213, 30.37, 213.92, 19.18]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 10. Caelum
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cae",
    name: "Caelum",
    genitive: "Caeli",
    ra: 69,
    dec: -40,
    area: 125,
    brightestStar: "Alpha Caeli",
    stickFigure: [
      // α Cae → β Cae
      [70.14, -41.86, 68.54, -37.14],
      // β Cae → γ Cae
      [68.54, -37.14, 76.1, -35.48]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 11. Camelopardalis
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cam",
    name: "Camelopardalis",
    genitive: "Camelopardalis",
    ra: 85,
    dec: 70,
    area: 757,
    brightestStar: "Beta Camelopardalis",
    stickFigure: [
      // β Cam → α Cam
      [75.85, 60.44, 73.51, 66.34],
      // α Cam → γ Cam
      [73.51, 66.34, 57.57, 71.33],
      // γ Cam → 7 Cam
      [57.57, 71.33, 67.87, 73.24],
      // β Cam → CS Cam
      [75.85, 60.44, 53.74, 68.89]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 12. Cancer
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cnc",
    name: "Cancer",
    genitive: "Cancri",
    ra: 128,
    dec: 20,
    area: 506,
    brightestStar: "Tarf",
    stickFigure: [
      // Tarf (β Cnc) → Asellus Australis (δ Cnc)
      [124.13, 9.19, 131.17, 18.15],
      // Asellus Australis → Asellus Borealis (γ Cnc)
      [131.17, 18.15, 130.81, 21.47],
      // Asellus Australis → Acubens (α Cnc)
      [131.17, 18.15, 134.62, 11.86],
      // Asellus Borealis → ι Cnc
      [130.81, 21.47, 131.67, 28.76]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 13. Canes Venatici
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "CVn",
    name: "Canes Venatici",
    genitive: "Canum Venaticorum",
    ra: 195,
    dec: 40,
    area: 465,
    brightestStar: "Cor Caroli",
    stickFigure: [
      // Cor Caroli (α CVn) → Chara (β CVn)
      [194.01, 38.32, 188.44, 41.36]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 14. Canis Major
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "CMa",
    name: "Canis Major",
    genitive: "Canis Majoris",
    ra: 105,
    dec: -22,
    area: 380,
    brightestStar: "Sirius",
    stickFigure: [
      // Sirius (α CMa) → Mirzam (β CMa)
      [101.29, -16.72, 95.67, -17.96],
      // Sirius → δ CMa (Wezen)
      [101.29, -16.72, 107.1, -26.39],
      // Mirzam → ν² CMa
      [95.67, -17.96, 97.2, -19.26],
      // Wezen → η CMa (Aludra)
      [107.1, -26.39, 111.02, -29.3],
      // Wezen → ε CMa (Adhara)
      [107.1, -26.39, 104.66, -28.97],
      // Adhara → ο² CMa
      [104.66, -28.97, 105.43, -23.83],
      // Sirius → ο² CMa
      [101.29, -16.72, 105.43, -23.83],
      // ε CMa → σ CMa
      [104.66, -28.97, 99.17, -27.93]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 15. Canis Minor
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "CMi",
    name: "Canis Minor",
    genitive: "Canis Minoris",
    ra: 112,
    dec: 6,
    area: 183,
    brightestStar: "Procyon",
    stickFigure: [
      // Procyon (α CMi) → Gomeisa (β CMi)
      [114.83, 5.22, 111.79, 8.29]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 16. Capricornus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cap",
    name: "Capricornus",
    genitive: "Capricorni",
    ra: 315,
    dec: -20,
    area: 414,
    brightestStar: "Deneb Algedi",
    stickFigure: [
      // Algedi (α² Cap) → β Cap (Dabih)
      [304.51, -12.51, 305.25, -14.78],
      // Dabih → ψ Cap
      [305.25, -14.78, 311.92, -25.27],
      // ψ Cap → ω Cap
      [311.92, -25.27, 314.68, -26.92],
      // ω Cap → 24 Cap
      [314.68, -26.92, 319.57, -25.01],
      // 24 Cap → ζ Cap
      [319.57, -25.01, 321.67, -22.41],
      // ζ Cap → Deneb Algedi (δ Cap)
      [321.67, -22.41, 326.76, -16.13],
      // Deneb Algedi → Nashira (γ Cap)
      [326.76, -16.13, 325.02, -16.66],
      // Algedi → θ Cap
      [304.51, -12.51, 316.49, -17.23]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 17. Carina
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Car",
    name: "Carina",
    genitive: "Carinae",
    ra: 125,
    dec: -63,
    area: 494,
    brightestStar: "Canopus",
    stickFigure: [
      // Canopus (α Car) → Avior (ε Car)
      [95.99, -52.7, 125.63, -59.51],
      // Avior → η Car
      [125.63, -59.51, 161.26, -59.68],
      // η Car → θ Car
      [161.26, -59.68, 160.74, -64.39],
      // θ Car → ι Car (Aspidiske)
      [160.74, -64.39, 139.27, -59.28],
      // Aspidiske → Avior
      [139.27, -59.28, 125.63, -59.51],
      // Canopus → χ Car
      [95.99, -52.7, 118.33, -52.98],
      // θ Car → υ Car
      [160.74, -64.39, 147.07, -65.07],
      // υ Car → β Car (Miaplacidus)
      [147.07, -65.07, 138.3, -69.72],
      // Miaplacidus → ω Car
      [138.3, -69.72, 152.08, -70.04]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 18. Cassiopeia
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cas",
    name: "Cassiopeia",
    genitive: "Cassiopeiae",
    ra: 15,
    dec: 62,
    area: 598,
    brightestStar: "Schedar",
    stickFigure: [
      // Caph (β Cas) → Schedar (α Cas)
      [2.29, 59.15, 10.13, 56.54],
      // Schedar → Navi (γ Cas)
      [10.13, 56.54, 14.18, 60.72],
      // Navi → Ruchbah (δ Cas)
      [14.18, 60.72, 21.45, 60.24],
      // Ruchbah → Segin (ε Cas)
      [21.45, 60.24, 28.6, 63.67]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 19. Centaurus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cen",
    name: "Centaurus",
    genitive: "Centauri",
    ra: 200,
    dec: -47,
    area: 1060,
    brightestStar: "Rigil Kentaurus",
    stickFigure: [
      // Rigil Kentaurus (α Cen) → Hadar (β Cen)
      [219.9, -60.83, 210.96, -60.37],
      // Hadar → ε Cen
      [210.96, -60.37, 204.97, -53.47],
      // ε Cen → ζ Cen
      [204.97, -53.47, 208.88, -47.29],
      // ζ Cen → η Cen
      [208.88, -47.29, 218.88, -42.16],
      // η Cen → θ Cen (Menkent)
      [218.88, -42.16, 211.67, -36.37],
      // Menkent → ι Cen
      [211.67, -36.37, 200.15, -36.71],
      // ε Cen → μ Cen
      [204.97, -53.47, 206.27, -44.8],
      // μ Cen → ν Cen
      [206.27, -44.8, 198.87, -41.18],
      // ν Cen → Menkent
      [198.87, -41.18, 211.67, -36.37],
      // ε Cen → δ Cen
      [204.97, -53.47, 190.38, -48.96],
      // δ Cen → γ Cen
      [190.38, -48.96, 185.34, -49.91],
      // γ Cen → σ Cen
      [185.34, -49.91, 186.73, -50.23]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 20. Cepheus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cep",
    name: "Cepheus",
    genitive: "Cephei",
    ra: 330,
    dec: 71,
    area: 588,
    brightestStar: "Alderamin",
    stickFigure: [
      // Alderamin (α Cep) → Alfirk (β Cep)
      [319.64, 62.59, 322.17, 70.56],
      // Alfirk → ι Cep (upper tip)
      [322.17, 70.56, 343.31, 66.2],
      // Alderamin → ζ Cep
      [319.64, 62.59, 333.19, 58.2],
      // ζ Cep → Errai (γ Cep)
      [333.19, 58.2, 354.84, 77.63],
      // Errai → ι Cep
      [354.84, 77.63, 343.31, 66.2],
      // ζ Cep → δ Cep
      [333.19, 58.2, 337.29, 58.42],
      // δ Cep → ε Cep
      [337.29, 58.42, 325.02, 57.05]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 21. Cetus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cet",
    name: "Cetus",
    genitive: "Ceti",
    ra: 25,
    dec: -10,
    area: 1231,
    brightestStar: "Diphda",
    stickFigure: [
      // Menkar (α Cet) → γ Cet
      [45.57, 4.09, 40.83, 3.24],
      // γ Cet → δ Cet
      [40.83, 3.24, 38.97, 0.33],
      // δ Cet → Mira (ο Cet)
      [38.97, 0.33, 34.84, -2.98],
      // Mira → ζ Cet
      [34.84, -2.98, 27.87, -10.18],
      // ζ Cet → τ Cet
      [27.87, -10.18, 26.02, -15.94],
      // Diphda (β Cet) → ι Cet
      [10.9, -17.99, 19.73, -8.82],
      // ι Cet → η Cet
      [19.73, -8.82, 17.15, -10.18],
      // η Cet → θ Cet
      [17.15, -10.18, 21.01, -8.18],
      // Menkar → λ Cet
      [45.57, 4.09, 44.57, 8.9],
      // Menkar → μ Cet
      [45.57, 4.09, 40.2, 10.11],
      // ι Cet → ζ Cet
      [19.73, -8.82, 27.87, -10.18]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 22. Chamaeleon
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cha",
    name: "Chamaeleon",
    genitive: "Chamaeleontis",
    ra: 168,
    dec: -79,
    area: 132,
    brightestStar: "Alpha Chamaeleontis",
    stickFigure: [
      // α Cha → θ Cha
      [124.63, -76.92, 125.6, -77.48],
      // θ Cha → γ Cha
      [125.6, -77.48, 161.3, -78.61],
      // γ Cha → δ² Cha
      [161.3, -78.61, 163.12, -80.54],
      // δ² Cha → β Cha
      [163.12, -80.54, 181.35, -79.31],
      // α Cha → ε Cha
      [124.63, -76.92, 178.8, -78.22]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 23. Circinus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cir",
    name: "Circinus",
    genitive: "Circini",
    ra: 225,
    dec: -64,
    area: 93,
    brightestStar: "Alpha Circini",
    stickFigure: [
      // α Cir → β Cir
      [220.33, -64.98, 228.08, -58.8],
      // β Cir → γ Cir
      [228.08, -58.8, 231.3, -59.32]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 24. Columba
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Col",
    name: "Columba",
    genitive: "Columbae",
    ra: 85,
    dec: -35,
    area: 270,
    brightestStar: "Phact",
    stickFigure: [
      // Phact (α Col) → Wazn (β Col)
      [84.91, -34.07, 87.74, -35.77],
      // Phact → ε Col
      [84.91, -34.07, 82.8, -35.47],
      // ε Col → η Col
      [82.8, -35.47, 81.12, -42.82],
      // Wazn → γ Col
      [87.74, -35.77, 85.19, -27.09],
      // Wazn → δ Col
      [87.74, -35.77, 92.24, -33.44]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 25. Coma Berenices
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Com",
    name: "Coma Berenices",
    genitive: "Comae Berenices",
    ra: 192,
    dec: 23,
    area: 386,
    brightestStar: "Beta Comae Berenices",
    stickFigure: [
      // β Com → α Com → γ Com
      [197.97, 27.88, 190.42, 17.53],
      [190.42, 17.53, 186.74, 28.27]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 26. Corona Australis
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "CrA",
    name: "Corona Australis",
    genitive: "Coronae Australis",
    ra: 280,
    dec: -41,
    area: 128,
    brightestStar: "Meridiana",
    stickFigure: [
      // Meridiana (α CrA) → β CrA
      [287.37, -37.9, 287.08, -39.34],
      // β CrA → δ CrA
      [287.08, -39.34, 284.04, -40.5],
      // δ CrA → γ CrA
      [284.04, -40.5, 285.43, -37.1],
      // γ CrA → Meridiana
      [285.43, -37.1, 287.37, -37.9],
      // β CrA → ε CrA
      [287.08, -39.34, 281.41, -37.06],
      // ε CrA → θ CrA
      [281.41, -37.06, 278.59, -42.31]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 27. Corona Borealis
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "CrB",
    name: "Corona Borealis",
    genitive: "Coronae Borealis",
    ra: 237,
    dec: 31,
    area: 179,
    brightestStar: "Alphecca",
    stickFigure: [
      // θ CrB → β CrB (Nusakan)
      [231.96, 31.36, 233.67, 29.11],
      // Nusakan → Alphecca (α CrB)
      [233.67, 29.11, 233.67, 26.71],
      // Alphecca → γ CrB
      [233.67, 26.71, 236.55, 26.3],
      // γ CrB → δ CrB
      [236.55, 26.3, 238.13, 26.07],
      // δ CrB → ε CrB
      [238.13, 26.07, 239.4, 26.88],
      // ε CrB → ι CrB
      [239.4, 26.88, 241.35, 29.85]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 28. Corvus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Crv",
    name: "Corvus",
    genitive: "Corvi",
    ra: 187,
    dec: -20,
    area: 184,
    brightestStar: "Gienah",
    stickFigure: [
      // Gienah (γ Crv) → δ Crv (Algorab)
      [183.95, -17.54, 187.47, -16.52],
      // Algorab → β Crv (Kraz)
      [187.47, -16.52, 188.6, -23.4],
      // Kraz → ε Crv (Minkar)
      [188.6, -23.4, 182.53, -22.62],
      // Minkar → Gienah
      [182.53, -22.62, 183.95, -17.54],
      // Gienah → α Crv (Alchiba)
      [183.95, -17.54, 182.1, -24.73]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 29. Crater
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Crt",
    name: "Crater",
    genitive: "Crateris",
    ra: 174,
    dec: -15,
    area: 282,
    brightestStar: "Labrum",
    stickFigure: [
      // Labrum (δ Crt) → γ Crt
      [174.17, -14.78, 171.22, -17.68],
      // γ Crt → ε Crt
      [171.22, -17.68, 167.65, -10.86],
      // ε Crt → θ Crt
      [167.65, -10.86, 167.92, -9.81],
      // Labrum → β Crt
      [174.17, -14.78, 167.91, -22.83],
      // β Crt → α Crt (Alkes)
      [167.91, -22.83, 164.94, -18.3],
      // Alkes → γ Crt
      [164.94, -18.3, 171.22, -17.68]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 30. Crux
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cru",
    name: "Crux",
    genitive: "Crucis",
    ra: 186,
    dec: -60,
    area: 68,
    brightestStar: "Acrux",
    stickFigure: [
      // Acrux (α Cru) → Gacrux (γ Cru)
      [186.65, -63.1, 187.79, -57.11],
      // Mimosa (β Cru) → δ Cru
      [191.93, -59.69, 183.79, -58.75]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 31. Cygnus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Cyg",
    name: "Cygnus",
    genitive: "Cygni",
    ra: 310,
    dec: 42,
    area: 804,
    brightestStar: "Deneb",
    stickFigure: [
      // Deneb (α Cyg) → Sadr (γ Cyg)
      [310.36, 45.28, 305.56, 40.26],
      // Sadr → Albireo (β Cyg)
      [305.56, 40.26, 292.68, 27.96],
      // Sadr → Fawaris (δ Cyg)
      [305.56, 40.26, 296.24, 45.13],
      // Sadr → Gienah (ε Cyg)
      [305.56, 40.26, 311.55, 33.97],
      // Fawaris → ι Cyg
      [296.24, 45.13, 291.63, 51.73],
      // Gienah → ζ Cyg
      [311.55, 33.97, 318.23, 30.23]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 32. Delphinus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Del",
    name: "Delphinus",
    genitive: "Delphini",
    ra: 309,
    dec: 13,
    area: 189,
    brightestStar: "Rotanev",
    stickFigure: [
      // Sualocin (α Del) → Rotanev (β Del)
      [309.39, 15.91, 309.18, 14.6],
      // Rotanev → δ Del
      [309.18, 14.6, 308.3, 11.3],
      // δ Del → γ Del
      [308.3, 11.3, 310.86, 16.12],
      // γ Del → Sualocin
      [310.86, 16.12, 309.39, 15.91],
      // δ Del → ε Del
      [308.3, 11.3, 307.47, 11.02]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 33. Dorado
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Dor",
    name: "Dorado",
    genitive: "Doradus",
    ra: 77,
    dec: -60,
    area: 179,
    brightestStar: "Alpha Doradus",
    stickFigure: [
      // α Dor → β Dor
      [68.5, -55.04, 83.41, -62.49],
      // β Dor → δ Dor
      [83.41, -62.49, 87.09, -65.74],
      // δ Dor → γ Dor
      [87.09, -65.74, 63.56, -51.07],
      // γ Dor → α Dor
      [63.56, -51.07, 68.5, -55.04]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 34. Draco
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Dra",
    name: "Draco",
    genitive: "Draconis",
    ra: 265,
    dec: 65,
    area: 1083,
    brightestStar: "Eltanin",
    stickFigure: [
      // λ Dra → κ Dra
      [172.85, 69.33, 188.37, 69.79],
      // κ Dra → α Dra (Thuban)
      [188.37, 69.79, 211.1, 64.38],
      // Thuban → ι Dra (Edasich)
      [211.1, 64.38, 231.23, 58.97],
      // Edasich → θ Dra
      [231.23, 58.97, 240.47, 58.56],
      // θ Dra → η Dra
      [240.47, 58.56, 245.99, 61.51],
      // η Dra → ζ Dra
      [245.99, 61.51, 257.2, 65.71],
      // ζ Dra → χ Dra
      [257.2, 65.71, 275.19, 72.73],
      // ζ Dra → δ Dra (Altais)
      [257.2, 65.71, 288.14, 67.66],
      // δ Dra → ε Dra (Tyl)
      [288.14, 67.66, 297.04, 70.27],
      // Eltanin (γ Dra) → β Dra (Rastaban)
      [269.15, 51.49, 262.61, 52.3],
      // Eltanin → ξ Dra
      [269.15, 51.49, 268.38, 56.87],
      // ξ Dra → ν Dra
      [268.38, 56.87, 262.05, 55.18],
      // Eltanin → ν² Dra
      [269.15, 51.49, 265.48, 51.99],
      // β Dra → ν Dra
      [262.61, 52.3, 262.05, 55.18]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 35. Equuleus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Equ",
    name: "Equuleus",
    genitive: "Equulei",
    ra: 318,
    dec: 8,
    area: 72,
    brightestStar: "Kitalpha",
    stickFigure: [
      // Kitalpha (α Equ) → δ Equ
      [318.96, 5.25, 318.48, 10.01],
      // δ Equ → γ Equ
      [318.48, 10.01, 316.34, 10.13]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 36. Eridanus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Eri",
    name: "Eridanus",
    genitive: "Eridani",
    ra: 55,
    dec: -30,
    area: 1138,
    brightestStar: "Achernar",
    stickFigure: [
      // Cursa (β Eri) → λ Eri
      [76.96, -5.09, 72.46, -8.75],
      // λ Eri → τ¹ Eri
      [72.46, -8.75, 68.89, -13.51],
      // τ¹ Eri → τ² Eri
      [68.89, -13.51, 66.01, -13.59],
      // τ² Eri → τ³ Eri
      [66.01, -13.59, 63.5, -13.51],
      // τ³ Eri → τ⁴ Eri
      [63.5, -13.51, 60.45, -13.17],
      // τ⁴ Eri → τ⁵ Eri
      [60.45, -13.17, 59.76, -12.1],
      // τ⁵ Eri → τ⁶ Eri
      [59.76, -12.1, 56.71, -12.1],
      // τ⁶ Eri → τ⁹ Eri (Angetenar)
      [56.71, -12.1, 49.88, -21],
      // τ⁹ Eri → υ¹ Eri
      [49.88, -21, 52.6, -29.77],
      // υ¹ Eri → 43 Eri
      [52.6, -29.77, 60.17, -34.02],
      // 43 Eri → υ² Eri
      [60.17, -34.02, 67.18, -33.8],
      // υ² Eri → ε Eri (Ran)
      [67.18, -33.8, 53.23, -9.46],
      // 43 Eri → θ¹ Eri (Acamar)
      [60.17, -34.02, 44.57, -40.3],
      // Acamar → φ Eri
      [44.57, -40.3, 32.58, -51.51],
      // φ Eri → χ Eri
      [32.58, -51.51, 28.99, -51.61],
      // χ Eri → Achernar (α Eri)
      [28.99, -51.61, 24.43, -57.24]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 37. Fornax
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "For",
    name: "Fornax",
    genitive: "Fornacis",
    ra: 39,
    dec: -32,
    area: 398,
    brightestStar: "Dalim",
    stickFigure: [
      // Dalim (α For) → β For
      [48.02, -28.99, 43.24, -32.41],
      // β For → ν For
      [43.24, -32.41, 31.94, -29.3]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 38. Gemini
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Gem",
    name: "Gemini",
    genitive: "Geminorum",
    ra: 102,
    dec: 23,
    area: 514,
    brightestStar: "Pollux",
    stickFigure: [
      // Pollux (β Gem) → Castor (α Gem)
      [116.33, 28.03, 113.65, 31.89],
      // Pollux → κ Gem
      [116.33, 28.03, 115.32, 24.4],
      // Castor → τ Gem
      [113.65, 31.89, 107.78, 30.25],
      // τ Gem → θ Gem
      [107.78, 30.25, 103.2, 33.96],
      // κ Gem → δ Gem (Wasat)
      [115.32, 24.4, 110.03, 21.98],
      // Wasat → ζ Gem (Mekbuda)
      [110.03, 21.98, 106.03, 20.57],
      // Mekbuda → γ Gem (Alhena)
      [106.03, 20.57, 99.43, 16.4],
      // Alhena → ξ Gem
      [99.43, 16.4, 101.32, 12.9],
      // Alhena → μ Gem (Tejat)
      [99.43, 16.4, 95.74, 22.51],
      // Tejat → ε Gem (Mebsuta)
      [95.74, 22.51, 100.98, 25.13],
      // Mebsuta → τ Gem
      [100.98, 25.13, 107.78, 30.25],
      // Tejat → η Gem (Propus)
      [95.74, 22.51, 93.72, 22.51]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 39. Grus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Gru",
    name: "Grus",
    genitive: "Gruis",
    ra: 340,
    dec: -46,
    area: 366,
    brightestStar: "Alnair",
    stickFigure: [
      // Alnair (α Gru) → β Gru (Tiaki)
      [332.06, -46.96, 340.67, -46.88],
      // Tiaki → ε Gru
      [340.67, -46.88, 342.04, -51.32],
      // ε Gru → ζ Gru
      [342.04, -51.32, 345.67, -52.75],
      // ζ Gru → ι Gru
      [345.67, -52.75, 348.09, -45.25],
      // Alnair → δ¹ Gru
      [332.06, -46.96, 332.94, -43.5],
      // δ¹ Gru → μ Gru
      [332.94, -43.5, 337.39, -41.35],
      // μ Gru → λ Gru
      [337.39, -41.35, 332.64, -39.54],
      // Alnair → γ Gru
      [332.06, -46.96, 328.48, -37.36]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 40. Hercules
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Her",
    name: "Hercules",
    genitive: "Herculis",
    ra: 258,
    dec: 30,
    area: 1225,
    brightestStar: "Kornephoros",
    stickFigure: [
      // Kornephoros (β Her) → ζ Her
      [247.55, 21.49, 250.32, 31.6],
      // ζ Her → η Her (Sophian)
      [250.32, 31.6, 253.09, 38.92],
      // η Her → σ Her
      [253.09, 38.92, 248.97, 42.44],
      // η Her → π Her
      [253.09, 38.92, 258.76, 36.81],
      // π Her → ε Her
      [258.76, 36.81, 255.07, 30.93],
      // ε Her → ζ Her (Keystone)
      [255.07, 30.93, 250.32, 31.6],
      // ε Her → δ Her (Sarin)
      [255.07, 30.93, 263.77, 24.84],
      // Sarin → α Her (Rasalgethi)
      [263.77, 24.84, 258.66, 14.39],
      // Kornephoros → γ Her
      [247.55, 21.49, 245.48, 19.15],
      // π Her → ρ Her
      [258.76, 36.81, 262.78, 37.15],
      // Sarin → λ Her (Maasym)
      [263.77, 24.84, 266.6, 26.11],
      // Maasym → μ Her
      [266.6, 26.11, 270.95, 27.72],
      // σ Her → τ Her
      [248.97, 42.44, 243.59, 46.31]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 41. Horologium
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Hor",
    name: "Horologium",
    genitive: "Horologii",
    ra: 48,
    dec: -53,
    area: 249,
    brightestStar: "Alpha Horologii",
    stickFigure: [
      // α Hor → η Hor
      [63.5, -42.29, 41.49, -52.54],
      // η Hor → ζ Hor
      [41.49, -52.54, 40.16, -54.55],
      // ζ Hor → μ Hor
      [40.16, -54.55, 46.19, -59.74],
      // μ Hor → β Hor
      [46.19, -59.74, 42.08, -64.07]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 42. Hydra
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Hya",
    name: "Hydra",
    genitive: "Hydrae",
    ra: 170,
    dec: -20,
    area: 1303,
    brightestStar: "Alphard",
    stickFigure: [
      // Head: ζ Hya → ε Hya
      [127.57, -5.7, 130.81, 6.42],
      // ε Hya → δ Hya
      [130.81, 6.42, 128.91, 5.7],
      // δ Hya → σ Hya
      [128.91, 5.7, 127.98, 3.34],
      // σ Hya → η Hya
      [127.98, 3.34, 130.06, 3.4],
      // ζ Hya → θ Hya
      [127.57, -5.7, 139.76, -8.66],
      // θ Hya → ι Hya
      [139.76, -8.66, 144.96, -1.14],
      // ι Hya → Alphard (α Hya)
      [144.96, -1.14, 141.9, -8.66],
      // Alphard → υ¹ Hya
      [141.9, -8.66, 147.87, -14.85],
      // υ¹ Hya → λ Hya
      [147.87, -14.85, 152.65, -12.35],
      // λ Hya → μ Hya
      [152.65, -12.35, 159.86, -16.84],
      // μ Hya → ν Hya
      [159.86, -16.84, 164.72, -19.07],
      // ν Hya → ξ Hya
      [164.72, -19.07, 172.85, -23.28],
      // ξ Hya → β Hya
      [172.85, -23.28, 177.26, -33.91],
      // β Hya → γ Hya
      [177.26, -33.91, 199.73, -23.17],
      // γ Hya → π Hya
      [199.73, -23.17, 213.22, -26.68]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 43. Hydrus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Hyi",
    name: "Hydrus",
    genitive: "Hydri",
    ra: 30,
    dec: -72,
    area: 243,
    brightestStar: "Beta Hydri",
    stickFigure: [
      // α Hyi → β Hyi
      [29.69, -61.57, 6.43, -77.25],
      // β Hyi → γ Hyi
      [6.43, -77.25, 59.1, -74.24],
      // γ Hyi → α Hyi
      [59.1, -74.24, 29.69, -61.57]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 44. Indus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Ind",
    name: "Indus",
    genitive: "Indi",
    ra: 315,
    dec: -55,
    area: 294,
    brightestStar: "The Persian",
    stickFigure: [
      // The Persian (α Ind) → β Ind
      [309.39, -47.29, 314.41, -58.45],
      // β Ind → δ Ind
      [314.41, -58.45, 320.93, -54.99],
      // The Persian → θ Ind
      [309.39, -47.29, 320.62, -53.45],
      // θ Ind → δ Ind
      [320.62, -53.45, 320.93, -54.99]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 45. Lacerta
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Lac",
    name: "Lacerta",
    genitive: "Lacertae",
    ra: 337,
    dec: 46,
    area: 201,
    brightestStar: "Alpha Lacertae",
    stickFigure: [
      // α Lac → β Lac
      [337.82, 50.28, 335.25, 52.23],
      // β Lac → 4 Lac
      [335.25, 52.23, 335.5, 49.48],
      // 4 Lac → 5 Lac
      [335.5, 49.48, 336.83, 47.71],
      // 5 Lac → 2 Lac
      [336.83, 47.71, 338, 46.54],
      // 2 Lac → 6 Lac
      [338, 46.54, 339.44, 43.12],
      // 6 Lac → 1 Lac
      [339.44, 43.12, 337.13, 37.75]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 46. Leo
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Leo",
    name: "Leo",
    genitive: "Leonis",
    ra: 161,
    dec: 17,
    area: 947,
    brightestStar: "Regulus",
    stickFigure: [
      // Regulus (α Leo) → η Leo
      [152.09, 11.97, 151.83, 16.76],
      // η Leo → Algieba (γ1 Leo)
      [151.83, 16.76, 154.99, 19.84],
      // Algieba → ζ Leo (Adhafera)
      [154.99, 19.84, 154.17, 23.42],
      // Adhafera → μ Leo (Rasalas)
      [154.17, 23.42, 148.19, 26.01],
      // Rasalas → ε Leo
      [148.19, 26.01, 146.46, 23.77],
      // ε Leo → η Leo (Sickle)
      [146.46, 23.77, 151.83, 16.76],
      // Algieba → δ Leo (Zosma)
      [154.99, 19.84, 168.53, 20.52],
      // Zosma → Denebola (β Leo)
      [168.53, 20.52, 177.27, 14.57],
      // Zosma → θ Leo (Chertan)
      [168.53, 20.52, 168.56, 15.43],
      // Chertan → Regulus
      [168.56, 15.43, 152.09, 11.97]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 47. Leo Minor
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "LMi",
    name: "Leo Minor",
    genitive: "Leonis Minoris",
    ra: 158,
    dec: 33,
    area: 232,
    brightestStar: "Praecipua",
    stickFigure: [
      // Praecipua (46 LMi) → β LMi
      [160.72, 34.21, 155.43, 36.71],
      // β LMi → 21 LMi
      [155.43, 36.71, 150.39, 35.25],
      // 21 LMi → 10 LMi
      [150.39, 35.25, 142.93, 36.4]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 48. Lepus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Lep",
    name: "Lepus",
    genitive: "Leporis",
    ra: 82,
    dec: -20,
    area: 290,
    brightestStar: "Arneb",
    stickFigure: [
      // Arneb (α Lep) → Nihal (β Lep)
      [83.18, -17.82, 82.06, -20.76],
      // Nihal → ε Lep
      [82.06, -20.76, 78.23, -22.37],
      // ε Lep → μ Lep
      [78.23, -22.37, 75.85, -16.21],
      // μ Lep → Arneb
      [75.85, -16.21, 83.18, -17.82],
      // Arneb → ζ Lep
      [83.18, -17.82, 86.74, -14.82],
      // Nihal → γ Lep
      [82.06, -20.76, 86.12, -22.45],
      // γ Lep → δ Lep
      [86.12, -22.45, 87.58, -20.88],
      // ζ Lep → η Lep
      [86.74, -14.82, 84.23, -14.17]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 49. Libra
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Lib",
    name: "Libra",
    genitive: "Librae",
    ra: 229,
    dec: -16,
    area: 538,
    brightestStar: "Zubeneschamali",
    stickFigure: [
      // Zubenelgenubi (α² Lib) → Zubeneschamali (β Lib)
      [222.72, -16.04, 229.25, -9.38],
      // Zubeneschamali → γ Lib
      [229.25, -9.38, 233.88, -14.79],
      // γ Lib → Zubenelgenubi
      [233.88, -14.79, 222.72, -16.04],
      // γ Lib → υ Lib
      [233.88, -14.79, 237.96, -28.13],
      // Zubeneschamali → σ Lib (Brachium)
      [229.25, -9.38, 239.71, -25.28]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 50. Lupus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Lup",
    name: "Lupus",
    genitive: "Lupi",
    ra: 233,
    dec: -42,
    area: 334,
    brightestStar: "Alpha Lupi",
    stickFigure: [
      // α Lup → β Lup
      [220.48, -47.39, 224.63, -43.13],
      // β Lup → δ Lup
      [224.63, -43.13, 230.67, -40.65],
      // δ Lup → γ Lup
      [230.67, -40.65, 233.79, -41.17],
      // γ Lup → ε Lup
      [233.79, -41.17, 231.26, -44.69],
      // ε Lup → α Lup
      [231.26, -44.69, 220.48, -47.39],
      // ε Lup → ζ Lup
      [231.26, -44.69, 228.07, -52.1],
      // ζ Lup → η Lup
      [228.07, -52.1, 237.84, -38.4],
      // δ Lup → φ¹ Lup
      [230.67, -40.65, 234.51, -36.26]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 51. Lynx
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Lyn",
    name: "Lynx",
    genitive: "Lyncis",
    ra: 118,
    dec: 46,
    area: 545,
    brightestStar: "Alpha Lyncis",
    stickFigure: [
      // α Lyn → 38 Lyn
      [137.5, 34.39, 139.71, 36.8],
      // 38 Lyn → 31 Lyn
      [139.71, 36.8, 123.38, 43.19],
      // 31 Lyn → 21 Lyn
      [123.38, 43.19, 108.95, 49.21],
      // 21 Lyn → 15 Lyn
      [108.95, 49.21, 101.19, 58.42],
      // 15 Lyn → 2 Lyn
      [101.19, 58.42, 97.74, 59.01]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 52. Lyra
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Lyr",
    name: "Lyra",
    genitive: "Lyrae",
    ra: 284,
    dec: 37,
    area: 286,
    brightestStar: "Vega",
    stickFigure: [
      // Vega (α Lyr) → ε² Lyr
      [279.23, 38.78, 281.08, 39.67],
      // Vega → ζ Lyr
      [279.23, 38.78, 281.19, 37.61],
      // ζ Lyr → Sheliak (β Lyr)
      [281.19, 37.61, 282.52, 33.36],
      // Sheliak → γ Lyr (Sulafat)
      [282.52, 33.36, 284.74, 32.69],
      // Sulafat → δ² Lyr
      [284.74, 32.69, 283.63, 36.9],
      // δ² Lyr → ζ Lyr
      [283.63, 36.9, 281.19, 37.61]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 53. Mensa
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Men",
    name: "Mensa",
    genitive: "Mensae",
    ra: 83,
    dec: -77,
    area: 153,
    brightestStar: "Alpha Mensae",
    stickFigure: [
      // α Men → γ Men
      [92.06, -74.75, 86.31, -76.34],
      // γ Men → η Men
      [86.31, -76.34, 74.94, -74.95],
      // η Men → β Men
      [74.94, -74.95, 75.77, -71.31]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 54. Microscopium
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Mic",
    name: "Microscopium",
    genitive: "Microscopii",
    ra: 315,
    dec: -37,
    area: 210,
    brightestStar: "Gamma Microscopii",
    stickFigure: [
      // γ Mic → ε Mic
      [318.95, -32.17, 321.53, -32.17],
      // ε Mic → α Mic
      [321.53, -32.17, 312.81, -33.78],
      // α Mic → θ¹ Mic
      [312.81, -33.78, 318.6, -40.81]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 55. Monoceros
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Mon",
    name: "Monoceros",
    genitive: "Monocerotis",
    ra: 107,
    dec: -4,
    area: 482,
    brightestStar: "Beta Monocerotis",
    stickFigure: [
      // α Mon → ζ Mon
      [115.31, -9.55, 122.15, -2.98],
      // ζ Mon → δ Mon
      [122.15, -2.98, 107.97, -0.49],
      // δ Mon → β Mon
      [107.97, -0.49, 97.2, -7.03],
      // β Mon → γ Mon
      [97.2, -7.03, 93.71, -6.27],
      // δ Mon → 18 Mon
      [107.97, -0.49, 101, 2.41],
      // 18 Mon → ε Mon
      [101, 2.41, 95.07, 4.59],
      // α Mon → ε Mon
      [115.31, -9.55, 95.07, 4.59]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 56. Musca
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Mus",
    name: "Musca",
    genitive: "Muscae",
    ra: 188,
    dec: -70,
    area: 138,
    brightestStar: "Alpha Muscae",
    stickFigure: [
      // α Mus → β Mus
      [189.3, -69.14, 191.57, -68.11],
      // β Mus → δ Mus
      [191.57, -68.11, 195.65, -71.55],
      // δ Mus → γ Mus
      [195.65, -71.55, 189.47, -72.13],
      // γ Mus → α Mus
      [189.47, -72.13, 189.3, -69.14],
      // α Mus → ε Mus
      [189.3, -69.14, 184.19, -67.96],
      // ε Mus → λ Mus
      [184.19, -67.96, 177.79, -66.73]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 57. Norma
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Nor",
    name: "Norma",
    genitive: "Normae",
    ra: 241,
    dec: -50,
    area: 165,
    brightestStar: "Gamma2 Normae",
    stickFigure: [
      // γ² Nor → ε Nor
      [242.67, -50.15, 245.14, -47.55],
      // ε Nor → δ Nor
      [245.14, -47.55, 240.14, -45.17],
      // δ Nor → η Nor
      [240.14, -45.17, 243.59, -49.23],
      // η Nor → γ² Nor
      [243.59, -49.23, 242.67, -50.15]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 58. Octans
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Oct",
    name: "Octans",
    genitive: "Octantis",
    ra: 330,
    dec: -83,
    area: 291,
    brightestStar: "Nu Octantis",
    stickFigure: [
      // ν Oct → β Oct
      [325.37, -77.39, 340.79, -81.38],
      // β Oct → δ Oct
      [340.79, -81.38, 218.98, -83.67],
      // δ Oct → ν Oct
      [218.98, -83.67, 325.37, -77.39]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 59. Ophiuchus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Oph",
    name: "Ophiuchus",
    genitive: "Ophiuchi",
    ra: 258,
    dec: -4,
    area: 948,
    brightestStar: "Rasalhague",
    stickFigure: [
      // Rasalhague (α Oph) → κ Oph
      [263.73, 12.56, 262.69, 9.37],
      // κ Oph → δ Oph (Yed Prior)
      [262.69, 9.37, 243.59, -3.69],
      // Yed Prior → ε Oph (Yed Posterior)
      [243.59, -3.69, 244.58, -4.69],
      // ε Oph → ζ Oph
      [244.58, -4.69, 249.29, -10.57],
      // ζ Oph → η Oph (Sabik)
      [249.29, -10.57, 257.59, -15.72],
      // Sabik → θ Oph
      [257.59, -15.72, 264.33, -25],
      // Rasalhague → β Oph (Cebalrai)
      [263.73, 12.56, 265.87, 4.57],
      // Cebalrai → γ Oph
      [265.87, 4.57, 264.4, 2.71],
      // Cebalrai → η Oph
      [265.87, 4.57, 257.59, -15.72],
      // ν Oph → Cebalrai
      [266.97, -9.77, 265.87, 4.57]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 60. Orion
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Ori",
    name: "Orion",
    genitive: "Orionis",
    ra: 82,
    dec: 3,
    area: 594,
    brightestStar: "Rigel",
    stickFigure: [
      // Betelgeuse (α Ori) → Bellatrix (γ Ori)
      [88.79, 7.41, 81.28, 6.35],
      // Betelgeuse → Meissa (λ Ori)
      [88.79, 7.41, 83.78, 9.93],
      // Bellatrix → Meissa
      [81.28, 6.35, 83.78, 9.93],
      // Betelgeuse → Alnitak (ζ Ori)
      [88.79, 7.41, 85.19, -1.94],
      // Bellatrix → Mintaka (δ Ori)
      [81.28, 6.35, 83, -0.3],
      // Mintaka → Alnilam (ε Ori)
      [83, -0.3, 84.05, -1.2],
      // Alnilam → Alnitak (ζ Ori)
      [84.05, -1.2, 85.19, -1.94],
      // Alnitak → Saiph (κ Ori)
      [85.19, -1.94, 86.94, -9.67],
      // Mintaka → Rigel (β Ori)
      [83, -0.3, 78.63, -8.2],
      // Rigel → Saiph
      [78.63, -8.2, 86.94, -9.67],
      // Betelgeuse → μ Ori
      [88.79, 7.41, 90.6, 9.65]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 61. Pavo
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Pav",
    name: "Pavo",
    genitive: "Pavonis",
    ra: 290,
    dec: -65,
    area: 378,
    brightestStar: "Peacock",
    stickFigure: [
      // Peacock (α Pav) → δ Pav
      [306.41, -56.74, 300.14, -66.18],
      // δ Pav → β Pav
      [300.14, -66.18, 311.24, -66.2],
      // β Pav → ε Pav
      [311.24, -66.2, 300.19, -72.91],
      // ε Pav → ζ Pav
      [300.19, -72.91, 282.46, -71.43],
      // ζ Pav → η Pav
      [282.46, -71.43, 263.4, -64.72],
      // η Pav → ξ Pav
      [263.4, -64.72, 274.16, -61.49],
      // ξ Pav → λ Pav
      [274.16, -61.49, 284.33, -62.19],
      // λ Pav → δ Pav
      [284.33, -62.19, 300.14, -66.18],
      // Peacock → γ Pav
      [306.41, -56.74, 320.72, -65.37]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 62. Pegasus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Peg",
    name: "Pegasus",
    genitive: "Pegasi",
    ra: 340,
    dec: 18,
    area: 1121,
    brightestStar: "Enif",
    stickFigure: [
      // Great Square: Markab (α Peg) → Scheat (β Peg)
      [346.19, 15.21, 345.94, 28.08],
      // Scheat → Matar (η Peg)
      [345.94, 28.08, 340.75, 30.22],
      // Markab → Algenib (γ Peg)
      [346.19, 15.21, 3.31, 15.18],
      // Algenib → Alpheratz (α And) [shared star]
      [3.31, 15.18, 2.07, 29.09],
      // Alpheratz → Scheat
      [2.07, 29.09, 345.94, 28.08],
      // Scheat → μ Peg
      [345.94, 28.08, 340.37, 24.6],
      // μ Peg → λ Peg
      [340.37, 24.6, 339.79, 23.57],
      // Markab → Enif (ε Peg)
      [346.19, 15.21, 326.05, 9.88],
      // Enif → Baham (θ Peg)
      [326.05, 9.88, 326.93, 6.2],
      // Enif → Homam (ζ Peg)
      [326.05, 9.88, 340.75, 10.83],
      // Enif → κ Peg
      [326.05, 9.88, 322.88, 25.65]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 63. Perseus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Per",
    name: "Perseus",
    genitive: "Persei",
    ra: 51,
    dec: 45,
    area: 615,
    brightestStar: "Mirfak",
    stickFigure: [
      // Mirfak (α Per) → δ Per
      [51.08, 49.86, 54.74, 47.79],
      // δ Per → ε Per
      [54.74, 47.79, 57.29, 40.01],
      // ε Per → ξ Per (Menkib)
      [57.29, 40.01, 59.46, 35.79],
      // ξ Per → ζ Per
      [59.46, 35.79, 58.53, 31.88],
      // Mirfak → γ Per
      [51.08, 49.86, 46.2, 53.51],
      // γ Per → τ Per
      [46.2, 53.51, 42.93, 52.76],
      // Mirfak → κ Per
      [51.08, 49.86, 47.37, 44.86],
      // κ Per → Algol (β Per)
      [47.37, 44.86, 47.04, 40.96],
      // Algol → ρ Per (Gorgonea Tertia)
      [47.04, 40.96, 46.79, 38.84],
      // ρ Per → 16 Per
      [46.79, 38.84, 42.29, 38.32],
      // Mirfak → η Per (Miram)
      [51.08, 49.86, 42.67, 55.9]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 64. Phoenix
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Phe",
    name: "Phoenix",
    genitive: "Phoenicis",
    ra: 20,
    dec: -48,
    area: 469,
    brightestStar: "Ankaa",
    stickFigure: [
      // Ankaa (α Phe) → β Phe
      [6.57, -42.31, 16.52, -46.72],
      // β Phe → γ Phe
      [16.52, -46.72, 22.09, -43.32],
      // γ Phe → δ Phe
      [22.09, -43.32, 24.49, -49.07],
      // δ Phe → ζ Phe
      [24.49, -49.07, 16.73, -55.25],
      // ζ Phe → β Phe
      [16.73, -55.25, 16.52, -46.72],
      // γ Phe → Ankaa
      [22.09, -43.32, 6.57, -42.31],
      // Ankaa → ε Phe
      [6.57, -42.31, 1.27, -45.75],
      // Ankaa → κ Phe
      [6.57, -42.31, 1.69, -43.68]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 65. Pictor
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Pic",
    name: "Pictor",
    genitive: "Pictoris",
    ra: 83,
    dec: -53,
    area: 247,
    brightestStar: "Alpha Pictoris",
    stickFigure: [
      // α Pic → β Pic
      [102.05, -61.94, 86.82, -51.07],
      // β Pic → γ Pic
      [86.82, -51.07, 80.07, -56.17]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 66. Pisces
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Psc",
    name: "Pisces",
    genitive: "Piscium",
    ra: 6,
    dec: 13,
    area: 889,
    brightestStar: "Alpherg",
    stickFigure: [
      // Alpherg (η Psc) → ο Psc
      [22.87, 15.35, 26.35, 9.16],
      // ο Psc → α Psc (Alrescha)
      [26.35, 9.16, 30.51, 2.76],
      // Alrescha → ξ Psc
      [30.51, 2.76, 27.31, 3.19],
      // ξ Psc → ν Psc
      [27.31, 3.19, 23.36, 5.63],
      // ν Psc → μ Psc
      [23.36, 5.63, 22.15, 6.14],
      // Alpherg → γ Psc
      [22.87, 15.35, 352.49, 3.28],
      // γ Psc → κ Psc
      [352.49, 3.28, 351.73, 1.26],
      // κ Psc → λ Psc
      [351.73, 1.26, 354.99, 1.78],
      // λ Psc → ι Psc
      [354.99, 1.78, 352.77, 5.63],
      // ι Psc → θ Psc
      [352.77, 5.63, 349.29, 6.38],
      // θ Psc → γ Psc
      [349.29, 6.38, 352.49, 3.28]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 67. Piscis Austrinus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "PsA",
    name: "Piscis Austrinus",
    genitive: "Piscis Austrini",
    ra: 338,
    dec: -31,
    area: 245,
    brightestStar: "Fomalhaut",
    stickFigure: [
      // Fomalhaut (α PsA) → δ PsA
      [344.41, -29.62, 340.16, -32.54],
      // δ PsA → γ PsA
      [340.16, -32.54, 336.15, -32.88],
      // γ PsA → β PsA
      [336.15, -32.88, 334.01, -32.35],
      // β PsA → μ PsA
      [334.01, -32.35, 332.1, -32.99],
      // Fomalhaut → ε PsA
      [344.41, -29.62, 340.24, -27.04],
      // ε PsA → ι PsA
      [340.24, -27.04, 324.6, -33.03],
      // μ PsA → ι PsA
      [332.1, -32.99, 324.6, -33.03]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 68. Puppis
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Pup",
    name: "Puppis",
    genitive: "Puppis",
    ra: 120,
    dec: -33,
    area: 673,
    brightestStar: "Naos",
    stickFigure: [
      // Naos (ζ Pup) → ρ Pup
      [120.9, -40, 121.89, -24.3],
      // ρ Pup → ξ Pup
      [121.89, -24.3, 113.98, -24.86],
      // ξ Pup → ν Pup
      [113.98, -24.86, 100.6, -43.2],
      // ν Pup → τ Pup
      [100.6, -43.2, 99.44, -50.61],
      // Naos → π Pup
      [120.9, -40, 112.31, -37.1],
      // π Pup → ν Pup
      [112.31, -37.1, 100.6, -43.2],
      // π Pup → σ Pup
      [112.31, -37.1, 112.16, -43.3],
      // Naos → L² Pup
      [120.9, -40, 114.71, -44.64]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 69. Pyxis
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Pyx",
    name: "Pyxis",
    genitive: "Pyxidis",
    ra: 133,
    dec: -28,
    area: 221,
    brightestStar: "Alpha Pyxidis",
    stickFigure: [
      // α Pyx → β Pyx
      [130.9, -33.19, 131.67, -35.31],
      // β Pyx → γ Pyx
      [131.67, -35.31, 132.63, -27.71]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 70. Reticulum
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Ret",
    name: "Reticulum",
    genitive: "Reticuli",
    ra: 58,
    dec: -62,
    area: 114,
    brightestStar: "Alpha Reticuli",
    stickFigure: [
      // α Ret → β Ret
      [63.61, -62.47, 55.78, -64.81],
      // β Ret → δ Ret
      [55.78, -64.81, 56.62, -59.3],
      // δ Ret → ε Ret
      [56.62, -59.3, 65.11, -59.3],
      // ε Ret → α Ret
      [65.11, -59.3, 63.61, -62.47]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 71. Sagitta
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Sge",
    name: "Sagitta",
    genitive: "Sagittae",
    ra: 297,
    dec: 18,
    area: 80,
    brightestStar: "Gamma Sagittae",
    stickFigure: [
      // γ Sge → δ Sge
      [299.69, 19.49, 296.85, 18.53],
      // δ Sge → α Sge (Sham)
      [296.85, 18.53, 295.02, 18.01],
      // δ Sge → β Sge
      [296.85, 18.53, 295.22, 17.48]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 72. Sagittarius
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Sgr",
    name: "Sagittarius",
    genitive: "Sagittarii",
    ra: 283,
    dec: -28,
    area: 867,
    brightestStar: "Kaus Australis",
    stickFigure: [
      // Kaus Australis (ε Sgr) → Kaus Media (δ Sgr)
      [276.04, -34.38, 275.25, -29.83],
      // Kaus Media → Kaus Borealis (λ Sgr)
      [275.25, -29.83, 276.99, -25.42],
      // Kaus Media → γ² Sgr (Alnasl)
      [275.25, -29.83, 271.45, -30.42],
      // Kaus Australis → η Sgr
      [276.04, -34.38, 274.41, -36.76],
      // Kaus Borealis → φ Sgr
      [276.99, -25.42, 281.41, -27.05],
      // φ Sgr → Nunki (σ Sgr)
      [281.41, -27.05, 283.82, -26.3],
      // Nunki → τ Sgr
      [283.82, -26.3, 286.74, -27.67],
      // Nunki → Ascella (ζ Sgr)
      [283.82, -26.3, 285.65, -29.88],
      // Ascella → τ Sgr
      [285.65, -29.88, 286.74, -27.67],
      // Ascella → ε Sgr
      [285.65, -29.88, 276.04, -34.38],
      // φ Sgr → δ Sgr
      [281.41, -27.05, 275.25, -29.83],
      // Kaus Borealis → μ Sgr
      [276.99, -25.42, 274.51, -21.06]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 73. Scorpius
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Sco",
    name: "Scorpius",
    genitive: "Scorpii",
    ra: 252,
    dec: -30,
    area: 497,
    brightestStar: "Antares",
    stickFigure: [
      // Antares (α Sco) → σ Sco (Alniyat)
      [247.35, -26.43, 245.15, -25.59],
      // σ Sco → Dschubba (δ Sco)
      [245.15, -25.59, 240.08, -22.62],
      // Dschubba → Acrab (β1 Sco)
      [240.08, -22.62, 241.36, -19.81],
      // Dschubba → π Sco (Fang)
      [240.08, -22.62, 239.71, -26.11],
      // Fang → ρ Sco
      [239.71, -26.11, 239.22, -29.21],
      // Antares → τ Sco (Paikauhale)
      [247.35, -26.43, 248.97, -28.22],
      // τ Sco → ε Sco (Larawag)
      [248.97, -28.22, 252.54, -34.29],
      // Larawag → μ1 Sco (Xamidimura)
      [252.54, -34.29, 253.08, -38.05],
      // Xamidimura → ζ¹ Sco
      [253.08, -38.05, 253.5, -42.36],
      // ζ¹ Sco → η Sco
      [253.5, -42.36, 258.04, -43.24],
      // η Sco → Sargas (θ Sco)
      [258.04, -43.24, 264.33, -43],
      // Sargas → ι¹ Sco
      [264.33, -43, 266.89, -40.13],
      // ι¹ Sco → κ Sco (Girtab)
      [266.89, -40.13, 265.62, -39.03],
      // Sargas → Shaula (λ Sco)
      [264.33, -43, 263.4, -37.1],
      // Shaula → υ Sco (Lesath)
      [263.4, -37.1, 262.69, -37.3]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 74. Sculptor
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Scl",
    name: "Sculptor",
    genitive: "Sculptoris",
    ra: 10,
    dec: -33,
    area: 475,
    brightestStar: "Alpha Sculptoris",
    stickFigure: [
      // α Scl → ι Scl
      [14.52, -29.36, 3.66, -28.98],
      // ι Scl → δ Scl
      [3.66, -28.98, 358.77, -28.13],
      // δ Scl → γ Scl
      [358.77, -28.13, 347, -32.53],
      // α Scl → β Scl
      [14.52, -29.36, 354.81, -37.82]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 75. Scutum
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Sct",
    name: "Scutum",
    genitive: "Scuti",
    ra: 280,
    dec: -10,
    area: 109,
    brightestStar: "Alpha Scuti",
    stickFigure: [
      // α Sct → β Sct
      [280.73, -8.24, 281.79, -4.75],
      // β Sct → δ Sct
      [281.79, -4.75, 281.57, -9.05],
      // δ Sct → ε Sct
      [281.57, -9.05, 278.68, -8.31],
      // ε Sct → α Sct
      [278.68, -8.31, 280.73, -8.24],
      // δ Sct → γ Sct
      [281.57, -9.05, 277.03, -14.57]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 76. Serpens (Caput + Cauda treated as one)
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Ser",
    name: "Serpens",
    genitive: "Serpentis",
    ra: 248,
    dec: 7,
    area: 637,
    brightestStar: "Unukalhai",
    stickFigure: [
      // Serpens Caput:
      // Unukalhai (α Ser) → δ Ser
      [236.07, 6.43, 233.7, 10.54],
      // δ Ser → β Ser
      [233.7, 10.54, 236.59, 15.42],
      // β Ser → γ Ser
      [236.59, 15.42, 239.11, 15.66],
      // γ Ser → κ Ser
      [239.11, 15.66, 237.19, 18.14],
      // Unukalhai → ε Ser
      [236.07, 6.43, 234.1, 4.48],
      // ε Ser → μ Ser
      [234.1, 4.48, 234.73, -3.43],
      // Unukalhai → μ Ser
      [236.07, 6.43, 234.73, -3.43],
      // Serpens Cauda:
      // ξ Ser → η Ser
      [267.46, -15.4, 275.33, -2.9],
      // η Ser → θ1 Ser
      [275.33, -2.9, 281.83, 4.2],
      // θ1 Ser → ν Ser
      [281.83, 4.2, 279.02, -12.85]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 77. Sextans
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Sex",
    name: "Sextans",
    genitive: "Sextantis",
    ra: 152,
    dec: -3,
    area: 314,
    brightestStar: "Alpha Sextantis",
    stickFigure: [
      // α Sex → γ Sex
      [150.28, -0.37, 148.51, -8.1],
      // γ Sex → β Sex
      [148.51, -8.1, 156.73, -0.64],
      // β Sex → α Sex
      [156.73, -0.64, 150.28, -0.37]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 78. Taurus
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Tau",
    name: "Taurus",
    genitive: "Tauri",
    ra: 65,
    dec: 18,
    area: 797,
    brightestStar: "Aldebaran",
    stickFigure: [
      // Aldebaran (α Tau) → θ² Tau (Hyades)
      [68.98, 16.51, 67.17, 15.87],
      // θ² Tau → γ Tau (Prima Hyadum)
      [67.17, 15.87, 64.95, 15.63],
      // Prima Hyadum → δ¹ Tau (Secunda Hyadum)
      [64.95, 15.63, 65.73, 17.54],
      // Secunda Hyadum → ε Tau (Ain)
      [65.73, 17.54, 67.15, 19.18],
      // Ain → Elnath (β Tau)
      [67.15, 19.18, 81.57, 28.61],
      // Aldebaran → ζ Tau (Tianguan)
      [68.98, 16.51, 84.41, 21.14],
      // Tianguan → Elnath
      [84.41, 21.14, 81.57, 28.61],
      // γ Tau → λ Tau
      [64.95, 15.63, 60.17, 12.49],
      // λ Tau → ξ Tau
      [60.17, 12.49, 50.7, 9.73]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 79. Telescopium
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Tel",
    name: "Telescopium",
    genitive: "Telescopii",
    ra: 272,
    dec: -50,
    area: 252,
    brightestStar: "Alpha Telescopii",
    stickFigure: [
      // α Tel → ζ Tel
      [271.36, -45.97, 273.14, -49.07],
      // ζ Tel → ε Tel
      [273.14, -49.07, 270.19, -45.95]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 80. Triangulum
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Tri",
    name: "Triangulum",
    genitive: "Trianguli",
    ra: 32,
    dec: 32,
    area: 132,
    brightestStar: "Mothallah",
    stickFigure: [
      // Mothallah (α Tri) → β Tri
      [28.27, 29.58, 31.1, 34.99],
      // β Tri → γ Tri
      [31.1, 34.99, 34.54, 33.85],
      // γ Tri → Mothallah
      [34.54, 33.85, 28.27, 29.58]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 81. Triangulum Australe
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "TrA",
    name: "Triangulum Australe",
    genitive: "Trianguli Australis",
    ra: 242,
    dec: -65,
    area: 110,
    brightestStar: "Atria",
    stickFigure: [
      // Atria (α TrA) → β TrA
      [252.17, -69.03, 238.19, -63.43],
      // β TrA → γ TrA
      [238.19, -63.43, 237.39, -68.68],
      // γ TrA → Atria
      [237.39, -68.68, 252.17, -69.03]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 82. Tucana
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Tuc",
    name: "Tucana",
    genitive: "Tucanae",
    ra: 352,
    dec: -64,
    area: 295,
    brightestStar: "Alpha Tucanae",
    stickFigure: [
      // α Tuc → γ Tuc
      [334.63, -60.26, 349.4, -58.24],
      // γ Tuc → β¹ Tuc
      [349.4, -58.24, 3.11, -62.96],
      // β¹ Tuc → ζ Tuc
      [3.11, -62.96, 4.59, -64.87],
      // ζ Tuc → ε Tuc
      [4.59, -64.87, 359.38, -65.58],
      // ε Tuc → δ Tuc
      [359.38, -65.58, 337.51, -64.97],
      // δ Tuc → α Tuc
      [337.51, -64.97, 334.63, -60.26]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 83. Ursa Major
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "UMa",
    name: "Ursa Major",
    genitive: "Ursae Majoris",
    ra: 165,
    dec: 56,
    area: 1280,
    brightestStar: "Alioth",
    stickFigure: [
      // Big Dipper:
      // Dubhe (α UMa) → Merak (β UMa)
      [165.93, 61.75, 165.46, 56.38],
      // Merak → Phecda (γ UMa)
      [165.46, 56.38, 178.46, 53.69],
      // Phecda → Megrez (δ UMa)
      [178.46, 53.69, 183.86, 57.03],
      // Megrez → Alioth (ε UMa)
      [183.86, 57.03, 193.51, 55.96],
      // Alioth → Mizar (ζ UMa)
      [193.51, 55.96, 200.98, 54.93],
      // Mizar → Alkaid (η UMa)
      [200.98, 54.93, 206.89, 49.31],
      // Body extensions:
      // Dubhe → Muscida (ο UMa)
      [165.93, 61.75, 129, 60.72],
      // Muscida → 23 UMa
      [129, 60.72, 136.37, 63.06],
      // Merak → ψ UMa
      [165.46, 56.38, 167.42, 44.5],
      // ψ UMa → Tania Australis (μ UMa)
      [167.42, 44.5, 155.58, 41.5],
      // Tania Australis → Tania Borealis (λ UMa)
      [155.58, 41.5, 152.39, 42.91],
      // Phecda → χ UMa
      [178.46, 53.69, 176.51, 47.78],
      // χ UMa → ν UMa (Alula Borealis)
      [176.51, 47.78, 169.62, 33.09],
      // Alula Borealis → ξ UMa (Alula Australis)
      [169.62, 33.09, 169.55, 31.53]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 84. Ursa Minor
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "UMi",
    name: "Ursa Minor",
    genitive: "Ursae Minoris",
    ra: 225,
    dec: 78,
    area: 256,
    brightestStar: "Polaris",
    stickFigure: [
      // Polaris (α UMi) → δ UMi (Yildun)
      [37.95, 89.26, 263.05, 86.59],
      // Yildun → ε UMi
      [263.05, 86.59, 251.49, 82.04],
      // ε UMi → ζ UMi (Ahfa al Farkadain)
      [251.49, 82.04, 236.01, 77.79],
      // ζ UMi → η UMi (Anwar al Farkadain)
      [236.01, 77.79, 243.54, 75.76],
      // η UMi → γ UMi (Pherkad)
      [243.54, 75.76, 230.18, 71.83],
      // Pherkad → β UMi (Kochab)
      [230.18, 71.83, 222.68, 74.16],
      // Kochab → ζ UMi
      [222.68, 74.16, 236.01, 77.79]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 85. Vela
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Vel",
    name: "Vela",
    genitive: "Velorum",
    ra: 138,
    dec: -47,
    area: 500,
    brightestStar: "Regor",
    stickFigure: [
      // Regor (γ² Vel) → δ Vel
      [122.38, -47.34, 131.18, -54.71],
      // δ Vel → κ Vel (Markeb)
      [131.18, -54.71, 140.53, -55.01],
      // Markeb → φ Vel
      [140.53, -55.01, 146.11, -47.1],
      // φ Vel → μ Vel
      [146.11, -47.1, 161.69, -49.42],
      // μ Vel → ψ Vel
      [161.69, -49.42, 141.94, -40.47],
      // ψ Vel → λ Vel (Suhail)
      [141.94, -40.47, 136.99, -43.43],
      // Suhail → Regor
      [136.99, -43.43, 122.38, -47.34]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 86. Virgo
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Vir",
    name: "Virgo",
    genitive: "Virginis",
    ra: 197,
    dec: -3,
    area: 1294,
    brightestStar: "Spica",
    stickFigure: [
      // Spica (α Vir) → θ Vir
      [201.3, -11.16, 196.73, -5.54],
      // θ Vir → γ Vir (Porrima)
      [196.73, -5.54, 190.42, -1.45],
      // Porrima → η Vir (Zaniah)
      [190.42, -1.45, 184.98, -0.67],
      // Zaniah → β Vir (Zavijava)
      [184.98, -0.67, 177.67, 1.76],
      // Porrima → δ Vir (Minelauva)
      [190.42, -1.45, 193.9, 3.4],
      // Minelauva → ε Vir (Vindemiatrix)
      [193.9, 3.4, 195.54, 10.96],
      // Spica → ζ Vir (Heze)
      [201.3, -11.16, 203.67, -0.6],
      // Heze → δ Vir
      [203.67, -0.6, 193.9, 3.4],
      // Spica → κ Vir
      [201.3, -11.16, 213.22, -10.27],
      // κ Vir → ι Vir (Syrma)
      [213.22, -10.27, 214, -6]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 87. Volans
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Vol",
    name: "Volans",
    genitive: "Volantis",
    ra: 118,
    dec: -69,
    area: 141,
    brightestStar: "Beta Volantis",
    stickFigure: [
      // β Vol → γ Vol
      [121.55, -66.14, 108.7, -70.5],
      // γ Vol → δ Vol
      [108.7, -70.5, 105.25, -67.96],
      // δ Vol → ε Vol
      [105.25, -67.96, 121.98, -68.62],
      // ε Vol → α Vol
      [121.98, -68.62, 132.1, -66.4],
      // α Vol → β Vol
      [132.1, -66.4, 121.55, -66.14],
      // ζ Vol → δ Vol
      [117.42, -72.61, 105.25, -67.96]
    ]
  },
  // ────────────────────────────────────────────────────────────────
  // 88. Vulpecula
  // ────────────────────────────────────────────────────────────────
  {
    abbr: "Vul",
    name: "Vulpecula",
    genitive: "Vulpeculae",
    ra: 303,
    dec: 24,
    area: 268,
    brightestStar: "Anser",
    stickFigure: [
      // Anser (α Vul) → 23 Vul
      [297.64, 24.66, 300.89, 27.81],
      // 23 Vul → 31 Vul
      [300.89, 27.81, 308.55, 27.09],
      // 31 Vul → 13 Vul
      [308.55, 27.09, 295.74, 24.08]
    ]
  }
], cs = [
  { messier: 1, name: "Crab Nebula", ngc: "NGC 1952", type: "nebula", subtype: "supernova remnant", constellation: "Tau", ra: 83.633, dec: 22.015, mag: 8.4, size_arcmin: 6, distance_kly: 6.5, description: "Supernova remnant from SN 1054, contains a pulsar" },
  { messier: 2, name: "M2", ngc: "NGC 7089", type: "cluster", subtype: "globular cluster", constellation: "Aqr", ra: 323.363, dec: -0.823, mag: 6.3, size_arcmin: 16, distance_kly: 37.5, description: "Rich globular cluster" },
  { messier: 3, name: "M3", ngc: "NGC 5272", type: "cluster", subtype: "globular cluster", constellation: "CVn", ra: 205.548, dec: 28.377, mag: 6.2, size_arcmin: 18, distance_kly: 33.9, description: "One of the finest globular clusters" },
  { messier: 4, name: "M4", ngc: "NGC 6121", type: "cluster", subtype: "globular cluster", constellation: "Sco", ra: 245.897, dec: -26.526, mag: 5.6, size_arcmin: 36, distance_kly: 7.2, description: "Nearest globular cluster to the Sun" },
  { messier: 5, name: "M5", ngc: "NGC 5904", type: "cluster", subtype: "globular cluster", constellation: "Ser", ra: 229.638, dec: 2.081, mag: 5.6, size_arcmin: 23, distance_kly: 24.5, description: "One of the oldest known globular clusters" },
  { messier: 6, name: "Butterfly Cluster", ngc: "NGC 6405", type: "cluster", subtype: "open cluster", constellation: "Sco", ra: 265.083, dec: -32.217, mag: 4.2, size_arcmin: 25, distance_kly: 1.6, description: "Bright open cluster resembling a butterfly" },
  { messier: 7, name: "Ptolemy Cluster", ngc: "NGC 6475", type: "cluster", subtype: "open cluster", constellation: "Sco", ra: 268.467, dec: -34.793, mag: 3.3, size_arcmin: 80, distance_kly: 0.98, description: "Large bright open cluster known since antiquity" },
  { messier: 8, name: "Lagoon Nebula", ngc: "NGC 6523", type: "nebula", subtype: "emission nebula", constellation: "Sgr", ra: 270.917, dec: -24.383, mag: 6, size_arcmin: 90, distance_kly: 5.2, description: "Bright emission nebula with embedded cluster" },
  { messier: 9, name: "M9", ngc: "NGC 6333", type: "cluster", subtype: "globular cluster", constellation: "Oph", ra: 259.8, dec: -18.516, mag: 7.7, size_arcmin: 12, distance_kly: 25.8, description: "Globular cluster near the galactic center" },
  { messier: 10, name: "M10", ngc: "NGC 6254", type: "cluster", subtype: "globular cluster", constellation: "Oph", ra: 254.288, dec: -4.1, mag: 6.6, size_arcmin: 20, distance_kly: 14.3, description: "Bright globular cluster" },
  { messier: 11, name: "Wild Duck Cluster", ngc: "NGC 6705", type: "cluster", subtype: "open cluster", constellation: "Sct", ra: 282.767, dec: -6.267, mag: 5.8, size_arcmin: 14, distance_kly: 6.2, description: "Rich compact open cluster" },
  { messier: 12, name: "M12", ngc: "NGC 6218", type: "cluster", subtype: "globular cluster", constellation: "Oph", ra: 251.809, dec: -1.949, mag: 6.7, size_arcmin: 16, distance_kly: 15.7, description: "Loose globular cluster" },
  { messier: 13, name: "Hercules Cluster", ngc: "NGC 6205", type: "cluster", subtype: "globular cluster", constellation: "Her", ra: 250.423, dec: 36.461, mag: 5.8, size_arcmin: 20, distance_kly: 25.1, description: "Great Globular Cluster in Hercules" },
  { messier: 14, name: "M14", ngc: "NGC 6402", type: "cluster", subtype: "globular cluster", constellation: "Oph", ra: 264.4, dec: -3.246, mag: 7.6, size_arcmin: 11, distance_kly: 30.3, description: "Slightly elliptical globular cluster" },
  { messier: 15, name: "M15", ngc: "NGC 7078", type: "cluster", subtype: "globular cluster", constellation: "Peg", ra: 322.493, dec: 12.167, mag: 6.2, size_arcmin: 18, distance_kly: 33.6, description: "Dense globular cluster, may contain black hole" },
  { messier: 16, name: "Eagle Nebula", ngc: "NGC 6611", type: "nebula", subtype: "emission nebula", constellation: "Ser", ra: 274.7, dec: -13.783, mag: 6, size_arcmin: 35, distance_kly: 7, description: "Contains the Pillars of Creation" },
  { messier: 17, name: "Omega Nebula", ngc: "NGC 6618", type: "nebula", subtype: "emission nebula", constellation: "Sgr", ra: 275.183, dec: -16.183, mag: 6, size_arcmin: 46, distance_kly: 5, description: "Bright emission nebula, also called Swan Nebula" },
  { messier: 18, name: "M18", ngc: "NGC 6613", type: "cluster", subtype: "open cluster", constellation: "Sgr", ra: 274.7, dec: -17.133, mag: 6.9, size_arcmin: 9, distance_kly: 4.9, description: "Small, sparse open cluster" },
  { messier: 19, name: "M19", ngc: "NGC 6273", type: "cluster", subtype: "globular cluster", constellation: "Oph", ra: 255.657, dec: -26.268, mag: 6.8, size_arcmin: 17, distance_kly: 28.7, description: "Most oblate known globular cluster" },
  { messier: 20, name: "Trifid Nebula", ngc: "NGC 6514", type: "nebula", subtype: "emission nebula", constellation: "Sgr", ra: 270.617, dec: -23.033, mag: 6.3, size_arcmin: 28, distance_kly: 5.2, description: "Emission nebula divided by dark lanes" },
  { messier: 21, name: "M21", ngc: "NGC 6531", type: "cluster", subtype: "open cluster", constellation: "Sgr", ra: 271.05, dec: -22.5, mag: 5.9, size_arcmin: 13, distance_kly: 4.25, description: "Open cluster near the Trifid Nebula" },
  { messier: 22, name: "M22", ngc: "NGC 6656", type: "cluster", subtype: "globular cluster", constellation: "Sgr", ra: 279.1, dec: -23.905, mag: 5.1, size_arcmin: 32, distance_kly: 10.6, description: "One of the nearest and brightest globulars" },
  { messier: 23, name: "M23", ngc: "NGC 6494", type: "cluster", subtype: "open cluster", constellation: "Sgr", ra: 269.267, dec: -19.017, mag: 5.5, size_arcmin: 27, distance_kly: 2.15, description: "Rich open cluster" },
  { messier: 24, name: "Sagittarius Star Cloud", ngc: "IC 4715", type: "cluster", subtype: "star cloud", constellation: "Sgr", ra: 274.533, dec: -18.517, mag: 4.6, size_arcmin: 90, distance_kly: 10, description: "Dense Milky Way star cloud" },
  { messier: 25, name: "M25", ngc: "IC 4725", type: "cluster", subtype: "open cluster", constellation: "Sgr", ra: 277.933, dec: -19.117, mag: 4.6, size_arcmin: 32, distance_kly: 2, description: "Open cluster with a Cepheid variable" },
  { messier: 26, name: "M26", ngc: "NGC 6694", type: "cluster", subtype: "open cluster", constellation: "Sct", ra: 281.117, dec: -9.383, mag: 8, size_arcmin: 15, distance_kly: 5, description: "Small open cluster" },
  { messier: 27, name: "Dumbbell Nebula", ngc: "NGC 6853", type: "nebula", subtype: "planetary nebula", constellation: "Vul", ra: 299.902, dec: 22.721, mag: 7.5, size_arcmin: 8, distance_kly: 1.36, description: "First planetary nebula discovered (1764)" },
  { messier: 28, name: "M28", ngc: "NGC 6626", type: "cluster", subtype: "globular cluster", constellation: "Sgr", ra: 276.137, dec: -24.87, mag: 6.8, size_arcmin: 11, distance_kly: 18.3, description: "Globular cluster near Kaus Borealis" },
  { messier: 29, name: "M29", ngc: "NGC 6913", type: "cluster", subtype: "open cluster", constellation: "Cyg", ra: 305.1, dec: 38.517, mag: 6.6, size_arcmin: 7, distance_kly: 4, description: "Small open cluster in Cygnus" },
  { messier: 30, name: "M30", ngc: "NGC 7099", type: "cluster", subtype: "globular cluster", constellation: "Cap", ra: 325.092, dec: -23.18, mag: 7.2, size_arcmin: 12, distance_kly: 26.1, description: "Core-collapsed globular cluster" },
  { messier: 31, name: "Andromeda Galaxy", ngc: "NGC 224", type: "galaxy", subtype: "spiral galaxy", constellation: "And", ra: 10.685, dec: 41.269, mag: 3.4, size_arcmin: 190, distance_kly: 2537, description: "Nearest large galaxy, spiral, Local Group member" },
  { messier: 32, name: "M32", ngc: "NGC 221", type: "galaxy", subtype: "elliptical galaxy", constellation: "And", ra: 10.674, dec: 40.866, mag: 8.1, size_arcmin: 8, distance_kly: 2490, description: "Satellite of Andromeda Galaxy" },
  { messier: 33, name: "Triangulum Galaxy", ngc: "NGC 598", type: "galaxy", subtype: "spiral galaxy", constellation: "Tri", ra: 23.462, dec: 30.66, mag: 5.7, size_arcmin: 73, distance_kly: 2730, description: "Third-largest galaxy in the Local Group" },
  { messier: 34, name: "M34", ngc: "NGC 1039", type: "cluster", subtype: "open cluster", constellation: "Per", ra: 40.517, dec: 42.767, mag: 5.2, size_arcmin: 35, distance_kly: 1.5, description: "Large open cluster" },
  { messier: 35, name: "M35", ngc: "NGC 2168", type: "cluster", subtype: "open cluster", constellation: "Gem", ra: 92.25, dec: 24.333, mag: 5.1, size_arcmin: 28, distance_kly: 2.8, description: "Rich open cluster visible to naked eye" },
  { messier: 36, name: "M36", ngc: "NGC 1960", type: "cluster", subtype: "open cluster", constellation: "Aur", ra: 84.083, dec: 34.133, mag: 6, size_arcmin: 12, distance_kly: 4.1, description: "Open cluster in Auriga" },
  { messier: 37, name: "M37", ngc: "NGC 2099", type: "cluster", subtype: "open cluster", constellation: "Aur", ra: 88.067, dec: 32.55, mag: 5.6, size_arcmin: 24, distance_kly: 4.5, description: "Richest open cluster in Auriga" },
  { messier: 38, name: "M38", ngc: "NGC 1912", type: "cluster", subtype: "open cluster", constellation: "Aur", ra: 82.167, dec: 35.833, mag: 6.4, size_arcmin: 21, distance_kly: 4.2, description: "Open cluster forming a cross pattern" },
  { messier: 39, name: "M39", ngc: "NGC 7092", type: "cluster", subtype: "open cluster", constellation: "Cyg", ra: 323.067, dec: 48.433, mag: 4.6, size_arcmin: 32, distance_kly: 0.82, description: "Nearby sparse open cluster" },
  { messier: 40, name: "Winnecke 4", type: "cluster", subtype: "double star", constellation: "UMa", ra: 185.567, dec: 58.083, mag: 8.4, size_arcmin: 1, distance_kly: 0.51, description: "Double star, not a deep-sky object (Messier error)" },
  { messier: 41, name: "M41", ngc: "NGC 2287", type: "cluster", subtype: "open cluster", constellation: "CMa", ra: 101.5, dec: -20.733, mag: 4.5, size_arcmin: 38, distance_kly: 2.3, description: "Open cluster south of Sirius" },
  { messier: 42, name: "Orion Nebula", ngc: "NGC 1976", type: "nebula", subtype: "emission nebula", constellation: "Ori", ra: 83.822, dec: -5.391, mag: 4, size_arcmin: 85, distance_kly: 1.34, description: "Brightest diffuse nebula, stellar nursery" },
  { messier: 43, name: "De Mairan's Nebula", ngc: "NGC 1982", type: "nebula", subtype: "emission nebula", constellation: "Ori", ra: 83.867, dec: -5.267, mag: 9, size_arcmin: 20, distance_kly: 1.6, description: "Part of the Orion Nebula complex" },
  { messier: 44, name: "Beehive Cluster", ngc: "NGC 2632", type: "cluster", subtype: "open cluster", constellation: "Cnc", ra: 130.025, dec: 19.667, mag: 3.7, size_arcmin: 95, distance_kly: 0.577, description: "Praesepe; large naked-eye open cluster" },
  { messier: 45, name: "Pleiades", type: "cluster", subtype: "open cluster", constellation: "Tau", ra: 56.75, dec: 24.117, mag: 1.6, size_arcmin: 110, distance_kly: 0.44, description: "Seven Sisters; bright nearby open cluster" },
  { messier: 46, name: "M46", ngc: "NGC 2437", type: "cluster", subtype: "open cluster", constellation: "Pup", ra: 115.467, dec: -14.817, mag: 6.1, size_arcmin: 27, distance_kly: 5.5, description: "Rich open cluster with a planetary nebula" },
  { messier: 47, name: "M47", ngc: "NGC 2422", type: "cluster", subtype: "open cluster", constellation: "Pup", ra: 114.15, dec: -14.5, mag: 4.4, size_arcmin: 30, distance_kly: 1.6, description: "Bright open cluster" },
  { messier: 48, name: "M48", ngc: "NGC 2548", type: "cluster", subtype: "open cluster", constellation: "Hya", ra: 123.417, dec: -5.8, mag: 5.8, size_arcmin: 54, distance_kly: 1.5, description: "Large open cluster" },
  { messier: 49, name: "M49", ngc: "NGC 4472", type: "galaxy", subtype: "elliptical galaxy", constellation: "Vir", ra: 187.445, dec: 8, mag: 8.4, size_arcmin: 10, distance_kly: 55900, description: "Brightest galaxy in the Virgo Cluster" },
  { messier: 50, name: "M50", ngc: "NGC 2323", type: "cluster", subtype: "open cluster", constellation: "Mon", ra: 105.683, dec: -8.367, mag: 5.9, size_arcmin: 16, distance_kly: 3, description: "Open cluster" },
  { messier: 51, name: "Whirlpool Galaxy", ngc: "NGC 5194", type: "galaxy", subtype: "spiral galaxy", constellation: "CVn", ra: 202.47, dec: 47.195, mag: 8.4, size_arcmin: 11, distance_kly: 23e3, description: "Face-on spiral with companion NGC 5195" },
  { messier: 52, name: "M52", ngc: "NGC 7654", type: "cluster", subtype: "open cluster", constellation: "Cas", ra: 351.2, dec: 61.583, mag: 6.9, size_arcmin: 13, distance_kly: 5, description: "Rich open cluster" },
  { messier: 53, name: "M53", ngc: "NGC 5024", type: "cluster", subtype: "globular cluster", constellation: "Com", ra: 198.23, dec: 18.169, mag: 7.6, size_arcmin: 13, distance_kly: 58, description: "Remote globular cluster" },
  { messier: 54, name: "M54", ngc: "NGC 6715", type: "cluster", subtype: "globular cluster", constellation: "Sgr", ra: 283.764, dec: -30.48, mag: 7.6, size_arcmin: 12, distance_kly: 87.4, description: "Globular cluster in the Sagittarius Dwarf Galaxy" },
  { messier: 55, name: "M55", ngc: "NGC 6809", type: "cluster", subtype: "globular cluster", constellation: "Sgr", ra: 294.999, dec: -30.965, mag: 6.3, size_arcmin: 19, distance_kly: 17.6, description: "Large loose globular cluster" },
  { messier: 56, name: "M56", ngc: "NGC 6779", type: "cluster", subtype: "globular cluster", constellation: "Lyr", ra: 289.148, dec: 30.184, mag: 8.3, size_arcmin: 8, distance_kly: 32.9, description: "Compact globular cluster" },
  { messier: 57, name: "Ring Nebula", ngc: "NGC 6720", type: "nebula", subtype: "planetary nebula", constellation: "Lyr", ra: 283.396, dec: 33.029, mag: 8.8, size_arcmin: 2.5, distance_kly: 2.3, description: "Classic planetary nebula, ring-shaped" },
  { messier: 58, name: "M58", ngc: "NGC 4579", type: "galaxy", subtype: "barred spiral galaxy", constellation: "Vir", ra: 189.431, dec: 11.818, mag: 9.7, size_arcmin: 6, distance_kly: 6e4, description: "Virgo Cluster barred spiral galaxy" },
  { messier: 59, name: "M59", ngc: "NGC 4621", type: "galaxy", subtype: "elliptical galaxy", constellation: "Vir", ra: 190.51, dec: 11.647, mag: 9.6, size_arcmin: 5, distance_kly: 6e4, description: "Virgo Cluster elliptical galaxy" },
  { messier: 60, name: "M60", ngc: "NGC 4649", type: "galaxy", subtype: "elliptical galaxy", constellation: "Vir", ra: 190.917, dec: 11.553, mag: 8.8, size_arcmin: 7, distance_kly: 55e3, description: "Giant elliptical galaxy in Virgo Cluster" },
  { messier: 61, name: "M61", ngc: "NGC 4303", type: "galaxy", subtype: "barred spiral galaxy", constellation: "Vir", ra: 185.479, dec: 4.474, mag: 9.7, size_arcmin: 6, distance_kly: 52500, description: "Face-on barred spiral galaxy" },
  { messier: 62, name: "M62", ngc: "NGC 6266", type: "cluster", subtype: "globular cluster", constellation: "Oph", ra: 255.303, dec: -30.114, mag: 6.5, size_arcmin: 15, distance_kly: 22.5, description: "Irregularly shaped globular cluster" },
  { messier: 63, name: "Sunflower Galaxy", ngc: "NGC 5055", type: "galaxy", subtype: "spiral galaxy", constellation: "CVn", ra: 198.955, dec: 42.029, mag: 8.6, size_arcmin: 13, distance_kly: 29300, description: "Flocculent spiral galaxy" },
  { messier: 64, name: "Black Eye Galaxy", ngc: "NGC 4826", type: "galaxy", subtype: "spiral galaxy", constellation: "Com", ra: 194.182, dec: 21.683, mag: 8.5, size_arcmin: 10, distance_kly: 17e3, description: "Spiral galaxy with prominent dust band" },
  { messier: 65, name: "M65", ngc: "NGC 3623", type: "galaxy", subtype: "spiral galaxy", constellation: "Leo", ra: 169.733, dec: 13.092, mag: 9.3, size_arcmin: 10, distance_kly: 35e3, description: "Leo Triplet member" },
  { messier: 66, name: "M66", ngc: "NGC 3627", type: "galaxy", subtype: "barred spiral galaxy", constellation: "Leo", ra: 170.063, dec: 12.992, mag: 8.9, size_arcmin: 9, distance_kly: 36e3, description: "Largest Leo Triplet member" },
  { messier: 67, name: "M67", ngc: "NGC 2682", type: "cluster", subtype: "open cluster", constellation: "Cnc", ra: 132.85, dec: 11.817, mag: 6.9, size_arcmin: 30, distance_kly: 2.7, description: "Old open cluster (~4 billion years)" },
  { messier: 68, name: "M68", ngc: "NGC 4590", type: "cluster", subtype: "globular cluster", constellation: "Hya", ra: 189.867, dec: -26.745, mag: 7.8, size_arcmin: 11, distance_kly: 33.3, description: "Southern globular cluster" },
  { messier: 69, name: "M69", ngc: "NGC 6637", type: "cluster", subtype: "globular cluster", constellation: "Sgr", ra: 277.846, dec: -32.348, mag: 7.6, size_arcmin: 9, distance_kly: 29.7, description: "Small globular cluster near galactic center" },
  { messier: 70, name: "M70", ngc: "NGC 6681", type: "cluster", subtype: "globular cluster", constellation: "Sgr", ra: 280.803, dec: -32.292, mag: 7.9, size_arcmin: 8, distance_kly: 29.3, description: "Core-collapsed globular cluster" },
  { messier: 71, name: "M71", ngc: "NGC 6838", type: "cluster", subtype: "globular cluster", constellation: "Sge", ra: 298.444, dec: 18.779, mag: 8.2, size_arcmin: 7, distance_kly: 13, description: "Loose globular cluster" },
  { messier: 72, name: "M72", ngc: "NGC 6981", type: "cluster", subtype: "globular cluster", constellation: "Aqr", ra: 313.365, dec: -12.537, mag: 9.3, size_arcmin: 6, distance_kly: 55.4, description: "Distant globular cluster" },
  { messier: 73, name: "M73", ngc: "NGC 6994", type: "cluster", subtype: "asterism", constellation: "Aqr", ra: 314.75, dec: -12.633, mag: 9, size_arcmin: 3, description: "Four stars; asterism, not a true cluster" },
  { messier: 74, name: "Phantom Galaxy", ngc: "NGC 628", type: "galaxy", subtype: "spiral galaxy", constellation: "Psc", ra: 24.174, dec: 15.784, mag: 9.4, size_arcmin: 10, distance_kly: 32e3, description: "Face-on grand design spiral galaxy" },
  { messier: 75, name: "M75", ngc: "NGC 6864", type: "cluster", subtype: "globular cluster", constellation: "Sgr", ra: 301.52, dec: -21.921, mag: 8.5, size_arcmin: 6, distance_kly: 67.5, description: "Very concentrated globular cluster" },
  { messier: 76, name: "Little Dumbbell Nebula", ngc: "NGC 650", type: "nebula", subtype: "planetary nebula", constellation: "Per", ra: 25.582, dec: 51.575, mag: 10.1, size_arcmin: 2.7, distance_kly: 2.5, description: "Faint planetary nebula" },
  { messier: 77, name: "M77", ngc: "NGC 1068", type: "galaxy", subtype: "spiral galaxy", constellation: "Cet", ra: 40.67, dec: -0.014, mag: 8.9, size_arcmin: 7, distance_kly: 47e3, description: "Seyfert galaxy with active nucleus" },
  { messier: 78, name: "M78", ngc: "NGC 2068", type: "nebula", subtype: "reflection nebula", constellation: "Ori", ra: 86.65, dec: 0.05, mag: 8.3, size_arcmin: 8, distance_kly: 1.6, description: "Brightest reflection nebula in the sky" },
  { messier: 79, name: "M79", ngc: "NGC 1904", type: "cluster", subtype: "globular cluster", constellation: "Lep", ra: 81.046, dec: -24.524, mag: 7.7, size_arcmin: 9, distance_kly: 41.1, description: "Winter globular cluster" },
  { messier: 80, name: "M80", ngc: "NGC 6093", type: "cluster", subtype: "globular cluster", constellation: "Sco", ra: 244.26, dec: -22.976, mag: 7.3, size_arcmin: 10, distance_kly: 32.6, description: "Dense globular cluster" },
  { messier: 81, name: "Bode's Galaxy", ngc: "NGC 3031", type: "galaxy", subtype: "spiral galaxy", constellation: "UMa", ra: 148.888, dec: 69.065, mag: 6.9, size_arcmin: 27, distance_kly: 11800, description: "Grand design spiral galaxy" },
  { messier: 82, name: "Cigar Galaxy", ngc: "NGC 3034", type: "galaxy", subtype: "starburst galaxy", constellation: "UMa", ra: 148.968, dec: 69.68, mag: 8.4, size_arcmin: 11, distance_kly: 11500, description: "Starburst galaxy interacting with M81" },
  { messier: 83, name: "Southern Pinwheel", ngc: "NGC 5236", type: "galaxy", subtype: "barred spiral galaxy", constellation: "Hya", ra: 204.254, dec: -29.866, mag: 7.6, size_arcmin: 13, distance_kly: 15e3, description: "Southern face-on barred spiral galaxy" },
  { messier: 84, name: "M84", ngc: "NGC 4374", type: "galaxy", subtype: "elliptical galaxy", constellation: "Vir", ra: 186.266, dec: 12.887, mag: 9.1, size_arcmin: 6, distance_kly: 6e4, description: "Virgo Cluster elliptical galaxy" },
  { messier: 85, name: "M85", ngc: "NGC 4382", type: "galaxy", subtype: "lenticular galaxy", constellation: "Com", ra: 186.35, dec: 18.191, mag: 9.1, size_arcmin: 7, distance_kly: 6e4, description: "Lenticular galaxy in Virgo Cluster" },
  { messier: 86, name: "M86", ngc: "NGC 4406", type: "galaxy", subtype: "elliptical galaxy", constellation: "Vir", ra: 186.549, dec: 12.946, mag: 8.9, size_arcmin: 9, distance_kly: 52e3, description: "Approaching Virgo Cluster galaxy" },
  { messier: 87, name: "Virgo A", ngc: "NGC 4486", type: "galaxy", subtype: "elliptical galaxy", constellation: "Vir", ra: 187.706, dec: 12.391, mag: 8.6, size_arcmin: 8, distance_kly: 53500, description: "Giant elliptical with famous jet, hosts SMBH" },
  { messier: 88, name: "M88", ngc: "NGC 4501", type: "galaxy", subtype: "spiral galaxy", constellation: "Com", ra: 187.997, dec: 14.42, mag: 9.6, size_arcmin: 7, distance_kly: 47e3, description: "Nearly edge-on spiral galaxy" },
  { messier: 89, name: "M89", ngc: "NGC 4552", type: "galaxy", subtype: "elliptical galaxy", constellation: "Vir", ra: 188.916, dec: 12.556, mag: 9.8, size_arcmin: 5, distance_kly: 5e4, description: "Almost perfectly circular elliptical galaxy" },
  { messier: 90, name: "M90", ngc: "NGC 4569", type: "galaxy", subtype: "spiral galaxy", constellation: "Vir", ra: 189.209, dec: 13.163, mag: 9.5, size_arcmin: 10, distance_kly: 6e4, description: "Large spiral galaxy in Virgo Cluster" },
  { messier: 91, name: "M91", ngc: "NGC 4548", type: "galaxy", subtype: "barred spiral galaxy", constellation: "Com", ra: 188.86, dec: 14.497, mag: 10.2, size_arcmin: 5, distance_kly: 63e3, description: "Faint barred spiral galaxy" },
  { messier: 92, name: "M92", ngc: "NGC 6341", type: "cluster", subtype: "globular cluster", constellation: "Her", ra: 259.281, dec: 43.136, mag: 6.4, size_arcmin: 14, distance_kly: 26.7, description: "Ancient globular cluster (~14 billion years)" },
  { messier: 93, name: "M93", ngc: "NGC 2447", type: "cluster", subtype: "open cluster", constellation: "Pup", ra: 116.133, dec: -23.867, mag: 6.2, size_arcmin: 22, distance_kly: 3.6, description: "Open cluster" },
  { messier: 94, name: "M94", ngc: "NGC 4736", type: "galaxy", subtype: "spiral galaxy", constellation: "CVn", ra: 192.721, dec: 41.12, mag: 8.2, size_arcmin: 14, distance_kly: 16e3, description: "Ring galaxy with starburst ring" },
  { messier: 95, name: "M95", ngc: "NGC 3351", type: "galaxy", subtype: "barred spiral galaxy", constellation: "Leo", ra: 160.99, dec: 11.704, mag: 9.7, size_arcmin: 7, distance_kly: 32600, description: "Barred spiral galaxy in Leo I Group" },
  { messier: 96, name: "M96", ngc: "NGC 3368", type: "galaxy", subtype: "spiral galaxy", constellation: "Leo", ra: 161.691, dec: 11.82, mag: 9.2, size_arcmin: 7, distance_kly: 31e3, description: "Asymmetric spiral galaxy" },
  { messier: 97, name: "Owl Nebula", ngc: "NGC 3587", type: "nebula", subtype: "planetary nebula", constellation: "UMa", ra: 168.699, dec: 55.019, mag: 9.9, size_arcmin: 3.4, distance_kly: 2.03, description: "Round planetary nebula with dark eye-like features" },
  { messier: 98, name: "M98", ngc: "NGC 4192", type: "galaxy", subtype: "spiral galaxy", constellation: "Com", ra: 183.452, dec: 14.9, mag: 10.1, size_arcmin: 10, distance_kly: 44e3, description: "Nearly edge-on spiral galaxy" },
  { messier: 99, name: "M99", ngc: "NGC 4254", type: "galaxy", subtype: "spiral galaxy", constellation: "Com", ra: 184.707, dec: 14.417, mag: 9.9, size_arcmin: 5, distance_kly: 55e3, description: "Grand design spiral galaxy" },
  { messier: 100, name: "M100", ngc: "NGC 4321", type: "galaxy", subtype: "spiral galaxy", constellation: "Com", ra: 185.729, dec: 15.822, mag: 9.3, size_arcmin: 7, distance_kly: 55e3, description: "Grand design face-on spiral galaxy" },
  { messier: 101, name: "Pinwheel Galaxy", ngc: "NGC 5457", type: "galaxy", subtype: "spiral galaxy", constellation: "UMa", ra: 210.802, dec: 54.349, mag: 7.9, size_arcmin: 29, distance_kly: 20900, description: "Large face-on spiral galaxy" },
  { messier: 102, name: "Spindle Galaxy", ngc: "NGC 5866", type: "galaxy", subtype: "lenticular galaxy", constellation: "Dra", ra: 226.623, dec: 55.763, mag: 9.9, size_arcmin: 6, distance_kly: 5e4, description: "Edge-on lenticular galaxy (disputed identification)" },
  { messier: 103, name: "M103", ngc: "NGC 581", type: "cluster", subtype: "open cluster", constellation: "Cas", ra: 23.95, dec: 60.7, mag: 7.4, size_arcmin: 6, distance_kly: 8.5, description: "Last object in Messier's original catalog" },
  { messier: 104, name: "Sombrero Galaxy", ngc: "NGC 4594", type: "galaxy", subtype: "spiral galaxy", constellation: "Vir", ra: 190, dec: -11.623, mag: 8, size_arcmin: 9, distance_kly: 29350, description: "Edge-on spiral with prominent dust lane and bulge" },
  { messier: 105, name: "M105", ngc: "NGC 3379", type: "galaxy", subtype: "elliptical galaxy", constellation: "Leo", ra: 161.957, dec: 12.582, mag: 9.3, size_arcmin: 5, distance_kly: 32e3, description: "Elliptical galaxy in Leo I Group" },
  { messier: 106, name: "M106", ngc: "NGC 4258", type: "galaxy", subtype: "spiral galaxy", constellation: "CVn", ra: 184.74, dec: 47.304, mag: 8.4, size_arcmin: 19, distance_kly: 23700, description: "Seyfert galaxy with water maser" },
  { messier: 107, name: "M107", ngc: "NGC 6171", type: "cluster", subtype: "globular cluster", constellation: "Oph", ra: 248.133, dec: -13.054, mag: 7.9, size_arcmin: 13, distance_kly: 20.9, description: "Loose globular cluster" },
  { messier: 108, name: "M108", ngc: "NGC 3556", type: "galaxy", subtype: "barred spiral galaxy", constellation: "UMa", ra: 167.879, dec: 55.674, mag: 10, size_arcmin: 8, distance_kly: 45e3, description: "Nearly edge-on barred spiral near Owl Nebula" },
  { messier: 109, name: "M109", ngc: "NGC 3992", type: "galaxy", subtype: "barred spiral galaxy", constellation: "UMa", ra: 179.4, dec: 53.375, mag: 9.8, size_arcmin: 8, distance_kly: 83500, description: "Barred spiral galaxy near Phecda" },
  { messier: 110, name: "M110", ngc: "NGC 205", type: "galaxy", subtype: "elliptical galaxy", constellation: "And", ra: 10.092, dec: 41.685, mag: 8.5, size_arcmin: 22, distance_kly: 2690, description: "Satellite of Andromeda Galaxy" }
], gs = [
  { id: "quadrantids", name: "Quadrantids", code: "QUA", radiantRA: 230.1, radiantDec: 48.5, solarLon: 283.16, peakDate: "Jan 04", start: "Dec 28", end: "Jan 12", zhr: 110, speed: 41, parentBody: "2003 EH1" },
  { id: "lyrids", name: "Lyrids", code: "LYR", radiantRA: 271.4, radiantDec: 33.6, solarLon: 32.32, peakDate: "Apr 22", start: "Apr 14", end: "Apr 30", zhr: 18, speed: 49, parentBody: "C/1861 G1 (Thatcher)" },
  { id: "eta-aquariids", name: "Eta Aquariids", code: "ETA", radiantRA: 338, radiantDec: -1, solarLon: 45.5, peakDate: "May 06", start: "Apr 19", end: "May 28", zhr: 50, speed: 66, parentBody: "1P/Halley" },
  { id: "arietids", name: "Arietids", code: "ARI", radiantRA: 44, radiantDec: 24, solarLon: 77, peakDate: "Jun 07", start: "May 14", end: "Jun 24", zhr: 54, speed: 39, parentBody: "96P/Machholz" },
  { id: "s-delta-aquariids", name: "Southern Delta Aquariids", code: "SDA", radiantRA: 339, radiantDec: -16, solarLon: 125, peakDate: "Jul 30", start: "Jul 12", end: "Aug 23", zhr: 16, speed: 41 },
  { id: "alpha-capricornids", name: "Alpha Capricornids", code: "CAP", radiantRA: 307, radiantDec: -10, solarLon: 127, peakDate: "Jul 30", start: "Jul 03", end: "Aug 15", zhr: 5, speed: 23, parentBody: "169P/NEAT" },
  { id: "perseids", name: "Perseids", code: "PER", radiantRA: 48, radiantDec: 58, solarLon: 140, peakDate: "Aug 12", start: "Jul 17", end: "Aug 24", zhr: 100, speed: 59, parentBody: "109P/Swift-Tuttle" },
  { id: "kappa-cygnids", name: "Kappa Cygnids", code: "KCG", radiantRA: 286, radiantDec: 59, solarLon: 145, peakDate: "Aug 17", start: "Aug 03", end: "Aug 25", zhr: 3, speed: 25 },
  { id: "aurigids", name: "Aurigids", code: "AUR", radiantRA: 91, radiantDec: 39, solarLon: 158.6, peakDate: "Sep 01", start: "Aug 28", end: "Sep 05", zhr: 6, speed: 66, parentBody: "C/1911 N1 (Kiess)" },
  { id: "draconids", name: "Draconids", code: "DRA", radiantRA: 262, radiantDec: 54, solarLon: 195.4, peakDate: "Oct 08", start: "Oct 06", end: "Oct 10", zhr: 10, speed: 20, parentBody: "21P/Giacobini-Zinner" },
  { id: "orionids", name: "Orionids", code: "ORI", radiantRA: 95, radiantDec: 16, solarLon: 208, peakDate: "Oct 21", start: "Oct 02", end: "Nov 07", zhr: 20, speed: 66, parentBody: "1P/Halley" },
  { id: "s-taurids", name: "Southern Taurids", code: "STA", radiantRA: 52, radiantDec: 13, solarLon: 220.7, peakDate: "Nov 05", start: "Sep 10", end: "Nov 20", zhr: 5, speed: 27, parentBody: "2P/Encke" },
  { id: "n-taurids", name: "Northern Taurids", code: "NTA", radiantRA: 58, radiantDec: 22, solarLon: 230, peakDate: "Nov 12", start: "Oct 20", end: "Dec 10", zhr: 5, speed: 29, parentBody: "2P/Encke" },
  { id: "leonids", name: "Leonids", code: "LEO", radiantRA: 152, radiantDec: 22, solarLon: 235.27, peakDate: "Nov 17", start: "Nov 06", end: "Nov 30", zhr: 15, speed: 71, parentBody: "55P/Tempel-Tuttle" },
  { id: "andromedids", name: "Andromedids", code: "AND", radiantRA: 25, radiantDec: 37, solarLon: 240, peakDate: "Dec 03", start: "Nov 25", end: "Dec 06", zhr: 3, speed: 19, parentBody: "3D/Biela" },
  { id: "phoenicids", name: "Phoenicids", code: "PHO", radiantRA: 18, radiantDec: -53, solarLon: 254.25, peakDate: "Dec 02", start: "Nov 28", end: "Dec 09", zhr: 5, speed: 18, parentBody: "289P/Blanpain" },
  { id: "puppid-velids", name: "Puppid-Velids", code: "PUP", radiantRA: 123, radiantDec: -45, solarLon: 255, peakDate: "Dec 07", start: "Dec 01", end: "Dec 15", zhr: 10, speed: 40 },
  { id: "monocerotids", name: "Monocerotids", code: "MON", radiantRA: 100, radiantDec: 8, solarLon: 261, peakDate: "Dec 11", start: "Nov 27", end: "Dec 17", zhr: 3, speed: 42, parentBody: "C/1917 F1 (Mellish)" },
  { id: "sigma-hydrids", name: "Sigma Hydrids", code: "HYD", radiantRA: 127, radiantDec: 2, solarLon: 262, peakDate: "Dec 12", start: "Dec 03", end: "Dec 15", zhr: 3, speed: 58 },
  { id: "geminids", name: "Geminids", code: "GEM", radiantRA: 112, radiantDec: 33, solarLon: 262.2, peakDate: "Dec 14", start: "Dec 04", end: "Dec 17", zhr: 150, speed: 35, parentBody: "3200 Phaethon" },
  { id: "comae-berenicids", name: "Comae Berenicids", code: "COM", radiantRA: 175, radiantDec: 18, solarLon: 271, peakDate: "Dec 19", start: "Dec 12", end: "Jan 02", zhr: 3, speed: 65 },
  { id: "ursids", name: "Ursids", code: "URS", radiantRA: 217, radiantDec: 76, solarLon: 270.7, peakDate: "Dec 22", start: "Dec 17", end: "Dec 26", zhr: 10, speed: 33, parentBody: "8P/Tuttle" }
];
let es = "DEMO_KEY";
const ts = {
  /**
   * Set the NASA API key used for APOD requests.
   *
   * The default key (`DEMO_KEY`) is heavily rate-limited (30 req/hr,
   * 50 req/day). Register for a free key at {@link https://api.nasa.gov}
   * to raise these limits to 1,000 req/hr.
   *
   * @param key - Your NASA API key.
   *
   * @example
   * ```ts
   * NASA.setApiKey('Ab12Cd34Ef56Gh78Ij90KlMnOpQrStUvWxYz0123')
   * ```
   */
  setApiKey(n) {
    es = n;
  },
  /**
   * Search the NASA Image and Video Library.
   *
   * Queries the public NASA images API and returns an array of
   * {@link NASAImageResult} objects containing metadata and preview URLs.
   *
   * @param query - Free-text search term (e.g. `'pillars of creation'`).
   * @param opts  - Optional filters and pagination settings.
   *
   * @returns An array of search results. An empty array is returned when
   *          the query matches nothing.
   *
   * @throws {Error} If the NASA API responds with a non-2xx status code.
   *
   * @example
   * ```ts
   * const results = await NASA.searchImages('pillars of creation', {
   *   yearStart: 2010,
   *   pageSize: 5,
   * })
   * for (const r of results) {
   *   console.log(r.title, r.previewUrl)
   * }
   * ```
   *
   * @see {@link https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf | NASA Image API docs}
   */
  async searchImages(n, s = {}) {
    var v;
    const { mediaType: e = "image", yearStart: i, yearEnd: t, pageSize: r = 10, page: l = 1 } = s, c = new URLSearchParams({
      q: n,
      media_type: e,
      page: String(l),
      page_size: String(r)
    });
    i && c.set("year_start", String(i)), t && c.set("year_end", String(t));
    const o = await fetch(`https://images-api.nasa.gov/search?${c.toString()}`);
    if (!o.ok) throw new Error(`NASA Image API error: ${o.status} ${o.statusText}`);
    return (((v = (await o.json()).collection) == null ? void 0 : v.items) ?? []).map((k) => {
      var a, y, u, d, f, b, p, m, A, h, C, x, j, G;
      return {
        nasaId: ((y = (a = k.data) == null ? void 0 : a[0]) == null ? void 0 : y.nasa_id) ?? "",
        title: ((d = (u = k.data) == null ? void 0 : u[0]) == null ? void 0 : d.title) ?? "",
        description: ((b = (f = k.data) == null ? void 0 : f[0]) == null ? void 0 : b.description) ?? "",
        date: ((m = (p = k.data) == null ? void 0 : p[0]) == null ? void 0 : m.date_created) ?? "",
        center: ((h = (A = k.data) == null ? void 0 : A[0]) == null ? void 0 : h.center) ?? "",
        keywords: ((x = (C = k.data) == null ? void 0 : C[0]) == null ? void 0 : x.keywords) ?? [],
        previewUrl: ((G = (j = k.links) == null ? void 0 : j.find((V) => V.rel === "preview")) == null ? void 0 : G.href) ?? null,
        href: k.href ?? ""
      };
    });
  },
  /**
   * Fetch all asset URLs for a given NASA image ID.
   *
   * Returns the full list of available renditions (JPEG, TIFF, etc.)
   * sorted by quality: original, large, medium, small, then thumbnail.
   *
   * @param nasaId - The NASA-assigned identifier (e.g. `'PIA06890'`).
   *
   * @returns An array of absolute URLs sorted from highest to lowest quality.
   *
   * @throws {Error} If the NASA asset endpoint responds with a non-2xx status.
   *
   * @example
   * ```ts
   * const urls = await NASA.getAssets('PIA06890')
   * console.log(urls[0]) // highest quality rendition
   * ```
   */
  async getAssets(n) {
    var t;
    const s = await fetch(
      `https://images-api.nasa.gov/asset/${encodeURIComponent(n)}`
    );
    if (!s.ok) throw new Error(`NASA asset fetch error: ${s.status}`);
    const e = await s.json(), i = (r) => r.includes("~orig") ? 0 : r.includes("~large") ? 1 : r.includes("~medium") ? 2 : r.includes("~small") ? 3 : 4;
    return (((t = e.collection) == null ? void 0 : t.items) ?? []).map((r) => r.href).sort((r, l) => i(r) - i(l));
  },
  /**
   * Convenience helper that returns the single highest-quality image URL
   * for a NASA asset ID.
   *
   * Internally calls {@link NASA.getAssets} and filters for image file
   * extensions (JPEG, PNG, GIF, TIFF), returning the first match (which
   * is the original-resolution rendition when available).
   *
   * @param nasaId - The NASA-assigned identifier (e.g. `'PIA06890'`).
   *
   * @returns The URL of the best available image, or `null` if no image
   *          renditions exist for the given ID.
   *
   * @throws {Error} If the underlying {@link NASA.getAssets} call fails.
   *
   * @example
   * ```ts
   * const url = await NASA.getBestImageUrl('PIA06890')
   * if (url) {
   *   document.querySelector('img')!.src = url
   * }
   * ```
   */
  async getBestImageUrl(n) {
    return (await this.getAssets(n)).filter((i) => /\.(jpe?g|png|gif|tiff?)$/i.test(i))[0] ?? null;
  },
  /**
   * Fetch the NASA Astronomy Picture of the Day (APOD).
   *
   * Returns a single {@link APODResult} containing the title, explanation,
   * standard and HD image URLs, and copyright information.
   *
   * @param date - An ISO-8601 date string (`'2024-06-15'`) or a `Date`
   *               object. When omitted the API returns today's picture.
   *
   * @returns The APOD entry for the requested date.
   *
   * @throws {Error} If the APOD API responds with a non-2xx status code
   *                 (e.g. 403 for an invalid API key, 404 for a date with
   *                 no entry).
   *
   * @example
   * ```ts
   * // Today's APOD
   * const today = await NASA.apod()
   * console.log(today.title, today.hdUrl)
   *
   * // A specific date
   * const historic = await NASA.apod('1995-06-16')
   * ```
   */
  async apod(n) {
    const s = new URLSearchParams({ api_key: es });
    if (n) {
      const t = n instanceof Date ? n : new Date(n);
      s.set("date", t.toISOString().slice(0, 10));
    }
    const e = await fetch(`https://api.nasa.gov/planetary/apod?${s.toString()}`);
    if (!e.ok) throw new Error(`APOD error: ${e.status} ${e.statusText}`);
    const i = await e.json();
    return {
      title: i.title,
      date: i.date,
      explanation: i.explanation,
      url: i.url,
      hdUrl: i.hdurl ?? i.url,
      mediaType: i.media_type === "video" ? "video" : "image",
      copyright: i.copyright ?? "NASA"
    };
  },
  /**
   * Fetch a random selection of recent APOD entries.
   *
   * Uses the `count` parameter of the APOD API to retrieve multiple
   * randomly-selected entries at once. Thumbnails are requested for
   * video entries.
   *
   * @param count - Number of random entries to return. Defaults to `7`.
   *                The NASA API supports a maximum of `100`.
   *
   * @returns An array of {@link APODResult} objects.
   *
   * @throws {Error} If the APOD API responds with a non-2xx status code.
   *
   * @example
   * ```ts
   * const week = await NASA.recentAPOD()
   * for (const entry of week) {
   *   console.log(`${entry.date}: ${entry.title}`)
   * }
   *
   * // Fetch 20 random entries
   * const batch = await NASA.recentAPOD(20)
   * ```
   */
  async recentAPOD(n = 7) {
    const s = new URLSearchParams({
      api_key: es,
      count: String(n),
      thumbs: "true"
    }), e = await fetch(`https://api.nasa.gov/planetary/apod?${s.toString()}`);
    if (!e.ok) throw new Error(`APOD error: ${e.status} ${e.statusText}`);
    return (await e.json()).map((t) => ({
      title: t.title,
      date: t.date,
      explanation: t.explanation,
      url: t.url,
      hdUrl: t.hdurl ?? t.url,
      mediaType: t.media_type === "video" ? "video" : "image",
      copyright: t.copyright ?? "NASA"
    }));
  }
}, ms = {
  /**
   * Search the ESA Hubble Space Telescope image archive.
   *
   * Queries the ESAHubble public REST API and returns an array of
   * {@link ESAHubbleResult} objects with image metadata and URLs.
   *
   * @param query - Free-text search term (e.g. `'crab nebula'`).
   * @param limit - Maximum number of results to return. Defaults to `10`.
   *
   * @returns An array of matching Hubble image results. Each result
   *          includes both a full-resolution `imageUrl` and a
   *          screen-sized `thumbUrl`.
   *
   * @throws {Error} If the ESA API responds with a non-2xx status code.
   *
   * @example
   * ```ts
   * const results = await ESA.searchHubble('crab nebula', 3)
   * for (const r of results) {
   *   console.log(r.title, r.thumbUrl)
   * }
   * ```
   *
   * @see {@link https://esahubble.org/api/v1/ | ESA Hubble API docs}
   */
  async searchHubble(n, s = 10) {
    const e = await fetch(
      `https://esahubble.org/api/v1/images/?search=${encodeURIComponent(n)}&limit=${s}`
    );
    if (!e.ok) throw new Error(`ESA Hubble API error: ${e.status}`);
    return ((await e.json()).results ?? []).map((t) => {
      var l, c;
      const r = ((c = (l = t.image_files) == null ? void 0 : l[0]) == null ? void 0 : c.file_url) ?? null;
      return {
        id: t.id ?? "",
        title: t.title ?? "",
        description: t.description ?? "",
        credit: t.credit ?? "",
        date: t.release_date ?? "",
        imageUrl: r,
        thumbUrl: (r == null ? void 0 : r.replace("original", "screen")) ?? null,
        tags: t.subject_category ?? []
      };
    });
  }
};
async function Es(n) {
  var r;
  const s = new URLSearchParams({
    REQUEST: "doQuery",
    LANG: "ADQL",
    FORMAT: "json",
    QUERY: [
      "SELECT TOP 1 main_id, ra, dec, otype",
      "FROM basic",
      "JOIN ident ON ident.oidref = basic.oid",
      `WHERE id = '${n.replace(/'/g, "''")}'`
    ].join(" ")
  }), e = await fetch("https://simbad.cds.unistra.fr/simbad/sim-tap/sync", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: s.toString()
  });
  if (!e.ok) throw new Error(`Simbad error: ${e.status}`);
  const t = (r = (await e.json()).data) == null ? void 0 : r[0];
  return t ? { id: t[0], ra: t[1], dec: t[2], type: t[3] } : null;
}
const Os = {
  acrab: { g: "/rings.v3.skycell/0938/008/rings.v3.skycell.0938.008.stk.g.unconv.fits", i: "/rings.v3.skycell/0938/008/rings.v3.skycell.0938.008.stk.i.unconv.fits", r: "/rings.v3.skycell/0938/008/rings.v3.skycell.0938.008.stk.r.unconv.fits", y: "/rings.v3.skycell/0938/008/rings.v3.skycell.0938.008.stk.y.unconv.fits", z: "/rings.v3.skycell/0938/008/rings.v3.skycell.0938.008.stk.z.unconv.fits" },
  adhafera: { g: "/rings.v3.skycell/1800/085/rings.v3.skycell.1800.085.stk.g.unconv.fits", i: "/rings.v3.skycell/1800/085/rings.v3.skycell.1800.085.stk.i.unconv.fits", r: "/rings.v3.skycell/1800/085/rings.v3.skycell.1800.085.stk.r.unconv.fits", y: "/rings.v3.skycell/1800/085/rings.v3.skycell.1800.085.stk.y.unconv.fits", z: "/rings.v3.skycell/1800/085/rings.v3.skycell.1800.085.stk.z.unconv.fits" },
  adhara: { g: "/rings.v3.skycell/0658/075/rings.v3.skycell.0658.075.stk.g.unconv.fits", i: "/rings.v3.skycell/0658/075/rings.v3.skycell.0658.075.stk.i.unconv.fits", r: "/rings.v3.skycell/0658/075/rings.v3.skycell.0658.075.stk.r.unconv.fits", y: "/rings.v3.skycell/0658/075/rings.v3.skycell.0658.075.stk.y.unconv.fits", z: "/rings.v3.skycell/0658/075/rings.v3.skycell.0658.075.stk.z.unconv.fits" },
  albireo: { g: "/rings.v3.skycell/1915/098/rings.v3.skycell.1915.098.stk.g.unconv.fits", i: "/rings.v3.skycell/1915/098/rings.v3.skycell.1915.098.stk.i.unconv.fits", r: "/rings.v3.skycell/1915/098/rings.v3.skycell.1915.098.stk.r.unconv.fits", y: "/rings.v3.skycell/1915/098/rings.v3.skycell.1915.098.stk.y.unconv.fits", z: "/rings.v3.skycell/1915/098/rings.v3.skycell.1915.098.stk.z.unconv.fits" },
  alchiba: { g: "/rings.v3.skycell/0755/080/rings.v3.skycell.0755.080.stk.g.unconv.fits", i: "/rings.v3.skycell/0755/080/rings.v3.skycell.0755.080.stk.i.unconv.fits", r: "/rings.v3.skycell/0755/080/rings.v3.skycell.0755.080.stk.r.unconv.fits", y: "/rings.v3.skycell/0755/080/rings.v3.skycell.0755.080.stk.y.unconv.fits", z: "/rings.v3.skycell/0755/080/rings.v3.skycell.0755.080.stk.z.unconv.fits" },
  aldebaran: { g: "/rings.v3.skycell/1694/010/rings.v3.skycell.1694.010.stk.g.unconv.fits", i: "/rings.v3.skycell/1694/010/rings.v3.skycell.1694.010.stk.i.unconv.fits", r: "/rings.v3.skycell/1694/010/rings.v3.skycell.1694.010.stk.r.unconv.fits", y: "/rings.v3.skycell/1694/010/rings.v3.skycell.1694.010.stk.y.unconv.fits", z: "/rings.v3.skycell/1694/010/rings.v3.skycell.1694.010.stk.z.unconv.fits" },
  alderamin: { g: "/rings.v3.skycell/2494/065/rings.v3.skycell.2494.065.stk.g.unconv.fits", i: "/rings.v3.skycell/2494/065/rings.v3.skycell.2494.065.stk.i.unconv.fits", r: "/rings.v3.skycell/2494/065/rings.v3.skycell.2494.065.stk.r.unconv.fits", y: "/rings.v3.skycell/2494/065/rings.v3.skycell.2494.065.stk.y.unconv.fits", z: "/rings.v3.skycell/2494/065/rings.v3.skycell.2494.065.stk.z.unconv.fits" },
  algedi: { g: "/rings.v3.skycell/1040/080/rings.v3.skycell.1040.080.stk.g.unconv.fits", i: "/rings.v3.skycell/1040/080/rings.v3.skycell.1040.080.stk.i.unconv.fits", r: "/rings.v3.skycell/1040/080/rings.v3.skycell.1040.080.stk.r.unconv.fits", y: "/rings.v3.skycell/1040/080/rings.v3.skycell.1040.080.stk.y.unconv.fits", z: "/rings.v3.skycell/1040/080/rings.v3.skycell.1040.080.stk.z.unconv.fits" },
  algenib: { g: "/rings.v3.skycell/1591/076/rings.v3.skycell.1591.076.stk.g.unconv.fits", i: "/rings.v3.skycell/1591/076/rings.v3.skycell.1591.076.stk.i.unconv.fits", r: "/rings.v3.skycell/1591/076/rings.v3.skycell.1591.076.stk.r.unconv.fits", y: "/rings.v3.skycell/1591/076/rings.v3.skycell.1591.076.stk.y.unconv.fits", z: "/rings.v3.skycell/1591/076/rings.v3.skycell.1591.076.stk.z.unconv.fits" },
  algieba: { g: "/rings.v3.skycell/1715/094/rings.v3.skycell.1715.094.stk.g.unconv.fits", i: "/rings.v3.skycell/1715/094/rings.v3.skycell.1715.094.stk.i.unconv.fits", r: "/rings.v3.skycell/1715/094/rings.v3.skycell.1715.094.stk.r.unconv.fits", y: "/rings.v3.skycell/1715/094/rings.v3.skycell.1715.094.stk.y.unconv.fits", z: "/rings.v3.skycell/1715/094/rings.v3.skycell.1715.094.stk.z.unconv.fits" },
  algol: { g: "/rings.v3.skycell/2166/026/rings.v3.skycell.2166.026.stk.g.unconv.fits", i: "/rings.v3.skycell/2166/026/rings.v3.skycell.2166.026.stk.i.unconv.fits", r: "/rings.v3.skycell/2166/026/rings.v3.skycell.2166.026.stk.r.unconv.fits", y: "/rings.v3.skycell/2166/026/rings.v3.skycell.2166.026.stk.y.unconv.fits", z: "/rings.v3.skycell/2166/026/rings.v3.skycell.2166.026.stk.z.unconv.fits" },
  algorab: { g: "/rings.v3.skycell/0925/087/rings.v3.skycell.0925.087.stk.g.unconv.fits", i: "/rings.v3.skycell/0925/087/rings.v3.skycell.0925.087.stk.i.unconv.fits", r: "/rings.v3.skycell/0925/087/rings.v3.skycell.0925.087.stk.r.unconv.fits", y: "/rings.v3.skycell/0925/087/rings.v3.skycell.0925.087.stk.y.unconv.fits", z: "/rings.v3.skycell/0925/087/rings.v3.skycell.0925.087.stk.z.unconv.fits" },
  alhena: { g: "/rings.v3.skycell/1702/017/rings.v3.skycell.1702.017.stk.g.unconv.fits", i: "/rings.v3.skycell/1702/017/rings.v3.skycell.1702.017.stk.i.unconv.fits", r: "/rings.v3.skycell/1702/017/rings.v3.skycell.1702.017.stk.r.unconv.fits", y: "/rings.v3.skycell/1702/017/rings.v3.skycell.1702.017.stk.y.unconv.fits", z: "/rings.v3.skycell/1702/017/rings.v3.skycell.1702.017.stk.z.unconv.fits" },
  alioth: { g: "/rings.v3.skycell/2379/098/rings.v3.skycell.2379.098.stk.g.unconv.fits", i: "/rings.v3.skycell/2379/098/rings.v3.skycell.2379.098.stk.i.unconv.fits", r: "/rings.v3.skycell/2379/098/rings.v3.skycell.2379.098.stk.r.unconv.fits", y: "/rings.v3.skycell/2379/098/rings.v3.skycell.2379.098.stk.y.unconv.fits", z: "/rings.v3.skycell/2379/098/rings.v3.skycell.2379.098.stk.z.unconv.fits" },
  aljanah: { g: "/rings.v3.skycell/2075/047/rings.v3.skycell.2075.047.stk.g.unconv.fits", i: "/rings.v3.skycell/2075/047/rings.v3.skycell.2075.047.stk.i.unconv.fits", r: "/rings.v3.skycell/2075/047/rings.v3.skycell.2075.047.stk.r.unconv.fits", y: "/rings.v3.skycell/2075/047/rings.v3.skycell.2075.047.stk.y.unconv.fits", z: "/rings.v3.skycell/2075/047/rings.v3.skycell.2075.047.stk.z.unconv.fits" },
  alkaid: { g: "/rings.v3.skycell/2323/030/rings.v3.skycell.2323.030.stk.g.unconv.fits", i: "/rings.v3.skycell/2323/030/rings.v3.skycell.2323.030.stk.i.unconv.fits", r: "/rings.v3.skycell/2323/030/rings.v3.skycell.2323.030.stk.r.unconv.fits", y: "/rings.v3.skycell/2323/030/rings.v3.skycell.2323.030.stk.y.unconv.fits", z: "/rings.v3.skycell/2323/030/rings.v3.skycell.2323.030.stk.z.unconv.fits" },
  alkalurops: { g: "/rings.v3.skycell/2131/032/rings.v3.skycell.2131.032.stk.g.unconv.fits", i: "/rings.v3.skycell/2131/032/rings.v3.skycell.2131.032.stk.i.unconv.fits", r: "/rings.v3.skycell/2131/032/rings.v3.skycell.2131.032.stk.r.unconv.fits", y: "/rings.v3.skycell/2131/032/rings.v3.skycell.2131.032.stk.y.unconv.fits", z: "/rings.v3.skycell/2131/032/rings.v3.skycell.2131.032.stk.z.unconv.fits" },
  alkaphrah: { g: "/rings.v3.skycell/2249/076/rings.v3.skycell.2249.076.stk.g.unconv.fits", i: "/rings.v3.skycell/2249/076/rings.v3.skycell.2249.076.stk.i.unconv.fits", r: "/rings.v3.skycell/2249/076/rings.v3.skycell.2249.076.stk.r.unconv.fits", y: "/rings.v3.skycell/2249/076/rings.v3.skycell.2249.076.stk.y.unconv.fits", z: "/rings.v3.skycell/2249/076/rings.v3.skycell.2249.076.stk.z.unconv.fits" },
  alkes: { g: "/rings.v3.skycell/0919/041/rings.v3.skycell.0919.041.stk.g.unconv.fits", i: "/rings.v3.skycell/0919/041/rings.v3.skycell.0919.041.stk.i.unconv.fits", r: "/rings.v3.skycell/0919/041/rings.v3.skycell.0919.041.stk.r.unconv.fits", y: "/rings.v3.skycell/0919/041/rings.v3.skycell.0919.041.stk.y.unconv.fits", z: "/rings.v3.skycell/0919/041/rings.v3.skycell.0919.041.stk.z.unconv.fits" },
  almach: { g: "/rings.v3.skycell/2163/056/rings.v3.skycell.2163.056.stk.g.unconv.fits", i: "/rings.v3.skycell/2163/056/rings.v3.skycell.2163.056.stk.i.unconv.fits", r: "/rings.v3.skycell/2163/056/rings.v3.skycell.2163.056.stk.r.unconv.fits", y: "/rings.v3.skycell/2163/056/rings.v3.skycell.2163.056.stk.y.unconv.fits", z: "/rings.v3.skycell/2163/056/rings.v3.skycell.2163.056.stk.z.unconv.fits" },
  alnilam: { g: "/rings.v3.skycell/1253/064/rings.v3.skycell.1253.064.stk.g.unconv.fits", i: "/rings.v3.skycell/1253/064/rings.v3.skycell.1253.064.stk.i.unconv.fits", r: "/rings.v3.skycell/1253/064/rings.v3.skycell.1253.064.stk.r.unconv.fits", y: "/rings.v3.skycell/1253/064/rings.v3.skycell.1253.064.stk.y.unconv.fits", z: "/rings.v3.skycell/1253/064/rings.v3.skycell.1253.064.stk.z.unconv.fits" },
  alnitak: { g: "/rings.v3.skycell/1253/052/rings.v3.skycell.1253.052.stk.g.unconv.fits", i: "/rings.v3.skycell/1253/052/rings.v3.skycell.1253.052.stk.i.unconv.fits", r: "/rings.v3.skycell/1253/052/rings.v3.skycell.1253.052.stk.r.unconv.fits", y: "/rings.v3.skycell/1253/052/rings.v3.skycell.1253.052.stk.y.unconv.fits", z: "/rings.v3.skycell/1253/052/rings.v3.skycell.1253.052.stk.z.unconv.fits" },
  alphard: { g: "/rings.v3.skycell/1089/084/rings.v3.skycell.1089.084.stk.g.unconv.fits", i: "/rings.v3.skycell/1089/084/rings.v3.skycell.1089.084.stk.i.unconv.fits", r: "/rings.v3.skycell/1089/084/rings.v3.skycell.1089.084.stk.r.unconv.fits", y: "/rings.v3.skycell/1089/084/rings.v3.skycell.1089.084.stk.y.unconv.fits", z: "/rings.v3.skycell/1089/084/rings.v3.skycell.1089.084.stk.z.unconv.fits" },
  alpheratz: { g: "/rings.v3.skycell/1930/020/rings.v3.skycell.1930.020.stk.g.unconv.fits", i: "/rings.v3.skycell/1930/020/rings.v3.skycell.1930.020.stk.i.unconv.fits", r: "/rings.v3.skycell/1930/020/rings.v3.skycell.1930.020.stk.r.unconv.fits", y: "/rings.v3.skycell/1930/020/rings.v3.skycell.1930.020.stk.y.unconv.fits", z: "/rings.v3.skycell/1930/020/rings.v3.skycell.1930.020.stk.z.unconv.fits" },
  alshat: { g: "/rings.v3.skycell/1041/088/rings.v3.skycell.1041.088.stk.g.unconv.fits", i: "/rings.v3.skycell/1041/088/rings.v3.skycell.1041.088.stk.i.unconv.fits", r: "/rings.v3.skycell/1041/088/rings.v3.skycell.1041.088.stk.r.unconv.fits", y: "/rings.v3.skycell/1041/088/rings.v3.skycell.1041.088.stk.y.unconv.fits", z: "/rings.v3.skycell/1041/088/rings.v3.skycell.1041.088.stk.z.unconv.fits" },
  altair: { g: "/rings.v3.skycell/1575/029/rings.v3.skycell.1575.029.stk.g.unconv.fits", i: "/rings.v3.skycell/1575/029/rings.v3.skycell.1575.029.stk.i.unconv.fits", r: "/rings.v3.skycell/1575/029/rings.v3.skycell.1575.029.stk.r.unconv.fits", y: "/rings.v3.skycell/1575/029/rings.v3.skycell.1575.029.stk.y.unconv.fits", z: "/rings.v3.skycell/1575/029/rings.v3.skycell.1575.029.stk.z.unconv.fits" },
  alterf: { g: "/rings.v3.skycell/1797/071/rings.v3.skycell.1797.071.stk.g.unconv.fits", i: "/rings.v3.skycell/1797/071/rings.v3.skycell.1797.071.stk.i.unconv.fits", r: "/rings.v3.skycell/1797/071/rings.v3.skycell.1797.071.stk.r.unconv.fits", y: "/rings.v3.skycell/1797/071/rings.v3.skycell.1797.071.stk.y.unconv.fits", z: "/rings.v3.skycell/1797/071/rings.v3.skycell.1797.071.stk.z.unconv.fits" },
  aludra: { g: "/rings.v3.skycell/0659/061/rings.v3.skycell.0659.061.stk.g.unconv.fits", i: "/rings.v3.skycell/0659/061/rings.v3.skycell.0659.061.stk.i.unconv.fits", r: "/rings.v3.skycell/0659/061/rings.v3.skycell.0659.061.stk.r.unconv.fits", y: "/rings.v3.skycell/0659/061/rings.v3.skycell.0659.061.stk.y.unconv.fits", z: "/rings.v3.skycell/0659/061/rings.v3.skycell.0659.061.stk.z.unconv.fits" },
  "alula-australis": { g: "/rings.v3.skycell/1967/083/rings.v3.skycell.1967.083.stk.g.unconv.fits", i: "/rings.v3.skycell/1967/083/rings.v3.skycell.1967.083.stk.i.unconv.fits", r: "/rings.v3.skycell/1967/083/rings.v3.skycell.1967.083.stk.r.unconv.fits", y: "/rings.v3.skycell/1967/083/rings.v3.skycell.1967.083.stk.y.unconv.fits", z: "/rings.v3.skycell/1967/083/rings.v3.skycell.1967.083.stk.z.unconv.fits" },
  antares: { g: "/rings.v3.skycell/0770/031/rings.v3.skycell.0770.031.stk.g.unconv.fits", i: "/rings.v3.skycell/0770/031/rings.v3.skycell.0770.031.stk.i.unconv.fits", r: "/rings.v3.skycell/0770/031/rings.v3.skycell.0770.031.stk.r.unconv.fits", y: "/rings.v3.skycell/0770/031/rings.v3.skycell.0770.031.stk.y.unconv.fits", z: "/rings.v3.skycell/0770/031/rings.v3.skycell.0770.031.stk.z.unconv.fits" },
  arcturus: { g: "/rings.v3.skycell/1729/073/rings.v3.skycell.1729.073.stk.g.unconv.fits", i: "/rings.v3.skycell/1729/073/rings.v3.skycell.1729.073.stk.i.unconv.fits", r: "/rings.v3.skycell/1729/073/rings.v3.skycell.1729.073.stk.r.unconv.fits", y: "/rings.v3.skycell/1729/073/rings.v3.skycell.1729.073.stk.y.unconv.fits", z: "/rings.v3.skycell/1729/073/rings.v3.skycell.1729.073.stk.z.unconv.fits" },
  arneb: { g: "/rings.v3.skycell/0900/056/rings.v3.skycell.0900.056.stk.g.unconv.fits", i: "/rings.v3.skycell/0900/056/rings.v3.skycell.0900.056.stk.i.unconv.fits", r: "/rings.v3.skycell/0900/056/rings.v3.skycell.0900.056.stk.r.unconv.fits", y: "/rings.v3.skycell/0900/056/rings.v3.skycell.0900.056.stk.y.unconv.fits", z: "/rings.v3.skycell/0900/056/rings.v3.skycell.0900.056.stk.z.unconv.fits" },
  azelfafage: { g: "/rings.v3.skycell/2283/065/rings.v3.skycell.2283.065.stk.g.unconv.fits", i: "/rings.v3.skycell/2283/065/rings.v3.skycell.2283.065.stk.i.unconv.fits", r: "/rings.v3.skycell/2283/065/rings.v3.skycell.2283.065.stk.r.unconv.fits", y: "/rings.v3.skycell/2283/065/rings.v3.skycell.2283.065.stk.y.unconv.fits", z: "/rings.v3.skycell/2283/065/rings.v3.skycell.2283.065.stk.z.unconv.fits" },
  "baten-kaitos": { g: "/rings.v3.skycell/1061/046/rings.v3.skycell.1061.046.stk.g.unconv.fits", i: "/rings.v3.skycell/1061/046/rings.v3.skycell.1061.046.stk.i.unconv.fits", r: "/rings.v3.skycell/1061/046/rings.v3.skycell.1061.046.stk.r.unconv.fits", y: "/rings.v3.skycell/1061/046/rings.v3.skycell.1061.046.stk.y.unconv.fits", z: "/rings.v3.skycell/1061/046/rings.v3.skycell.1061.046.stk.z.unconv.fits" },
  bellatrix: { g: "/rings.v3.skycell/1432/054/rings.v3.skycell.1432.054.stk.g.unconv.fits", i: "/rings.v3.skycell/1432/054/rings.v3.skycell.1432.054.stk.i.unconv.fits", r: "/rings.v3.skycell/1432/054/rings.v3.skycell.1432.054.stk.r.unconv.fits", y: "/rings.v3.skycell/1432/054/rings.v3.skycell.1432.054.stk.y.unconv.fits", z: "/rings.v3.skycell/1432/054/rings.v3.skycell.1432.054.stk.z.unconv.fits" },
  betelgeuse: { g: "/rings.v3.skycell/1434/085/rings.v3.skycell.1434.085.stk.g.unconv.fits", i: "/rings.v3.skycell/1434/085/rings.v3.skycell.1434.085.stk.i.unconv.fits", r: "/rings.v3.skycell/1434/085/rings.v3.skycell.1434.085.stk.r.unconv.fits", y: "/rings.v3.skycell/1434/085/rings.v3.skycell.1434.085.stk.y.unconv.fits", z: "/rings.v3.skycell/1434/085/rings.v3.skycell.1434.085.stk.z.unconv.fits" },
  biham: { g: "/rings.v3.skycell/1494/052/rings.v3.skycell.1494.052.stk.g.unconv.fits", i: "/rings.v3.skycell/1494/052/rings.v3.skycell.1494.052.stk.i.unconv.fits", r: "/rings.v3.skycell/1494/052/rings.v3.skycell.1494.052.stk.r.unconv.fits", y: "/rings.v3.skycell/1494/052/rings.v3.skycell.1494.052.stk.y.unconv.fits", z: "/rings.v3.skycell/1494/052/rings.v3.skycell.1494.052.stk.z.unconv.fits" },
  capella: { g: "/rings.v3.skycell/2239/044/rings.v3.skycell.2239.044.stk.g.unconv.fits", i: "/rings.v3.skycell/2239/044/rings.v3.skycell.2239.044.stk.i.unconv.fits", r: "/rings.v3.skycell/2239/044/rings.v3.skycell.2239.044.stk.r.unconv.fits", y: "/rings.v3.skycell/2239/044/rings.v3.skycell.2239.044.stk.y.unconv.fits", z: "/rings.v3.skycell/2239/044/rings.v3.skycell.2239.044.stk.z.unconv.fits" },
  caph: { g: "/rings.v3.skycell/2404/072/rings.v3.skycell.2404.072.stk.g.unconv.fits", i: "/rings.v3.skycell/2404/072/rings.v3.skycell.2404.072.stk.i.unconv.fits", r: "/rings.v3.skycell/2404/072/rings.v3.skycell.2404.072.stk.r.unconv.fits", y: "/rings.v3.skycell/2404/072/rings.v3.skycell.2404.072.stk.y.unconv.fits", z: "/rings.v3.skycell/2404/072/rings.v3.skycell.2404.072.stk.z.unconv.fits" },
  chara: { g: "/rings.v3.skycell/2193/038/rings.v3.skycell.2193.038.stk.g.unconv.fits", i: "/rings.v3.skycell/2193/038/rings.v3.skycell.2193.038.stk.i.unconv.fits", r: "/rings.v3.skycell/2193/038/rings.v3.skycell.2193.038.stk.r.unconv.fits", y: "/rings.v3.skycell/2193/038/rings.v3.skycell.2193.038.stk.y.unconv.fits", z: "/rings.v3.skycell/2193/038/rings.v3.skycell.2193.038.stk.z.unconv.fits" },
  chertan: { g: "/rings.v3.skycell/1631/082/rings.v3.skycell.1631.082.stk.g.unconv.fits", i: "/rings.v3.skycell/1631/082/rings.v3.skycell.1631.082.stk.i.unconv.fits", r: "/rings.v3.skycell/1631/082/rings.v3.skycell.1631.082.stk.r.unconv.fits", y: "/rings.v3.skycell/1631/082/rings.v3.skycell.1631.082.stk.y.unconv.fits", z: "/rings.v3.skycell/1631/082/rings.v3.skycell.1631.082.stk.z.unconv.fits" },
  "cor-caroli": { g: "/rings.v3.skycell/2124/056/rings.v3.skycell.2124.056.stk.g.unconv.fits", i: "/rings.v3.skycell/2124/056/rings.v3.skycell.2124.056.stk.i.unconv.fits", r: "/rings.v3.skycell/2124/056/rings.v3.skycell.2124.056.stk.r.unconv.fits", y: "/rings.v3.skycell/2124/056/rings.v3.skycell.2124.056.stk.y.unconv.fits", z: "/rings.v3.skycell/2124/056/rings.v3.skycell.2124.056.stk.z.unconv.fits" },
  cursa: { g: "/rings.v3.skycell/1162/074/rings.v3.skycell.1162.074.stk.g.unconv.fits", i: "/rings.v3.skycell/1162/074/rings.v3.skycell.1162.074.stk.i.unconv.fits", r: "/rings.v3.skycell/1162/074/rings.v3.skycell.1162.074.stk.r.unconv.fits", y: "/rings.v3.skycell/1162/074/rings.v3.skycell.1162.074.stk.y.unconv.fits", z: "/rings.v3.skycell/1162/074/rings.v3.skycell.1162.074.stk.z.unconv.fits" },
  dabih: { g: "/rings.v3.skycell/1041/038/rings.v3.skycell.1041.038.stk.g.unconv.fits", i: "/rings.v3.skycell/1041/038/rings.v3.skycell.1041.038.stk.i.unconv.fits", r: "/rings.v3.skycell/1041/038/rings.v3.skycell.1041.038.stk.r.unconv.fits", y: "/rings.v3.skycell/1041/038/rings.v3.skycell.1041.038.stk.y.unconv.fits", z: "/rings.v3.skycell/1041/038/rings.v3.skycell.1041.038.stk.z.unconv.fits" },
  deneb: { g: "/rings.v3.skycell/2280/033/rings.v3.skycell.2280.033.stk.g.unconv.fits", i: "/rings.v3.skycell/2280/033/rings.v3.skycell.2280.033.stk.i.unconv.fits", r: "/rings.v3.skycell/2280/033/rings.v3.skycell.2280.033.stk.r.unconv.fits", y: "/rings.v3.skycell/2280/033/rings.v3.skycell.2280.033.stk.y.unconv.fits", z: "/rings.v3.skycell/2280/033/rings.v3.skycell.2280.033.stk.z.unconv.fits" },
  "deneb-algedi": { g: "/rings.v3.skycell/0958/094/rings.v3.skycell.0958.094.stk.g.unconv.fits", i: "/rings.v3.skycell/0958/094/rings.v3.skycell.0958.094.stk.i.unconv.fits", r: "/rings.v3.skycell/0958/094/rings.v3.skycell.0958.094.stk.r.unconv.fits", y: "/rings.v3.skycell/0958/094/rings.v3.skycell.0958.094.stk.y.unconv.fits", z: "/rings.v3.skycell/0958/094/rings.v3.skycell.0958.094.stk.z.unconv.fits" },
  denebola: { g: "/rings.v3.skycell/1633/061/rings.v3.skycell.1633.061.stk.g.unconv.fits", i: "/rings.v3.skycell/1633/061/rings.v3.skycell.1633.061.stk.i.unconv.fits", r: "/rings.v3.skycell/1633/061/rings.v3.skycell.1633.061.stk.r.unconv.fits", y: "/rings.v3.skycell/1633/061/rings.v3.skycell.1633.061.stk.y.unconv.fits", z: "/rings.v3.skycell/1633/061/rings.v3.skycell.1633.061.stk.z.unconv.fits" },
  diphda: { g: "/rings.v3.skycell/0883/058/rings.v3.skycell.0883.058.stk.g.unconv.fits", i: "/rings.v3.skycell/0883/058/rings.v3.skycell.0883.058.stk.i.unconv.fits", r: "/rings.v3.skycell/0883/058/rings.v3.skycell.0883.058.stk.r.unconv.fits", y: "/rings.v3.skycell/0883/058/rings.v3.skycell.0883.058.stk.y.unconv.fits", z: "/rings.v3.skycell/0883/058/rings.v3.skycell.0883.058.stk.z.unconv.fits" },
  dschubba: { g: "/rings.v3.skycell/0852/034/rings.v3.skycell.0852.034.stk.g.unconv.fits", i: "/rings.v3.skycell/0852/034/rings.v3.skycell.0852.034.stk.i.unconv.fits", r: "/rings.v3.skycell/0852/034/rings.v3.skycell.0852.034.stk.r.unconv.fits", y: "/rings.v3.skycell/0852/034/rings.v3.skycell.0852.034.stk.y.unconv.fits", z: "/rings.v3.skycell/0852/034/rings.v3.skycell.0852.034.stk.z.unconv.fits" },
  dubhe: { g: "/rings.v3.skycell/2475/047/rings.v3.skycell.2475.047.stk.g.unconv.fits", i: "/rings.v3.skycell/2475/047/rings.v3.skycell.2475.047.stk.i.unconv.fits", r: "/rings.v3.skycell/2475/047/rings.v3.skycell.2475.047.stk.r.unconv.fits", y: "/rings.v3.skycell/2475/047/rings.v3.skycell.2475.047.stk.y.unconv.fits", z: "/rings.v3.skycell/2475/047/rings.v3.skycell.2475.047.stk.z.unconv.fits" },
  elnath: { g: "/rings.v3.skycell/1948/015/rings.v3.skycell.1948.015.stk.g.unconv.fits", i: "/rings.v3.skycell/1948/015/rings.v3.skycell.1948.015.stk.i.unconv.fits", r: "/rings.v3.skycell/1948/015/rings.v3.skycell.1948.015.stk.r.unconv.fits", y: "/rings.v3.skycell/1948/015/rings.v3.skycell.1948.015.stk.y.unconv.fits", z: "/rings.v3.skycell/1948/015/rings.v3.skycell.1948.015.stk.z.unconv.fits" },
  eltanin: { g: "/rings.v3.skycell/2334/086/rings.v3.skycell.2334.086.stk.g.unconv.fits", i: "/rings.v3.skycell/2334/086/rings.v3.skycell.2334.086.stk.i.unconv.fits", r: "/rings.v3.skycell/2334/086/rings.v3.skycell.2334.086.stk.r.unconv.fits", y: "/rings.v3.skycell/2334/086/rings.v3.skycell.2334.086.stk.y.unconv.fits", z: "/rings.v3.skycell/2334/086/rings.v3.skycell.2334.086.stk.z.unconv.fits" },
  enif: { g: "/rings.v3.skycell/1582/048/rings.v3.skycell.1582.048.stk.g.unconv.fits", i: "/rings.v3.skycell/1582/048/rings.v3.skycell.1582.048.stk.i.unconv.fits", r: "/rings.v3.skycell/1582/048/rings.v3.skycell.1582.048.stk.r.unconv.fits", y: "/rings.v3.skycell/1582/048/rings.v3.skycell.1582.048.stk.y.unconv.fits", z: "/rings.v3.skycell/1582/048/rings.v3.skycell.1582.048.stk.z.unconv.fits" },
  fomalhaut: { g: "/rings.v3.skycell/0711/059/rings.v3.skycell.0711.059.stk.g.unconv.fits", i: "/rings.v3.skycell/0711/059/rings.v3.skycell.0711.059.stk.i.unconv.fits", r: "/rings.v3.skycell/0711/059/rings.v3.skycell.0711.059.stk.r.unconv.fits", y: "/rings.v3.skycell/0711/059/rings.v3.skycell.0711.059.stk.y.unconv.fits", z: "/rings.v3.skycell/0711/059/rings.v3.skycell.0711.059.stk.z.unconv.fits" },
  gemma: { g: "/rings.v3.skycell/1901/062/rings.v3.skycell.1901.062.stk.g.unconv.fits", i: "/rings.v3.skycell/1901/062/rings.v3.skycell.1901.062.stk.i.unconv.fits", r: "/rings.v3.skycell/1901/062/rings.v3.skycell.1901.062.stk.r.unconv.fits", y: "/rings.v3.skycell/1901/062/rings.v3.skycell.1901.062.stk.y.unconv.fits", z: "/rings.v3.skycell/1901/062/rings.v3.skycell.1901.062.stk.z.unconv.fits" },
  gienah: { g: "/rings.v3.skycell/0924/065/rings.v3.skycell.0924.065.stk.g.unconv.fits", i: "/rings.v3.skycell/0924/065/rings.v3.skycell.0924.065.stk.i.unconv.fits", r: "/rings.v3.skycell/0924/065/rings.v3.skycell.0924.065.stk.r.unconv.fits", y: "/rings.v3.skycell/0924/065/rings.v3.skycell.0924.065.stk.y.unconv.fits", z: "/rings.v3.skycell/0924/065/rings.v3.skycell.0924.065.stk.z.unconv.fits" },
  hamal: { g: "/rings.v3.skycell/1771/080/rings.v3.skycell.1771.080.stk.g.unconv.fits", i: "/rings.v3.skycell/1771/080/rings.v3.skycell.1771.080.stk.i.unconv.fits", r: "/rings.v3.skycell/1771/080/rings.v3.skycell.1771.080.stk.r.unconv.fits", y: "/rings.v3.skycell/1771/080/rings.v3.skycell.1771.080.stk.y.unconv.fits", z: "/rings.v3.skycell/1771/080/rings.v3.skycell.1771.080.stk.z.unconv.fits" },
  hassaleh: { g: "/rings.v3.skycell/2025/028/rings.v3.skycell.2025.028.stk.g.unconv.fits", i: "/rings.v3.skycell/2025/028/rings.v3.skycell.2025.028.stk.i.unconv.fits", r: "/rings.v3.skycell/2025/028/rings.v3.skycell.2025.028.stk.r.unconv.fits", y: "/rings.v3.skycell/2025/028/rings.v3.skycell.2025.028.stk.y.unconv.fits", z: "/rings.v3.skycell/2025/028/rings.v3.skycell.2025.028.stk.z.unconv.fits" },
  homam: { g: "/rings.v3.skycell/1585/073/rings.v3.skycell.1585.073.stk.g.unconv.fits", i: "/rings.v3.skycell/1585/073/rings.v3.skycell.1585.073.stk.i.unconv.fits", r: "/rings.v3.skycell/1585/073/rings.v3.skycell.1585.073.stk.r.unconv.fits", y: "/rings.v3.skycell/1585/073/rings.v3.skycell.1585.073.stk.y.unconv.fits", z: "/rings.v3.skycell/1585/073/rings.v3.skycell.1585.073.stk.z.unconv.fits" },
  izar: { g: "/rings.v3.skycell/1898/071/rings.v3.skycell.1898.071.stk.g.unconv.fits", i: "/rings.v3.skycell/1898/071/rings.v3.skycell.1898.071.stk.i.unconv.fits", r: "/rings.v3.skycell/1898/071/rings.v3.skycell.1898.071.stk.r.unconv.fits", y: "/rings.v3.skycell/1898/071/rings.v3.skycell.1898.071.stk.y.unconv.fits", z: "/rings.v3.skycell/1898/071/rings.v3.skycell.1898.071.stk.z.unconv.fits" },
  kochab: { g: "/rings.v3.skycell/2588/057/rings.v3.skycell.2588.057.stk.g.unconv.fits", i: "/rings.v3.skycell/2588/057/rings.v3.skycell.2588.057.stk.i.unconv.fits", r: "/rings.v3.skycell/2588/057/rings.v3.skycell.2588.057.stk.r.unconv.fits", y: "/rings.v3.skycell/2588/057/rings.v3.skycell.2588.057.stk.y.unconv.fits", z: "/rings.v3.skycell/2588/057/rings.v3.skycell.2588.057.stk.z.unconv.fits" },
  kornephoros: { g: "/rings.v3.skycell/1822/037/rings.v3.skycell.1822.037.stk.g.unconv.fits", i: "/rings.v3.skycell/1822/037/rings.v3.skycell.1822.037.stk.i.unconv.fits", r: "/rings.v3.skycell/1822/037/rings.v3.skycell.1822.037.stk.r.unconv.fits", y: "/rings.v3.skycell/1822/037/rings.v3.skycell.1822.037.stk.y.unconv.fits", z: "/rings.v3.skycell/1822/037/rings.v3.skycell.1822.037.stk.z.unconv.fits" },
  kraz: { g: "/rings.v3.skycell/0840/014/rings.v3.skycell.0840.014.stk.g.unconv.fits", i: "/rings.v3.skycell/0840/014/rings.v3.skycell.0840.014.stk.i.unconv.fits", r: "/rings.v3.skycell/0840/014/rings.v3.skycell.0840.014.stk.r.unconv.fits", y: "/rings.v3.skycell/0840/014/rings.v3.skycell.0840.014.stk.y.unconv.fits", z: "/rings.v3.skycell/0840/014/rings.v3.skycell.0840.014.stk.z.unconv.fits" },
  m1: { g: "/rings.v3.skycell/1784/059/rings.v3.skycell.1784.059.stk.g.unconv.fits", i: "/rings.v3.skycell/1784/059/rings.v3.skycell.1784.059.stk.i.unconv.fits", r: "/rings.v3.skycell/1784/059/rings.v3.skycell.1784.059.stk.r.unconv.fits", y: "/rings.v3.skycell/1784/059/rings.v3.skycell.1784.059.stk.y.unconv.fits", z: "/rings.v3.skycell/1784/059/rings.v3.skycell.1784.059.stk.z.unconv.fits" },
  m10: { g: "/rings.v3.skycell/1206/096/rings.v3.skycell.1206.096.stk.g.unconv.fits", i: "/rings.v3.skycell/1206/096/rings.v3.skycell.1206.096.stk.i.unconv.fits", r: "/rings.v3.skycell/1206/096/rings.v3.skycell.1206.096.stk.r.unconv.fits", y: "/rings.v3.skycell/1206/096/rings.v3.skycell.1206.096.stk.y.unconv.fits", z: "/rings.v3.skycell/1206/096/rings.v3.skycell.1206.096.stk.z.unconv.fits" },
  m100: { g: "/rings.v3.skycell/1635/091/rings.v3.skycell.1635.091.stk.g.unconv.fits", i: "/rings.v3.skycell/1635/091/rings.v3.skycell.1635.091.stk.i.unconv.fits", r: "/rings.v3.skycell/1635/091/rings.v3.skycell.1635.091.stk.r.unconv.fits", y: "/rings.v3.skycell/1635/091/rings.v3.skycell.1635.091.stk.y.unconv.fits", z: "/rings.v3.skycell/1635/091/rings.v3.skycell.1635.091.stk.z.unconv.fits" },
  m101: { g: "/rings.v3.skycell/2381/053/rings.v3.skycell.2381.053.stk.g.unconv.fits", i: "/rings.v3.skycell/2381/053/rings.v3.skycell.2381.053.stk.i.unconv.fits", r: "/rings.v3.skycell/2381/053/rings.v3.skycell.2381.053.stk.r.unconv.fits", y: "/rings.v3.skycell/2381/053/rings.v3.skycell.2381.053.stk.y.unconv.fits", z: "/rings.v3.skycell/2381/053/rings.v3.skycell.2381.053.stk.z.unconv.fits" },
  m102: { g: "/rings.v3.skycell/2384/098/rings.v3.skycell.2384.098.stk.g.unconv.fits", i: "/rings.v3.skycell/2384/098/rings.v3.skycell.2384.098.stk.i.unconv.fits", r: "/rings.v3.skycell/2384/098/rings.v3.skycell.2384.098.stk.r.unconv.fits", y: "/rings.v3.skycell/2384/098/rings.v3.skycell.2384.098.stk.y.unconv.fits", z: "/rings.v3.skycell/2384/098/rings.v3.skycell.2384.098.stk.z.unconv.fits" },
  m103: { g: "/rings.v3.skycell/2457/015/rings.v3.skycell.2457.015.stk.g.unconv.fits", i: "/rings.v3.skycell/2457/015/rings.v3.skycell.2457.015.stk.i.unconv.fits", r: "/rings.v3.skycell/2457/015/rings.v3.skycell.2457.015.stk.r.unconv.fits", y: "/rings.v3.skycell/2457/015/rings.v3.skycell.2457.015.stk.y.unconv.fits", z: "/rings.v3.skycell/2457/015/rings.v3.skycell.2457.015.stk.z.unconv.fits" },
  m104: { g: "/rings.v3.skycell/1101/005/rings.v3.skycell.1101.005.stk.g.unconv.fits", i: "/rings.v3.skycell/1101/005/rings.v3.skycell.1101.005.stk.i.unconv.fits", r: "/rings.v3.skycell/1101/005/rings.v3.skycell.1101.005.stk.r.unconv.fits", y: "/rings.v3.skycell/1101/005/rings.v3.skycell.1101.005.stk.y.unconv.fits", z: "/rings.v3.skycell/1101/005/rings.v3.skycell.1101.005.stk.z.unconv.fits" },
  m105: { g: "/rings.v3.skycell/1630/019/rings.v3.skycell.1630.019.stk.g.unconv.fits", i: "/rings.v3.skycell/1630/019/rings.v3.skycell.1630.019.stk.i.unconv.fits", r: "/rings.v3.skycell/1630/019/rings.v3.skycell.1630.019.stk.r.unconv.fits", y: "/rings.v3.skycell/1630/019/rings.v3.skycell.1630.019.stk.y.unconv.fits", z: "/rings.v3.skycell/1630/019/rings.v3.skycell.1630.019.stk.z.unconv.fits" },
  m106: { g: "/rings.v3.skycell/2258/086/rings.v3.skycell.2258.086.stk.g.unconv.fits", i: "/rings.v3.skycell/2258/086/rings.v3.skycell.2258.086.stk.i.unconv.fits", r: "/rings.v3.skycell/2258/086/rings.v3.skycell.2258.086.stk.r.unconv.fits", y: "/rings.v3.skycell/2258/086/rings.v3.skycell.2258.086.stk.y.unconv.fits", z: "/rings.v3.skycell/2258/086/rings.v3.skycell.2258.086.stk.z.unconv.fits" },
  m107: { g: "/rings.v3.skycell/1027/078/rings.v3.skycell.1027.078.stk.g.unconv.fits", i: "/rings.v3.skycell/1027/078/rings.v3.skycell.1027.078.stk.i.unconv.fits", r: "/rings.v3.skycell/1027/078/rings.v3.skycell.1027.078.stk.r.unconv.fits", y: "/rings.v3.skycell/1027/078/rings.v3.skycell.1027.078.stk.y.unconv.fits", z: "/rings.v3.skycell/1027/078/rings.v3.skycell.1027.078.stk.z.unconv.fits" },
  m108: { g: "/rings.v3.skycell/2375/098/rings.v3.skycell.2375.098.stk.g.unconv.fits", i: "/rings.v3.skycell/2375/098/rings.v3.skycell.2375.098.stk.i.unconv.fits", r: "/rings.v3.skycell/2375/098/rings.v3.skycell.2375.098.stk.r.unconv.fits", y: "/rings.v3.skycell/2375/098/rings.v3.skycell.2375.098.stk.y.unconv.fits", z: "/rings.v3.skycell/2375/098/rings.v3.skycell.2375.098.stk.z.unconv.fits" },
  m109: { g: "/rings.v3.skycell/2376/031/rings.v3.skycell.2376.031.stk.g.unconv.fits", i: "/rings.v3.skycell/2376/031/rings.v3.skycell.2376.031.stk.i.unconv.fits", r: "/rings.v3.skycell/2376/031/rings.v3.skycell.2376.031.stk.r.unconv.fits", y: "/rings.v3.skycell/2376/031/rings.v3.skycell.2376.031.stk.y.unconv.fits", z: "/rings.v3.skycell/2376/031/rings.v3.skycell.2376.031.stk.z.unconv.fits" },
  m11: { g: "/rings.v3.skycell/1213/045/rings.v3.skycell.1213.045.stk.g.unconv.fits", i: "/rings.v3.skycell/1213/045/rings.v3.skycell.1213.045.stk.i.unconv.fits", r: "/rings.v3.skycell/1213/045/rings.v3.skycell.1213.045.stk.r.unconv.fits", y: "/rings.v3.skycell/1213/045/rings.v3.skycell.1213.045.stk.y.unconv.fits", z: "/rings.v3.skycell/1213/045/rings.v3.skycell.1213.045.stk.z.unconv.fits" },
  m110: { g: "/rings.v3.skycell/2159/045/rings.v3.skycell.2159.045.stk.g.unconv.fits", i: "/rings.v3.skycell/2159/045/rings.v3.skycell.2159.045.stk.i.unconv.fits", r: "/rings.v3.skycell/2159/045/rings.v3.skycell.2159.045.stk.r.unconv.fits", y: "/rings.v3.skycell/2159/045/rings.v3.skycell.2159.045.stk.y.unconv.fits", z: "/rings.v3.skycell/2159/045/rings.v3.skycell.2159.045.stk.z.unconv.fits" },
  m12: { g: "/rings.v3.skycell/1295/055/rings.v3.skycell.1295.055.stk.g.unconv.fits", i: "/rings.v3.skycell/1295/055/rings.v3.skycell.1295.055.stk.i.unconv.fits", r: "/rings.v3.skycell/1295/055/rings.v3.skycell.1295.055.stk.r.unconv.fits", y: "/rings.v3.skycell/1295/055/rings.v3.skycell.1295.055.stk.y.unconv.fits", z: "/rings.v3.skycell/1295/055/rings.v3.skycell.1295.055.stk.z.unconv.fits" },
  m13: { g: "/rings.v3.skycell/2135/014/rings.v3.skycell.2135.014.stk.g.unconv.fits", i: "/rings.v3.skycell/2135/014/rings.v3.skycell.2135.014.stk.i.unconv.fits", r: "/rings.v3.skycell/2135/014/rings.v3.skycell.2135.014.stk.r.unconv.fits", y: "/rings.v3.skycell/2135/014/rings.v3.skycell.2135.014.stk.y.unconv.fits", z: "/rings.v3.skycell/2135/014/rings.v3.skycell.2135.014.stk.z.unconv.fits" },
  m14: { g: "/rings.v3.skycell/1298/014/rings.v3.skycell.1298.014.stk.g.unconv.fits", i: "/rings.v3.skycell/1298/014/rings.v3.skycell.1298.014.stk.i.unconv.fits", r: "/rings.v3.skycell/1298/014/rings.v3.skycell.1298.014.stk.r.unconv.fits", y: "/rings.v3.skycell/1298/014/rings.v3.skycell.1298.014.stk.y.unconv.fits", z: "/rings.v3.skycell/1298/014/rings.v3.skycell.1298.014.stk.z.unconv.fits" },
  m15: { g: "/rings.v3.skycell/1669/006/rings.v3.skycell.1669.006.stk.g.unconv.fits", i: "/rings.v3.skycell/1669/006/rings.v3.skycell.1669.006.stk.i.unconv.fits", r: "/rings.v3.skycell/1669/006/rings.v3.skycell.1669.006.stk.r.unconv.fits", y: "/rings.v3.skycell/1669/006/rings.v3.skycell.1669.006.stk.y.unconv.fits", z: "/rings.v3.skycell/1669/006/rings.v3.skycell.1669.006.stk.z.unconv.fits" },
  m16: { g: "/rings.v3.skycell/1033/053/rings.v3.skycell.1033.053.stk.g.unconv.fits", i: "/rings.v3.skycell/1033/053/rings.v3.skycell.1033.053.stk.i.unconv.fits", r: "/rings.v3.skycell/1033/053/rings.v3.skycell.1033.053.stk.r.unconv.fits", y: "/rings.v3.skycell/1033/053/rings.v3.skycell.1033.053.stk.y.unconv.fits", z: "/rings.v3.skycell/1033/053/rings.v3.skycell.1033.053.stk.z.unconv.fits" },
  m17: { g: "/rings.v3.skycell/0946/097/rings.v3.skycell.0946.097.stk.g.unconv.fits", i: "/rings.v3.skycell/0946/097/rings.v3.skycell.0946.097.stk.i.unconv.fits", r: "/rings.v3.skycell/0946/097/rings.v3.skycell.0946.097.stk.r.unconv.fits", y: "/rings.v3.skycell/0946/097/rings.v3.skycell.0946.097.stk.y.unconv.fits", z: "/rings.v3.skycell/0946/097/rings.v3.skycell.0946.097.stk.z.unconv.fits" },
  m18: { g: "/rings.v3.skycell/0946/078/rings.v3.skycell.0946.078.stk.g.unconv.fits", i: "/rings.v3.skycell/0946/078/rings.v3.skycell.0946.078.stk.i.unconv.fits", r: "/rings.v3.skycell/0946/078/rings.v3.skycell.0946.078.stk.r.unconv.fits", y: "/rings.v3.skycell/0946/078/rings.v3.skycell.0946.078.stk.y.unconv.fits", z: "/rings.v3.skycell/0946/078/rings.v3.skycell.0946.078.stk.z.unconv.fits" },
  m19: { g: "/rings.v3.skycell/0772/042/rings.v3.skycell.0772.042.stk.g.unconv.fits", i: "/rings.v3.skycell/0772/042/rings.v3.skycell.0772.042.stk.i.unconv.fits", r: "/rings.v3.skycell/0772/042/rings.v3.skycell.0772.042.stk.r.unconv.fits", y: "/rings.v3.skycell/0772/042/rings.v3.skycell.0772.042.stk.y.unconv.fits", z: "/rings.v3.skycell/0772/042/rings.v3.skycell.0772.042.stk.z.unconv.fits" },
  m2: { g: "/rings.v3.skycell/1313/076/rings.v3.skycell.1313.076.stk.g.unconv.fits", i: "/rings.v3.skycell/1313/076/rings.v3.skycell.1313.076.stk.i.unconv.fits", r: "/rings.v3.skycell/1313/076/rings.v3.skycell.1313.076.stk.r.unconv.fits", y: "/rings.v3.skycell/1313/076/rings.v3.skycell.1313.076.stk.y.unconv.fits", z: "/rings.v3.skycell/1313/076/rings.v3.skycell.1313.076.stk.z.unconv.fits" },
  m20: { g: "/rings.v3.skycell/0859/023/rings.v3.skycell.0859.023.stk.g.unconv.fits", i: "/rings.v3.skycell/0859/023/rings.v3.skycell.0859.023.stk.i.unconv.fits", r: "/rings.v3.skycell/0859/023/rings.v3.skycell.0859.023.stk.r.unconv.fits", y: "/rings.v3.skycell/0859/023/rings.v3.skycell.0859.023.stk.y.unconv.fits", z: "/rings.v3.skycell/0859/023/rings.v3.skycell.0859.023.stk.z.unconv.fits" },
  m21: { g: "/rings.v3.skycell/0859/032/rings.v3.skycell.0859.032.stk.g.unconv.fits", i: "/rings.v3.skycell/0859/032/rings.v3.skycell.0859.032.stk.i.unconv.fits", r: "/rings.v3.skycell/0859/032/rings.v3.skycell.0859.032.stk.r.unconv.fits", y: "/rings.v3.skycell/0859/032/rings.v3.skycell.0859.032.stk.y.unconv.fits", z: "/rings.v3.skycell/0859/032/rings.v3.skycell.0859.032.stk.z.unconv.fits" },
  m22: { g: "/rings.v3.skycell/0861/003/rings.v3.skycell.0861.003.stk.g.unconv.fits", i: "/rings.v3.skycell/0861/003/rings.v3.skycell.0861.003.stk.i.unconv.fits", r: "/rings.v3.skycell/0861/003/rings.v3.skycell.0861.003.stk.r.unconv.fits", y: "/rings.v3.skycell/0861/003/rings.v3.skycell.0861.003.stk.y.unconv.fits", z: "/rings.v3.skycell/0861/003/rings.v3.skycell.0861.003.stk.z.unconv.fits" },
  m23: { g: "/rings.v3.skycell/0944/021/rings.v3.skycell.0944.021.stk.g.unconv.fits", i: "/rings.v3.skycell/0944/021/rings.v3.skycell.0944.021.stk.i.unconv.fits", r: "/rings.v3.skycell/0944/021/rings.v3.skycell.0944.021.stk.r.unconv.fits", y: "/rings.v3.skycell/0944/021/rings.v3.skycell.0944.021.stk.y.unconv.fits", z: "/rings.v3.skycell/0944/021/rings.v3.skycell.0944.021.stk.z.unconv.fits" },
  m24: { g: "/rings.v3.skycell/0946/039/rings.v3.skycell.0946.039.stk.g.unconv.fits", i: "/rings.v3.skycell/0946/039/rings.v3.skycell.0946.039.stk.i.unconv.fits", r: "/rings.v3.skycell/0946/039/rings.v3.skycell.0946.039.stk.r.unconv.fits", y: "/rings.v3.skycell/0946/039/rings.v3.skycell.0946.039.stk.y.unconv.fits", z: "/rings.v3.skycell/0946/039/rings.v3.skycell.0946.039.stk.z.unconv.fits" },
  m25: { g: "/rings.v3.skycell/0946/021/rings.v3.skycell.0946.021.stk.g.unconv.fits", i: "/rings.v3.skycell/0946/021/rings.v3.skycell.0946.021.stk.i.unconv.fits", r: "/rings.v3.skycell/0946/021/rings.v3.skycell.0946.021.stk.r.unconv.fits", y: "/rings.v3.skycell/0946/021/rings.v3.skycell.0946.021.stk.y.unconv.fits", z: "/rings.v3.skycell/0946/021/rings.v3.skycell.0946.021.stk.z.unconv.fits" },
  m26: { g: "/rings.v3.skycell/1123/060/rings.v3.skycell.1123.060.stk.g.unconv.fits", i: "/rings.v3.skycell/1123/060/rings.v3.skycell.1123.060.stk.i.unconv.fits", r: "/rings.v3.skycell/1123/060/rings.v3.skycell.1123.060.stk.r.unconv.fits", y: "/rings.v3.skycell/1123/060/rings.v3.skycell.1123.060.stk.y.unconv.fits", z: "/rings.v3.skycell/1123/060/rings.v3.skycell.1123.060.stk.z.unconv.fits" },
  m27: { g: "/rings.v3.skycell/1834/065/rings.v3.skycell.1834.065.stk.g.unconv.fits", i: "/rings.v3.skycell/1834/065/rings.v3.skycell.1834.065.stk.i.unconv.fits", r: "/rings.v3.skycell/1834/065/rings.v3.skycell.1834.065.stk.r.unconv.fits", y: "/rings.v3.skycell/1834/065/rings.v3.skycell.1834.065.stk.y.unconv.fits", z: "/rings.v3.skycell/1834/065/rings.v3.skycell.1834.065.stk.z.unconv.fits" },
  m28: { g: "/rings.v3.skycell/0777/076/rings.v3.skycell.0777.076.stk.g.unconv.fits", i: "/rings.v3.skycell/0777/076/rings.v3.skycell.0777.076.stk.i.unconv.fits", r: "/rings.v3.skycell/0777/076/rings.v3.skycell.0777.076.stk.r.unconv.fits", y: "/rings.v3.skycell/0777/076/rings.v3.skycell.0777.076.stk.y.unconv.fits", z: "/rings.v3.skycell/0777/076/rings.v3.skycell.0777.076.stk.z.unconv.fits" },
  m29: { g: "/rings.v3.skycell/2146/064/rings.v3.skycell.2146.064.stk.g.unconv.fits", i: "/rings.v3.skycell/2146/064/rings.v3.skycell.2146.064.stk.i.unconv.fits", r: "/rings.v3.skycell/2146/064/rings.v3.skycell.2146.064.stk.r.unconv.fits", y: "/rings.v3.skycell/2146/064/rings.v3.skycell.2146.064.stk.y.unconv.fits", z: "/rings.v3.skycell/2146/064/rings.v3.skycell.2146.064.stk.z.unconv.fits" },
  m3: { g: "/rings.v3.skycell/1975/003/rings.v3.skycell.1975.003.stk.g.unconv.fits", i: "/rings.v3.skycell/1975/003/rings.v3.skycell.1975.003.stk.i.unconv.fits", r: "/rings.v3.skycell/1975/003/rings.v3.skycell.1975.003.stk.r.unconv.fits", y: "/rings.v3.skycell/1975/003/rings.v3.skycell.1975.003.stk.y.unconv.fits", z: "/rings.v3.skycell/1975/003/rings.v3.skycell.1975.003.stk.z.unconv.fits" },
  m30: { g: "/rings.v3.skycell/0872/026/rings.v3.skycell.0872.026.stk.g.unconv.fits", i: "/rings.v3.skycell/0872/026/rings.v3.skycell.0872.026.stk.i.unconv.fits", r: "/rings.v3.skycell/0872/026/rings.v3.skycell.0872.026.stk.r.unconv.fits", y: "/rings.v3.skycell/0872/026/rings.v3.skycell.0872.026.stk.y.unconv.fits", z: "/rings.v3.skycell/0872/026/rings.v3.skycell.0872.026.stk.z.unconv.fits" },
  m31: { g: "/rings.v3.skycell/2159/034/rings.v3.skycell.2159.034.stk.g.unconv.fits", i: "/rings.v3.skycell/2159/034/rings.v3.skycell.2159.034.stk.i.unconv.fits", r: "/rings.v3.skycell/2159/034/rings.v3.skycell.2159.034.stk.r.unconv.fits", y: "/rings.v3.skycell/2159/034/rings.v3.skycell.2159.034.stk.y.unconv.fits", z: "/rings.v3.skycell/2159/034/rings.v3.skycell.2159.034.stk.z.unconv.fits" },
  m32: { g: "/rings.v3.skycell/2159/024/rings.v3.skycell.2159.024.stk.g.unconv.fits", i: "/rings.v3.skycell/2159/024/rings.v3.skycell.2159.024.stk.i.unconv.fits", r: "/rings.v3.skycell/2159/024/rings.v3.skycell.2159.024.stk.r.unconv.fits", y: "/rings.v3.skycell/2159/024/rings.v3.skycell.2159.024.stk.y.unconv.fits", z: "/rings.v3.skycell/2159/024/rings.v3.skycell.2159.024.stk.z.unconv.fits" },
  m33: { g: "/rings.v3.skycell/1935/063/rings.v3.skycell.1935.063.stk.g.unconv.fits", i: "/rings.v3.skycell/1935/063/rings.v3.skycell.1935.063.stk.i.unconv.fits", r: "/rings.v3.skycell/1935/063/rings.v3.skycell.1935.063.stk.r.unconv.fits", y: "/rings.v3.skycell/1935/063/rings.v3.skycell.1935.063.stk.y.unconv.fits", z: "/rings.v3.skycell/1935/063/rings.v3.skycell.1935.063.stk.z.unconv.fits" },
  m34: { g: "/rings.v3.skycell/2165/068/rings.v3.skycell.2165.068.stk.g.unconv.fits", i: "/rings.v3.skycell/2165/068/rings.v3.skycell.2165.068.stk.i.unconv.fits", r: "/rings.v3.skycell/2165/068/rings.v3.skycell.2165.068.stk.r.unconv.fits", y: "/rings.v3.skycell/2165/068/rings.v3.skycell.2165.068.stk.y.unconv.fits", z: "/rings.v3.skycell/2165/068/rings.v3.skycell.2165.068.stk.z.unconv.fits" },
  m35: { g: "/rings.v3.skycell/1869/004/rings.v3.skycell.1869.004.stk.g.unconv.fits", i: "/rings.v3.skycell/1869/004/rings.v3.skycell.1869.004.stk.i.unconv.fits", r: "/rings.v3.skycell/1869/004/rings.v3.skycell.1869.004.stk.r.unconv.fits", y: "/rings.v3.skycell/1869/004/rings.v3.skycell.1869.004.stk.y.unconv.fits", z: "/rings.v3.skycell/1869/004/rings.v3.skycell.1869.004.stk.z.unconv.fits" },
  m36: { g: "/rings.v3.skycell/2027/057/rings.v3.skycell.2027.057.stk.g.unconv.fits", i: "/rings.v3.skycell/2027/057/rings.v3.skycell.2027.057.stk.i.unconv.fits", r: "/rings.v3.skycell/2027/057/rings.v3.skycell.2027.057.stk.r.unconv.fits", y: "/rings.v3.skycell/2027/057/rings.v3.skycell.2027.057.stk.y.unconv.fits", z: "/rings.v3.skycell/2027/057/rings.v3.skycell.2027.057.stk.z.unconv.fits" },
  m37: { g: "/rings.v3.skycell/2028/019/rings.v3.skycell.2028.019.stk.g.unconv.fits", i: "/rings.v3.skycell/2028/019/rings.v3.skycell.2028.019.stk.i.unconv.fits", r: "/rings.v3.skycell/2028/019/rings.v3.skycell.2028.019.stk.r.unconv.fits", y: "/rings.v3.skycell/2028/019/rings.v3.skycell.2028.019.stk.y.unconv.fits", z: "/rings.v3.skycell/2028/019/rings.v3.skycell.2028.019.stk.z.unconv.fits" },
  m38: { g: "/rings.v3.skycell/2026/091/rings.v3.skycell.2026.091.stk.g.unconv.fits", i: "/rings.v3.skycell/2026/091/rings.v3.skycell.2026.091.stk.i.unconv.fits", r: "/rings.v3.skycell/2026/091/rings.v3.skycell.2026.091.stk.r.unconv.fits", y: "/rings.v3.skycell/2026/091/rings.v3.skycell.2026.091.stk.y.unconv.fits", z: "/rings.v3.skycell/2026/091/rings.v3.skycell.2026.091.stk.z.unconv.fits" },
  m39: { g: "/rings.v3.skycell/2343/016/rings.v3.skycell.2343.016.stk.g.unconv.fits", i: "/rings.v3.skycell/2343/016/rings.v3.skycell.2343.016.stk.i.unconv.fits", r: "/rings.v3.skycell/2343/016/rings.v3.skycell.2343.016.stk.r.unconv.fits", y: "/rings.v3.skycell/2343/016/rings.v3.skycell.2343.016.stk.y.unconv.fits", z: "/rings.v3.skycell/2343/016/rings.v3.skycell.2343.016.stk.z.unconv.fits" },
  m4: { g: "/rings.v3.skycell/0770/034/rings.v3.skycell.0770.034.stk.g.unconv.fits", i: "/rings.v3.skycell/0770/034/rings.v3.skycell.0770.034.stk.i.unconv.fits", r: "/rings.v3.skycell/0770/034/rings.v3.skycell.0770.034.stk.r.unconv.fits", y: "/rings.v3.skycell/0770/034/rings.v3.skycell.0770.034.stk.y.unconv.fits", z: "/rings.v3.skycell/0770/034/rings.v3.skycell.0770.034.stk.z.unconv.fits" },
  m40: { g: "/rings.v3.skycell/2430/057/rings.v3.skycell.2430.057.stk.g.unconv.fits", i: "/rings.v3.skycell/2430/057/rings.v3.skycell.2430.057.stk.i.unconv.fits", r: "/rings.v3.skycell/2430/057/rings.v3.skycell.2430.057.stk.r.unconv.fits", y: "/rings.v3.skycell/2430/057/rings.v3.skycell.2430.057.stk.y.unconv.fits", z: "/rings.v3.skycell/2430/057/rings.v3.skycell.2430.057.stk.z.unconv.fits" },
  m41: { g: "/rings.v3.skycell/0820/088/rings.v3.skycell.0820.088.stk.g.unconv.fits", i: "/rings.v3.skycell/0820/088/rings.v3.skycell.0820.088.stk.i.unconv.fits", r: "/rings.v3.skycell/0820/088/rings.v3.skycell.0820.088.stk.r.unconv.fits", y: "/rings.v3.skycell/0820/088/rings.v3.skycell.0820.088.stk.y.unconv.fits", z: "/rings.v3.skycell/0820/088/rings.v3.skycell.0820.088.stk.z.unconv.fits" },
  m42: { g: "/rings.v3.skycell/1164/067/rings.v3.skycell.1164.067.stk.g.unconv.fits", i: "/rings.v3.skycell/1164/067/rings.v3.skycell.1164.067.stk.i.unconv.fits", y: "/rings.v3.skycell/1164/067/rings.v3.skycell.1164.067.stk.y.unconv.fits", z: "/rings.v3.skycell/1164/067/rings.v3.skycell.1164.067.stk.z.unconv.fits" },
  m43: { g: "/rings.v3.skycell/1164/067/rings.v3.skycell.1164.067.stk.g.unconv.fits", i: "/rings.v3.skycell/1164/067/rings.v3.skycell.1164.067.stk.i.unconv.fits", y: "/rings.v3.skycell/1164/067/rings.v3.skycell.1164.067.stk.y.unconv.fits", z: "/rings.v3.skycell/1164/067/rings.v3.skycell.1164.067.stk.z.unconv.fits" },
  m44: { g: "/rings.v3.skycell/1709/094/rings.v3.skycell.1709.094.stk.g.unconv.fits", i: "/rings.v3.skycell/1709/094/rings.v3.skycell.1709.094.stk.i.unconv.fits", r: "/rings.v3.skycell/1709/094/rings.v3.skycell.1709.094.stk.r.unconv.fits", y: "/rings.v3.skycell/1709/094/rings.v3.skycell.1709.094.stk.y.unconv.fits", z: "/rings.v3.skycell/1709/094/rings.v3.skycell.1709.094.stk.z.unconv.fits" },
  m45: { g: "/rings.v3.skycell/1861/005/rings.v3.skycell.1861.005.stk.g.unconv.fits", i: "/rings.v3.skycell/1861/005/rings.v3.skycell.1861.005.stk.i.unconv.fits", r: "/rings.v3.skycell/1861/005/rings.v3.skycell.1861.005.stk.r.unconv.fits", y: "/rings.v3.skycell/1861/005/rings.v3.skycell.1861.005.stk.y.unconv.fits", z: "/rings.v3.skycell/1861/005/rings.v3.skycell.1861.005.stk.z.unconv.fits" },
  m46: { g: "/rings.v3.skycell/0994/022/rings.v3.skycell.0994.022.stk.g.unconv.fits", i: "/rings.v3.skycell/0994/022/rings.v3.skycell.0994.022.stk.i.unconv.fits", r: "/rings.v3.skycell/0994/022/rings.v3.skycell.0994.022.stk.r.unconv.fits", y: "/rings.v3.skycell/0994/022/rings.v3.skycell.0994.022.stk.y.unconv.fits", z: "/rings.v3.skycell/0994/022/rings.v3.skycell.0994.022.stk.z.unconv.fits" },
  m47: { g: "/rings.v3.skycell/0994/035/rings.v3.skycell.0994.035.stk.g.unconv.fits", i: "/rings.v3.skycell/0994/035/rings.v3.skycell.0994.035.stk.i.unconv.fits", r: "/rings.v3.skycell/0994/035/rings.v3.skycell.0994.035.stk.r.unconv.fits", y: "/rings.v3.skycell/0994/035/rings.v3.skycell.0994.035.stk.y.unconv.fits", z: "/rings.v3.skycell/0994/035/rings.v3.skycell.0994.035.stk.z.unconv.fits" },
  m48: { g: "/rings.v3.skycell/1174/059/rings.v3.skycell.1174.059.stk.g.unconv.fits", i: "/rings.v3.skycell/1174/059/rings.v3.skycell.1174.059.stk.i.unconv.fits", r: "/rings.v3.skycell/1174/059/rings.v3.skycell.1174.059.stk.r.unconv.fits", y: "/rings.v3.skycell/1174/059/rings.v3.skycell.1174.059.stk.y.unconv.fits", z: "/rings.v3.skycell/1174/059/rings.v3.skycell.1174.059.stk.z.unconv.fits" },
  m49: { g: "/rings.v3.skycell/1547/001/rings.v3.skycell.1547.001.stk.g.unconv.fits", i: "/rings.v3.skycell/1547/001/rings.v3.skycell.1547.001.stk.i.unconv.fits", r: "/rings.v3.skycell/1547/001/rings.v3.skycell.1547.001.stk.r.unconv.fits", y: "/rings.v3.skycell/1547/001/rings.v3.skycell.1547.001.stk.y.unconv.fits", z: "/rings.v3.skycell/1547/001/rings.v3.skycell.1547.001.stk.z.unconv.fits" },
  m5: { g: "/rings.v3.skycell/1379/050/rings.v3.skycell.1379.050.stk.g.unconv.fits", i: "/rings.v3.skycell/1379/050/rings.v3.skycell.1379.050.stk.i.unconv.fits", r: "/rings.v3.skycell/1379/050/rings.v3.skycell.1379.050.stk.r.unconv.fits", y: "/rings.v3.skycell/1379/050/rings.v3.skycell.1379.050.stk.y.unconv.fits", z: "/rings.v3.skycell/1379/050/rings.v3.skycell.1379.050.stk.z.unconv.fits" },
  m50: { g: "/rings.v3.skycell/1080/093/rings.v3.skycell.1080.093.stk.g.unconv.fits", i: "/rings.v3.skycell/1080/093/rings.v3.skycell.1080.093.stk.i.unconv.fits", r: "/rings.v3.skycell/1080/093/rings.v3.skycell.1080.093.stk.r.unconv.fits", y: "/rings.v3.skycell/1080/093/rings.v3.skycell.1080.093.stk.y.unconv.fits", z: "/rings.v3.skycell/1080/093/rings.v3.skycell.1080.093.stk.z.unconv.fits" },
  m51: { g: "/rings.v3.skycell/2261/075/rings.v3.skycell.2261.075.stk.g.unconv.fits", i: "/rings.v3.skycell/2261/075/rings.v3.skycell.2261.075.stk.i.unconv.fits", r: "/rings.v3.skycell/2261/075/rings.v3.skycell.2261.075.stk.r.unconv.fits", y: "/rings.v3.skycell/2261/075/rings.v3.skycell.2261.075.stk.y.unconv.fits", z: "/rings.v3.skycell/2261/075/rings.v3.skycell.2261.075.stk.z.unconv.fits" },
  m52: { g: "/rings.v3.skycell/2498/035/rings.v3.skycell.2498.035.stk.g.unconv.fits", i: "/rings.v3.skycell/2498/035/rings.v3.skycell.2498.035.stk.i.unconv.fits", r: "/rings.v3.skycell/2498/035/rings.v3.skycell.2498.035.stk.r.unconv.fits", y: "/rings.v3.skycell/2498/035/rings.v3.skycell.2498.035.stk.y.unconv.fits", z: "/rings.v3.skycell/2498/035/rings.v3.skycell.2498.035.stk.z.unconv.fits" },
  m53: { g: "/rings.v3.skycell/1725/051/rings.v3.skycell.1725.051.stk.g.unconv.fits", i: "/rings.v3.skycell/1725/051/rings.v3.skycell.1725.051.stk.i.unconv.fits", r: "/rings.v3.skycell/1725/051/rings.v3.skycell.1725.051.stk.r.unconv.fits", y: "/rings.v3.skycell/1725/051/rings.v3.skycell.1725.051.stk.y.unconv.fits", z: "/rings.v3.skycell/1725/051/rings.v3.skycell.1725.051.stk.z.unconv.fits" },
  m56: { g: "/rings.v3.skycell/1993/050/rings.v3.skycell.1993.050.stk.g.unconv.fits", i: "/rings.v3.skycell/1993/050/rings.v3.skycell.1993.050.stk.i.unconv.fits", r: "/rings.v3.skycell/1993/050/rings.v3.skycell.1993.050.stk.r.unconv.fits", y: "/rings.v3.skycell/1993/050/rings.v3.skycell.1993.050.stk.y.unconv.fits", z: "/rings.v3.skycell/1993/050/rings.v3.skycell.1993.050.stk.z.unconv.fits" },
  m57: { g: "/rings.v3.skycell/2069/026/rings.v3.skycell.2069.026.stk.g.unconv.fits", i: "/rings.v3.skycell/2069/026/rings.v3.skycell.2069.026.stk.i.unconv.fits", r: "/rings.v3.skycell/2069/026/rings.v3.skycell.2069.026.stk.r.unconv.fits", y: "/rings.v3.skycell/2069/026/rings.v3.skycell.2069.026.stk.y.unconv.fits", z: "/rings.v3.skycell/2069/026/rings.v3.skycell.2069.026.stk.z.unconv.fits" },
  m58: { g: "/rings.v3.skycell/1548/096/rings.v3.skycell.1548.096.stk.g.unconv.fits", i: "/rings.v3.skycell/1548/096/rings.v3.skycell.1548.096.stk.i.unconv.fits", r: "/rings.v3.skycell/1548/096/rings.v3.skycell.1548.096.stk.r.unconv.fits", y: "/rings.v3.skycell/1548/096/rings.v3.skycell.1548.096.stk.y.unconv.fits", z: "/rings.v3.skycell/1548/096/rings.v3.skycell.1548.096.stk.z.unconv.fits" },
  m59: { g: "/rings.v3.skycell/1548/094/rings.v3.skycell.1548.094.stk.g.unconv.fits", i: "/rings.v3.skycell/1548/094/rings.v3.skycell.1548.094.stk.i.unconv.fits", r: "/rings.v3.skycell/1548/094/rings.v3.skycell.1548.094.stk.r.unconv.fits", y: "/rings.v3.skycell/1548/094/rings.v3.skycell.1548.094.stk.y.unconv.fits", z: "/rings.v3.skycell/1548/094/rings.v3.skycell.1548.094.stk.z.unconv.fits" },
  m60: { g: "/rings.v3.skycell/1548/083/rings.v3.skycell.1548.083.stk.g.unconv.fits", i: "/rings.v3.skycell/1548/083/rings.v3.skycell.1548.083.stk.i.unconv.fits", r: "/rings.v3.skycell/1548/083/rings.v3.skycell.1548.083.stk.r.unconv.fits", y: "/rings.v3.skycell/1548/083/rings.v3.skycell.1548.083.stk.y.unconv.fits", z: "/rings.v3.skycell/1548/083/rings.v3.skycell.1548.083.stk.z.unconv.fits" },
  m61: { g: "/rings.v3.skycell/1458/016/rings.v3.skycell.1458.016.stk.g.unconv.fits", i: "/rings.v3.skycell/1458/016/rings.v3.skycell.1458.016.stk.i.unconv.fits", r: "/rings.v3.skycell/1458/016/rings.v3.skycell.1458.016.stk.r.unconv.fits", y: "/rings.v3.skycell/1458/016/rings.v3.skycell.1458.016.stk.y.unconv.fits", z: "/rings.v3.skycell/1458/016/rings.v3.skycell.1458.016.stk.z.unconv.fits" },
  m63: { g: "/rings.v3.skycell/2195/059/rings.v3.skycell.2195.059.stk.g.unconv.fits", i: "/rings.v3.skycell/2195/059/rings.v3.skycell.2195.059.stk.i.unconv.fits", r: "/rings.v3.skycell/2195/059/rings.v3.skycell.2195.059.stk.r.unconv.fits", y: "/rings.v3.skycell/2195/059/rings.v3.skycell.2195.059.stk.y.unconv.fits", z: "/rings.v3.skycell/2195/059/rings.v3.skycell.2195.059.stk.z.unconv.fits" },
  m64: { g: "/rings.v3.skycell/1809/041/rings.v3.skycell.1809.041.stk.g.unconv.fits", i: "/rings.v3.skycell/1809/041/rings.v3.skycell.1809.041.stk.i.unconv.fits", r: "/rings.v3.skycell/1809/041/rings.v3.skycell.1809.041.stk.r.unconv.fits", y: "/rings.v3.skycell/1809/041/rings.v3.skycell.1809.041.stk.y.unconv.fits", z: "/rings.v3.skycell/1809/041/rings.v3.skycell.1809.041.stk.z.unconv.fits" },
  m65: { g: "/rings.v3.skycell/1631/020/rings.v3.skycell.1631.020.stk.g.unconv.fits", i: "/rings.v3.skycell/1631/020/rings.v3.skycell.1631.020.stk.i.unconv.fits", r: "/rings.v3.skycell/1631/020/rings.v3.skycell.1631.020.stk.r.unconv.fits", y: "/rings.v3.skycell/1631/020/rings.v3.skycell.1631.020.stk.y.unconv.fits", z: "/rings.v3.skycell/1631/020/rings.v3.skycell.1631.020.stk.z.unconv.fits" },
  m66: { g: "/rings.v3.skycell/1632/029/rings.v3.skycell.1632.029.stk.g.unconv.fits", i: "/rings.v3.skycell/1632/029/rings.v3.skycell.1632.029.stk.i.unconv.fits", r: "/rings.v3.skycell/1632/029/rings.v3.skycell.1632.029.stk.r.unconv.fits", y: "/rings.v3.skycell/1632/029/rings.v3.skycell.1632.029.stk.y.unconv.fits", z: "/rings.v3.skycell/1632/029/rings.v3.skycell.1632.029.stk.z.unconv.fits" },
  m67: { g: "/rings.v3.skycell/1534/096/rings.v3.skycell.1534.096.stk.g.unconv.fits", i: "/rings.v3.skycell/1534/096/rings.v3.skycell.1534.096.stk.i.unconv.fits", r: "/rings.v3.skycell/1534/096/rings.v3.skycell.1534.096.stk.r.unconv.fits", y: "/rings.v3.skycell/1534/096/rings.v3.skycell.1534.096.stk.y.unconv.fits", z: "/rings.v3.skycell/1534/096/rings.v3.skycell.1534.096.stk.z.unconv.fits" },
  m68: { g: "/rings.v3.skycell/0757/032/rings.v3.skycell.0757.032.stk.g.unconv.fits", i: "/rings.v3.skycell/0757/032/rings.v3.skycell.0757.032.stk.i.unconv.fits", r: "/rings.v3.skycell/0757/032/rings.v3.skycell.0757.032.stk.r.unconv.fits", y: "/rings.v3.skycell/0757/032/rings.v3.skycell.0757.032.stk.y.unconv.fits", z: "/rings.v3.skycell/0757/032/rings.v3.skycell.0757.032.stk.z.unconv.fits" },
  m71: { g: "/rings.v3.skycell/1749/062/rings.v3.skycell.1749.062.stk.g.unconv.fits", i: "/rings.v3.skycell/1749/062/rings.v3.skycell.1749.062.stk.i.unconv.fits", r: "/rings.v3.skycell/1749/062/rings.v3.skycell.1749.062.stk.r.unconv.fits", y: "/rings.v3.skycell/1749/062/rings.v3.skycell.1749.062.stk.y.unconv.fits", z: "/rings.v3.skycell/1749/062/rings.v3.skycell.1749.062.stk.z.unconv.fits" },
  m72: { g: "/rings.v3.skycell/1043/088/rings.v3.skycell.1043.088.stk.g.unconv.fits", i: "/rings.v3.skycell/1043/088/rings.v3.skycell.1043.088.stk.i.unconv.fits", r: "/rings.v3.skycell/1043/088/rings.v3.skycell.1043.088.stk.r.unconv.fits", y: "/rings.v3.skycell/1043/088/rings.v3.skycell.1043.088.stk.y.unconv.fits", z: "/rings.v3.skycell/1043/088/rings.v3.skycell.1043.088.stk.z.unconv.fits" },
  m73: { g: "/rings.v3.skycell/1043/085/rings.v3.skycell.1043.085.stk.g.unconv.fits", i: "/rings.v3.skycell/1043/085/rings.v3.skycell.1043.085.stk.i.unconv.fits", r: "/rings.v3.skycell/1043/085/rings.v3.skycell.1043.085.stk.r.unconv.fits", y: "/rings.v3.skycell/1043/085/rings.v3.skycell.1043.085.stk.y.unconv.fits", z: "/rings.v3.skycell/1043/085/rings.v3.skycell.1043.085.stk.z.unconv.fits" },
  m74: { g: "/rings.v3.skycell/1596/095/rings.v3.skycell.1596.095.stk.g.unconv.fits", i: "/rings.v3.skycell/1596/095/rings.v3.skycell.1596.095.stk.i.unconv.fits", r: "/rings.v3.skycell/1596/095/rings.v3.skycell.1596.095.stk.r.unconv.fits", y: "/rings.v3.skycell/1596/095/rings.v3.skycell.1596.095.stk.y.unconv.fits", z: "/rings.v3.skycell/1596/095/rings.v3.skycell.1596.095.stk.z.unconv.fits" },
  m75: { g: "/rings.v3.skycell/0866/051/rings.v3.skycell.0866.051.stk.g.unconv.fits", i: "/rings.v3.skycell/0866/051/rings.v3.skycell.0866.051.stk.i.unconv.fits", r: "/rings.v3.skycell/0866/051/rings.v3.skycell.0866.051.stk.r.unconv.fits", y: "/rings.v3.skycell/0866/051/rings.v3.skycell.0866.051.stk.y.unconv.fits", z: "/rings.v3.skycell/0866/051/rings.v3.skycell.0866.051.stk.z.unconv.fits" },
  m76: { g: "/rings.v3.skycell/2293/082/rings.v3.skycell.2293.082.stk.g.unconv.fits", i: "/rings.v3.skycell/2293/082/rings.v3.skycell.2293.082.stk.i.unconv.fits", r: "/rings.v3.skycell/2293/082/rings.v3.skycell.2293.082.stk.r.unconv.fits", y: "/rings.v3.skycell/2293/082/rings.v3.skycell.2293.082.stk.y.unconv.fits", z: "/rings.v3.skycell/2293/082/rings.v3.skycell.2293.082.stk.z.unconv.fits" },
  m77: { g: "/rings.v3.skycell/1242/093/rings.v3.skycell.1242.093.stk.g.unconv.fits", i: "/rings.v3.skycell/1242/093/rings.v3.skycell.1242.093.stk.i.unconv.fits", r: "/rings.v3.skycell/1242/093/rings.v3.skycell.1242.093.stk.r.unconv.fits", y: "/rings.v3.skycell/1242/093/rings.v3.skycell.1242.093.stk.y.unconv.fits", z: "/rings.v3.skycell/1242/093/rings.v3.skycell.1242.093.stk.z.unconv.fits" },
  m78: { g: "/rings.v3.skycell/1344/008/rings.v3.skycell.1344.008.stk.g.unconv.fits", i: "/rings.v3.skycell/1344/008/rings.v3.skycell.1344.008.stk.i.unconv.fits", r: "/rings.v3.skycell/1344/008/rings.v3.skycell.1344.008.stk.r.unconv.fits", y: "/rings.v3.skycell/1344/008/rings.v3.skycell.1344.008.stk.y.unconv.fits", z: "/rings.v3.skycell/1344/008/rings.v3.skycell.1344.008.stk.z.unconv.fits" },
  m79: { g: "/rings.v3.skycell/0732/080/rings.v3.skycell.0732.080.stk.g.unconv.fits", i: "/rings.v3.skycell/0732/080/rings.v3.skycell.0732.080.stk.i.unconv.fits", r: "/rings.v3.skycell/0732/080/rings.v3.skycell.0732.080.stk.r.unconv.fits", y: "/rings.v3.skycell/0732/080/rings.v3.skycell.0732.080.stk.y.unconv.fits", z: "/rings.v3.skycell/0732/080/rings.v3.skycell.0732.080.stk.z.unconv.fits" },
  m8: { g: "/rings.v3.skycell/0776/097/rings.v3.skycell.0776.097.stk.g.unconv.fits", i: "/rings.v3.skycell/0776/097/rings.v3.skycell.0776.097.stk.i.unconv.fits", r: "/rings.v3.skycell/0776/097/rings.v3.skycell.0776.097.stk.r.unconv.fits", y: "/rings.v3.skycell/0776/097/rings.v3.skycell.0776.097.stk.y.unconv.fits", z: "/rings.v3.skycell/0776/097/rings.v3.skycell.0776.097.stk.z.unconv.fits" },
  m80: { g: "/rings.v3.skycell/0853/025/rings.v3.skycell.0853.025.stk.g.unconv.fits", i: "/rings.v3.skycell/0853/025/rings.v3.skycell.0853.025.stk.i.unconv.fits", r: "/rings.v3.skycell/0853/025/rings.v3.skycell.0853.025.stk.r.unconv.fits", y: "/rings.v3.skycell/0853/025/rings.v3.skycell.0853.025.stk.y.unconv.fits", z: "/rings.v3.skycell/0853/025/rings.v3.skycell.0853.025.stk.z.unconv.fits" },
  m81: { g: "/rings.v3.skycell/2552/028/rings.v3.skycell.2552.028.stk.g.unconv.fits", i: "/rings.v3.skycell/2552/028/rings.v3.skycell.2552.028.stk.i.unconv.fits", r: "/rings.v3.skycell/2552/028/rings.v3.skycell.2552.028.stk.r.unconv.fits", y: "/rings.v3.skycell/2552/028/rings.v3.skycell.2552.028.stk.y.unconv.fits", z: "/rings.v3.skycell/2552/028/rings.v3.skycell.2552.028.stk.z.unconv.fits" },
  m82: { g: "/rings.v3.skycell/2552/048/rings.v3.skycell.2552.048.stk.g.unconv.fits", i: "/rings.v3.skycell/2552/048/rings.v3.skycell.2552.048.stk.i.unconv.fits", r: "/rings.v3.skycell/2552/048/rings.v3.skycell.2552.048.stk.r.unconv.fits", y: "/rings.v3.skycell/2552/048/rings.v3.skycell.2552.048.stk.y.unconv.fits", z: "/rings.v3.skycell/2552/048/rings.v3.skycell.2552.048.stk.z.unconv.fits" },
  m83: { g: "/rings.v3.skycell/0680/056/rings.v3.skycell.0680.056.stk.g.unconv.fits", i: "/rings.v3.skycell/0680/056/rings.v3.skycell.0680.056.stk.i.unconv.fits", r: "/rings.v3.skycell/0680/056/rings.v3.skycell.0680.056.stk.r.unconv.fits", y: "/rings.v3.skycell/0680/056/rings.v3.skycell.0680.056.stk.y.unconv.fits", z: "/rings.v3.skycell/0680/056/rings.v3.skycell.0680.056.stk.z.unconv.fits" },
  m84: { g: "/rings.v3.skycell/1636/029/rings.v3.skycell.1636.029.stk.g.unconv.fits", i: "/rings.v3.skycell/1636/029/rings.v3.skycell.1636.029.stk.i.unconv.fits", r: "/rings.v3.skycell/1636/029/rings.v3.skycell.1636.029.stk.r.unconv.fits", y: "/rings.v3.skycell/1636/029/rings.v3.skycell.1636.029.stk.y.unconv.fits", z: "/rings.v3.skycell/1636/029/rings.v3.skycell.1636.029.stk.z.unconv.fits" },
  m85: { g: "/rings.v3.skycell/1723/059/rings.v3.skycell.1723.059.stk.g.unconv.fits", i: "/rings.v3.skycell/1723/059/rings.v3.skycell.1723.059.stk.i.unconv.fits", r: "/rings.v3.skycell/1723/059/rings.v3.skycell.1723.059.stk.r.unconv.fits", y: "/rings.v3.skycell/1723/059/rings.v3.skycell.1723.059.stk.y.unconv.fits", z: "/rings.v3.skycell/1723/059/rings.v3.skycell.1723.059.stk.z.unconv.fits" },
  m86: { g: "/rings.v3.skycell/1636/028/rings.v3.skycell.1636.028.stk.g.unconv.fits", i: "/rings.v3.skycell/1636/028/rings.v3.skycell.1636.028.stk.i.unconv.fits", r: "/rings.v3.skycell/1636/028/rings.v3.skycell.1636.028.stk.r.unconv.fits", y: "/rings.v3.skycell/1636/028/rings.v3.skycell.1636.028.stk.y.unconv.fits", z: "/rings.v3.skycell/1636/028/rings.v3.skycell.1636.028.stk.z.unconv.fits" },
  m87: { g: "/rings.v3.skycell/1636/006/rings.v3.skycell.1636.006.stk.g.unconv.fits", i: "/rings.v3.skycell/1636/006/rings.v3.skycell.1636.006.stk.i.unconv.fits", r: "/rings.v3.skycell/1636/006/rings.v3.skycell.1636.006.stk.r.unconv.fits", y: "/rings.v3.skycell/1636/006/rings.v3.skycell.1636.006.stk.y.unconv.fits", z: "/rings.v3.skycell/1636/006/rings.v3.skycell.1636.006.stk.z.unconv.fits" },
  "m87-bh": { g: "/rings.v3.skycell/1636/006/rings.v3.skycell.1636.006.stk.g.unconv.fits", i: "/rings.v3.skycell/1636/006/rings.v3.skycell.1636.006.stk.i.unconv.fits", r: "/rings.v3.skycell/1636/006/rings.v3.skycell.1636.006.stk.r.unconv.fits", y: "/rings.v3.skycell/1636/006/rings.v3.skycell.1636.006.stk.y.unconv.fits", z: "/rings.v3.skycell/1636/006/rings.v3.skycell.1636.006.stk.z.unconv.fits" },
  m88: { g: "/rings.v3.skycell/1636/065/rings.v3.skycell.1636.065.stk.g.unconv.fits", i: "/rings.v3.skycell/1636/065/rings.v3.skycell.1636.065.stk.i.unconv.fits", r: "/rings.v3.skycell/1636/065/rings.v3.skycell.1636.065.stk.r.unconv.fits", y: "/rings.v3.skycell/1636/065/rings.v3.skycell.1636.065.stk.y.unconv.fits", z: "/rings.v3.skycell/1636/065/rings.v3.skycell.1636.065.stk.z.unconv.fits" },
  m89: { g: "/rings.v3.skycell/1636/013/rings.v3.skycell.1636.013.stk.g.unconv.fits", i: "/rings.v3.skycell/1636/013/rings.v3.skycell.1636.013.stk.i.unconv.fits", r: "/rings.v3.skycell/1636/013/rings.v3.skycell.1636.013.stk.r.unconv.fits", y: "/rings.v3.skycell/1636/013/rings.v3.skycell.1636.013.stk.y.unconv.fits", z: "/rings.v3.skycell/1636/013/rings.v3.skycell.1636.013.stk.z.unconv.fits" },
  m9: { g: "/rings.v3.skycell/0942/034/rings.v3.skycell.0942.034.stk.g.unconv.fits", i: "/rings.v3.skycell/0942/034/rings.v3.skycell.0942.034.stk.i.unconv.fits", r: "/rings.v3.skycell/0942/034/rings.v3.skycell.0942.034.stk.r.unconv.fits", y: "/rings.v3.skycell/0942/034/rings.v3.skycell.0942.034.stk.y.unconv.fits", z: "/rings.v3.skycell/0942/034/rings.v3.skycell.0942.034.stk.z.unconv.fits" },
  m90: { g: "/rings.v3.skycell/1636/022/rings.v3.skycell.1636.022.stk.g.unconv.fits", i: "/rings.v3.skycell/1636/022/rings.v3.skycell.1636.022.stk.i.unconv.fits", r: "/rings.v3.skycell/1636/022/rings.v3.skycell.1636.022.stk.r.unconv.fits", y: "/rings.v3.skycell/1636/022/rings.v3.skycell.1636.022.stk.y.unconv.fits", z: "/rings.v3.skycell/1636/022/rings.v3.skycell.1636.022.stk.z.unconv.fits" },
  m91: { g: "/rings.v3.skycell/1636/063/rings.v3.skycell.1636.063.stk.g.unconv.fits", i: "/rings.v3.skycell/1636/063/rings.v3.skycell.1636.063.stk.i.unconv.fits", r: "/rings.v3.skycell/1636/063/rings.v3.skycell.1636.063.stk.r.unconv.fits", y: "/rings.v3.skycell/1636/063/rings.v3.skycell.1636.063.stk.y.unconv.fits", z: "/rings.v3.skycell/1636/063/rings.v3.skycell.1636.063.stk.z.unconv.fits" },
  m92: { g: "/rings.v3.skycell/2206/075/rings.v3.skycell.2206.075.stk.g.unconv.fits", i: "/rings.v3.skycell/2206/075/rings.v3.skycell.2206.075.stk.i.unconv.fits", r: "/rings.v3.skycell/2206/075/rings.v3.skycell.2206.075.stk.r.unconv.fits", y: "/rings.v3.skycell/2206/075/rings.v3.skycell.2206.075.stk.y.unconv.fits", z: "/rings.v3.skycell/2206/075/rings.v3.skycell.2206.075.stk.z.unconv.fits" },
  m93: { g: "/rings.v3.skycell/0823/004/rings.v3.skycell.0823.004.stk.g.unconv.fits", i: "/rings.v3.skycell/0823/004/rings.v3.skycell.0823.004.stk.i.unconv.fits", r: "/rings.v3.skycell/0823/004/rings.v3.skycell.0823.004.stk.r.unconv.fits", y: "/rings.v3.skycell/0823/004/rings.v3.skycell.0823.004.stk.y.unconv.fits", z: "/rings.v3.skycell/0823/004/rings.v3.skycell.0823.004.stk.z.unconv.fits" },
  m94: { g: "/rings.v3.skycell/2193/021/rings.v3.skycell.2193.021.stk.g.unconv.fits", i: "/rings.v3.skycell/2193/021/rings.v3.skycell.2193.021.stk.i.unconv.fits", r: "/rings.v3.skycell/2193/021/rings.v3.skycell.2193.021.stk.r.unconv.fits", y: "/rings.v3.skycell/2193/021/rings.v3.skycell.2193.021.stk.y.unconv.fits", z: "/rings.v3.skycell/2193/021/rings.v3.skycell.2193.021.stk.z.unconv.fits" },
  m95: { g: "/rings.v3.skycell/1541/096/rings.v3.skycell.1541.096.stk.g.unconv.fits", i: "/rings.v3.skycell/1541/096/rings.v3.skycell.1541.096.stk.i.unconv.fits", r: "/rings.v3.skycell/1541/096/rings.v3.skycell.1541.096.stk.r.unconv.fits", y: "/rings.v3.skycell/1541/096/rings.v3.skycell.1541.096.stk.y.unconv.fits", z: "/rings.v3.skycell/1541/096/rings.v3.skycell.1541.096.stk.z.unconv.fits" },
  m96: { g: "/rings.v3.skycell/1541/095/rings.v3.skycell.1541.095.stk.g.unconv.fits", i: "/rings.v3.skycell/1541/095/rings.v3.skycell.1541.095.stk.i.unconv.fits", r: "/rings.v3.skycell/1541/095/rings.v3.skycell.1541.095.stk.r.unconv.fits", y: "/rings.v3.skycell/1541/095/rings.v3.skycell.1541.095.stk.y.unconv.fits", z: "/rings.v3.skycell/1541/095/rings.v3.skycell.1541.095.stk.z.unconv.fits" },
  m97: { g: "/rings.v3.skycell/2375/077/rings.v3.skycell.2375.077.stk.g.unconv.fits", i: "/rings.v3.skycell/2375/077/rings.v3.skycell.2375.077.stk.i.unconv.fits", r: "/rings.v3.skycell/2375/077/rings.v3.skycell.2375.077.stk.r.unconv.fits", y: "/rings.v3.skycell/2375/077/rings.v3.skycell.2375.077.stk.y.unconv.fits", z: "/rings.v3.skycell/2375/077/rings.v3.skycell.2375.077.stk.z.unconv.fits" },
  m98: { g: "/rings.v3.skycell/1635/076/rings.v3.skycell.1635.076.stk.g.unconv.fits", i: "/rings.v3.skycell/1635/076/rings.v3.skycell.1635.076.stk.i.unconv.fits", r: "/rings.v3.skycell/1635/076/rings.v3.skycell.1635.076.stk.r.unconv.fits", y: "/rings.v3.skycell/1635/076/rings.v3.skycell.1635.076.stk.y.unconv.fits", z: "/rings.v3.skycell/1635/076/rings.v3.skycell.1635.076.stk.z.unconv.fits" },
  m99: { g: "/rings.v3.skycell/1635/063/rings.v3.skycell.1635.063.stk.g.unconv.fits", i: "/rings.v3.skycell/1635/063/rings.v3.skycell.1635.063.stk.i.unconv.fits", r: "/rings.v3.skycell/1635/063/rings.v3.skycell.1635.063.stk.r.unconv.fits", y: "/rings.v3.skycell/1635/063/rings.v3.skycell.1635.063.stk.y.unconv.fits", z: "/rings.v3.skycell/1635/063/rings.v3.skycell.1635.063.stk.z.unconv.fits" },
  maasym: { g: "/rings.v3.skycell/1908/056/rings.v3.skycell.1908.056.stk.g.unconv.fits", i: "/rings.v3.skycell/1908/056/rings.v3.skycell.1908.056.stk.i.unconv.fits", r: "/rings.v3.skycell/1908/056/rings.v3.skycell.1908.056.stk.r.unconv.fits", y: "/rings.v3.skycell/1908/056/rings.v3.skycell.1908.056.stk.y.unconv.fits", z: "/rings.v3.skycell/1908/056/rings.v3.skycell.1908.056.stk.z.unconv.fits" },
  markab: { g: "/rings.v3.skycell/1675/088/rings.v3.skycell.1675.088.stk.g.unconv.fits", i: "/rings.v3.skycell/1675/088/rings.v3.skycell.1675.088.stk.i.unconv.fits", r: "/rings.v3.skycell/1675/088/rings.v3.skycell.1675.088.stk.r.unconv.fits", y: "/rings.v3.skycell/1675/088/rings.v3.skycell.1675.088.stk.y.unconv.fits", z: "/rings.v3.skycell/1675/088/rings.v3.skycell.1675.088.stk.z.unconv.fits" },
  marsic: { g: "/rings.v3.skycell/1736/026/rings.v3.skycell.1736.026.stk.g.unconv.fits", i: "/rings.v3.skycell/1736/026/rings.v3.skycell.1736.026.stk.i.unconv.fits", r: "/rings.v3.skycell/1736/026/rings.v3.skycell.1736.026.stk.r.unconv.fits", y: "/rings.v3.skycell/1736/026/rings.v3.skycell.1736.026.stk.y.unconv.fits", z: "/rings.v3.skycell/1736/026/rings.v3.skycell.1736.026.stk.z.unconv.fits" },
  matar: { g: "/rings.v3.skycell/2005/057/rings.v3.skycell.2005.057.stk.g.unconv.fits", i: "/rings.v3.skycell/2005/057/rings.v3.skycell.2005.057.stk.i.unconv.fits", r: "/rings.v3.skycell/2005/057/rings.v3.skycell.2005.057.stk.r.unconv.fits", y: "/rings.v3.skycell/2005/057/rings.v3.skycell.2005.057.stk.y.unconv.fits", z: "/rings.v3.skycell/2005/057/rings.v3.skycell.2005.057.stk.z.unconv.fits" },
  mebsuta: { g: "/rings.v3.skycell/1871/024/rings.v3.skycell.1871.024.stk.g.unconv.fits", i: "/rings.v3.skycell/1871/024/rings.v3.skycell.1871.024.stk.i.unconv.fits", r: "/rings.v3.skycell/1871/024/rings.v3.skycell.1871.024.stk.r.unconv.fits", y: "/rings.v3.skycell/1871/024/rings.v3.skycell.1871.024.stk.y.unconv.fits", z: "/rings.v3.skycell/1871/024/rings.v3.skycell.1871.024.stk.z.unconv.fits" },
  megrez: { g: "/rings.v3.skycell/2430/029/rings.v3.skycell.2430.029.stk.g.unconv.fits", i: "/rings.v3.skycell/2430/029/rings.v3.skycell.2430.029.stk.i.unconv.fits", r: "/rings.v3.skycell/2430/029/rings.v3.skycell.2430.029.stk.r.unconv.fits", y: "/rings.v3.skycell/2430/029/rings.v3.skycell.2430.029.stk.y.unconv.fits", z: "/rings.v3.skycell/2430/029/rings.v3.skycell.2430.029.stk.z.unconv.fits" },
  menkalinan: { g: "/rings.v3.skycell/2241/025/rings.v3.skycell.2241.025.stk.g.unconv.fits", i: "/rings.v3.skycell/2241/025/rings.v3.skycell.2241.025.stk.i.unconv.fits", r: "/rings.v3.skycell/2241/025/rings.v3.skycell.2241.025.stk.r.unconv.fits", y: "/rings.v3.skycell/2241/025/rings.v3.skycell.2241.025.stk.y.unconv.fits", z: "/rings.v3.skycell/2241/025/rings.v3.skycell.2241.025.stk.z.unconv.fits" },
  menkar: { g: "/rings.v3.skycell/1423/002/rings.v3.skycell.1423.002.stk.g.unconv.fits", i: "/rings.v3.skycell/1423/002/rings.v3.skycell.1423.002.stk.i.unconv.fits", r: "/rings.v3.skycell/1423/002/rings.v3.skycell.1423.002.stk.r.unconv.fits", y: "/rings.v3.skycell/1423/002/rings.v3.skycell.1423.002.stk.y.unconv.fits", z: "/rings.v3.skycell/1423/002/rings.v3.skycell.1423.002.stk.z.unconv.fits" },
  merak: { g: "/rings.v3.skycell/2427/015/rings.v3.skycell.2427.015.stk.g.unconv.fits", i: "/rings.v3.skycell/2427/015/rings.v3.skycell.2427.015.stk.i.unconv.fits", r: "/rings.v3.skycell/2427/015/rings.v3.skycell.2427.015.stk.r.unconv.fits", y: "/rings.v3.skycell/2427/015/rings.v3.skycell.2427.015.stk.y.unconv.fits", z: "/rings.v3.skycell/2427/015/rings.v3.skycell.2427.015.stk.z.unconv.fits" },
  minkar: { g: "/rings.v3.skycell/0839/039/rings.v3.skycell.0839.039.stk.g.unconv.fits", i: "/rings.v3.skycell/0839/039/rings.v3.skycell.0839.039.stk.i.unconv.fits", r: "/rings.v3.skycell/0839/039/rings.v3.skycell.0839.039.stk.r.unconv.fits", y: "/rings.v3.skycell/0839/039/rings.v3.skycell.0839.039.stk.y.unconv.fits", z: "/rings.v3.skycell/0839/039/rings.v3.skycell.0839.039.stk.z.unconv.fits" },
  mintaka: { g: "/rings.v3.skycell/1253/097/rings.v3.skycell.1253.097.stk.g.unconv.fits", i: "/rings.v3.skycell/1253/097/rings.v3.skycell.1253.097.stk.i.unconv.fits", r: "/rings.v3.skycell/1253/097/rings.v3.skycell.1253.097.stk.r.unconv.fits", y: "/rings.v3.skycell/1253/097/rings.v3.skycell.1253.097.stk.y.unconv.fits", z: "/rings.v3.skycell/1253/097/rings.v3.skycell.1253.097.stk.z.unconv.fits" },
  mirach: { g: "/rings.v3.skycell/2013/098/rings.v3.skycell.2013.098.stk.g.unconv.fits", i: "/rings.v3.skycell/2013/098/rings.v3.skycell.2013.098.stk.i.unconv.fits", r: "/rings.v3.skycell/2013/098/rings.v3.skycell.2013.098.stk.r.unconv.fits", y: "/rings.v3.skycell/2013/098/rings.v3.skycell.2013.098.stk.y.unconv.fits", z: "/rings.v3.skycell/2013/098/rings.v3.skycell.2013.098.stk.z.unconv.fits" },
  mirfak: { g: "/rings.v3.skycell/2298/049/rings.v3.skycell.2298.049.stk.g.unconv.fits", i: "/rings.v3.skycell/2298/049/rings.v3.skycell.2298.049.stk.i.unconv.fits", r: "/rings.v3.skycell/2298/049/rings.v3.skycell.2298.049.stk.r.unconv.fits", y: "/rings.v3.skycell/2298/049/rings.v3.skycell.2298.049.stk.y.unconv.fits", z: "/rings.v3.skycell/2298/049/rings.v3.skycell.2298.049.stk.z.unconv.fits" },
  mirzam: { g: "/rings.v3.skycell/0903/056/rings.v3.skycell.0903.056.stk.g.unconv.fits", i: "/rings.v3.skycell/0903/056/rings.v3.skycell.0903.056.stk.i.unconv.fits", r: "/rings.v3.skycell/0903/056/rings.v3.skycell.0903.056.stk.r.unconv.fits", y: "/rings.v3.skycell/0903/056/rings.v3.skycell.0903.056.stk.y.unconv.fits", z: "/rings.v3.skycell/0903/056/rings.v3.skycell.0903.056.stk.z.unconv.fits" },
  mizar: { g: "/rings.v3.skycell/2380/077/rings.v3.skycell.2380.077.stk.g.unconv.fits", i: "/rings.v3.skycell/2380/077/rings.v3.skycell.2380.077.stk.i.unconv.fits", r: "/rings.v3.skycell/2380/077/rings.v3.skycell.2380.077.stk.r.unconv.fits", y: "/rings.v3.skycell/2380/077/rings.v3.skycell.2380.077.stk.y.unconv.fits", z: "/rings.v3.skycell/2380/077/rings.v3.skycell.2380.077.stk.z.unconv.fits" },
  muphrid: { g: "/rings.v3.skycell/1728/056/rings.v3.skycell.1728.056.stk.g.unconv.fits", i: "/rings.v3.skycell/1728/056/rings.v3.skycell.1728.056.stk.i.unconv.fits", r: "/rings.v3.skycell/1728/056/rings.v3.skycell.1728.056.stk.r.unconv.fits", y: "/rings.v3.skycell/1728/056/rings.v3.skycell.1728.056.stk.y.unconv.fits", z: "/rings.v3.skycell/1728/056/rings.v3.skycell.1728.056.stk.z.unconv.fits" },
  muscida: { g: "/rings.v3.skycell/2470/015/rings.v3.skycell.2470.015.stk.g.unconv.fits", i: "/rings.v3.skycell/2470/015/rings.v3.skycell.2470.015.stk.i.unconv.fits", r: "/rings.v3.skycell/2470/015/rings.v3.skycell.2470.015.stk.r.unconv.fits", y: "/rings.v3.skycell/2470/015/rings.v3.skycell.2470.015.stk.y.unconv.fits", z: "/rings.v3.skycell/2470/015/rings.v3.skycell.2470.015.stk.z.unconv.fits" },
  nashira: { g: "/rings.v3.skycell/0958/088/rings.v3.skycell.0958.088.stk.g.unconv.fits", i: "/rings.v3.skycell/0958/088/rings.v3.skycell.0958.088.stk.i.unconv.fits", r: "/rings.v3.skycell/0958/088/rings.v3.skycell.0958.088.stk.r.unconv.fits", y: "/rings.v3.skycell/0958/088/rings.v3.skycell.0958.088.stk.y.unconv.fits", z: "/rings.v3.skycell/0958/088/rings.v3.skycell.0958.088.stk.z.unconv.fits" },
  navi: { g: "/rings.v3.skycell/2456/017/rings.v3.skycell.2456.017.stk.g.unconv.fits", i: "/rings.v3.skycell/2456/017/rings.v3.skycell.2456.017.stk.i.unconv.fits", r: "/rings.v3.skycell/2456/017/rings.v3.skycell.2456.017.stk.r.unconv.fits", y: "/rings.v3.skycell/2456/017/rings.v3.skycell.2456.017.stk.y.unconv.fits", z: "/rings.v3.skycell/2456/017/rings.v3.skycell.2456.017.stk.z.unconv.fits" },
  nekkar: { g: "/rings.v3.skycell/2200/019/rings.v3.skycell.2200.019.stk.g.unconv.fits", i: "/rings.v3.skycell/2200/019/rings.v3.skycell.2200.019.stk.i.unconv.fits", r: "/rings.v3.skycell/2200/019/rings.v3.skycell.2200.019.stk.r.unconv.fits", y: "/rings.v3.skycell/2200/019/rings.v3.skycell.2200.019.stk.y.unconv.fits", z: "/rings.v3.skycell/2200/019/rings.v3.skycell.2200.019.stk.z.unconv.fits" },
  ngc7293: { g: "/rings.v3.skycell/0875/077/rings.v3.skycell.0875.077.stk.g.unconv.fits", i: "/rings.v3.skycell/0875/077/rings.v3.skycell.0875.077.stk.i.unconv.fits", r: "/rings.v3.skycell/0875/077/rings.v3.skycell.0875.077.stk.r.unconv.fits", y: "/rings.v3.skycell/0875/077/rings.v3.skycell.0875.077.stk.y.unconv.fits", z: "/rings.v3.skycell/0875/077/rings.v3.skycell.0875.077.stk.z.unconv.fits" },
  nunki: { g: "/rings.v3.skycell/0779/048/rings.v3.skycell.0779.048.stk.g.unconv.fits", i: "/rings.v3.skycell/0779/048/rings.v3.skycell.0779.048.stk.i.unconv.fits", r: "/rings.v3.skycell/0779/048/rings.v3.skycell.0779.048.stk.r.unconv.fits", y: "/rings.v3.skycell/0779/048/rings.v3.skycell.0779.048.stk.y.unconv.fits", z: "/rings.v3.skycell/0779/048/rings.v3.skycell.0779.048.stk.z.unconv.fits" },
  nusakan: { g: "/rings.v3.skycell/1981/025/rings.v3.skycell.1981.025.stk.g.unconv.fits", i: "/rings.v3.skycell/1981/025/rings.v3.skycell.1981.025.stk.i.unconv.fits", r: "/rings.v3.skycell/1981/025/rings.v3.skycell.1981.025.stk.r.unconv.fits", y: "/rings.v3.skycell/1981/025/rings.v3.skycell.1981.025.stk.y.unconv.fits", z: "/rings.v3.skycell/1981/025/rings.v3.skycell.1981.025.stk.z.unconv.fits" },
  phecda: { g: "/rings.v3.skycell/2376/042/rings.v3.skycell.2376.042.stk.g.unconv.fits", i: "/rings.v3.skycell/2376/042/rings.v3.skycell.2376.042.stk.i.unconv.fits", r: "/rings.v3.skycell/2376/042/rings.v3.skycell.2376.042.stk.r.unconv.fits", y: "/rings.v3.skycell/2376/042/rings.v3.skycell.2376.042.stk.y.unconv.fits", z: "/rings.v3.skycell/2376/042/rings.v3.skycell.2376.042.stk.z.unconv.fits" },
  polaris: { g: "/rings.v3.skycell/2643/033/rings.v3.skycell.2643.033.stk.g.unconv.fits", i: "/rings.v3.skycell/2643/033/rings.v3.skycell.2643.033.stk.i.unconv.fits", r: "/rings.v3.skycell/2643/033/rings.v3.skycell.2643.033.stk.r.unconv.fits", y: "/rings.v3.skycell/2643/033/rings.v3.skycell.2643.033.stk.y.unconv.fits", z: "/rings.v3.skycell/2643/033/rings.v3.skycell.2643.033.stk.z.unconv.fits" },
  pollux: { g: "/rings.v3.skycell/1956/009/rings.v3.skycell.1956.009.stk.g.unconv.fits", i: "/rings.v3.skycell/1956/009/rings.v3.skycell.1956.009.stk.i.unconv.fits", r: "/rings.v3.skycell/1956/009/rings.v3.skycell.1956.009.stk.r.unconv.fits", y: "/rings.v3.skycell/1956/009/rings.v3.skycell.1956.009.stk.y.unconv.fits", z: "/rings.v3.skycell/1956/009/rings.v3.skycell.1956.009.stk.z.unconv.fits" },
  porrima: { g: "/rings.v3.skycell/1280/068/rings.v3.skycell.1280.068.stk.g.unconv.fits", i: "/rings.v3.skycell/1280/068/rings.v3.skycell.1280.068.stk.i.unconv.fits", r: "/rings.v3.skycell/1280/068/rings.v3.skycell.1280.068.stk.r.unconv.fits", y: "/rings.v3.skycell/1280/068/rings.v3.skycell.1280.068.stk.y.unconv.fits", z: "/rings.v3.skycell/1280/068/rings.v3.skycell.1280.068.stk.z.unconv.fits" },
  princeps: { g: "/rings.v3.skycell/2057/031/rings.v3.skycell.2057.031.stk.g.unconv.fits", i: "/rings.v3.skycell/2057/031/rings.v3.skycell.2057.031.stk.i.unconv.fits", r: "/rings.v3.skycell/2057/031/rings.v3.skycell.2057.031.stk.r.unconv.fits", y: "/rings.v3.skycell/2057/031/rings.v3.skycell.2057.031.stk.y.unconv.fits", z: "/rings.v3.skycell/2057/031/rings.v3.skycell.2057.031.stk.z.unconv.fits" },
  procyon: { g: "/rings.v3.skycell/1440/031/rings.v3.skycell.1440.031.stk.g.unconv.fits", i: "/rings.v3.skycell/1440/031/rings.v3.skycell.1440.031.stk.i.unconv.fits", r: "/rings.v3.skycell/1440/031/rings.v3.skycell.1440.031.stk.r.unconv.fits", y: "/rings.v3.skycell/1440/031/rings.v3.skycell.1440.031.stk.y.unconv.fits", z: "/rings.v3.skycell/1440/031/rings.v3.skycell.1440.031.stk.z.unconv.fits" },
  propus: { g: "/rings.v3.skycell/1786/066/rings.v3.skycell.1786.066.stk.g.unconv.fits", i: "/rings.v3.skycell/1786/066/rings.v3.skycell.1786.066.stk.i.unconv.fits", r: "/rings.v3.skycell/1786/066/rings.v3.skycell.1786.066.stk.r.unconv.fits", y: "/rings.v3.skycell/1786/066/rings.v3.skycell.1786.066.stk.y.unconv.fits", z: "/rings.v3.skycell/1786/066/rings.v3.skycell.1786.066.stk.z.unconv.fits" },
  ran: { g: "/rings.v3.skycell/1067/063/rings.v3.skycell.1067.063.stk.g.unconv.fits", i: "/rings.v3.skycell/1067/063/rings.v3.skycell.1067.063.stk.i.unconv.fits", r: "/rings.v3.skycell/1067/063/rings.v3.skycell.1067.063.stk.r.unconv.fits", y: "/rings.v3.skycell/1067/063/rings.v3.skycell.1067.063.stk.y.unconv.fits", z: "/rings.v3.skycell/1067/063/rings.v3.skycell.1067.063.stk.z.unconv.fits" },
  rasalas: { g: "/rings.v3.skycell/1882/057/rings.v3.skycell.1882.057.stk.g.unconv.fits", i: "/rings.v3.skycell/1882/057/rings.v3.skycell.1882.057.stk.i.unconv.fits", r: "/rings.v3.skycell/1882/057/rings.v3.skycell.1882.057.stk.r.unconv.fits", y: "/rings.v3.skycell/1882/057/rings.v3.skycell.1882.057.stk.y.unconv.fits", z: "/rings.v3.skycell/1882/057/rings.v3.skycell.1882.057.stk.z.unconv.fits" },
  rasalhague: { g: "/rings.v3.skycell/1654/010/rings.v3.skycell.1654.010.stk.g.unconv.fits", i: "/rings.v3.skycell/1654/010/rings.v3.skycell.1654.010.stk.i.unconv.fits", r: "/rings.v3.skycell/1654/010/rings.v3.skycell.1654.010.stk.r.unconv.fits", y: "/rings.v3.skycell/1654/010/rings.v3.skycell.1654.010.stk.y.unconv.fits", z: "/rings.v3.skycell/1654/010/rings.v3.skycell.1654.010.stk.z.unconv.fits" },
  rastaban: { g: "/rings.v3.skycell/2389/003/rings.v3.skycell.2389.003.stk.g.unconv.fits", i: "/rings.v3.skycell/2389/003/rings.v3.skycell.2389.003.stk.i.unconv.fits", r: "/rings.v3.skycell/2389/003/rings.v3.skycell.2389.003.stk.r.unconv.fits", y: "/rings.v3.skycell/2389/003/rings.v3.skycell.2389.003.stk.y.unconv.fits", z: "/rings.v3.skycell/2389/003/rings.v3.skycell.2389.003.stk.z.unconv.fits" },
  regulus: { g: "/rings.v3.skycell/1539/098/rings.v3.skycell.1539.098.stk.g.unconv.fits", i: "/rings.v3.skycell/1539/098/rings.v3.skycell.1539.098.stk.i.unconv.fits", r: "/rings.v3.skycell/1539/098/rings.v3.skycell.1539.098.stk.r.unconv.fits", y: "/rings.v3.skycell/1539/098/rings.v3.skycell.1539.098.stk.y.unconv.fits", z: "/rings.v3.skycell/1539/098/rings.v3.skycell.1539.098.stk.z.unconv.fits" },
  rigel: { g: "/rings.v3.skycell/1073/090/rings.v3.skycell.1073.090.stk.g.unconv.fits", i: "/rings.v3.skycell/1073/090/rings.v3.skycell.1073.090.stk.i.unconv.fits", r: "/rings.v3.skycell/1073/090/rings.v3.skycell.1073.090.stk.r.unconv.fits", y: "/rings.v3.skycell/1073/090/rings.v3.skycell.1073.090.stk.y.unconv.fits", z: "/rings.v3.skycell/1073/090/rings.v3.skycell.1073.090.stk.z.unconv.fits" },
  rotanev: { g: "/rings.v3.skycell/1666/068/rings.v3.skycell.1666.068.stk.g.unconv.fits", i: "/rings.v3.skycell/1666/068/rings.v3.skycell.1666.068.stk.i.unconv.fits", r: "/rings.v3.skycell/1666/068/rings.v3.skycell.1666.068.stk.r.unconv.fits", y: "/rings.v3.skycell/1666/068/rings.v3.skycell.1666.068.stk.y.unconv.fits", z: "/rings.v3.skycell/1666/068/rings.v3.skycell.1666.068.stk.z.unconv.fits" },
  ruchba: { g: "/rings.v3.skycell/2278/028/rings.v3.skycell.2278.028.stk.g.unconv.fits", i: "/rings.v3.skycell/2278/028/rings.v3.skycell.2278.028.stk.i.unconv.fits", r: "/rings.v3.skycell/2278/028/rings.v3.skycell.2278.028.stk.r.unconv.fits", y: "/rings.v3.skycell/2278/028/rings.v3.skycell.2278.028.stk.y.unconv.fits", z: "/rings.v3.skycell/2278/028/rings.v3.skycell.2278.028.stk.z.unconv.fits" },
  ruchbah: { g: "/rings.v3.skycell/2457/008/rings.v3.skycell.2457.008.stk.g.unconv.fits", i: "/rings.v3.skycell/2457/008/rings.v3.skycell.2457.008.stk.i.unconv.fits", r: "/rings.v3.skycell/2457/008/rings.v3.skycell.2457.008.stk.r.unconv.fits", y: "/rings.v3.skycell/2457/008/rings.v3.skycell.2457.008.stk.y.unconv.fits", z: "/rings.v3.skycell/2457/008/rings.v3.skycell.2457.008.stk.z.unconv.fits" },
  sabik: { g: "/rings.v3.skycell/1029/005/rings.v3.skycell.1029.005.stk.g.unconv.fits", i: "/rings.v3.skycell/1029/005/rings.v3.skycell.1029.005.stk.i.unconv.fits", r: "/rings.v3.skycell/1029/005/rings.v3.skycell.1029.005.stk.r.unconv.fits", y: "/rings.v3.skycell/1029/005/rings.v3.skycell.1029.005.stk.y.unconv.fits", z: "/rings.v3.skycell/1029/005/rings.v3.skycell.1029.005.stk.z.unconv.fits" },
  sadachbia: { g: "/rings.v3.skycell/1316/066/rings.v3.skycell.1316.066.stk.g.unconv.fits", i: "/rings.v3.skycell/1316/066/rings.v3.skycell.1316.066.stk.i.unconv.fits", r: "/rings.v3.skycell/1316/066/rings.v3.skycell.1316.066.stk.r.unconv.fits", y: "/rings.v3.skycell/1316/066/rings.v3.skycell.1316.066.stk.y.unconv.fits", z: "/rings.v3.skycell/1316/066/rings.v3.skycell.1316.066.stk.z.unconv.fits" },
  sadalmelik: { g: "/rings.v3.skycell/1315/096/rings.v3.skycell.1315.096.stk.g.unconv.fits", i: "/rings.v3.skycell/1315/096/rings.v3.skycell.1315.096.stk.i.unconv.fits", r: "/rings.v3.skycell/1315/096/rings.v3.skycell.1315.096.stk.r.unconv.fits", y: "/rings.v3.skycell/1315/096/rings.v3.skycell.1315.096.stk.y.unconv.fits", z: "/rings.v3.skycell/1315/096/rings.v3.skycell.1315.096.stk.z.unconv.fits" },
  sadalsuud: { g: "/rings.v3.skycell/1223/066/rings.v3.skycell.1223.066.stk.g.unconv.fits", i: "/rings.v3.skycell/1223/066/rings.v3.skycell.1223.066.stk.i.unconv.fits", r: "/rings.v3.skycell/1223/066/rings.v3.skycell.1223.066.stk.r.unconv.fits", y: "/rings.v3.skycell/1223/066/rings.v3.skycell.1223.066.stk.y.unconv.fits", z: "/rings.v3.skycell/1223/066/rings.v3.skycell.1223.066.stk.z.unconv.fits" },
  sadr: { g: "/rings.v3.skycell/2215/007/rings.v3.skycell.2215.007.stk.g.unconv.fits", i: "/rings.v3.skycell/2215/007/rings.v3.skycell.2215.007.stk.i.unconv.fits", r: "/rings.v3.skycell/2215/007/rings.v3.skycell.2215.007.stk.r.unconv.fits", y: "/rings.v3.skycell/2215/007/rings.v3.skycell.2215.007.stk.y.unconv.fits", z: "/rings.v3.skycell/2215/007/rings.v3.skycell.2215.007.stk.z.unconv.fits" },
  saiph: { g: "/rings.v3.skycell/1075/050/rings.v3.skycell.1075.050.stk.g.unconv.fits", i: "/rings.v3.skycell/1075/050/rings.v3.skycell.1075.050.stk.i.unconv.fits", r: "/rings.v3.skycell/1075/050/rings.v3.skycell.1075.050.stk.r.unconv.fits", y: "/rings.v3.skycell/1075/050/rings.v3.skycell.1075.050.stk.y.unconv.fits", z: "/rings.v3.skycell/1075/050/rings.v3.skycell.1075.050.stk.z.unconv.fits" },
  sarin: { g: "/rings.v3.skycell/1907/025/rings.v3.skycell.1907.025.stk.g.unconv.fits", i: "/rings.v3.skycell/1907/025/rings.v3.skycell.1907.025.stk.i.unconv.fits", r: "/rings.v3.skycell/1907/025/rings.v3.skycell.1907.025.stk.r.unconv.fits", y: "/rings.v3.skycell/1907/025/rings.v3.skycell.1907.025.stk.y.unconv.fits", z: "/rings.v3.skycell/1907/025/rings.v3.skycell.1907.025.stk.z.unconv.fits" },
  scheat: { g: "/rings.v3.skycell/2006/005/rings.v3.skycell.2006.005.stk.g.unconv.fits", i: "/rings.v3.skycell/2006/005/rings.v3.skycell.2006.005.stk.i.unconv.fits", r: "/rings.v3.skycell/2006/005/rings.v3.skycell.2006.005.stk.r.unconv.fits", y: "/rings.v3.skycell/2006/005/rings.v3.skycell.2006.005.stk.y.unconv.fits", z: "/rings.v3.skycell/2006/005/rings.v3.skycell.2006.005.stk.z.unconv.fits" },
  schedar: { g: "/rings.v3.skycell/2405/010/rings.v3.skycell.2405.010.stk.g.unconv.fits", i: "/rings.v3.skycell/2405/010/rings.v3.skycell.2405.010.stk.i.unconv.fits", r: "/rings.v3.skycell/2405/010/rings.v3.skycell.2405.010.stk.r.unconv.fits", y: "/rings.v3.skycell/2405/010/rings.v3.skycell.2405.010.stk.y.unconv.fits", z: "/rings.v3.skycell/2405/010/rings.v3.skycell.2405.010.stk.z.unconv.fits" },
  seginus: { g: "/rings.v3.skycell/2129/058/rings.v3.skycell.2129.058.stk.g.unconv.fits", i: "/rings.v3.skycell/2129/058/rings.v3.skycell.2129.058.stk.i.unconv.fits", r: "/rings.v3.skycell/2129/058/rings.v3.skycell.2129.058.stk.r.unconv.fits", y: "/rings.v3.skycell/2129/058/rings.v3.skycell.2129.058.stk.y.unconv.fits", z: "/rings.v3.skycell/2129/058/rings.v3.skycell.2129.058.stk.z.unconv.fits" },
  "sgr-a-star": { g: "/rings.v3.skycell/0693/070/rings.v3.skycell.0693.070.stk.g.unconv.fits", i: "/rings.v3.skycell/0693/070/rings.v3.skycell.0693.070.stk.i.unconv.fits", r: "/rings.v3.skycell/0693/070/rings.v3.skycell.0693.070.stk.r.unconv.fits", y: "/rings.v3.skycell/0693/070/rings.v3.skycell.0693.070.stk.y.unconv.fits", z: "/rings.v3.skycell/0693/070/rings.v3.skycell.0693.070.stk.z.unconv.fits" },
  sheliak: { g: "/rings.v3.skycell/2069/038/rings.v3.skycell.2069.038.stk.g.unconv.fits", i: "/rings.v3.skycell/2069/038/rings.v3.skycell.2069.038.stk.i.unconv.fits", r: "/rings.v3.skycell/2069/038/rings.v3.skycell.2069.038.stk.r.unconv.fits", y: "/rings.v3.skycell/2069/038/rings.v3.skycell.2069.038.stk.y.unconv.fits", z: "/rings.v3.skycell/2069/038/rings.v3.skycell.2069.038.stk.z.unconv.fits" },
  sirius: { g: "/rings.v3.skycell/0904/083/rings.v3.skycell.0904.083.stk.g.unconv.fits", i: "/rings.v3.skycell/0904/083/rings.v3.skycell.0904.083.stk.i.unconv.fits", r: "/rings.v3.skycell/0904/083/rings.v3.skycell.0904.083.stk.r.unconv.fits", y: "/rings.v3.skycell/0904/083/rings.v3.skycell.0904.083.stk.y.unconv.fits", z: "/rings.v3.skycell/0904/083/rings.v3.skycell.0904.083.stk.z.unconv.fits" },
  skat: { g: "/rings.v3.skycell/1050/004/rings.v3.skycell.1050.004.stk.g.unconv.fits", i: "/rings.v3.skycell/1050/004/rings.v3.skycell.1050.004.stk.i.unconv.fits", r: "/rings.v3.skycell/1050/004/rings.v3.skycell.1050.004.stk.r.unconv.fits", y: "/rings.v3.skycell/1050/004/rings.v3.skycell.1050.004.stk.y.unconv.fits", z: "/rings.v3.skycell/1050/004/rings.v3.skycell.1050.004.stk.z.unconv.fits" },
  spica: { g: "/rings.v3.skycell/1104/027/rings.v3.skycell.1104.027.stk.g.unconv.fits", i: "/rings.v3.skycell/1104/027/rings.v3.skycell.1104.027.stk.i.unconv.fits", r: "/rings.v3.skycell/1104/027/rings.v3.skycell.1104.027.stk.r.unconv.fits", y: "/rings.v3.skycell/1104/027/rings.v3.skycell.1104.027.stk.y.unconv.fits", z: "/rings.v3.skycell/1104/027/rings.v3.skycell.1104.027.stk.z.unconv.fits" },
  sualocin: { g: "/rings.v3.skycell/1666/097/rings.v3.skycell.1666.097.stk.g.unconv.fits", i: "/rings.v3.skycell/1666/097/rings.v3.skycell.1666.097.stk.i.unconv.fits", r: "/rings.v3.skycell/1666/097/rings.v3.skycell.1666.097.stk.r.unconv.fits", y: "/rings.v3.skycell/1666/097/rings.v3.skycell.1666.097.stk.y.unconv.fits", z: "/rings.v3.skycell/1666/097/rings.v3.skycell.1666.097.stk.z.unconv.fits" },
  subra: { g: "/rings.v3.skycell/1538/048/rings.v3.skycell.1538.048.stk.g.unconv.fits", i: "/rings.v3.skycell/1538/048/rings.v3.skycell.1538.048.stk.i.unconv.fits", r: "/rings.v3.skycell/1538/048/rings.v3.skycell.1538.048.stk.r.unconv.fits", y: "/rings.v3.skycell/1538/048/rings.v3.skycell.1538.048.stk.y.unconv.fits", z: "/rings.v3.skycell/1538/048/rings.v3.skycell.1538.048.stk.z.unconv.fits" },
  sulafat: { g: "/rings.v3.skycell/2069/013/rings.v3.skycell.2069.013.stk.g.unconv.fits", i: "/rings.v3.skycell/2069/013/rings.v3.skycell.2069.013.stk.i.unconv.fits", r: "/rings.v3.skycell/2069/013/rings.v3.skycell.2069.013.stk.r.unconv.fits", y: "/rings.v3.skycell/2069/013/rings.v3.skycell.2069.013.stk.y.unconv.fits", z: "/rings.v3.skycell/2069/013/rings.v3.skycell.2069.013.stk.z.unconv.fits" },
  talitha: { g: "/rings.v3.skycell/2311/000/rings.v3.skycell.2311.000.stk.g.unconv.fits", i: "/rings.v3.skycell/2311/000/rings.v3.skycell.2311.000.stk.i.unconv.fits", r: "/rings.v3.skycell/2311/000/rings.v3.skycell.2311.000.stk.r.unconv.fits", y: "/rings.v3.skycell/2311/000/rings.v3.skycell.2311.000.stk.y.unconv.fits", z: "/rings.v3.skycell/2311/000/rings.v3.skycell.2311.000.stk.z.unconv.fits" },
  "tania-borealis": { g: "/rings.v3.skycell/2186/073/rings.v3.skycell.2186.073.stk.g.unconv.fits", i: "/rings.v3.skycell/2186/073/rings.v3.skycell.2186.073.stk.i.unconv.fits", r: "/rings.v3.skycell/2186/073/rings.v3.skycell.2186.073.stk.r.unconv.fits", y: "/rings.v3.skycell/2186/073/rings.v3.skycell.2186.073.stk.y.unconv.fits", z: "/rings.v3.skycell/2186/073/rings.v3.skycell.2186.073.stk.z.unconv.fits" },
  tarazed: { g: "/rings.v3.skycell/1574/061/rings.v3.skycell.1574.061.stk.g.unconv.fits", i: "/rings.v3.skycell/1574/061/rings.v3.skycell.1574.061.stk.i.unconv.fits", r: "/rings.v3.skycell/1574/061/rings.v3.skycell.1574.061.stk.r.unconv.fits", y: "/rings.v3.skycell/1574/061/rings.v3.skycell.1574.061.stk.y.unconv.fits", z: "/rings.v3.skycell/1574/061/rings.v3.skycell.1574.061.stk.z.unconv.fits" },
  tejat: { g: "/rings.v3.skycell/1786/061/rings.v3.skycell.1786.061.stk.g.unconv.fits", i: "/rings.v3.skycell/1786/061/rings.v3.skycell.1786.061.stk.i.unconv.fits", r: "/rings.v3.skycell/1786/061/rings.v3.skycell.1786.061.stk.r.unconv.fits", y: "/rings.v3.skycell/1786/061/rings.v3.skycell.1786.061.stk.y.unconv.fits", z: "/rings.v3.skycell/1786/061/rings.v3.skycell.1786.061.stk.z.unconv.fits" },
  thuban: { g: "/rings.v3.skycell/2522/016/rings.v3.skycell.2522.016.stk.g.unconv.fits", i: "/rings.v3.skycell/2522/016/rings.v3.skycell.2522.016.stk.i.unconv.fits", r: "/rings.v3.skycell/2522/016/rings.v3.skycell.2522.016.stk.r.unconv.fits", y: "/rings.v3.skycell/2522/016/rings.v3.skycell.2522.016.stk.y.unconv.fits", z: "/rings.v3.skycell/2522/016/rings.v3.skycell.2522.016.stk.z.unconv.fits" },
  tureis: { g: "/rings.v3.skycell/0742/097/rings.v3.skycell.0742.097.stk.g.unconv.fits", i: "/rings.v3.skycell/0742/097/rings.v3.skycell.0742.097.stk.i.unconv.fits", r: "/rings.v3.skycell/0742/097/rings.v3.skycell.0742.097.stk.r.unconv.fits", y: "/rings.v3.skycell/0742/097/rings.v3.skycell.0742.097.stk.y.unconv.fits", z: "/rings.v3.skycell/0742/097/rings.v3.skycell.0742.097.stk.z.unconv.fits" },
  unukalhai: { g: "/rings.v3.skycell/1470/061/rings.v3.skycell.1470.061.stk.g.unconv.fits", i: "/rings.v3.skycell/1470/061/rings.v3.skycell.1470.061.stk.i.unconv.fits", r: "/rings.v3.skycell/1470/061/rings.v3.skycell.1470.061.stk.r.unconv.fits", y: "/rings.v3.skycell/1470/061/rings.v3.skycell.1470.061.stk.y.unconv.fits", z: "/rings.v3.skycell/1470/061/rings.v3.skycell.1470.061.stk.z.unconv.fits" },
  vega: { g: "/rings.v3.skycell/2141/066/rings.v3.skycell.2141.066.stk.g.unconv.fits", i: "/rings.v3.skycell/2141/066/rings.v3.skycell.2141.066.stk.i.unconv.fits", r: "/rings.v3.skycell/2141/066/rings.v3.skycell.2141.066.stk.r.unconv.fits", y: "/rings.v3.skycell/2141/066/rings.v3.skycell.2141.066.stk.y.unconv.fits", z: "/rings.v3.skycell/2141/066/rings.v3.skycell.2141.066.stk.z.unconv.fits" },
  wasat: { g: "/rings.v3.skycell/1790/048/rings.v3.skycell.1790.048.stk.g.unconv.fits", i: "/rings.v3.skycell/1790/048/rings.v3.skycell.1790.048.stk.i.unconv.fits", r: "/rings.v3.skycell/1790/048/rings.v3.skycell.1790.048.stk.r.unconv.fits", y: "/rings.v3.skycell/1790/048/rings.v3.skycell.1790.048.stk.y.unconv.fits", z: "/rings.v3.skycell/1790/048/rings.v3.skycell.1790.048.stk.z.unconv.fits" },
  wezen: { g: "/rings.v3.skycell/0738/031/rings.v3.skycell.0738.031.stk.g.unconv.fits", i: "/rings.v3.skycell/0738/031/rings.v3.skycell.0738.031.stk.i.unconv.fits", r: "/rings.v3.skycell/0738/031/rings.v3.skycell.0738.031.stk.r.unconv.fits", y: "/rings.v3.skycell/0738/031/rings.v3.skycell.0738.031.stk.y.unconv.fits", z: "/rings.v3.skycell/0738/031/rings.v3.skycell.0738.031.stk.z.unconv.fits" },
  "yed-prior": { g: "/rings.v3.skycell/1293/006/rings.v3.skycell.1293.006.stk.g.unconv.fits", i: "/rings.v3.skycell/1293/006/rings.v3.skycell.1293.006.stk.i.unconv.fits", r: "/rings.v3.skycell/1293/006/rings.v3.skycell.1293.006.stk.r.unconv.fits", y: "/rings.v3.skycell/1293/006/rings.v3.skycell.1293.006.stk.y.unconv.fits", z: "/rings.v3.skycell/1293/006/rings.v3.skycell.1293.006.stk.z.unconv.fits" },
  zaurak: { g: "/rings.v3.skycell/0981/069/rings.v3.skycell.0981.069.stk.g.unconv.fits", i: "/rings.v3.skycell/0981/069/rings.v3.skycell.0981.069.stk.i.unconv.fits", r: "/rings.v3.skycell/0981/069/rings.v3.skycell.0981.069.stk.r.unconv.fits", y: "/rings.v3.skycell/0981/069/rings.v3.skycell.0981.069.stk.y.unconv.fits", z: "/rings.v3.skycell/0981/069/rings.v3.skycell.0981.069.stk.z.unconv.fits" },
  zosma: { g: "/rings.v3.skycell/1803/011/rings.v3.skycell.1803.011.stk.g.unconv.fits", i: "/rings.v3.skycell/1803/011/rings.v3.skycell.1803.011.stk.i.unconv.fits", r: "/rings.v3.skycell/1803/011/rings.v3.skycell.1803.011.stk.r.unconv.fits", y: "/rings.v3.skycell/1803/011/rings.v3.skycell.1803.011.stk.y.unconv.fits", z: "/rings.v3.skycell/1803/011/rings.v3.skycell.1803.011.stk.z.unconv.fits" },
  zubenelgenubi: { g: "/rings.v3.skycell/0933/092/rings.v3.skycell.0933.092.stk.g.unconv.fits", i: "/rings.v3.skycell/0933/092/rings.v3.skycell.0933.092.stk.i.unconv.fits", r: "/rings.v3.skycell/0933/092/rings.v3.skycell.0933.092.stk.r.unconv.fits", y: "/rings.v3.skycell/0933/092/rings.v3.skycell.0933.092.stk.y.unconv.fits", z: "/rings.v3.skycell/0933/092/rings.v3.skycell.0933.092.stk.z.unconv.fits" },
  zubeneschamali: { g: "/rings.v3.skycell/1111/068/rings.v3.skycell.1111.068.stk.g.unconv.fits", i: "/rings.v3.skycell/1111/068/rings.v3.skycell.1111.068.stk.i.unconv.fits", r: "/rings.v3.skycell/1111/068/rings.v3.skycell.1111.068.stk.r.unconv.fits", y: "/rings.v3.skycell/1111/068/rings.v3.skycell.1111.068.stk.y.unconv.fits", z: "/rings.v3.skycell/1111/068/rings.v3.skycell.1111.068.stk.z.unconv.fits" }
}, Fs = {
  star: 15,
  planet: 10,
  nebula: 20,
  galaxy: 12,
  cluster: 20,
  "black-hole": 8
};
function js(n, s, e = {}) {
  const { padding: i = 1.6, minFov: t = 4, maxFov: r = 120 } = e, l = n != null ? n * i : Fs[s] ?? 15;
  return Math.max(t, Math.min(r, l));
}
const Vs = 0.25;
async function Bs(n, s, e, i, t = {}) {
  if (e < -30) return null;
  const r = Os[n];
  if (!r) return null;
  const { outputSize: l = 1024, timeout: c = 15e3 } = t, o = Math.round(i * 60 / Vs), g = Math.max(l, Math.min(o, 1e4)), v = r.i ?? r.r ?? r.g, k = r.r ?? r.g ?? r.i, a = r.g ?? r.r ?? r.i;
  if (!v && !k && !a) return null;
  const y = new URL("https://ps1images.stsci.edu/cgi-bin/fitscut.cgi");
  v && y.searchParams.set("red", v), k && y.searchParams.set("green", k), a && y.searchParams.set("blue", a), y.searchParams.set("size", String(g)), y.searchParams.set("output_size", String(Math.min(l, g))), y.searchParams.set("format", "jpg"), y.searchParams.set("autoscale", "99.5");
  try {
    const u = await fetch(y.toString(), {
      method: "HEAD",
      signal: AbortSignal.timeout(c)
    });
    if (!u.ok) return null;
    const d = u.headers.get("content-length");
    return d && parseInt(d) < 8e3 ? null : {
      url: y.toString(),
      format: "jpg",
      credit: "Pan-STARRS/STScI",
      source: "panstarrs"
    };
  } catch {
    return null;
  }
}
async function Hs(n, s, e, i = {}) {
  const { timeout: t = 15e3 } = i, r = s > -40 ? "poss2ukstu_red" : "poss1_red", l = new URL("https://archive.stsci.edu/cgi-bin/dss_search");
  l.searchParams.set("r", n.toFixed(6)), l.searchParams.set("d", s.toFixed(6)), l.searchParams.set("e", "J2000"), l.searchParams.set("w", e.toFixed(2)), l.searchParams.set("h", e.toFixed(2)), l.searchParams.set("f", "gif"), l.searchParams.set("v", r), l.searchParams.set("s", "on"), l.searchParams.set("compress", "none");
  try {
    const c = await fetch(l.toString(), {
      method: "HEAD",
      signal: AbortSignal.timeout(t)
    });
    if (!c.ok) return null;
    const o = c.headers.get("content-length");
    return o && parseInt(o) < 2e3 ? null : {
      url: l.toString(),
      format: "gif",
      credit: "DSS/STScI",
      source: "dss"
    };
  } catch {
    return null;
  }
}
let T = null, ls = null;
function Us(n) {
  T = n;
}
function Ks(n) {
  ls = n;
}
const q = {
  // ── Solar system ──────────────────────────────────────────────────────────
  sun: [{ filename: "The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg", credit: "NASA/SDO (AIA)" }],
  mercury: [{ filename: "Mercury_in_color_-_Prockter07-edit1.jpg", credit: "NASA/Johns Hopkins APL/Carnegie Inst. Washington" }],
  venus: [{ filename: "PIA00271-_Venus_-_3D_Perspective_View_of_Maat_Mons.jpg", credit: "NASA/JPL" }],
  earth: [{ filename: "The_Blue_Marble_(remastered).jpg", credit: "NASA/Apollo 17" }],
  moon: [{ filename: "FullMoon2010.jpg", credit: "Gregory H. Revera (CC BY-SA 3.0)" }],
  mars: [{ filename: "OSIRIS_Mars_true_color.jpg", credit: "ESA/MPS/UPD/LAM/IAA/RSSD/INTA/UPM/DASP/IDA" }],
  jupiter: [{ filename: "Jupiter_and_its_shrunken_Great_Red_Spot.jpg", credit: "NASA · ESA · A. Simon (GSFC)" }],
  saturn: [{ filename: "Saturn_during_Equinox.jpg", credit: "NASA/JPL/Space Science Institute" }],
  uranus: [{ filename: "Uranus2.jpg", credit: "NASA/JPL-Caltech" }],
  neptune: [{ filename: "Neptune_-_Voyager_2_(29347980845)_flatten_crop.jpg", credit: "NASA/JPL" }],
  // ── Bright stars ───────────────────────────────────────────────────────────
  sirius: [{ filename: "A_Guiding_Star.jpg", credit: "ESO/J. Girard" }],
  canopus: [{ filename: "Star_Canopus.superstructures.ajb.jpg", credit: "Ajepbah (CC BY-SA 3.0)" }],
  vega: [{ filename: "Vega_star.jpg", credit: "Talesofaviewfinder (CC BY-SA 4.0)" }],
  procyon: [{ filename: "4heic0516d.jpg", credit: "ESA/Hubble · Akira Fujii" }],
  albireo: [{ filename: "Albireo_double_star.jpg", credit: "N. B. (CC BY-SA 4.0)" }],
  mintaka: [{ filename: "Orion_Head_to_Toe.jpg", credit: "Rogelio Bernal Andreo (CC BY-SA 3.0)" }],
  acrab: [{ filename: "Rho_Ophiucus_Widefield.jpg", credit: "Rogelio Bernal Andreo (CC BY-SA 3.0)" }],
  // ── Messier objects ───────────────────────────────────────────────────────
  m1: [{ filename: "Crab_Nebula.jpg", credit: "NASA · ESA · J. Hester & A. Loll (ASU)" }],
  m8: [{ filename: "Lagoon_Nebula_from_ESO.jpg", credit: "ESO/INAF-VST/OmegaCAM" }],
  m13: [{ filename: "Messier_13_Hubble_WikiSky.jpg", credit: "NASA · ESA · Hubble Heritage Team" }],
  m16: [{ filename: "Pillars_of_creation_2014_HST_WFC3-UVIS_full-res_denoised.jpg", credit: "NASA · ESA · Hubble Heritage Team" }],
  m17: [{ filename: "Omega_Nebula.jpg", credit: "ESO" }],
  m20: [{ filename: "Trifid_Nebula_by_Spitzer.jpg", credit: "NASA/JPL-Caltech" }],
  m27: [{ filename: "Dumbbell_Nebula_by_HST.jpg", credit: "NASA · ESA" }],
  m31: [{ filename: "Andromeda_Galaxy_(with_h-alpha).jpg", credit: "Adam Evans (CC BY 2.0)" }],
  m33: [{ filename: "Triangulum_Galaxy_(full).jpg", credit: "NASA · ESA · M. Durbin, J. Dalcanton, B.F. Williams (Univ. of Washington)" }],
  m42: [{ filename: "Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg", credit: "NASA · ESA · M. Robberto (STScI/ESA)" }],
  m45: [{ filename: "Pleiades_large.jpg", credit: "NASA · ESA · AURA/Caltech" }],
  m51: [{ filename: "Messier51_sRGB.jpg", credit: "NASA · ESA · S. Beckwith (STScI) · Hubble Heritage Team" }],
  m57: [{ filename: "M57_The_Ring_Nebula.jpg", credit: "NASA · ESA · Hubble Heritage Team" }],
  m63: [{ filename: "Messier63_-_HST_-_Potw1901a.jpg", credit: "ESA/Hubble · NASA" }],
  m78: [{ filename: "Messier_78_-_Hubble.jpg", credit: "ESA/Hubble · NASA/D. Padgett (GSFC)" }],
  m81: [{ filename: "Messier_81_HST.jpg", credit: "NASA · ESA · Hubble Heritage Team" }],
  m82: [{ filename: "M82_HST_ACS_2006-14-a-large_web.jpg", credit: "NASA · ESA · Hubble Heritage Team" }],
  m83: [{ filename: "Messier_83_-_Hubble_-_STScI-PRC2014-04a.jpg", credit: "NASA · ESA · Hubble Heritage Team" }],
  m87: [{ filename: "Messier_87_Hubble_WikiSky.jpg", credit: "NASA · ESA · Hubble Heritage Team" }],
  m101: [{ filename: "M101_hires_STScI-PRC2006-10a.jpg", credit: "NASA · ESA · Hubble Heritage Team" }],
  m104: [{ filename: "M104_ngc4594_sombrero_galaxy_hi-res.jpg", credit: "NASA · ESA · Hubble Heritage Team" }],
  m109: [{ filename: "M109,_NGC_3992_(noao-m109).jpg", credit: "NOIRLab/NSF/AURA" }],
  // ── Deep-sky extras ───────────────────────────────────────────────────────
  ngc7293: [{ filename: "Helix_Nebula_-_NGC_7293.jpg", credit: "NASA · ESA · C.R. O'Dell (Vanderbilt)" }],
  "omega-cen": [{ filename: "Omega_Centauri_by_ESO.jpg", credit: "ESO" }],
  "m87-bh": [{ filename: "Black_hole_-_Messier_87_crop_max_res.jpg", credit: "Event Horizon Telescope · CC BY 4.0" }]
};
async function ds(n, s = {}) {
  const { source: e = "nasa", limit: i = 5 } = s, t = [];
  if (e === "nasa" || e === "all") {
    const r = await ts.searchImages(n, { pageSize: i });
    for (const l of r) {
      if (!l.nasaId) continue;
      const o = (await ts.getAssets(l.nasaId)).filter((g) => /\.(jpe?g|png|tiff?)$/i.test(g));
      o.length > 0 && t.push({
        urls: o,
        previewUrl: l.previewUrl,
        title: l.title,
        credit: l.center ? `NASA/${l.center}` : "NASA",
        source: "nasa"
      });
    }
  }
  if (e === "esa" || e === "all") {
    const r = await ms.searchHubble(n, i);
    for (const l of r) {
      const c = [l.imageUrl, l.thumbUrl].filter((o) => o !== null);
      c.length > 0 && t.push({
        urls: c,
        previewUrl: l.thumbUrl,
        title: l.title,
        credit: l.credit || "ESA/Hubble",
        source: "esa"
      });
    }
  }
  return t.slice(0, i);
}
const H = /* @__PURE__ */ new Map();
function rs(n, s, e) {
  return `${n}::${s}::${e}`;
}
function $s(n) {
  if (T)
    for (const s of n) {
      const e = T(s);
      if (!e) continue;
      const i = rs(s, 1200, "nasa");
      H.has(i) || as(s, e.name, { prefetch: !1 }).catch(() => {
      });
    }
}
const vs = /^(m|ngc|ic|sh2|arp|abell)\s*\d/i;
function qs(n, s) {
  const e = [], i = T == null ? void 0 : T(n);
  if (i != null && i.aliases)
    for (const t of i.aliases)
      vs.test(t) && e.push(t);
  return vs.test(n) && e.push(n.toUpperCase()), e.push(`${s} ${(i == null ? void 0 : i.type) ?? "astronomy"}`), e;
}
async function as(n, s, e = {}) {
  const {
    width: i = 1200,
    srcsetWidths: t = [640, 1024, 1600],
    source: r = "all",
    cutoutTimeout: l = 15e3,
    skipCutouts: c = !0,
    prefetch: o
  } = e, g = rs(n, i, r);
  if (H.has(g))
    return H.get(g) ?? null;
  let v = null;
  const k = q[n];
  if (k != null && k.length) {
    const a = k[0];
    v = {
      src: R.wikimediaUrl(a.filename, i),
      srcset: R.srcset(t, (y) => R.wikimediaUrl(a.filename, y)),
      placeholder: R.wikimediaUrl(a.filename, 64),
      credit: a.credit,
      source: "static"
    };
  }
  if (!v && !c && T) {
    const a = T(n);
    if (a && a.ra !== null && a.dec !== null) {
      const y = js(a.size_arcmin, a.type), u = { outputSize: i, timeout: l }, d = await Bs(n, a.ra, a.dec, y, u);
      if (d && (v = {
        src: d.url,
        srcset: null,
        placeholder: null,
        credit: d.credit,
        source: "panstarrs"
      }), !v) {
        const f = await Hs(a.ra, a.dec, y, u);
        f && (v = {
          src: f.url,
          srcset: null,
          placeholder: null,
          credit: f.credit,
          source: "dss"
        });
      }
    }
  }
  if (!v) {
    const a = qs(n, s), y = r === "nasa" ? ["nasa"] : r === "esa" ? ["esa"] : ["esa", "nasa"];
    for (const u of y) {
      if (v) break;
      for (const d of a)
        try {
          const f = await ds(d, { source: u, limit: 1 });
          if (f.length > 0) {
            const b = f[0];
            v = {
              src: b.previewUrl ?? b.urls[0],
              srcset: null,
              placeholder: null,
              credit: b.credit,
              source: b.source
            };
            break;
          }
        } catch {
        }
    }
  }
  if (H.set(g, v), v && o !== !1 && T && ls) {
    const a = T(n);
    if (a && a.ra !== null && a.dec !== null) {
      const y = typeof o == "object" ? o : {}, { radius: u = 5, limit: d = 8 } = y, f = ls({ ra: a.ra, dec: a.dec }, u).filter((b) => b.object.id !== n && !H.has(rs(b.object.id, i, r))).slice(0, d);
      for (const b of f)
        as(b.object.id, b.object.name, { ...e, prefetch: !1 }).catch(() => {
        });
    }
  }
  return v;
}
function Ws(n) {
  return {
    id: n.id,
    name: n.name,
    aliases: [],
    type: "star",
    ra: n.ra,
    dec: n.dec,
    magnitude: n.mag,
    spectral: n.spec,
    description: "",
    tags: ["star"]
  };
}
function Ys(n) {
  return {
    id: `m${n.messier}`,
    name: n.name,
    aliases: [`M${n.messier}`, ...n.ngc ? [n.ngc] : []],
    type: n.type,
    subtype: n.subtype,
    ra: n.ra,
    dec: n.dec,
    magnitude: n.mag,
    description: n.description,
    tags: ["messier", n.type],
    ...n.size_arcmin != null ? { size_arcmin: n.size_arcmin } : {}
  };
}
const P = [
  ...Ps,
  ...U.map(Ws),
  ...cs.map(Ys),
  ...Gs
], ps = new Map(P.map((n) => [n.id, n])), Js = new Map(
  P.flatMap(
    (n) => [n.name, ...n.aliases].map((s) => [s.toLowerCase(), n])
  )
);
Us((n) => {
  const s = ps.get(n);
  return s ? { id: s.id, ra: s.ra, dec: s.dec, size_arcmin: s.size_arcmin, type: s.type, name: s.name, aliases: s.aliases } : null;
});
Ks(
  (n, s) => P.filter(
    (e) => e.ra !== null && e.dec !== null
  ).map((e) => ({
    object: e,
    separation: M.angularSeparation(n, { ra: e.ra, dec: e.dec })
  })).filter((e) => e.separation <= s).sort((e, i) => e.separation - i.separation)
);
const Xs = new Map(
  U.map((n) => [n.name.toLowerCase(), n])
), Qs = new Map(
  us.map((n) => [n.abbr.toLowerCase(), n])
), Zs = new Map(
  cs.map((n) => [n.messier, n])
), se = P.map((n) => {
  var s;
  return {
    object: n,
    nameLower: n.name.toLowerCase(),
    aliasesLower: n.aliases.map((e) => e.toLowerCase()),
    descriptionLower: n.description.toLowerCase(),
    subtypeLower: (s = n.subtype) == null ? void 0 : s.toLowerCase()
  };
}), ee = {
  // ── Unified queries ────────────────────────────────────────────────────
  /**
   * Look up a celestial object by its exact identifier.
   *
   * @param id - The unique object ID (e.g. `'mars'`, `'m42'`, `'sirius'`).
   * @returns The matching {@link CelestialObject}, or `null` if not found.
   *
   * @example
   * ```ts
   * const mars = Data.get('mars')
   * // => { id: 'mars', name: 'Mars', type: 'planet', ... }
   *
   * const missing = Data.get('nonexistent')
   * // => null
   * ```
   */
  get(n) {
    return ps.get(n) ?? null;
  },
  /**
   * Look up a celestial object by name or any known alias (case-insensitive).
   *
   * @param name - The common name or alias (e.g. `'Sirius'`, `'Morning Star'`, `'NGC 1976'`).
   * @returns The matching {@link CelestialObject}, or `null` if no match.
   *
   * @example
   * ```ts
   * const sirius = Data.getByName('Sirius')
   * // => { id: 'sirius', name: 'Sirius', type: 'star', ... }
   *
   * const venus = Data.getByName('morning star')
   * // => { id: 'venus', name: 'Venus', ... }
   * ```
   */
  getByName(n) {
    return Js.get(n.toLowerCase()) ?? null;
  },
  /**
   * Return a shallow copy of the full unified catalog.
   *
   * The returned array is a new instance on every call, so it is safe to
   * sort, filter, or mutate without affecting the internal data.
   *
   * @returns A new array containing every {@link CelestialObject} in the catalog.
   *
   * @example
   * ```ts
   * const catalog = Data.all()
   * console.log(catalog.length) // ~420+ objects
   * ```
   */
  all() {
    return [...P];
  },
  /**
   * Filter the unified catalog by object type.
   *
   * @param type - The {@link ObjectType} to filter on (e.g. `'planet'`, `'nebula'`, `'galaxy'`).
   * @returns All objects matching the given type.
   *
   * @example
   * ```ts
   * const nebulae = Data.getByType('nebula')
   * // => [{ id: 'm1', name: 'Crab Nebula', ... }, ...]
   *
   * const planets = Data.getByType('planet')
   * // => [{ id: 'mercury', ... }, { id: 'venus', ... }, ...]
   * ```
   */
  getByType(n) {
    return P.filter((s) => s.type === n);
  },
  /**
   * Filter the unified catalog by a tag string.
   *
   * @param tag - A tag to match (e.g. `'messier'`, `'solar-system'`, `'globular'`).
   * @returns All objects whose `tags` array includes the given string.
   *
   * @example
   * ```ts
   * const messierObjects = Data.getByTag('messier')
   * // => all 110 Messier catalog entries
   *
   * const solarSystem = Data.getByTag('solar-system')
   * // => Sun, planets, and Moon
   * ```
   */
  getByTag(n) {
    return P.filter((s) => s.tags.includes(n));
  },
  /**
   * Fuzzy search across name, aliases, description, and tags.
   *
   * Results are ranked by a weighted relevance score: exact ID and name
   * matches rank highest, followed by alias matches, partial name matches,
   * description hits, and tag hits. Results are sorted highest-score first.
   *
   * @param query - The search term (case-insensitive). An empty string returns `[]`.
   * @returns Matching {@link CelestialObject CelestialObjects} sorted by relevance.
   *
   * @example
   * ```ts
   * const results = Data.search('orion')
   * // => [Orion Nebula (M42), De Mairan's Nebula (M43), Betelgeuse, ...]
   *
   * const galaxies = Data.search('spiral')
   * // => all objects with 'spiral' in name, subtype, description, or tags
   * ```
   */
  search(n) {
    const s = n.toLowerCase().trim();
    return s ? se.map((e) => {
      var t;
      let i = 0;
      return e.object.id === s && (i += 100), e.nameLower === s && (i += 90), e.nameLower.startsWith(s) && (i += 50), e.aliasesLower.some((r) => r === s) && (i += 80), e.aliasesLower.some((r) => r.includes(s)) && (i += 20), e.nameLower.includes(s) && (i += 15), e.descriptionLower.includes(s) && (i += 5), e.object.tags.some((r) => r.includes(s)) && (i += 8), (t = e.subtypeLower) != null && t.includes(s) && (i += 10), { object: e.object, score: i };
    }).filter((e) => e.score > 0).sort((e, i) => i.score - e.score).map((e) => e.object) : [];
  },
  /**
   * Find all objects within a given angular radius of a sky position.
   *
   * Only considers objects with known RA/Dec coordinates (solar-system
   * bodies with `null` RA/Dec are excluded). Results are sorted by
   * angular separation, nearest first.
   *
   * @param center - The sky position to search around, in J2000 equatorial coordinates.
   * @param radiusDeg - Search radius in degrees.
   * @returns An array of {@link ProximityResult} objects, each containing the
   *   matched object and its angular separation from the center.
   *
   * @example
   * ```ts
   * // Find objects within 5 degrees of the Orion Nebula
   * const nearby = Data.nearby({ ra: 83.82, dec: -5.39 }, 5)
   * nearby.forEach(r =>
   *   console.log(`${r.object.name}: ${r.separation.toFixed(2)}deg`)
   * )
   * ```
   */
  nearby(n, s) {
    return P.filter(
      (e) => e.ra !== null && e.dec !== null
    ).map((e) => ({
      object: e,
      separation: M.angularSeparation(n, { ra: e.ra, dec: e.dec })
    })).filter((e) => e.separation <= s).sort((e, i) => e.separation - i.separation);
  },
  // ── Image helpers ─────────────────────────────────────────────────────
  /**
   * Get static Wikimedia image URLs for an object from the fallback registry.
   *
   * Uses the curated {@link IMAGE_FALLBACKS} registry (no API call needed).
   * Returns an empty array if the object has no static images registered.
   *
   * @param id - The object ID (e.g. `'m42'`, `'m31'`).
   * @param width - Optional pixel width for Wikimedia thumbnail resizing.
   * @returns An array of Wikimedia Commons thumbnail URLs.
   *
   * @example
   * ```ts
   * const urls = Data.imageUrls('m42', 1280)
   * // => ['https://upload.wikimedia.org/...Orion_Nebula.../1280px-...']
   *
   * const empty = Data.imageUrls('mercury')
   * // => []
   * ```
   */
  imageUrls(n, s) {
    const e = q[n];
    return e != null && e.length ? e.map((i) => R.wikimediaUrl(i.filename, s)) : [];
  },
  /**
   * Build a {@link ProgressiveImageOptions} config from the static fallback registry.
   *
   * Produces a tiny 64 px placeholder, a standard-resolution source, and a
   * 2x HD source -- ready to feed into `Media.progressive()`.
   * Returns `null` if the object has no static images registered.
   *
   * @param id - The object ID (e.g. `'m42'`, `'m51'`).
   * @param width - Target width in pixels for the standard source. Defaults to `800`.
   * @returns A {@link ProgressiveImageOptions} object, or `null`.
   *
   * @example
   * ```ts
   * const prog = Data.progressiveImage('m42', 1024)
   * // => { placeholder: '...64px...', src: '...1024px...', srcHD: '...2048px...' }
   * ```
   */
  progressiveImage(n, s = 800) {
    const e = q[n], i = e == null ? void 0 : e[0];
    return i ? {
      placeholder: R.wikimediaUrl(i.filename, 64),
      src: R.wikimediaUrl(i.filename, s),
      srcHD: R.wikimediaUrl(i.filename, s * 2)
    } : null;
  },
  /**
   * Generate an HTML `srcset` string from the static fallback registry.
   *
   * Produces a comma-separated list of `<url> <width>w` entries suitable
   * for the `srcset` attribute of an `<img>` element.
   * Returns `null` if the object has no static images registered.
   *
   * @param id - The object ID (e.g. `'m31'`).
   * @param widths - Array of pixel widths to include. Defaults to `[640, 1280, 1920]`.
   * @returns A `srcset`-formatted string, or `null`.
   *
   * @example
   * ```ts
   * const srcset = Data.imageSrcset('m31')
   * // => '...640px-... 640w, ...1280px-... 1280w, ...1920px-... 1920w'
   * ```
   */
  imageSrcset(n, s = [640, 1280, 1920]) {
    const e = q[n], i = e == null ? void 0 : e[0];
    return i ? R.srcset(s, (t) => R.wikimediaUrl(i.filename, t)) : null;
  },
  /**
   * Search NASA and/or ESA APIs for images of any celestial object by name.
   *
   * Returns multi-resolution {@link ResolvedImage} results suitable for
   * progressive loading, fallback chains, or Three.js textures.
   * Unlike the static `imageUrls` / `imageSrcset` helpers, this method
   * works for **any** object -- it is not limited to the curated fallback registry.
   *
   * @param name - Object name to search (e.g. `'Orion Nebula'`, `'M42'`, `'Sirius'`).
   * @param opts - Optional {@link ResolveImageOptions} to control source and limit.
   * @returns A promise resolving to an array of {@link ResolvedImage} results.
   *
   * @example
   * ```ts
   * const images = await Data.resolveImages('Crab Nebula', { source: 'all', limit: 3 })
   * images.forEach(img => console.log(img.title, img.urls[0]))
   * ```
   */
  resolveImages: ds,
  /**
   * Unified image pipeline — resolves the best available image for any
   * celestial object and returns it in an optimized, ready-to-render format.
   *
   * Runs a cascading lookup: static registry (instant) → NASA → ESA.
   * Results from API sources are cached in memory. The consumer only needs
   * to provide the object ID and name — the pipeline handles source selection,
   * URL construction, and responsive `srcset` generation.
   *
   * @param id   - Object ID (e.g. `'mars'`, `'m42'`, `'sirius'`).
   * @param name - Display name for API search fallback (e.g. `'Mars'`).
   * @param opts - Width, srcset, and source preferences.
   * @returns The best available image, or `null` if nothing was found.
   *
   * @example
   * ```ts
   * const img = await Data.getImage('mars', 'Mars')
   * if (img) {
   *   heroEl.src = img.src
   *   heroEl.srcset = img.srcset ?? ''
   *   creditEl.textContent = img.credit
   * }
   * ```
   */
  getImage: as,
  /**
   * Prefetch images for a list of object IDs in the background.
   *
   * Results are stored in the in-memory cache so subsequent
   * {@link Data.getImage} calls resolve instantly.
   *
   * @param ids - Object IDs to prefetch.
   *
   * @example
   * ```ts
   * Data.prefetchImages(filteredObjects.map(o => o.id))
   * ```
   */
  prefetchImages: $s,
  // ── Bright star queries ────────────────────────────────────────────────
  /**
   * Get all bright stars in the catalog (~200 IAU named stars).
   *
   * @returns The full {@link BRIGHT_STARS} array (readonly).
   *
   * @example
   * ```ts
   * const stars = Data.stars()
   * console.log(stars[0].name) // 'Sirius'
   * ```
   */
  stars() {
    return U;
  },
  /**
   * Look up a bright star by its IAU proper name (case-insensitive).
   *
   * @param name - The IAU proper name (e.g. `'Sirius'`, `'Betelgeuse'`, `'Polaris'`).
   * @returns The matching {@link BrightStar}, or `null` if not found.
   *
   * @example
   * ```ts
   * const sirius = Data.getStarByName('Sirius')
   * // => { id: 'sirius', name: 'Sirius', con: 'CMa', mag: -1.46, ... }
   * ```
   */
  getStarByName(n) {
    return Xs.get(n.toLowerCase()) ?? null;
  },
  /**
   * Get all bright stars belonging to a given constellation.
   *
   * @param con - The 3-letter IAU constellation abbreviation (case-insensitive),
   *   e.g. `'Ori'`, `'CMa'`, `'UMa'`.
   * @returns All {@link BrightStar BrightStars} in that constellation.
   *
   * @example
   * ```ts
   * const orionStars = Data.getStarsByConstellation('Ori')
   * // => [Rigel, Betelgeuse, Bellatrix, Alnilam, Alnitak, Mintaka, Saiph]
   * ```
   */
  getStarsByConstellation(n) {
    const s = n.toUpperCase();
    return U.filter((e) => e.con.toUpperCase() === s);
  },
  /**
   * Find bright stars within a given angular radius of a sky position.
   *
   * Results are sorted by angular separation (nearest first).
   *
   * @param center - The sky position to search around, in J2000 equatorial coordinates.
   * @param radiusDeg - Search radius in degrees.
   * @returns An array of objects, each containing the matched {@link BrightStar}
   *   and its angular `separation` in degrees from the center.
   *
   * @example
   * ```ts
   * // Find bright stars within 10 degrees of Sirius
   * const nearby = Data.nearbyStars({ ra: 101.287, dec: -16.716 }, 10)
   * nearby.forEach(r =>
   *   console.log(`${r.star.name}: ${r.separation.toFixed(2)}deg`)
   * )
   * ```
   */
  nearbyStars(n, s) {
    return U.map((e) => ({
      star: e,
      separation: M.angularSeparation(n, { ra: e.ra, dec: e.dec })
    })).filter((e) => e.separation <= s).sort((e, i) => e.separation - i.separation);
  },
  // ── Constellation queries ────────────────────────────────────────────────
  /**
   * Get all 88 IAU constellations.
   *
   * @returns The full {@link CONSTELLATIONS} array (readonly).
   *
   * @example
   * ```ts
   * const all = Data.constellations()
   * console.log(all.length) // 88
   * ```
   */
  constellations() {
    return us;
  },
  /**
   * Look up a constellation by its 3-letter IAU abbreviation (case-insensitive).
   *
   * @param abbr - The abbreviation (e.g. `'Ori'`, `'UMa'`, `'Sco'`).
   * @returns The matching {@link Constellation}, or `null` if not found.
   *
   * @example
   * ```ts
   * const orion = Data.getConstellation('Ori')
   * // => { abbr: 'Ori', name: 'Orion', genitive: 'Orionis', area: 594, ... }
   * ```
   */
  getConstellation(n) {
    return Qs.get(n.toLowerCase()) ?? null;
  },
  // ── Messier catalog queries ────────────────────────────────────────────
  /**
   * Get all 110 Messier objects.
   *
   * @returns The full {@link MESSIER_CATALOG} array (readonly).
   *
   * @example
   * ```ts
   * const catalog = Data.messier()
   * console.log(catalog.length) // 110
   * ```
   */
  messier() {
    return cs;
  },
  /**
   * Look up a Messier object by its catalog number.
   *
   * @param number - The Messier number, from 1 to 110.
   * @returns The matching {@link MessierObject}, or `null` if out of range.
   *
   * @example
   * ```ts
   * const m42 = Data.getMessier(42)
   * // => { messier: 42, name: 'Orion Nebula', type: 'nebula', mag: 4.0, ... }
   *
   * const m1 = Data.getMessier(1)
   * // => { messier: 1, name: 'Crab Nebula', ... }
   * ```
   */
  getMessier(n) {
    return Zs.get(n) ?? null;
  },
  // ── Meteor shower queries ──────────────────────────────────────────────
  /**
   * Get all meteor showers in the catalog (~23 significant annual showers).
   *
   * @returns The full {@link METEOR_SHOWERS} array (readonly).
   *
   * @example
   * ```ts
   * const showers = Data.showers()
   * const perseids = showers.find(s => s.id === 'perseids')
   * console.log(perseids?.zhr) // 100
   * ```
   */
  showers() {
    return gs;
  },
  /**
   * Get meteor showers that are active on a given date.
   *
   * Computes the Sun's ecliptic longitude for the date and compares it
   * against each shower's peak solar longitude, returning those within
   * a +/-20 degree activity window.
   *
   * @param date - The date to check for active showers.
   * @returns An array of {@link MeteorShower MeteorShowers} active on the given date.
   *
   * @example
   * ```ts
   * // Check for active showers on August 12 (Perseid peak)
   * const active = Data.getActiveShowers(new Date('2025-08-12'))
   * console.log(active.map(s => s.name))
   * // => ['Perseids', 'Kappa Cygnids', ...]
   * ```
   */
  getActiveShowers(n) {
    const e = ((M.planetEcliptic("earth", n).lon + 180) % 360 + 360) % 360;
    return gs.filter((i) => Math.abs(((e - i.solarLon + 180) % 360 + 360) % 360 - 180) < 20);
  }
}, ge = {
  sun: {
    id: "sun",
    name: "Sun Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg"
    ],
    credit: "NASA/SDO (AIA)",
    license: "public-domain",
    width: 4096,
    height: 4096
  },
  mercury: {
    id: "mercury",
    name: "Mercury Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/9/92/Solarsystemscope_texture_2k_mercury.jpg"
    ],
    credit: "NASA/Johns Hopkins APL/Carnegie Institution",
    license: "public-domain",
    width: 2048,
    height: 1024
  },
  venus: {
    id: "venus",
    name: "Venus Surface (Radar)",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/1/16/Solarsystemscope_texture_2k_venus_surface.jpg"
    ],
    credit: "NASA/JPL-Caltech",
    license: "public-domain",
    width: 2048,
    height: 1024
  },
  venus_atmosphere: {
    id: "venus_atmosphere",
    name: "Venus Atmosphere",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/7/72/Solarsystemscope_texture_2k_venus_atmosphere.jpg"
    ],
    credit: "NASA/JPL-Caltech",
    license: "public-domain",
    width: 2048,
    height: 1024
  },
  earth: {
    id: "earth",
    name: "Earth Blue Marble",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/0/04/Solarsystemscope_texture_8k_earth_daymap.jpg",
      "https://upload.wikimedia.org/wikipedia/commons/2/23/Blue_Marble_2002.png"
    ],
    credit: "NASA Visible Earth",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  earth_night: {
    id: "earth_night",
    name: "Earth Night Lights",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/b/ba/Solarsystemscope_texture_8k_earth_nightmap.jpg"
    ],
    credit: "NASA Earth Observatory",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  earth_clouds: {
    id: "earth_clouds",
    name: "Earth Clouds",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/9/9d/Solarsystemscope_texture_8k_earth_clouds.jpg"
    ],
    credit: "NASA Visible Earth",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  moon: {
    id: "moon",
    name: "Moon Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/a/a8/Solarsystemscope_texture_8k_moon.jpg"
    ],
    credit: "NASA/GSFC/Arizona State University (LROC)",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  mars: {
    id: "mars",
    name: "Mars Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/f/fe/Solarsystemscope_texture_8k_mars.jpg"
    ],
    credit: "NASA/JPL-Caltech (MOLA)",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  jupiter: {
    id: "jupiter",
    name: "Jupiter Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/4/48/Solarsystemscope_texture_8k_jupiter.jpg"
    ],
    credit: "NASA/JPL-Caltech (Cassini/Juno)",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  saturn: {
    id: "saturn",
    name: "Saturn Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/e/ea/Solarsystemscope_texture_8k_saturn.jpg"
    ],
    credit: "NASA/JPL-Caltech (Cassini)",
    license: "public-domain",
    width: 8192,
    height: 4096
  },
  saturn_ring: {
    id: "saturn_ring",
    name: "Saturn Ring",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_saturn_ring_alpha.png"
    ],
    credit: "NASA/JPL-Caltech (Cassini)",
    license: "public-domain",
    width: 2048,
    height: 64
  },
  uranus: {
    id: "uranus",
    name: "Uranus Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/9/95/Solarsystemscope_texture_2k_uranus.jpg"
    ],
    credit: "NASA/JPL-Caltech (Voyager)",
    license: "public-domain",
    width: 2048,
    height: 1024
  },
  neptune: {
    id: "neptune",
    name: "Neptune Surface",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_neptune.jpg"
    ],
    credit: "NASA/JPL-Caltech (Voyager)",
    license: "public-domain",
    width: 2048,
    height: 1024
  }
}, ve = {
  milky_way: {
    id: "milky_way",
    name: "Milky Way Panorama",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/4/43/ESO_-_Milky_Way.jpg"
    ],
    credit: "ESO/S. Brunier",
    license: "CC-BY",
    width: 9e3,
    height: 3600
  },
  star_field: {
    id: "star_field",
    name: "Star Field Background",
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/8/80/Solarsystemscope_texture_8k_stars.jpg"
    ],
    credit: "NASA/Goddard Space Flight Center",
    license: "public-domain",
    width: 8192,
    height: 4096
  }
}, L = S.DEG_TO_RAD;
function Y(n, s, e = 500) {
  const i = s.ra * L, t = s.dec * L, r = n.ra * L, l = n.dec * L, c = r - i, o = Math.sin(t) * Math.sin(l) + Math.cos(t) * Math.cos(l) * Math.cos(c), g = 2 / (1 + o);
  return {
    x: g * Math.cos(l) * Math.sin(c) * e,
    y: g * (Math.cos(t) * Math.sin(l) - Math.sin(t) * Math.cos(l) * Math.cos(c)) * e,
    visible: o > -0.95
  };
}
function J(n, s) {
  const { width: e, height: i } = s, t = (n.ra - 180) * L, r = n.dec * L;
  let l = r;
  for (let g = 0; g < 10; g++) {
    const v = 4 * Math.cos(l) ** 2 + 2;
    if (Math.abs(v) < 1e-9) break;
    l -= (2 * l + Math.sin(2 * l) - Math.PI * Math.sin(r)) / v;
  }
  const c = e / 2 + e / (2 * Math.PI) * (2 * Math.SQRT2 / Math.PI) * t * Math.cos(l), o = i / 2 - i / 2 * Math.SQRT2 * Math.sin(l);
  return { x: c, y: o, visible: !0 };
}
function X(n, s, e = 400) {
  const i = s.ra * L, t = s.dec * L, r = n.ra * L, l = n.dec * L, c = r - i, o = Math.sin(t) * Math.sin(l) + Math.cos(t) * Math.cos(l) * Math.cos(c);
  return o <= 0 ? { x: 0, y: 0, visible: !1 } : {
    x: e * Math.cos(l) * Math.sin(c) / o,
    y: e * (Math.cos(t) * Math.sin(l) - Math.sin(t) * Math.cos(l) * Math.cos(c)) / o,
    visible: o > 0
  };
}
function ne(n) {
  var i;
  if (n.type === "nebula") return "#ff7744";
  if (n.type === "galaxy") return "#ffddaa";
  if (n.type === "cluster") return "#aaccff";
  if (n.type === "black-hole") return "#ff4400";
  const s = (i = n.spectral) == null ? void 0 : i[0], e = {
    O: "#9bb0ff",
    B: "#aabfff",
    A: "#cad7ff",
    F: "#f8f7ff",
    G: "#fff4e8",
    K: "#ffd2a1",
    M: "#ffcc6f"
  };
  return s && s in e ? e[s] ?? "#ffffff" : "#ffffff";
}
function os(n, s, e = {}) {
  const {
    projection: i = "stereographic",
    center: t = { ra: 0, dec: 0 },
    scale: r = 300,
    showGrid: l = !0,
    showLabels: c = !0,
    showMagnitudeLimit: o = 8,
    background: g = "#000008",
    gridColor: v = "rgba(255,255,255,0.12)",
    labelColor: k = "rgba(255,255,255,0.7)"
  } = e, a = n.getContext("2d");
  if (!a) throw new Error("Canvas 2D context not available");
  const y = n.width, u = n.height, d = y / 2, f = u / 2, b = (p) => {
    if (i === "mollweide")
      return J(p, { width: y, height: u });
    const m = i === "gnomonic" ? X(p, t, r) : Y(p, t, r);
    return { x: d + m.x, y: f - m.y, visible: m.visible };
  };
  if (a.fillStyle = g, a.fillRect(0, 0, y, u), l) {
    a.strokeStyle = v, a.lineWidth = 0.5;
    for (let p = -90; p <= 90; p += 30) {
      a.beginPath();
      let m = !1;
      for (let A = 0; A <= 360; A += 4) {
        const h = b({ ra: A, dec: p });
        if (!h.visible || h.x < -y || h.x > 2 * y) {
          m = !1;
          continue;
        }
        m ? a.lineTo(h.x, h.y) : (a.moveTo(h.x, h.y), m = !0);
      }
      a.stroke();
    }
    for (let p = 0; p < 360; p += 30) {
      a.beginPath();
      let m = !1;
      for (let A = -90; A <= 90; A += 4) {
        const h = b({ ra: p, dec: A });
        if (!h.visible || h.y < -u || h.y > 2 * u) {
          m = !1;
          continue;
        }
        m ? a.lineTo(h.x, h.y) : (a.moveTo(h.x, h.y), m = !0);
      }
      a.stroke();
    }
  }
  if (e.showConstellationLines && e.constellations) {
    a.strokeStyle = e.constellationLineColor ?? "rgba(100,149,237,0.35)", a.lineWidth = 0.8;
    for (const p of e.constellations)
      for (const m of p.stickFigure) {
        const A = b({ ra: m[0], dec: m[1] }), h = b({ ra: m[2], dec: m[3] });
        !A.visible || !h.visible || A.x < -50 || A.x > y + 50 || h.x < -50 || h.x > y + 50 || (a.beginPath(), a.moveTo(A.x, A.y), a.lineTo(h.x, h.y), a.stroke());
      }
  }
  if (e.showConstellationLabels && e.constellations) {
    a.fillStyle = e.constellationLabelColor ?? "rgba(100,149,237,0.5)", a.font = "11px sans-serif", a.textAlign = "center";
    for (const p of e.constellations) {
      const m = b({ ra: p.ra, dec: p.dec });
      m.visible && (m.x < 0 || m.x > y || m.y < 0 || m.y > u || a.fillText(p.name, m.x, m.y));
    }
    a.textAlign = "left";
  }
  for (const p of s) {
    if (p.ra === null || p.dec === null || p.magnitude !== null && p.magnitude > o) continue;
    const m = b({ ra: p.ra, dec: p.dec });
    if (!m.visible || m.x < -50 || m.x > y + 50 || m.y < -50 || m.y > u + 50) continue;
    const A = p.magnitude ?? 5, h = Math.max(1.5, Math.min(10, (6 - A) * 0.9 + 1.5)), C = ne(p);
    if (a.save(), p.type === "galaxy")
      a.strokeStyle = C, a.lineWidth = 1, a.beginPath(), a.ellipse(m.x, m.y, h * 2.5, h * 1.2, 0.4, 0, Math.PI * 2), a.stroke();
    else if (p.type === "nebula")
      a.fillStyle = C + "33", a.strokeStyle = C, a.lineWidth = 0.8, a.beginPath(), a.rect(m.x - h, m.y - h, h * 2, h * 2), a.fill(), a.stroke();
    else if (p.type === "cluster")
      a.strokeStyle = C, a.lineWidth = 1, a.beginPath(), a.arc(m.x, m.y, h * 1.8, 0, Math.PI * 2), a.stroke(), p.subtype === "globular" && (a.beginPath(), a.moveTo(m.x - h * 1.8, m.y), a.lineTo(m.x + h * 1.8, m.y), a.moveTo(m.x, m.y - h * 1.8), a.lineTo(m.x, m.y + h * 1.8), a.stroke());
    else {
      const x = a.createRadialGradient(m.x, m.y, 0, m.x, m.y, h * 2.5);
      x.addColorStop(0, C), x.addColorStop(0.3, C + "cc"), x.addColorStop(1, C + "00"), a.fillStyle = x, a.beginPath(), a.arc(m.x, m.y, h * 2.5, 0, Math.PI * 2), a.fill();
    }
    c && A < 3.5 && (a.fillStyle = k, a.font = `${Math.max(10, 13 - A)}px sans-serif`, a.fillText(p.name, m.x + h + 4, m.y - h)), a.restore();
  }
}
const ke = { stereographic: Y, mollweide: J, gnomonic: X, render: os }, K = S.DEG_TO_RAD, F = 1 / K;
function ie(n, s, e, i) {
  const t = n / i, r = s / i, l = Math.sqrt(t * t + r * r);
  if (l === 0) return { ra: e.ra, dec: e.dec };
  const c = 2 * Math.atan(l / 2), o = Math.sin(c), g = Math.cos(c), v = e.dec * K, k = e.ra * K, a = Math.asin(g * Math.sin(v) + r * o * Math.cos(v) / l) * F, y = (k + Math.atan2(
    t * o,
    l * Math.cos(v) * g - r * Math.sin(v) * o
  )) * F;
  return !isFinite(y) || !isFinite(a) ? null : { ra: (y % 360 + 360) % 360, dec: a };
}
function te(n, s, e, i) {
  const t = n / i, r = s / i, l = Math.sqrt(t * t + r * r), c = e.dec * K, o = e.ra * K, g = Math.atan(l), v = Math.sin(g), k = Math.cos(g);
  let a, y;
  return l === 0 ? (a = e.dec, y = e.ra) : (a = Math.asin(k * Math.sin(c) + r * v * Math.cos(c) / l) * F, y = (o + Math.atan2(
    t * v,
    l * Math.cos(c) * k - r * Math.sin(c) * v
  )) * F), !isFinite(y) || !isFinite(a) ? null : { ra: (y % 360 + 360) % 360, dec: a };
}
function le(n, s, e, i) {
  const r = -(s - i / 2) / (i / 2) / Math.SQRT2;
  if (Math.abs(r) > 1) return null;
  const l = Math.asin(r), c = (n - e / 2) / (e / (2 * Math.PI)), o = Math.cos(l);
  if (Math.abs(o) < 1e-12)
    return { ra: 180, dec: r > 0 ? 90 : -90 };
  const g = c / (2 * Math.SQRT2 / Math.PI * o);
  if (Math.abs(g) > Math.PI) return null;
  const v = (2 * l + Math.sin(2 * l)) / Math.PI;
  if (Math.abs(v) > 1) return null;
  const k = Math.asin(v), a = ((g * F + 180) % 360 + 360) % 360, y = k * F;
  return !isFinite(a) || !isFinite(y) ? null : { ra: a, dec: y };
}
function ks(n, s, e, i, t, r, l) {
  if (t === "mollweide")
    return le(n, s, e, i);
  const c = e / 2, o = i / 2, g = n - c, v = o - s;
  return t === "gnomonic" ? te(g, v, r, l) : ie(g, v, r, l);
}
function ns(n, s, e, i) {
  let t = null, r = 1 / 0;
  for (const l of n) {
    const c = l.x - s, o = l.y - e, g = c * c + o * o, v = Math.max(i, l.radius);
    g < v * v && g < r && (r = g, t = l);
  }
  return t;
}
const is = S.DEG_TO_RAD, re = 250, ce = 10, w = {
  panEnabled: !0,
  zoomEnabled: !0,
  selectEnabled: !0,
  hoverEnabled: !0,
  minScale: 50,
  maxScale: 5e3,
  hitRadius: 15,
  realTimeInterval: 1e3
};
class fs {
  constructor(s, e, i = {}) {
    var l, c;
    this._projectedCache = [], this._selectedObject = null, this._hoveredObject = null, this._listeners = /* @__PURE__ */ new Map(), this._rafId = null, this._dirty = !1, this._realTimeTimer = null, this._pointers = /* @__PURE__ */ new Map(), this._disposed = !1, this._panAnimId = null, this._onPointerDown = (o) => {
      if (this._disposed) return;
      this._canvas.setPointerCapture(o.pointerId);
      const { x: g, y: v } = this._canvasCoords(o);
      this._pointers.set(o.pointerId, {
        startX: g,
        startY: v,
        lastX: g,
        lastY: v,
        startTime: performance.now()
      });
    }, this._onPointerMove = (o) => {
      if (this._disposed) return;
      const { x: g, y: v } = this._canvasCoords(o), k = this._pointers.get(o.pointerId);
      if (k && this._pointers.size === 1 && (this._opts.panEnabled ?? w.panEnabled)) {
        const a = g - k.lastX, y = v - k.lastY;
        if (k.lastX = g, k.lastY = v, this._view.projection === "mollweide") {
          const u = this._canvas.width, d = this._canvas.height, f = ks(g - a, v - y, u, d, "mollweide", this._view.center, this._view.scale), b = ks(g, v, u, d, "mollweide", this._view.center, this._view.scale);
          if (f && b) {
            let p = f.ra - b.ra;
            p > 180 && (p -= 360), p < -180 && (p += 360), this._view.center = {
              ra: ((this._view.center.ra + p) % 360 + 360) % 360,
              dec: Math.max(-90, Math.min(90, this._view.center.dec + (f.dec - b.dec)))
            }, this._markDirty(), this._emitViewChange();
          }
        } else {
          const u = a / this._view.scale / is, d = y / this._view.scale / is;
          this._view.center = {
            ra: ((this._view.center.ra - u) % 360 + 360) % 360,
            dec: Math.max(-90, Math.min(90, this._view.center.dec + d))
          }, this._markDirty(), this._emitViewChange();
        }
        return;
      }
      if (k && this._pointers.size === 2 && (this._opts.zoomEnabled ?? w.zoomEnabled)) {
        k.lastX = g, k.lastY = v;
        const a = [...this._pointers.keys()], y = this._pointers.get(a[0]), u = this._pointers.get(a[1]), d = Math.hypot(y.lastX - u.lastX, y.lastY - u.lastY), f = Math.hypot(
          (a[0] === o.pointerId ? g - (g - k.lastX + (k.lastX - y.lastX)) : y.lastX) - u.lastX,
          (a[0] === o.pointerId ? v - (v - k.lastY + (k.lastY - y.lastY)) : y.lastY) - u.lastY
        );
        if (f > 0) {
          const b = d / f;
          this._view.scale = this._clampScale(this._view.scale * b), this._markDirty(), this._emitViewChange();
        }
        return;
      }
      if (this._pointers.size === 0 && (this._opts.hoverEnabled ?? w.hoverEnabled)) {
        const a = this._opts.hitRadius ?? w.hitRadius, y = ns(this._projectedCache, g, v, a), u = (y == null ? void 0 : y.object) ?? null;
        u !== this._hoveredObject && (this._hoveredObject = u, this._markDirty(), this._emit("hover", {
          object: u,
          point: y ? { x: y.x, y: y.y, visible: !0 } : null,
          event: o
        }));
      }
    }, this._onPointerUp = (o) => {
      if (this._disposed) return;
      const g = this._pointers.get(o.pointerId);
      if (this._pointers.delete(o.pointerId), !g) return;
      const v = performance.now() - g.startTime, k = Math.hypot(g.lastX - g.startX, g.lastY - g.startY);
      if (v < re && k < ce && (this._opts.selectEnabled ?? w.selectEnabled)) {
        const a = this._opts.hitRadius ?? w.hitRadius, y = ns(this._projectedCache, g.lastX, g.lastY, a);
        y ? (this._selectedObject = y.object, this._markDirty(), this._emit("select", {
          object: y.object,
          point: { x: y.x, y: y.y, visible: !0 },
          event: o
        })) : this._selectedObject && (this._selectedObject = null, this._markDirty());
      }
    }, this._onWheel = (o) => {
      if (this._disposed || !(this._opts.zoomEnabled ?? w.zoomEnabled)) return;
      o.preventDefault();
      const g = o.deltaY > 0 ? 0.9 : 1.1, v = this._clampScale(this._view.scale * g);
      v !== this._view.scale && (this._view.scale = v, this._markDirty(), this._emitViewChange());
    };
    const t = s.getContext("2d");
    if (!t) throw new Error("Canvas 2D context not available");
    this._canvas = s, this._ctx = t, this._objects = e, this._opts = i, this._view = {
      center: { ra: ((l = i.center) == null ? void 0 : l.ra) ?? 0, dec: ((c = i.center) == null ? void 0 : c.dec) ?? 0 },
      scale: i.scale ?? 300,
      projection: i.projection ?? "stereographic"
    }, this._abortController = new AbortController();
    const r = this._abortController.signal;
    s.addEventListener("pointerdown", this._onPointerDown, { signal: r }), s.addEventListener("pointermove", this._onPointerMove, { signal: r }), s.addEventListener("pointerup", this._onPointerUp, { signal: r }), s.addEventListener("pointercancel", this._onPointerUp, { signal: r }), s.addEventListener("wheel", this._onWheel, { passive: !1, signal: r }), s.style.touchAction = "none", i.realTime && this.startRealTime(i.observer), this.render();
  }
  // ── Event emitter ────────────────────────────────────────────────────────
  /**
   * Subscribe to an interaction event.
   *
   * @param event   - Event name (`'select'`, `'hover'`, or `'viewchange'`).
   * @param handler - Callback invoked when the event fires.
   */
  on(s, e) {
    this._listeners.has(s) || this._listeners.set(s, /* @__PURE__ */ new Set()), this._listeners.get(s).add(e);
  }
  /**
   * Unsubscribe from an interaction event.
   */
  off(s, e) {
    var i;
    (i = this._listeners.get(s)) == null || i.delete(e);
  }
  _emit(s, e) {
    const i = this._listeners.get(s);
    if (i)
      for (const t of i) t(e);
  }
  // ── View ─────────────────────────────────────────────────────────────────
  /** Get the current view state. */
  getView() {
    return { ...this._view };
  }
  /**
   * Programmatically set the view centre, scale, and/or projection.
   * Triggers a re-render and emits `'viewchange'`.
   */
  setView(s) {
    s.center && (this._view.center = { ...s.center }), s.scale !== void 0 && (this._view.scale = this._clampScale(s.scale)), s.projection && (this._view.projection = s.projection), this._markDirty(), this._emitViewChange();
  }
  /**
   * Animate the view to a new centre and/or scale.
   *
   * @param center     - Target centre in equatorial coordinates.
   * @param opts.scale - Target scale (optional, defaults to current).
   * @param opts.durationMs - Animation duration in ms (default 800).
   */
  panTo(s, e = {}) {
    this._panAnimId !== null && (cancelAnimationFrame(this._panAnimId), this._panAnimId = null);
    const { scale: i, durationMs: t = 800 } = e, r = { ...this._view.center }, l = this._view.scale, c = i !== void 0 ? this._clampScale(i) : l, o = performance.now();
    let g = s.ra - r.ra;
    g > 180 && (g -= 360), g < -180 && (g += 360);
    const v = (k) => {
      if (this._disposed) return;
      const a = Math.min((k - o) / t, 1), y = a < 0.5 ? 2 * a * a : 1 - (-2 * a + 2) ** 2 / 2;
      this._view.center = {
        ra: ((r.ra + g * y) % 360 + 360) % 360,
        dec: r.dec + (s.dec - r.dec) * y
      }, this._view.scale = l + (c - l) * y, this.render(), a < 1 ? this._panAnimId = requestAnimationFrame(v) : (this._panAnimId = null, this._emitViewChange());
    };
    this._panAnimId = requestAnimationFrame(v);
  }
  // ── Selection / hover ────────────────────────────────────────────────────
  /** The currently selected object, or `null`. */
  get selectedObject() {
    return this._selectedObject;
  }
  /** The currently hovered object, or `null`. */
  get hoveredObject() {
    return this._hoveredObject;
  }
  /**
   * Programmatically select an object by its `id`. Pass `null` to clear.
   */
  select(s) {
    s === null ? this._selectedObject = null : this._selectedObject = this._objects.find((e) => e.id === s) ?? null, this._markDirty();
  }
  /**
   * Return the celestial object at a given canvas pixel position, or `null`.
   */
  objectAt(s, e) {
    const i = this._opts.hitRadius ?? w.hitRadius, t = ns(this._projectedCache, s, e, i);
    return (t == null ? void 0 : t.object) ?? null;
  }
  // ── Data ─────────────────────────────────────────────────────────────────
  /** Replace the objects array and re-render. */
  setObjects(s) {
    this._objects = s, this._markDirty();
  }
  /** Merge new options and re-render. */
  setOptions(s) {
    this._opts = { ...this._opts, ...s }, s.center && (this._view.center = { ...s.center }), s.scale !== void 0 && (this._view.scale = this._clampScale(s.scale)), s.projection && (this._view.projection = s.projection), this._markDirty();
  }
  // ── FOV ──────────────────────────────────────────────────────────────────
  /** Set or clear the FOV indicator overlay(s). */
  setFOV(s) {
    s === null ? delete this._opts.fov : this._opts.fov = s, this._markDirty();
  }
  // ── Real-time mode ───────────────────────────────────────────────────────
  /**
   * Start real-time sidereal tracking. The view centre follows the local
   * sidereal time so the sky drifts naturally.
   *
   * @param observer - Observer parameters. If omitted, uses the value from
   *                   {@link InteractiveSkyMapOptions.observer}.
   * @throws If no observer parameters are available.
   */
  startRealTime(s) {
    if (s && (this._opts.observer = s), !this._opts.observer)
      throw new Error("Observer parameters required for real-time mode");
    this.stopRealTime(), this._realTimeLoop();
  }
  /** Stop real-time sidereal tracking. */
  stopRealTime() {
    this._realTimeTimer !== null && (clearTimeout(this._realTimeTimer), this._realTimeTimer = null);
  }
  // ── Render ───────────────────────────────────────────────────────────────
  /**
   * Force an immediate re-render. Normally renders happen automatically
   * via the dirty-flag mechanism; call this only if you need a synchronous
   * update.
   */
  render() {
    if (this._disposed) return;
    const s = this._canvas, e = this._ctx, i = s.width, t = s.height;
    os(s, this._objects, {
      ...this._opts,
      center: this._view.center,
      scale: this._view.scale,
      projection: this._view.projection
    }), this._rebuildProjectedCache(), this._hoveredObject && this._drawHighlight(e, this._hoveredObject, "hover", i, t), this._selectedObject && this._drawHighlight(e, this._selectedObject, "select", i, t), this._opts.fov && this._drawFOV(e, i, t), this._opts.hud && this._drawHUD(e, i, t), this._dirty = !1;
  }
  // ── Lifecycle ────────────────────────────────────────────────────────────
  /**
   * Remove all event listeners, cancel animations, and release resources.
   * The instance should not be used after calling `dispose()`.
   */
  dispose() {
    this._disposed = !0, this._abortController.abort(), this.stopRealTime(), this._rafId !== null && (cancelAnimationFrame(this._rafId), this._rafId = null), this._panAnimId !== null && (cancelAnimationFrame(this._panAnimId), this._panAnimId = null), this._listeners.clear(), this._projectedCache = [], this._pointers.clear();
  }
  // ── Pointer handling (private) ───────────────────────────────────────────
  /** Convert a pointer event to canvas-space coordinates (DPI-aware). */
  _canvasCoords(s) {
    const e = this._canvas.getBoundingClientRect(), i = this._canvas.width / e.width, t = this._canvas.height / e.height;
    return {
      x: (s.clientX - e.left) * i,
      y: (s.clientY - e.top) * t
    };
  }
  // ── Rendering helpers (private) ──────────────────────────────────────────
  _markDirty() {
    this._dirty || this._disposed || (this._dirty = !0, this._rafId = requestAnimationFrame(() => {
      this._rafId = null, this._dirty && !this._disposed && this.render();
    }));
  }
  _clampScale(s) {
    const e = this._opts.minScale ?? w.minScale, i = this._opts.maxScale ?? w.maxScale;
    return Math.max(e, Math.min(i, s));
  }
  _emitViewChange() {
    this._emit("viewchange", {
      center: { ...this._view.center },
      scale: this._view.scale,
      projection: this._view.projection
    });
  }
  /**
   * Unified forward-project helper (same logic as renderSkyMap's internal
   * `project` function) returning absolute canvas coordinates.
   */
  _project(s) {
    const e = this._canvas.width, i = this._canvas.height;
    if (this._view.projection === "mollweide")
      return J(s, { width: e, height: i });
    const t = this._view.projection === "gnomonic" ? X(s, this._view.center, this._view.scale) : Y(s, this._view.center, this._view.scale);
    return { x: e / 2 + t.x, y: i / 2 - t.y, visible: t.visible };
  }
  /** Rebuild the projected-object cache used for hit-testing and highlights. */
  _rebuildProjectedCache() {
    const s = this._opts.showMagnitudeLimit ?? 8, e = this._canvas.width, i = this._canvas.height, t = [];
    for (const r of this._objects) {
      if (r.ra === null || r.dec === null || r.magnitude !== null && r.magnitude > s) continue;
      const l = this._project({ ra: r.ra, dec: r.dec });
      if (!l.visible || l.x < -50 || l.x > e + 50 || l.y < -50 || l.y > i + 50) continue;
      const c = r.magnitude ?? 5, o = Math.max(1.5, Math.min(10, (6 - c) * 0.9 + 1.5));
      t.push({ object: r, x: l.x, y: l.y, radius: o * 2.5 });
    }
    this._projectedCache = t;
  }
  /** Draw a highlight ring around a specific object. */
  _drawHighlight(s, e, i, t, r) {
    var v;
    const l = this._projectedCache.find((k) => k.object === e);
    if (!l) return;
    const c = i === "hover" ? this._opts.hoverHighlight : this._opts.selectHighlight, o = (c == null ? void 0 : c.color) ?? (i === "hover" ? "rgba(255,255,255,0.6)" : "rgba(100,200,255,0.8)"), g = (c == null ? void 0 : c.radius) ?? (i === "hover" ? 20 : 24);
    if (s.save(), s.strokeStyle = o, s.lineWidth = i === "hover" ? 1.5 : 2, s.beginPath(), s.arc(l.x, l.y, g, 0, Math.PI * 2), s.stroke(), i === "hover" && (((v = this._opts.hoverHighlight) == null ? void 0 : v.showLabel) ?? !0)) {
      const k = this._opts.labelColor ?? "rgba(255,255,255,0.9)";
      s.fillStyle = k, s.font = "13px sans-serif", s.textAlign = "left";
      const a = e.name, y = e.magnitude !== null ? ` (${e.magnitude.toFixed(1)})` : "";
      s.fillText(a + y, l.x + g + 6, l.y - 4), s.textAlign = "left";
    }
    s.restore();
  }
  /** Draw FOV indicator overlay(s). */
  _drawFOV(s, e, i) {
    const t = Array.isArray(this._opts.fov) ? this._opts.fov : this._opts.fov ? [this._opts.fov] : [];
    for (const r of t) {
      if (!r) continue;
      const l = r.center ?? this._view.center, c = r.color ?? "rgba(255,255,100,0.6)", o = r.lineWidth ?? 1.5;
      s.save(), s.strokeStyle = c, s.lineWidth = o, s.setLineDash([6, 4]), s.beginPath();
      const g = 72;
      let v = !1;
      for (let k = 0; k <= g; k++) {
        const a = k / g * 2 * Math.PI, y = l.dec + r.radiusDeg * Math.sin(a), u = Math.cos(l.dec * is), d = l.ra + (u > 1e-6 ? r.radiusDeg * Math.cos(a) / u : 0), f = this._project({ ra: d, dec: Math.max(-90, Math.min(90, y)) });
        if (!f.visible) {
          v = !1;
          continue;
        }
        v ? s.lineTo(f.x, f.y) : (s.moveTo(f.x, f.y), v = !0);
      }
      if (s.stroke(), s.setLineDash([]), r.label) {
        const k = this._project({
          ra: l.ra,
          dec: Math.max(-90, Math.min(90, l.dec + r.radiusDeg))
        });
        k.visible && (s.fillStyle = c, s.font = "11px sans-serif", s.textAlign = "center", s.fillText(r.label, k.x, k.y - 6), s.textAlign = "left");
      }
      s.restore();
    }
  }
  /** Draw HUD elements (cardinal labels, horizon line, zenith marker). */
  _drawHUD(s, e, i) {
    const t = this._opts.hud, r = t.color ?? "rgba(255,255,255,0.5)", l = t.observer ?? this._opts.observer;
    if (s.save(), s.fillStyle = r, s.strokeStyle = r, s.font = "14px sans-serif", t.cardinalDirections && (s.textAlign = "center", s.fillText("N", e / 2, 18), s.fillText("S", e / 2, i - 6), s.textAlign = "left", s.fillText("E", 6, i / 2 + 5), s.textAlign = "right", s.fillText("W", e - 6, i / 2 + 5), s.textAlign = "left"), l) {
      const c = { ...l, date: l.date ?? /* @__PURE__ */ new Date() };
      if (t.horizonLine) {
        s.strokeStyle = t.color ?? "rgba(0,200,100,0.4)", s.lineWidth = 1, s.setLineDash([4, 4]), s.beginPath();
        let o = !1;
        for (let g = 0; g <= 360; g += 2) {
          const v = M.horizontalToEquatorial({ alt: 0, az: g }, c), k = this._project(v);
          if (!k.visible) {
            o = !1;
            continue;
          }
          o ? s.lineTo(k.x, k.y) : (s.moveTo(k.x, k.y), o = !0);
        }
        s.stroke(), s.setLineDash([]);
      }
      if (t.zenithMarker) {
        const o = M.horizontalToEquatorial({ alt: 90, az: 0 }, c), g = this._project(o);
        if (g.visible) {
          s.strokeStyle = t.color ?? "rgba(255,255,255,0.5)", s.lineWidth = 1.5;
          const v = 8;
          s.beginPath(), s.moveTo(g.x - v, g.y), s.lineTo(g.x + v, g.y), s.moveTo(g.x, g.y - v), s.lineTo(g.x, g.y + v), s.stroke(), s.fillStyle = r, s.font = "11px sans-serif", s.textAlign = "center", s.fillText("Z", g.x, g.y - v - 4), s.textAlign = "left";
        }
      }
    }
    s.restore();
  }
  // ── Real-time internals ──────────────────────────────────────────────────
  _realTimeLoop() {
    if (this._disposed) return;
    const s = this._opts.observer;
    if (!s) return;
    const e = /* @__PURE__ */ new Date(), i = M.lst(e, s.lng);
    this._view.center = { ra: i, dec: s.lat }, this._markDirty(), this._emitViewChange(), this._realTimeTimer = setTimeout(
      () => this._realTimeLoop(),
      this._opts.realTimeInterval ?? w.realTimeInterval
    );
  }
}
function ae(n, s, e) {
  return new fs(n, s, e);
}
async function hs(n, s = {}) {
  const { duration: e = 400, easing: i = "ease-in-out", signal: t } = s;
  if (t != null && t.aborted) return;
  if (!("startViewTransition" in document)) {
    await n();
    return;
  }
  document.documentElement.style.setProperty("--cosmos-vt-duration", `${e}ms`), document.documentElement.style.setProperty("--cosmos-vt-easing", i), await document.startViewTransition(n).finished;
}
function bs(n, s = {}) {
  const {
    delay: e = 0,
    stagger: i = 60,
    duration: t = 500,
    from: r = "bottom",
    distance: l = "20px",
    signal: c
  } = s;
  if (c != null && c.aborted) return Promise.resolve();
  const g = {
    top: `translateY(-${l})`,
    bottom: `translateY(${l})`,
    left: `translateX(-${l})`,
    right: `translateX(${l})`
  }[r], v = [...n.children];
  return v.forEach((k) => {
    k.style.opacity = "0", k.style.transform = g, k.style.transition = "none";
  }), v.length === 0 ? Promise.resolve() : new Promise((k) => {
    const a = performance.now() + e, y = () => {
      v.forEach((d) => {
        d.style.opacity = "1", d.style.transform = "none", d.style.transition = "";
      }), k();
    };
    c == null || c.addEventListener("abort", y, { once: !0 });
    const u = (d) => {
      if (c != null && c.aborted) return;
      let f = !0;
      for (let b = 0; b < v.length; b++) {
        const p = a + b * i;
        if (d >= p) {
          const m = v[b];
          m.style.opacity === "0" && (m.style.transition = `opacity ${t}ms ease, transform ${t}ms cubic-bezier(0.2,0,0,1)`, m.style.opacity = "1", m.style.transform = "none"), d < p + t && (f = !1);
        } else
          f = !1;
      }
      f ? (c == null || c.removeEventListener("abort", y), k()) : requestAnimationFrame(u);
    };
    requestAnimationFrame(() => requestAnimationFrame(u));
  });
}
function _s(n, s = {}) {
  const {
    stagger: e = 40,
    duration: i = 300,
    from: t = "bottom",
    distance: r = "12px",
    signal: l
  } = s;
  if (l != null && l.aborted) return Promise.resolve();
  const o = {
    top: `translateY(-${r})`,
    bottom: `translateY(${r})`,
    left: `translateX(-${r})`,
    right: `translateX(${r})`
  }[t], g = [...n.children].reverse();
  return g.length === 0 ? Promise.resolve() : new Promise((v) => {
    const k = performance.now(), a = () => {
      g.forEach((u) => {
        u.style.opacity = "0", u.style.transform = o, u.style.transition = "";
      }), v();
    };
    l == null || l.addEventListener("abort", a, { once: !0 });
    const y = (u) => {
      if (l != null && l.aborted) return;
      let d = !0;
      for (let f = 0; f < g.length; f++) {
        const b = k + f * e;
        if (u >= b) {
          const p = g[f];
          p.style.opacity !== "0" && (p.style.transition = `opacity ${i}ms ease, transform ${i}ms ease`, p.style.opacity = "0", p.style.transform = o), u < b + i && (d = !1);
        } else
          d = !1;
      }
      d ? (l == null || l.removeEventListener("abort", a), v()) : requestAnimationFrame(y);
    };
    requestAnimationFrame(y);
  });
}
function W(n, s, e = 300) {
  return new Promise((i) => {
    n.style.transition = `opacity ${e}ms ease`, n.style.opacity = s === "in" ? "1" : "0", n.style.pointerEvents = s === "in" ? "auto" : "none";
    const t = () => {
      n.removeEventListener("transitionend", t), i();
    };
    n.addEventListener("transitionend", t, { once: !0 }), setTimeout(i, e + 50);
  });
}
async function zs(n, s, e = 400) {
  s.style.opacity = "0", s.style.pointerEvents = "none", s.style.display = "", await Promise.all([
    W(n, "out", e),
    W(s, "in", e)
  ]), n.style.display = "none";
}
function Ms(n, s = {}) {
  const { duration: e = 500, easing: i = "cubic-bezier(0.4,0,0.2,1)", onDone: t, signal: r } = s;
  if (r != null && r.aborted) return;
  const l = n.getBoundingClientRect(), c = window.innerWidth / l.width, o = window.innerHeight / l.height, g = window.innerWidth / 2 - (l.left + l.width / 2), v = window.innerHeight / 2 - (l.top + l.height / 2);
  n.style.transformOrigin = "center center", n.style.transition = "none", n.style.transform = "translate(0,0) scale(1,1)", requestAnimationFrame(() => {
    r != null && r.aborted || requestAnimationFrame(() => {
      if (r != null && r.aborted) return;
      n.style.transition = `transform ${e}ms ${i}`, n.style.transform = `translate(${g}px, ${v}px) scale(${c}, ${o})`;
      const k = () => {
        n.removeEventListener("transitionend", k), n.style.transform = "", n.style.transition = "", t == null || t();
      };
      n.addEventListener("transitionend", k, { once: !0 }), setTimeout(k, e + 100);
    });
  });
}
function As(n, s = {}, e) {
  const { duration: i = 400, easing: t = "cubic-bezier(0.4,0,0.2,1)", onDone: r, signal: l } = s;
  if (l != null && l.aborted) return;
  const c = n.getBoundingClientRect(), o = c.width / window.innerWidth, g = c.height / window.innerHeight, v = c.left + c.width / 2 - window.innerWidth / 2, k = c.top + c.height / 2 - window.innerHeight / 2, a = !e, y = e ?? document.createElement("div");
  a && (Object.assign(y.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "9999",
    transformOrigin: "center center"
  }), document.body.appendChild(y)), y.style.transition = `transform ${i}ms ${t}, opacity ${i * 0.6}ms ease ${i * 0.4}ms`;
  const u = () => {
    y.removeEventListener("transitionend", u), a && y.remove(), r == null || r();
  };
  requestAnimationFrame(() => {
    if (l != null && l.aborted) {
      u();
      return;
    }
    y.style.transform = `translate(${v}px, ${k}px) scale(${o}, ${g})`, y.style.opacity = "0", y.addEventListener("transitionend", u, { once: !0 }), setTimeout(u, i + 100);
  });
}
const ye = {
  morph: hs,
  staggerIn: bs,
  staggerOut: _s,
  fade: W,
  crossfade: zs,
  heroExpand: Ms,
  heroCollapse: As
}, ue = {
  CONSTANTS: S,
  Units: Is,
  Math: M,
  Sun: Rs,
  Moon: E,
  Eclipse: Ns,
  Data: ee,
  Media: R,
  API: { NASA: ts, ESA: ms, resolveSimbad: Es },
  SkyMap: { render: os, stereographic: Y, mollweide: J, gnomonic: X, Interactive: fs, create: ae },
  Transitions: { morph: hs, staggerIn: bs, staggerOut: _s, fade: W, crossfade: zs, heroExpand: Ms, heroCollapse: As }
};
export {
  M as AstroMath,
  U as BRIGHT_STARS,
  S as CONSTANTS,
  us as CONSTELLATIONS,
  Gs as DEEP_SKY_EXTRAS,
  ee as Data,
  ms as ESA,
  Ns as Eclipse,
  q as IMAGE_FALLBACKS,
  fs as InteractiveSkyMap,
  cs as MESSIER_CATALOG,
  gs as METEOR_SHOWERS,
  R as Media,
  E as Moon,
  ts as NASA,
  ge as PLANET_TEXTURES,
  Ps as SOLAR_SYSTEM,
  ve as STAR_TEXTURES,
  ke as SkyMap,
  Rs as Sun,
  ye as Transitions,
  Is as Units,
  ks as canvasToEquatorial,
  js as computeFov,
  ae as createInteractiveSkyMap,
  zs as crossfade,
  ue as default,
  W as fade,
  as as getObjectImage,
  X as gnomonic,
  As as heroCollapse,
  Ms as heroExpand,
  J as mollweide,
  hs as morph,
  $s as prefetchImages,
  os as renderSkyMap,
  ds as resolveImages,
  Es as resolveSimbad,
  ne as spectralColor,
  bs as staggerIn,
  _s as staggerOut,
  Y as stereographic,
  Hs as tryDSS,
  Bs as tryPanSTARRS
};
