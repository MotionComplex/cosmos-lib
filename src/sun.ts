import { CONSTANTS } from './constants.js'
import { AstroMath } from './math.js'
import type { ObserverParams, SunPosition, TwilightTimes } from './types.js'

const D = CONSTANTS.DEG_TO_RAD

/**
 * Solar position and twilight calculations.
 *
 * Derives the geocentric Sun position from the Earth ephemeris by inverting
 * heliocentric Earth coordinates (heliocentric Earth longitude + 180°, negated latitude).
 * Nutation corrections are applied to produce apparent coordinates.
 *
 * @remarks
 * All methods use the VSOP87-derived Earth ephemeris from {@link AstroMath.planetEcliptic}
 * and apply IAU nutation corrections. Accuracy degrades for dates far from J2000.0.
 *
 * @example
 * ```ts
 * import { Sun } from '@motioncomplex/cosmos-lib'
 *
 * // Get the Sun's current position
 * const pos = Sun.position()
 * console.log(`RA: ${pos.ra.toFixed(4)}°, Dec: ${pos.dec.toFixed(4)}°`)
 *
 * // Get twilight times for London
 * const tw = Sun.twilight({ lat: 51.5, lng: -0.1, date: new Date('2024-03-20') })
 * console.log('Sunrise:', tw.sunrise?.toISOString())
 * ```
 */
export const Sun = {
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
  position(date: Date = new Date()): SunPosition {
    // Earth heliocentric ecliptic → geocentric Sun (add 180°)
    const earth = AstroMath.planetEcliptic('earth', date)
    const sunLon = ((earth.lon + 180) % 360 + 360) % 360
    const sunLat = -earth.lat

    // Apply nutation correction to longitude
    const jd = AstroMath.toJulian(date)
    const { dPsi } = AstroMath.nutation(jd)
    const correctedLon = sunLon + dPsi

    // Convert to equatorial using true obliquity
    const eps = AstroMath.trueObliquity(jd) * D
    const lonR = correctedLon * D
    const latR = sunLat * D

    const ra = Math.atan2(
      Math.sin(lonR) * Math.cos(eps) - Math.tan(latR) * Math.sin(eps),
      Math.cos(lonR),
    ) * (180 / Math.PI)

    const dec = Math.asin(
      Math.sin(latR) * Math.cos(eps) +
      Math.cos(latR) * Math.sin(eps) * Math.sin(lonR),
    ) * (180 / Math.PI)

    return {
      ra: ((ra % 360) + 360) % 360,
      dec,
      distance_AU: earth.r,
      eclipticLon: correctedLon,
    }
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
  solarNoon(obs: ObserverParams): Date {
    const date = obs.date ?? new Date()
    const sunPos = this.position(date)
    const rts = AstroMath.riseTransitSet(sunPos, obs, -0.8333)
    return rts.transit
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
  equationOfTime(date: Date = new Date()): number {
    const sunPos = this.position(date)
    const jd = AstroMath.toJulian(date)
    const T = (jd - 2_451_545.0) / 36525

    // Mean longitude of the Sun (degrees)
    const L0 = ((280.46646 + 36000.76983 * T) % 360 + 360) % 360

    // Equation of time = L0 - 0.0057183 - RA (converted to minutes)
    let eot = L0 - 0.0057183 - sunPos.ra
    // Normalize to [-180, 180]
    eot = ((eot + 180) % 360 + 360) % 360 - 180
    return eot * 4 // degrees to minutes (1° = 4 minutes of time)
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
  twilight(obs: ObserverParams): TwilightTimes {
    const date = obs.date ?? new Date()
    const sunPos = this.position(date)

    // Standard solar altitudes for each twilight type
    const sunrise   = AstroMath.riseTransitSet(sunPos, obs, -0.8333)
    const civil     = AstroMath.riseTransitSet(sunPos, obs, -6)
    const nautical  = AstroMath.riseTransitSet(sunPos, obs, -12)
    const astro     = AstroMath.riseTransitSet(sunPos, obs, -18)

    return {
      astronomicalDawn: astro.rise,
      nauticalDawn:     nautical.rise,
      civilDawn:        civil.rise,
      sunrise:          sunrise.rise,
      solarNoon:        sunrise.transit,
      sunset:           sunrise.set,
      civilDusk:        civil.set,
      nauticalDusk:     nautical.set,
      astronomicalDusk: astro.set,
    }
  },
} as const
