import type { EquatorialCoord, HorizontalCoord, GalacticCoord, EclipticCoord, ObserverParams, PlanetName, PlanetPosition, NutationResult, RiseTransitSet } from './types.js';
export declare const AstroMath: {
    /** JavaScript Date → Julian Date Number */
    readonly toJulian: (date?: Date) => number;
    /** Julian Date → JavaScript Date */
    readonly fromJulian: (jd: number) => Date;
    /** Days since J2000.0 */
    readonly j2000Days: (date?: Date) => number;
    /**
     * Greenwich Mean Sidereal Time in degrees.
     * Accurate to ~0.1 s over several centuries around J2000.
     */
    readonly gmst: (date?: Date) => number;
    /**
     * Local Sidereal Time in degrees.
     * @param date        observation time
     * @param longitudeDeg observer's geographic longitude (east positive)
     */
    readonly lst: (date: Date, longitudeDeg: number) => number;
    /**
     * Equatorial (RA/Dec) → Horizontal (Altitude/Azimuth).
     * All angles in degrees.
     */
    readonly equatorialToHorizontal: (eq: EquatorialCoord, obs: ObserverParams) => HorizontalCoord;
    /**
     * Horizontal (Altitude/Azimuth) → Equatorial (RA/Dec).
     * All angles in degrees.
     */
    readonly horizontalToEquatorial: (hor: HorizontalCoord, obs: ObserverParams) => EquatorialCoord;
    /**
     * Ecliptic → Equatorial (J2000).
     * All angles in degrees.
     */
    readonly eclipticToEquatorial: (ecl: EclipticCoord) => EquatorialCoord;
    /**
     * Galactic → Equatorial (J2000).
     * Standard IAU transformation.
     * All angles in degrees.
     */
    readonly galacticToEquatorial: (gal: GalacticCoord) => EquatorialCoord;
    /**
     * Great-circle angular separation between two equatorial coordinates.
     * Uses the haversine formula for numerical stability at small angles.
     * Returns degrees.
     */
    readonly angularSeparation: (a: EquatorialCoord, b: EquatorialCoord) => number;
    /** Absolute magnitude + distance (parsecs) → apparent magnitude */
    readonly apparentMagnitude: (absoluteMag: number, distancePc: number) => number;
    /** Apparent magnitude + distance (parsecs) → absolute magnitude */
    readonly absoluteMagnitude: (apparentMag: number, distancePc: number) => number;
    /** Parallax in arcseconds → distance in parsecs */
    readonly parallaxToDistance: (parallaxArcsec: number) => number;
    /**
     * Solve Kepler's equation M = E - e·sin(E) for eccentric anomaly E.
     * Newton-Raphson iteration. M in radians, returns E in radians.
     * Converges in 3-6 iterations for all planetary eccentricities.
     * Source: Meeus, "Astronomical Algorithms" (2nd ed.), Chapter 30.
     */
    readonly solveKepler: (M: number, e: number, tol?: number) => number;
    /**
     * Planetary ephemeris using J2000 orbital elements with secular rates
     * and iterative Kepler solver. Accurate to ~0.1° within several
     * centuries of J2000. Returns ecliptic longitude, latitude, and
     * heliocentric distance.
     *
     * Elements and secular rates from JPL (Standish 1992) via Meeus Table 31.A.
     */
    readonly planetEcliptic: (planet: PlanetName, date?: Date) => PlanetPosition;
    /**
     * Precess equatorial coordinates between epochs.
     * Rigorous method using Lieske (1979) polynomials.
     * Source: Meeus, Chapter 21.
     * @param eq    J2000 equatorial coordinates
     * @param jdFrom Julian date of source epoch (default J2000)
     * @param jdTo   Julian date of target epoch
     */
    readonly precess: (eq: EquatorialCoord, jdFrom: number, jdTo: number) => EquatorialCoord;
    /**
     * Nutation in longitude (dPsi) and obliquity (dEpsilon).
     * First 13 terms of the IAU 1980 nutation series.
     * Source: Meeus, Chapter 22, Table 22.A.
     * Returns values in degrees.
     */
    readonly nutation: (jd: number) => NutationResult;
    /**
     * True obliquity of the ecliptic (mean + nutation correction).
     * Returns degrees.
     */
    readonly trueObliquity: (jd: number) => number;
    /**
     * Greenwich Apparent Sidereal Time in degrees.
     * GMST corrected for nutation (equation of the equinoxes).
     */
    readonly gast: (date?: Date) => number;
    /**
     * Atmospheric refraction correction in degrees.
     * Saemundsson's formula (Meeus, Chapter 16).
     * @param apparentAlt apparent altitude in degrees
     * @param tempC       temperature in Celsius (default 10)
     * @param pressureMb  pressure in millibars (default 1010)
     */
    readonly refraction: (apparentAlt: number, tempC?: number, pressureMb?: number) => number;
    /**
     * Apply proper motion to star coordinates.
     * @param eq          J2000 equatorial coordinates
     * @param pmRA        proper motion in RA (mas/year, includes cos(dec) factor)
     * @param pmDec       proper motion in Dec (mas/year)
     * @param fromEpoch   source epoch in years (e.g. 2000.0)
     * @param toEpoch     target epoch in years
     */
    readonly applyProperMotion: (eq: EquatorialCoord, pmRA: number, pmDec: number, fromEpoch: number, toEpoch: number) => EquatorialCoord;
    /**
     * Compute rise, transit, and set times for a celestial object.
     * Source: Meeus, Chapter 15.
     * @param eq  equatorial coordinates (RA/Dec in degrees, J2000)
     * @param obs observer location and date (date = day of interest)
     * @param h0  standard altitude in degrees (default -0.5667 for stars)
     *            Use -0.8333 for Sun, +0.125 for Moon.
     */
    readonly riseTransitSet: (eq: EquatorialCoord, obs: ObserverParams, h0?: number) => RiseTransitSet;
};
