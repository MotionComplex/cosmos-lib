import type { ObserverParams, SunPosition, TwilightTimes } from './types.js';
export declare const Sun: {
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
    readonly position: (date?: Date) => SunPosition;
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
    readonly solarNoon: (obs: ObserverParams) => Date;
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
    readonly equationOfTime: (date?: Date) => number;
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
    readonly twilight: (obs: ObserverParams) => TwilightTimes;
};
