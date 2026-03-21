import { AstroMath } from './math.js'
import { Sun } from './sun.js'
import { Moon } from './moon.js'
import { Eclipse } from './eclipse.js'
import { Data } from './data/index.js'
import { Planner } from './planner.js'
import type { ObserverParams, PlanetName } from './types.js'

// ── Types ────────────────────────────────────────────────────────────────────

/** All supported astronomical event categories. */
export type AstroEventCategory =
  | 'moon-phase'
  | 'eclipse'
  | 'meteor-shower'
  | 'opposition'
  | 'conjunction'
  | 'equinox'
  | 'solstice'
  | 'elongation'

/**
 * A unified astronomical event — the common shape returned by all event
 * detection functions.
 */
export interface AstroEvent {
  /** Event category. */
  category: AstroEventCategory
  /** Human-readable title (e.g. "Full Moon", "Mars opposition", "Perseid meteor shower peak"). */
  title: string
  /** Approximate date/time of the event. */
  date: Date
  /** Optional additional detail. */
  detail?: string
  /** Sky position in equatorial coordinates (J2000), if applicable. For meteor showers this is the radiant; for planet events this is the planet's position. */
  ra?: number | undefined
  /** Declination in degrees, if applicable. */
  dec?: number | undefined
  /** Constellation where the event occurs (3-letter IAU abbreviation), if applicable. */
  constellation?: string | undefined
  /** Observer-specific visibility assessment, if an observer was provided. */
  visibility?: EventVisibility | undefined
}

/**
 * Observer-specific visibility assessment for an astronomical event.
 *
 * Computed when an observer location is provided to `nextEvents()`.
 * Tells you whether the event is visible from your location and how
 * good the conditions are.
 */
export interface EventVisibility {
  /** Whether the event target is above the horizon during darkness at the observer's location. */
  visible: boolean
  /** Peak altitude of the target above horizon during darkness (degrees). Negative means never rises. */
  peakAltitude: number
  /** Moon interference score 0–1 (0 = no interference, 1 = full moon nearby). */
  moonInterference: number
  /** Human-readable summary (e.g. "Excellent — radiant at 72° alt, no moon"). */
  summary: string
}

/** Options for {@link Events.nextEvents}. */
export interface NextEventsOptions {
  /** Number of days to scan forward. @defaultValue `90` */
  days?: number
  /** Filter by event categories. @defaultValue all categories */
  categories?: AstroEventCategory[]
  /** Maximum results. @defaultValue `50` */
  limit?: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const MOON_PHASE_TARGETS = [
  { target: 'new' as const, name: 'New Moon' },
  { target: 'first-quarter' as const, name: 'First Quarter Moon' },
  { target: 'full' as const, name: 'Full Moon' },
  { target: 'last-quarter' as const, name: 'Last Quarter Moon' },
]

/** Capitalize first letter. */
function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Module ───────────────────────────────────────────────────────────────────

/**
 * Astronomical event calendar — upcoming events feed.
 *
 * Aggregates moon phases, eclipses, meteor shower peaks, planet
 * oppositions/conjunctions, equinoxes, and solstices into a unified
 * timeline. Supports filtering by category, date range, and iCal export.
 *
 * @example
 * ```ts
 * import { Events } from '@motioncomplex/cosmos-lib'
 *
 * const upcoming = Events.nextEvents(
 *   { lat: 47, lng: 8, date: new Date() },
 *   { days: 90, limit: 20 }
 * )
 * upcoming.forEach(e => console.log(e.date.toLocaleDateString(), e.title))
 *
 * const nextFull = Events.nextEvent('moon-phase', { lat: 47, lng: 8 })
 * ```
 */
export const Events = {
  /**
   * Find upcoming astronomical events within a date range.
   *
   * Scans forward from the observer's date, aggregating events from
   * multiple sources: moon phases, eclipses, meteor showers, planet
   * events, equinoxes, and solstices. Results are sorted by date.
   *
   * @param observer - Observer location and start date.
   * @param options - Filtering and limit options.
   * @returns Array of events sorted by date.
   *
   * @example
   * ```ts
   * const events = Events.nextEvents(
   *   { lat: 47, lng: 8, date: new Date('2024-01-01') },
   *   { days: 365, categories: ['eclipse', 'opposition'] }
   * )
   * ```
   */
  nextEvents(observer: ObserverParams, options: NextEventsOptions = {}): AstroEvent[] {
    const { days = 90, categories, limit = 50 } = options
    const start = observer.date ?? new Date()
    const end = new Date(start.valueOf() + days * 86_400_000)
    const all: AstroEvent[] = []

    const include = (cat: AstroEventCategory) => !categories || categories.includes(cat)

    // Moon phases
    if (include('moon-phase')) {
      all.push(...findMoonPhases(start, end))
    }

    // Eclipses
    if (include('eclipse')) {
      all.push(...findEclipses(start, end))
    }

    // Meteor shower peaks
    if (include('meteor-shower')) {
      all.push(...findMeteorShowerPeaks(start, end))
    }

    // Planet oppositions & conjunctions
    if (include('opposition') || include('conjunction')) {
      const planetEvents = Planner.planetEvents(observer, { days })
      for (const pe of planetEvents) {
        if (include(pe.type as AstroEventCategory)) {
          // Compute planet's sky position at the event date
          let ra: number | undefined
          let dec: number | undefined
          try {
            const ecl = AstroMath.planetEcliptic(pe.planet, pe.date)
            const eq = AstroMath.eclipticToEquatorial(ecl)
            ra = eq.ra
            dec = eq.dec
          } catch { /* skip position if computation fails */ }

          all.push({
            category: pe.type as AstroEventCategory,
            title: `${cap(pe.planet)} ${pe.type}`,
            date: pe.date,
            detail: `Solar elongation: ${pe.elongation.toFixed(1)}°`,
            ra,
            dec,
          })
        }
      }
    }

    // Elongations (Mercury & Venus greatest elongations)
    if (include('elongation')) {
      all.push(...findGreatestElongations(start, days))
    }

    // Equinoxes & solstices
    if (include('equinox')) {
      all.push(...findEquinoxesSolstices(start, end, 'equinox'))
    }
    if (include('solstice')) {
      all.push(...findEquinoxesSolstices(start, end, 'solstice'))
    }

    // Compute visibility for events that have sky positions
    if (observer.lat !== undefined && observer.lng !== undefined) {
      for (const event of all) {
        if (event.ra !== undefined && event.dec !== undefined) {
          event.visibility = computeVisibility(event, observer)
        }
      }
    }

    // Sort by date, limit
    all.sort((a, b) => a.date.valueOf() - b.date.valueOf())
    return all.slice(0, limit)
  },

  /**
   * Find the next occurrence of a specific event category.
   *
   * @param category - The event category to search for.
   * @param observer - Observer location and start date.
   * @param days - How far to search forward. @defaultValue `365`
   * @returns The next event, or `null` if none found in the range.
   *
   * @example
   * ```ts
   * const nextEclipse = Events.nextEvent('eclipse', { lat: 47, lng: 8 })
   * const nextOpposition = Events.nextEvent('opposition', { lat: 47, lng: 8 })
   * ```
   */
  nextEvent(
    category: AstroEventCategory,
    observer: ObserverParams,
    days = 365,
  ): AstroEvent | null {
    const results = this.nextEvents(observer, { days, categories: [category], limit: 1 })
    return results[0] ?? null
  },

  /**
   * Export events as an iCal (`.ics`) string.
   *
   * Generates a valid iCalendar file with VEVENT entries for each event.
   * Events are all-day events (no specific time) since most astronomical
   * events span hours or occur at observer-dependent times.
   *
   * @param events - Array of events to export.
   * @param calendarName - Calendar name. @defaultValue `'Astronomical Events'`
   * @returns A string in iCalendar format, ready to save as `.ics`.
   *
   * @example
   * ```ts
   * const events = Events.nextEvents(observer, { days: 365 })
   * const ical = Events.toICal(events)
   * download('astro-events.ics', ical, 'text/calendar')
   * ```
   */
  toICal(events: AstroEvent[], calendarName = 'Astronomical Events'): string {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//cosmos-lib//Astronomical Events//EN',
      `X-WR-CALNAME:${calendarName}`,
    ]

    for (const event of events) {
      const d = event.date
      const dateStr = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`
      const uid = `${dateStr}-${event.category}-${event.title.replace(/\s/g, '-').toLowerCase()}@cosmos-lib`

      lines.push(
        'BEGIN:VEVENT',
        `DTSTART;VALUE=DATE:${dateStr}`,
        `SUMMARY:${event.title}`,
        `UID:${uid}`,
      )
      if (event.detail) {
        lines.push(`DESCRIPTION:${event.detail}`)
      }
      lines.push('END:VEVENT')
    }

    lines.push('END:VCALENDAR')
    return lines.join('\r\n')
  },
} as const

// ── Internal event finders ───────────────────────────────────────────────────

function findMoonPhases(start: Date, end: Date): AstroEvent[] {
  const events: AstroEvent[] = []
  for (const { target, name } of MOON_PHASE_TARGETS) {
    let cursor = new Date(start.valueOf())
    for (let i = 0; i < 20; i++) { // max ~20 phases per type in any range
      const next = Moon.nextPhase(cursor, target)
      if (next.valueOf() > end.valueOf()) break
      const moonPos = Moon.position(next)
      events.push({
        category: 'moon-phase',
        title: name,
        date: next,
        ra: moonPos.ra,
        dec: moonPos.dec,
      })
      cursor = new Date(next.valueOf() + 86_400_000) // skip ahead 1 day
    }
  }
  return events
}

function findEclipses(start: Date, end: Date): AstroEvent[] {
  const eclipses = Eclipse.search(start, end)
  return eclipses.map(e => ({
    category: 'eclipse' as const,
    title: `${cap(e.subtype)} ${e.type} eclipse`,
    date: e.date,
    detail: `Magnitude: ${e.magnitude.toFixed(3)}`,
  }))
}

function findMeteorShowerPeaks(start: Date, end: Date): AstroEvent[] {
  const events: AstroEvent[] = []

  // Check each day in range for active showers near peak
  const checked = new Set<string>()
  for (let d = start.valueOf(); d <= end.valueOf(); d += 86_400_000) {
    const date = new Date(d)
    const active = Data.getActiveShowers(date)
    for (const s of active) {
      // Only report once per shower, at peak
      if (checked.has(s.id)) continue
      // Check if this is within 2 days of peak
      const earth = AstroMath.planetEcliptic('earth', date)
      const sunLon = ((earth.lon + 180) % 360 + 360) % 360
      const diff = Math.abs(((sunLon - s.solarLon + 180) % 360 + 360) % 360 - 180)
      if (diff < 2) {
        checked.add(s.id)
        events.push({
          category: 'meteor-shower',
          title: `${s.name} meteor shower peak`,
          date,
          detail: `ZHR: ${s.zhr}, speed: ${s.speed} km/s${s.parentBody ? `, parent: ${s.parentBody}` : ''}`,
          ra: s.radiantRA,
          dec: s.radiantDec,
          constellation: s.code,
        })
      }
    }
  }
  return events
}

function findGreatestElongations(start: Date, days: number): AstroEvent[] {
  const events: AstroEvent[] = []
  const innerPlanets: PlanetName[] = ['mercury', 'venus']

  for (const planet of innerPlanets) {
    let prevElong = 0
    let prevIncreasing = true

    for (let d = 0; d <= days; d++) {
      const date = new Date(start.valueOf() + d * 86_400_000)
      const pEcl = AstroMath.planetEcliptic(planet, date)
      const pEq = AstroMath.eclipticToEquatorial(pEcl)
      const sunPos = Sun.position(date)
      const elong = AstroMath.angularSeparation(pEq, { ra: sunPos.ra, dec: sunPos.dec })

      if (d > 0) {
        const increasing = elong > prevElong
        // Greatest elongation: peak in elongation
        if (!increasing && prevIncreasing && prevElong > 15) {
          // Determine east/west based on ecliptic longitude difference
          const pLon = pEcl.lon
          const sunLon = sunPos.eclipticLon
          let diff = pLon - sunLon
          if (diff > 180) diff -= 360
          if (diff < -180) diff += 360
          const side = diff > 0 ? 'east (evening)' : 'west (morning)'

          events.push({
            category: 'elongation',
            title: `${cap(planet)} greatest elongation`,
            date: new Date(start.valueOf() + (d - 1) * 86_400_000),
            detail: `${prevElong.toFixed(1)}° ${side}`,
          })
        }
        prevIncreasing = increasing
      }
      prevElong = elong
    }
  }
  return events
}

function findEquinoxesSolstices(
  start: Date,
  end: Date,
  type: 'equinox' | 'solstice',
): AstroEvent[] {
  const events: AstroEvent[] = []

  // Check each month in range for Sun crossing 0°/90°/180°/270° ecliptic longitude
  const targets = type === 'equinox'
    ? [{ lon: 0, name: 'Vernal equinox (March)' }, { lon: 180, name: 'Autumnal equinox (September)' }]
    : [{ lon: 90, name: 'Summer solstice (June)' }, { lon: 270, name: 'Winter solstice (December)' }]

  for (const { lon: targetLon, name } of targets) {
    // Scan daily for the Sun crossing the target ecliptic longitude
    let prevLon = -1
    for (let d = 0; d <= (end.valueOf() - start.valueOf()) / 86_400_000; d++) {
      const date = new Date(start.valueOf() + d * 86_400_000)
      const sunPos = Sun.position(date)
      const curLon = sunPos.eclipticLon

      if (d > 0) {
        // Check if we crossed the target longitude
        let crossed = false
        if (targetLon === 0) {
          // Special case: 360→0 crossing
          crossed = prevLon > 350 && curLon < 10
        } else {
          crossed = prevLon < targetLon && curLon >= targetLon
        }

        if (crossed) {
          events.push({
            category: type,
            title: name,
            date,
            detail: `Sun ecliptic longitude: ${curLon.toFixed(2)}°`,
          })
        }
      }
      prevLon = curLon
    }
  }
  return events
}

// ── Visibility computation ───────────────────────────────────────────────────

/**
 * Compute observer-specific visibility for an event with a sky position.
 * Checks the target's altitude during darkness hours on the event night.
 */
function computeVisibility(event: AstroEvent, observer: ObserverParams): EventVisibility {
  const ra = event.ra!
  const dec = event.dec!
  const date = event.date

  // Get darkness window
  const tw = Sun.twilight({ ...observer, date })
  const dusk = tw.astronomicalDusk
  const nextDayTw = Sun.twilight({ ...observer, date: new Date(date.valueOf() + 86_400_000) })
  const dawn = nextDayTw.astronomicalDawn

  // Moon interference
  const moonPhase = Moon.phase(date)
  const moonPos = Moon.position(date)
  const moonSep = AstroMath.angularSeparation({ ra, dec }, { ra: moonPos.ra, dec: moonPos.dec })
  const proximityFactor = Math.max(0, Math.min(1, (120 - moonSep) / 115))
  const moonInterference = moonPhase.illumination * proximityFactor

  // If no darkness (polar summer), target is not visible for dark-sky events
  if (!dusk || !dawn) {
    const hor = AstroMath.equatorialToHorizontal({ ra, dec }, { ...observer, date })
    return {
      visible: false,
      peakAltitude: hor.alt,
      moonInterference,
      summary: 'No astronomical darkness at this location',
    }
  }

  // Sample altitude during darkness (every 30 min)
  const startMs = dusk.valueOf()
  const endMs = dawn.valueOf()
  let peakAlt = -90

  for (let t = startMs; t <= endMs; t += 1_800_000) {
    const hor = AstroMath.equatorialToHorizontal({ ra, dec }, { ...observer, date: new Date(t) })
    if (hor.alt > peakAlt) peakAlt = hor.alt
  }

  const visible = peakAlt > 10

  // Build summary
  let summary: string
  if (!visible) {
    summary = peakAlt > 0
      ? `Low visibility — peak altitude only ${peakAlt.toFixed(0)}° above horizon`
      : 'Not visible — target never rises above horizon at this location'
  } else if (moonInterference > 0.5) {
    summary = `Visible at ${peakAlt.toFixed(0)}° alt, but strong moon interference (${(moonInterference * 100).toFixed(0)}%)`
  } else if (moonInterference > 0.2) {
    summary = `Good — ${peakAlt.toFixed(0)}° alt, moderate moon (${(moonInterference * 100).toFixed(0)}%)`
  } else if (peakAlt > 50) {
    summary = `Excellent — ${peakAlt.toFixed(0)}° alt, dark skies`
  } else {
    summary = `Good — ${peakAlt.toFixed(0)}° alt, low moon interference`
  }

  return { visible, peakAltitude: peakAlt, moonInterference, summary }
}
