import type { EquatorialCoord, HorizontalCoord, GalacticCoord, EclipticCoord, ObserverParams, PlanetName, PlanetPosition, NutationResult, RiseTransitSet } from './types.js';
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
export declare const AstroMath: {
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
    readonly toJulian: (date?: Date) => number;
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
    readonly fromJulian: (jd: number) => Date;
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
    readonly j2000Days: (date?: Date) => number;
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
    readonly gmst: (date?: Date) => number;
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
    readonly lst: (date: Date, longitudeDeg: number) => number;
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
    readonly equatorialToHorizontal: (eq: EquatorialCoord, obs: ObserverParams) => HorizontalCoord;
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
    readonly horizontalToEquatorial: (hor: HorizontalCoord, obs: ObserverParams) => EquatorialCoord;
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
    readonly eclipticToEquatorial: (ecl: EclipticCoord) => EquatorialCoord;
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
    readonly galacticToEquatorial: (gal: GalacticCoord) => EquatorialCoord;
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
    readonly angularSeparation: (a: EquatorialCoord, b: EquatorialCoord) => number;
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
    readonly apparentMagnitude: (absoluteMag: number, distancePc: number) => number;
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
    readonly absoluteMagnitude: (apparentMag: number, distancePc: number) => number;
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
    readonly parallaxToDistance: (parallaxArcsec: number) => number;
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
    readonly solveKepler: (M: number, e: number, tol?: number) => number;
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
    readonly planetEcliptic: (planet: PlanetName, date?: Date) => PlanetPosition;
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
    readonly precess: (eq: EquatorialCoord, jdFrom: number, jdTo: number) => EquatorialCoord;
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
    readonly nutation: (jd: number) => NutationResult;
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
    readonly trueObliquity: (jd: number) => number;
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
    readonly gast: (date?: Date) => number;
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
    readonly refraction: (apparentAlt: number, tempC?: number, pressureMb?: number) => number;
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
    readonly applyProperMotion: (eq: EquatorialCoord, pmRA: number, pmDec: number, fromEpoch: number, toEpoch: number) => EquatorialCoord;
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
    readonly riseTransitSet: (eq: EquatorialCoord, obs: ObserverParams, h0?: number) => RiseTransitSet;
};
