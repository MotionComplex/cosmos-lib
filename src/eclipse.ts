import { AstroMath } from './math.js'
import { Moon } from './moon.js'

/**
 * Eclipse event result.
 */
export interface EclipseEvent {
  /** 'solar' or 'lunar' */
  type: 'solar' | 'lunar'
  /** Eclipse subtype */
  subtype: 'total' | 'annular' | 'partial' | 'penumbral'
  /** Date/time of maximum eclipse */
  date: Date
  /** Eclipse magnitude (fraction of diameter covered) */
  magnitude: number
}

/**
 * Eclipse prediction using simplified Besselian approach.
 * Based on Meeus, Chapters 54-55.
 *
 * Checks for eclipses near new moons (solar) and full moons (lunar)
 * by computing the angular separation between Sun and Moon.
 */
export const Eclipse = {
  /**
   * Find the next solar eclipse after the given date.
   * Returns null if none found within ~2 years.
   */
  nextSolar(date: Date = new Date()): EclipseEvent | null {
    let search = new Date(date)
    for (let i = 0; i < 26; i++) { // ~26 lunations = ~2 years
      const newMoon = Moon.nextPhase(search, 'new')
      const event = this._checkSolarEclipse(newMoon)
      if (event) return event
      search = new Date(newMoon.valueOf() + 86_400_000) // next day
    }
    return null
  },

  /**
   * Find the next lunar eclipse after the given date.
   * Returns null if none found within ~2 years.
   */
  nextLunar(date: Date = new Date()): EclipseEvent | null {
    let search = new Date(date)
    for (let i = 0; i < 26; i++) {
      const fullMoon = Moon.nextPhase(search, 'full')
      const event = this._checkLunarEclipse(fullMoon)
      if (event) return event
      search = new Date(fullMoon.valueOf() + 86_400_000)
    }
    return null
  },

  /**
   * Search for all eclipses in a date range.
   */
  search(
    startDate: Date,
    endDate: Date,
    type?: 'solar' | 'lunar',
  ): EclipseEvent[] {
    const results: EclipseEvent[] = []
    let search = new Date(startDate)
    const endMs = endDate.valueOf()

    while (search.valueOf() < endMs) {
      if (type !== 'lunar') {
        const newMoon = Moon.nextPhase(search, 'new')
        if (newMoon.valueOf() > endMs) break
        const solar = this._checkSolarEclipse(newMoon)
        if (solar) results.push(solar)
      }
      if (type !== 'solar') {
        const fullMoon = Moon.nextPhase(search, 'full')
        if (fullMoon.valueOf() <= endMs) {
          const lunar = this._checkLunarEclipse(fullMoon)
          if (lunar) results.push(lunar)
        }
      }
      // Advance by ~15 days to catch both new and full moons
      search = new Date(search.valueOf() + 15 * 86_400_000)
    }

    // Sort by date and deduplicate (same eclipse may be found twice)
    results.sort((a, b) => a.date.valueOf() - b.date.valueOf())
    return results.filter((e, i) =>
      i === 0 || Math.abs(e.date.valueOf() - results[i - 1]!.date.valueOf()) > 86_400_000
    )
  },

  /**
   * Check if a new moon produces a solar eclipse.
   * @internal
   */
  _checkSolarEclipse(newMoon: Date): EclipseEvent | null {
    const moonPos = Moon.position(newMoon)
    const earth = AstroMath.planetEcliptic('earth', newMoon)
    const sunLon = ((earth.lon + 180) % 360 + 360) % 360

    // Ecliptic latitude of Moon — must be near ecliptic for an eclipse
    const moonLat = Math.abs(moonPos.eclipticLat)

    // Angular distance from node — eclipses occur when Moon is near a node
    // Simplified: check if Moon's ecliptic latitude is small enough
    if (moonLat > 1.5) return null // too far from ecliptic plane

    // Apparent angular radii
    const sunDist_km = earth.r * 149_597_870.7
    const sunRadius_deg = Math.atan2(696_000, sunDist_km) * (180 / Math.PI)
    const moonRadius_deg = Math.atan2(1737.4, moonPos.distance_km) * (180 / Math.PI)

    // Separation between Sun and Moon centers
    const sep = AstroMath.angularSeparation(
      moonPos,
      AstroMath.eclipticToEquatorial({ lon: sunLon, lat: 0 }),
    )

    const sumRadii = sunRadius_deg + moonRadius_deg

    if (sep > sumRadii * 1.5) return null // no eclipse

    let subtype: EclipseEvent['subtype']
    let magnitude: number

    if (moonRadius_deg >= sunRadius_deg && sep < moonRadius_deg - sunRadius_deg) {
      subtype = 'total'
      magnitude = 1.0
    } else if (moonRadius_deg < sunRadius_deg && sep < sunRadius_deg - moonRadius_deg) {
      subtype = 'annular'
      magnitude = moonRadius_deg / sunRadius_deg
    } else if (sep < sumRadii) {
      subtype = 'partial'
      magnitude = (sumRadii - sep) / (2 * sunRadius_deg)
    } else {
      return null
    }

    return { type: 'solar', subtype, date: newMoon, magnitude }
  },

  /**
   * Check if a full moon produces a lunar eclipse.
   * @internal
   */
  _checkLunarEclipse(fullMoon: Date): EclipseEvent | null {
    const moonPos = Moon.position(fullMoon)

    // Moon's ecliptic latitude — must be near ecliptic for eclipse
    const moonLat = Math.abs(moonPos.eclipticLat)

    // Earth's shadow angular radius at Moon's distance
    // Umbra ≈ 0.45° at mean distance, penumbra ≈ 0.75°
    const earthShadow_deg = Math.atan2(6371, moonPos.distance_km) * (180 / Math.PI)
    const umbra_deg = earthShadow_deg * 2.6  // approximate umbral cone
    const penumbra_deg = earthShadow_deg * 4.3  // approximate penumbral cone
    const moonRadius_deg = Math.atan2(1737.4, moonPos.distance_km) * (180 / Math.PI)

    // For a lunar eclipse, Moon must be near the anti-solar point
    // Moon's ecliptic latitude is the key parameter
    if (moonLat > penumbra_deg + moonRadius_deg) return null

    let subtype: EclipseEvent['subtype']
    let magnitude: number

    if (moonLat < umbra_deg - moonRadius_deg) {
      subtype = 'total'
      magnitude = (umbra_deg - moonLat) / (2 * moonRadius_deg)
    } else if (moonLat < umbra_deg + moonRadius_deg) {
      subtype = 'partial'
      magnitude = (umbra_deg + moonRadius_deg - moonLat) / (2 * moonRadius_deg)
    } else if (moonLat < penumbra_deg + moonRadius_deg) {
      subtype = 'penumbral'
      magnitude = (penumbra_deg + moonRadius_deg - moonLat) / (2 * moonRadius_deg)
    } else {
      return null
    }

    return { type: 'lunar', subtype, date: fullMoon, magnitude: Math.min(magnitude, 1) }
  },
} as const
