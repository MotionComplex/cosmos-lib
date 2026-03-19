import { CONSTANTS } from './constants.js'
import { AstroMath } from './math.js'
import type { ObserverParams, SunPosition, TwilightTimes } from './types.js'

const D = CONSTANTS.DEG_TO_RAD

/**
 * Solar position and twilight calculations.
 * Derives geocentric Sun from the Earth ephemeris (heliocentric Earth + 180°).
 */
export const Sun = {
  /**
   * Geocentric equatorial position of the Sun.
   * Accuracy: ~0.01° for dates within a few centuries of J2000.
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
   */
  solarNoon(obs: ObserverParams): Date {
    const date = obs.date ?? new Date()
    const sunPos = this.position(date)
    const rts = AstroMath.riseTransitSet(sunPos, obs, -0.8333)
    return rts.transit
  },

  /**
   * Equation of time in minutes.
   * Difference between apparent solar time and mean solar time.
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
   * Returns sunrise/sunset plus civil, nautical, and astronomical twilight.
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
