import { AstroMath } from './math.js'
import { Sun } from './sun.js'
import { Moon } from './moon.js'
import { Data } from './data/index.js'
import type {
  CelestialObject,
  EquatorialCoord,
  ObserverParams,
  ObjectType,
  PlanetName,
} from './types.js'

// ── Types ────────────────────────────────────────────────────────────────────

/** A visible object with its current horizontal position and metadata. */
export interface VisibleObject {
  /** The catalog object. */
  object: CelestialObject
  /** Current altitude in degrees (above horizon). */
  alt: number
  /** Current azimuth in degrees (0=N, 90=E, 180=S, 270=W). */
  az: number
  /** Angular separation from the Moon in degrees, or `null` if Moon position unavailable. */
  moonSeparation: number | null
  /** Moon interference score 0–1 (0 = no interference, 1 = full moon on top of object). */
  moonInterference: number
}

/** Options for {@link Planner.whatsUp}. */
export interface WhatsUpOptions {
  /** Minimum altitude in degrees above horizon. @defaultValue `10` */
  minAltitude?: number
  /** Maximum (faintest) apparent magnitude to include. @defaultValue `6` */
  magnitudeLimit?: number
  /** Filter by object type(s). */
  types?: ObjectType[]
  /** Filter by constellation abbreviation (3-letter, case-insensitive). */
  constellation?: string
  /** Filter by catalog tag (e.g. `'messier'`). */
  tag?: string
  /** Maximum number of results. @defaultValue `50` */
  limit?: number
}

/** A point on the altitude-vs-time visibility curve. */
export interface VisibilityCurvePoint {
  /** The date/time of this sample. */
  date: Date
  /** Altitude in degrees at this time. */
  alt: number
  /** Azimuth in degrees at this time. */
  az: number
}

/** Result from {@link Planner.bestWindow}. */
export interface BestWindowResult {
  /** Time of maximum altitude. */
  peak: Date
  /** Maximum altitude in degrees. */
  peakAltitude: number
  /** Rise time (altitude crosses `minAlt`), or `null` if already up at start of night. */
  rise: Date | null
  /** Set time (altitude drops below `minAlt`), or `null` if still up at end of night. */
  set: Date | null
}

/** Result from planet opposition/conjunction detection. */
export interface PlanetEvent {
  /** The planet involved. */
  planet: PlanetName
  /** Type of event. */
  type: 'opposition' | 'conjunction'
  /** Approximate date of the event. */
  date: Date
  /** Elongation from the Sun in degrees at the event. */
  elongation: number
}

/** Moon interference details for a target. */
export interface MoonInterference {
  /** Angular separation from the Moon in degrees. */
  separation: number
  /** Moon illumination fraction 0–1. */
  illumination: number
  /** Combined interference score 0–1 (0 = no interference, 1 = worst case). */
  score: number
}

/** Airmass at a given time. */
export interface AirmassPoint {
  /** The date/time of this sample. */
  date: Date
  /** Altitude in degrees. */
  alt: number
  /** Airmass value (1.0 at zenith, higher near horizon). */
  airmass: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ALL_PLANETS: PlanetName[] = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

/** Get equatorial coords for a catalog object at a given date. */
function objectEquatorial(obj: CelestialObject, date: Date): EquatorialCoord | null {
  // Fixed RA/Dec objects (stars, DSOs)
  if (obj.ra !== null && obj.dec !== null) {
    return { ra: obj.ra, dec: obj.dec }
  }

  // Solar-system bodies: compute dynamically
  if (obj.type === 'planet') {
    const planetName = obj.id as PlanetName
    try {
      const ecl = AstroMath.planetEcliptic(planetName, date)
      // Convert heliocentric to geocentric
      const earth = AstroMath.planetEcliptic('earth', date)
      const geo = helioToGeo(ecl, earth)
      return AstroMath.eclipticToEquatorial(geo)
    } catch {
      return null
    }
  }

  if (obj.id === 'sun') {
    const pos = Sun.position(date)
    return { ra: pos.ra, dec: pos.dec }
  }

  if (obj.id === 'moon') {
    const pos = Moon.position(date)
    return { ra: pos.ra, dec: pos.dec }
  }

  return null
}

/** Convert heliocentric ecliptic to geocentric ecliptic. */
function helioToGeo(
  body: { lon: number; lat: number; r: number },
  earth: { lon: number; lat: number; r: number },
): { lon: number; lat: number } {
  const D = Math.PI / 180

  // Heliocentric rectangular
  const xB = body.r * Math.cos(body.lat * D) * Math.cos(body.lon * D)
  const yB = body.r * Math.cos(body.lat * D) * Math.sin(body.lon * D)
  const zB = body.r * Math.sin(body.lat * D)

  const xE = earth.r * Math.cos(earth.lat * D) * Math.cos(earth.lon * D)
  const yE = earth.r * Math.cos(earth.lat * D) * Math.sin(earth.lon * D)
  const zE = earth.r * Math.sin(earth.lat * D)

  // Geocentric rectangular
  const xG = xB - xE
  const yG = yB - yE
  const zG = zB - zE

  // Back to ecliptic lon/lat
  const lon = ((Math.atan2(yG, xG) * 180 / Math.PI) % 360 + 360) % 360
  const lat = Math.atan2(zG, Math.sqrt(xG * xG + yG * yG)) * 180 / Math.PI

  return { lon, lat }
}

/** Compute airmass using Kasten & Young (1989) formula. */
function airmass(altDeg: number): number {
  if (altDeg <= 0) return Infinity
  const zenith = 90 - altDeg
  const zRad = zenith * Math.PI / 180
  // Kasten & Young (1989)
  return 1 / (Math.cos(zRad) + 0.50572 * Math.pow(96.07995 - zenith, -1.6364))
}

/** Get darkness window (astronomical dusk to dawn) for a night. */
function darknessWindow(observer: ObserverParams): { start: Date; end: Date } | null {
  const date = observer.date ?? new Date()
  const tw = Sun.twilight(observer)

  // Use astronomical dusk → next astronomical dawn
  const dusk = tw.astronomicalDusk
  if (!dusk) return null

  // Get next morning's dawn
  const nextDay = new Date(date.valueOf() + 86_400_000)
  const twNext = Sun.twilight({ ...observer, date: nextDay })
  const dawn = twNext.astronomicalDawn

  if (!dawn) return null

  return { start: dusk, end: dawn }
}

// ── Main module ──────────────────────────────────────────────────────────────

/**
 * Observation planning utilities — "What can I see tonight?"
 *
 * Provides functions to determine which objects are visible for a given
 * observer, compute optimal viewing windows, altitude curves, moon
 * interference scoring, airmass calculations, and planet event detection.
 *
 * @example
 * ```ts
 * import { Planner } from '@motioncomplex/cosmos-lib'
 *
 * const observer = { lat: 47.05, lng: 8.31, date: new Date('2024-08-15') }
 *
 * // What's visible tonight?
 * const visible = Planner.whatsUp(observer)
 * visible.forEach(v => console.log(v.object.name, `alt: ${v.alt.toFixed(1)}°`))
 *
 * // Best time to observe M42
 * const window = Planner.bestWindow('m42', observer)
 * console.log('Peak altitude:', window?.peakAltitude.toFixed(1))
 *
 * // Altitude curve for Sirius
 * const curve = Planner.visibilityCurve('sirius', observer)
 * ```
 */
export const Planner = {
  /**
   * Objects currently above the horizon, sorted by altitude (highest first).
   *
   * Returns all catalog objects that are above the specified minimum altitude
   * at the observer's date/time, filtered by optional magnitude limit,
   * object type, constellation, or catalog tag. Each result includes the
   * current alt/az position and moon interference scoring.
   *
   * @param observer - Observer location and time.
   * @param options - Filtering and sorting options.
   * @returns Visible objects sorted by altitude (highest first).
   *
   * @example
   * ```ts
   * const visible = Planner.whatsUp(
   *   { lat: 47.05, lng: 8.31, date: new Date('2024-08-15T22:00:00Z') },
   *   { minAltitude: 15, magnitudeLimit: 5, types: ['nebula', 'cluster', 'galaxy'] }
   * )
   * ```
   */
  whatsUp(observer: ObserverParams, options: WhatsUpOptions = {}): VisibleObject[] {
    const {
      minAltitude = 10,
      magnitudeLimit = 6,
      types,
      constellation,
      tag,
      limit = 50,
    } = options

    const date = observer.date ?? new Date()
    const moonPos = Moon.position(date)
    const moonEq: EquatorialCoord = { ra: moonPos.ra, dec: moonPos.dec }
    const moonPhase = Moon.phase(date)

    let objects = Data.all()

    // Apply filters
    if (types) {
      objects = objects.filter(o => types.includes(o.type))
    }
    if (tag) {
      objects = objects.filter(o => o.tags.includes(tag))
    }
    if (constellation) {
      const conStars = Data.getStarsByConstellation(constellation)
      const conStarIds = new Set(conStars.map(s => s.id))
      objects = objects.filter(o => conStarIds.has(o.id))
    }

    const results: VisibleObject[] = []

    for (const obj of objects) {
      // Skip objects fainter than magnitude limit
      if (obj.magnitude !== null && obj.magnitude > magnitudeLimit) continue

      const eq = objectEquatorial(obj, date)
      if (!eq) continue

      const hor = AstroMath.equatorialToHorizontal(eq, { ...observer, date })
      if (hor.alt < minAltitude) continue

      // Moon interference
      const moonSep = AstroMath.angularSeparation(eq, moonEq)
      const moonInterference = computeMoonInterference(moonSep, moonPhase.illumination)

      results.push({
        object: obj,
        alt: hor.alt,
        az: hor.az,
        moonSeparation: moonSep,
        moonInterference,
      })
    }

    // Sort by altitude, highest first
    results.sort((a, b) => b.alt - a.alt)

    return results.slice(0, limit)
  },

  /**
   * Find the best observation window for an object on a given night.
   *
   * Samples the object's altitude between astronomical dusk and dawn,
   * returning the peak altitude time and the rise/set times relative
   * to the minimum observable altitude.
   *
   * @param objectId - Catalog object ID (e.g. `'m42'`, `'sirius'`, `'jupiter'`).
   * @param observer - Observer location and date (date determines which night).
   * @param minAlt - Minimum useful altitude in degrees. @defaultValue `10`
   * @returns The best window, or `null` if the object is never above `minAlt` during darkness.
   *
   * @example
   * ```ts
   * const window = Planner.bestWindow('m42', { lat: 47.05, lng: 8.31, date: new Date('2024-01-15') })
   * if (window) {
   *   console.log('Peak at', window.peak, `(${window.peakAltitude.toFixed(1)}°)`)
   * }
   * ```
   */
  bestWindow(objectId: string, observer: ObserverParams, minAlt = 10): BestWindowResult | null {
    const obj = Data.get(objectId)
    if (!obj) return null

    const darkness = darknessWindow(observer)
    if (!darkness) return null

    const { start, end } = darkness
    const duration = end.valueOf() - start.valueOf()
    const steps = 60 // sample every ~few minutes
    const stepMs = duration / steps

    let peakAlt = -Infinity
    let peakDate = start
    let riseDate: Date | null = null
    let setDate: Date | null = null
    let wasAbove = false

    for (let i = 0; i <= steps; i++) {
      const t = new Date(start.valueOf() + i * stepMs)
      const eq = objectEquatorial(obj, t)
      if (!eq) return null

      const hor = AstroMath.equatorialToHorizontal(eq, { ...observer, date: t })

      if (hor.alt >= minAlt) {
        if (!wasAbove && i > 0) riseDate = t
        wasAbove = true
        if (hor.alt > peakAlt) {
          peakAlt = hor.alt
          peakDate = t
        }
      } else {
        if (wasAbove) setDate = t
        wasAbove = false
      }
    }

    if (peakAlt < minAlt) return null

    // If still above at the end of night, set is null
    if (wasAbove) setDate = null
    // If above at start of night, rise is null
    const eqStart = objectEquatorial(obj, start)
    if (eqStart) {
      const horStart = AstroMath.equatorialToHorizontal(eqStart, { ...observer, date: start })
      if (horStart.alt >= minAlt) riseDate = null
    }

    return { peak: peakDate, peakAltitude: peakAlt, rise: riseDate, set: setDate }
  },

  /**
   * Compute altitude vs. time for an object over a night.
   *
   * Returns an array of altitude/azimuth samples from astronomical dusk
   * to astronomical dawn, suitable for plotting a visibility curve.
   *
   * @param objectId - Catalog object ID.
   * @param observer - Observer location and date.
   * @param steps - Number of samples. @defaultValue `100`
   * @returns Array of time/alt/az points, or `null` if the object is unknown or no darkness occurs.
   *
   * @example
   * ```ts
   * const curve = Planner.visibilityCurve('sirius', { lat: 47.05, lng: 8.31, date: new Date('2024-01-15') })
   * // Plot curve.map(p => ({ x: p.date, y: p.alt }))
   * ```
   */
  visibilityCurve(objectId: string, observer: ObserverParams, steps = 100): VisibilityCurvePoint[] | null {
    const obj = Data.get(objectId)
    if (!obj) return null

    const darkness = darknessWindow(observer)
    if (!darkness) return null

    const { start, end } = darkness
    const duration = end.valueOf() - start.valueOf()
    const stepMs = duration / steps
    const points: VisibilityCurvePoint[] = []

    for (let i = 0; i <= steps; i++) {
      const t = new Date(start.valueOf() + i * stepMs)
      const eq = objectEquatorial(obj, t)
      if (!eq) return null

      const hor = AstroMath.equatorialToHorizontal(eq, { ...observer, date: t })
      points.push({ date: t, alt: hor.alt, az: hor.az })
    }

    return points
  },

  /**
   * Detect oppositions and conjunctions for outer planets near a given date.
   *
   * Scans a date range (default: 1 year forward) for dates where a planet's
   * elongation from the Sun is near 180° (opposition) or 0° (conjunction).
   *
   * @param observer - Observer with date as the start of the search range.
   * @param options - Search options.
   * @returns Array of detected planet events, sorted by date.
   *
   * @example
   * ```ts
   * const events = Planner.planetEvents({ lat: 47, lng: 8, date: new Date('2024-01-01') })
   * events.forEach(e => console.log(e.planet, e.type, e.date.toISOString()))
   * ```
   */
  planetEvents(
    observer: ObserverParams,
    options: { planets?: PlanetName[]; days?: number } = {},
  ): PlanetEvent[] {
    const { planets = ALL_PLANETS, days = 365 } = options
    const startDate = observer.date ?? new Date()
    const events: PlanetEvent[] = []

    for (const planet of planets) {
      // Sample elongation daily
      let prevElong = -1
      let prevIncreasing = true

      for (let d = 0; d <= days; d++) {
        const date = new Date(startDate.valueOf() + d * 86_400_000)
        const elong = solarElongation(planet, date)

        if (d > 0) {
          const increasing = elong > prevElong

          // Opposition: elongation peaks near 180°
          if (!increasing && prevIncreasing && prevElong > 150) {
            events.push({
              planet,
              type: 'opposition',
              date: new Date(startDate.valueOf() + (d - 1) * 86_400_000),
              elongation: prevElong,
            })
          }

          // Conjunction: elongation reaches minimum near 0°
          if (increasing && !prevIncreasing && prevElong < 30) {
            events.push({
              planet,
              type: 'conjunction',
              date: new Date(startDate.valueOf() + (d - 1) * 86_400_000),
              elongation: prevElong,
            })
          }

          prevIncreasing = increasing
        }
        prevElong = elong
      }
    }

    events.sort((a, b) => a.date.valueOf() - b.date.valueOf())
    return events
  },

  /**
   * Moon interference score for a specific target.
   *
   * Combines angular separation from the Moon with the current lunar
   * illumination to produce a 0–1 interference score. Score of 0 means
   * no interference (new moon or far away), 1 means maximum interference
   * (full moon very close to the target).
   *
   * @param objectId - Catalog object ID.
   * @param observer - Observer location and time.
   * @returns Moon interference details, or `null` if the object is unknown.
   *
   * @example
   * ```ts
   * const mi = Planner.moonInterference('m42', { lat: 47, lng: 8, date: new Date() })
   * if (mi && mi.score > 0.5) console.log('Significant moon interference!')
   * ```
   */
  moonInterference(objectId: string, observer: ObserverParams): MoonInterference | null {
    const obj = Data.get(objectId)
    if (!obj) return null

    const date = observer.date ?? new Date()
    const eq = objectEquatorial(obj, date)
    if (!eq) return null

    const moonPos = Moon.position(date)
    const moonEq: EquatorialCoord = { ra: moonPos.ra, dec: moonPos.dec }
    const phase = Moon.phase(date)

    const separation = AstroMath.angularSeparation(eq, moonEq)
    const score = computeMoonInterference(separation, phase.illumination)

    return { separation, illumination: phase.illumination, score }
  },

  /**
   * Airmass curve for an object over a night.
   *
   * Returns airmass values (using Kasten & Young 1989 formula) sampled
   * from astronomical dusk to dawn. Airmass is 1.0 at zenith and increases
   * toward the horizon. Only points where the object is above the horizon
   * are included (airmass at or below 0° altitude is infinite).
   *
   * @param objectId - Catalog object ID.
   * @param observer - Observer location and date.
   * @param steps - Number of samples. @defaultValue `100`
   * @returns Array of time/alt/airmass points (only above-horizon), or `null`.
   *
   * @example
   * ```ts
   * const am = Planner.airmassCurve('sirius', { lat: 47, lng: 8, date: new Date('2024-01-15') })
   * // Plot am.map(p => ({ x: p.date, y: p.airmass }))
   * ```
   */
  airmassCurve(objectId: string, observer: ObserverParams, steps = 100): AirmassPoint[] | null {
    const obj = Data.get(objectId)
    if (!obj) return null

    const darkness = darknessWindow(observer)
    if (!darkness) return null

    const { start, end } = darkness
    const duration = end.valueOf() - start.valueOf()
    const stepMs = duration / steps
    const points: AirmassPoint[] = []

    for (let i = 0; i <= steps; i++) {
      const t = new Date(start.valueOf() + i * stepMs)
      const eq = objectEquatorial(obj, t)
      if (!eq) return null

      const hor = AstroMath.equatorialToHorizontal(eq, { ...observer, date: t })
      if (hor.alt > 0) {
        points.push({ date: t, alt: hor.alt, airmass: airmass(hor.alt) })
      }
    }

    return points
  },
} as const

// ── Internal helpers ─────────────────────────────────────────────────────────

/** Compute solar elongation for a planet in degrees (0–180). */
function solarElongation(planet: PlanetName, date: Date): number {
  const pEcl = AstroMath.planetEcliptic(planet, date)
  const earth = AstroMath.planetEcliptic('earth', date)
  const geo = helioToGeo(pEcl, earth)
  const planetEq = AstroMath.eclipticToEquatorial(geo)
  const sunPos = Sun.position(date)
  return AstroMath.angularSeparation(planetEq, { ra: sunPos.ra, dec: sunPos.dec })
}

/**
 * Compute moon interference score 0–1.
 * Uses angular separation and illumination: closer + brighter = more interference.
 * Separation < 5° is maximum proximity penalty; tapers to 0 at 120°.
 */
function computeMoonInterference(separationDeg: number, illumination: number): number {
  // Proximity factor: 1.0 at <=5°, 0.0 at >=120°, linear between
  const proximityFactor = Math.max(0, Math.min(1, (120 - separationDeg) / 115))
  // Combined: illumination * proximity
  return illumination * proximityFactor
}
