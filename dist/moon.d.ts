import type { MoonPhase, MoonPosition, ObserverParams, RiseTransitSet } from './types.js';
export declare const Moon: {
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
    readonly position: (date?: Date) => MoonPosition;
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
    readonly phase: (date?: Date) => MoonPhase;
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
    readonly nextPhase: (date?: Date, targetPhase?: "new" | "first-quarter" | "full" | "last-quarter") => Date;
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
    readonly riseTransitSet: (obs: ObserverParams) => RiseTransitSet;
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
    readonly libration: (date?: Date) => {
        l: number;
        b: number;
    };
};
