import { AstroMath } from './math.js'
import { Sun } from './sun.js'
import { Moon } from './moon.js'
import { Data } from './data/index.js'
import { Planner } from './planner.js'
import type { ObserverParams, EquatorialCoord } from './types.js'

// ── Types ────────────────────────────────────────────────────────────────────

/** A scored target in a session plan. */
export interface SessionTarget {
  /** Object ID. */
  objectId: string
  /** Object name. */
  name: string
  /** Optimal imaging start time. */
  start: Date
  /** Optimal imaging end time. */
  end: Date
  /** Transit (meridian crossing) time. */
  transit: Date
  /** Peak altitude in degrees. */
  peakAltitude: number
  /** Airmass range [min, max] during the window. */
  airmassRange: [number, number]
  /** Moon separation in degrees. */
  moonSeparation: number
  /** Moon interference score 0–1. */
  moonInterference: number
  /** Overall quality score 0–100 (higher = better). */
  score: number
}

/** Imaging window for a single target. */
export interface ImagingWindow {
  /** When the target rises above the airmass threshold. */
  start: Date | null
  /** When the target drops below the airmass threshold. */
  end: Date | null
  /** Transit time. */
  transit: Date
  /** Peak altitude. */
  peakAltitude: number
  /** Hours of usable imaging time. */
  hours: number
}

/** Milky Way visibility information. */
export interface MilkyWayInfo {
  /** Galactic center (Sgr A*) equatorial position. */
  position: EquatorialCoord
  /** Current altitude of galactic center. */
  altitude: number
  /** Current azimuth of galactic center. */
  azimuth: number
  /** Whether the core is above the horizon. */
  aboveHorizon: boolean
  /** Rise time (null if circumpolar or never rises). */
  rise: Date | null
  /** Set time. */
  set: Date | null
  /** Transit time. */
  transit: Date
}

/** Polar alignment info. */
export interface PolarAlignmentInfo {
  /** Angular offset of Polaris from true NCP in degrees. */
  polarisOffset: number
  /** Position angle of Polaris relative to NCP in degrees (0=N, 90=E). */
  positionAngle: number
  /** Polaris current altitude. */
  polarisAltitude: number
  /** Polaris current azimuth. */
  polarisAzimuth: number
  /** Hemisphere. */
  hemisphere: 'north' | 'south'
}

/** Session plan options. */
export interface SessionPlanOptions {
  /** Minimum altitude in degrees. @defaultValue `25` */
  minAltitude?: number | undefined
  /** Maximum airmass. @defaultValue `2.0` */
  maxAirmass?: number | undefined
  /** Minimum moon separation in degrees. @defaultValue `30` */
  minMoonSeparation?: number | undefined
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Sgr A* (galactic center) J2000 coordinates. */
const SGR_A_STAR: EquatorialCoord = { ra: 266.4168, dec: -29.0078 }

/** Polaris J2000 coordinates. */
const POLARIS: EquatorialCoord = { ra: 37.9546, dec: 89.2641 }

/** Sigma Octantis (southern pole star) J2000. */
const SIGMA_OCT: EquatorialCoord = { ra: 317.195, dec: -88.9564 }

/** Compute airmass from altitude. */
function airmass(altDeg: number): number {
  if (altDeg <= 0) return Infinity
  const z = (90 - altDeg) * Math.PI / 180
  return 1 / (Math.cos(z) + 0.50572 * Math.pow(96.07995 - (90 - altDeg), -1.6364))
}

// ── Module ───────────────────────────────────────────────────────────────────

/**
 * Astrophotography planning utilities.
 *
 * Session planning, exposure calculators, Milky Way tracking, polar
 * alignment, and light pollution tools.
 *
 * @example
 * ```ts
 * import { AstroPhoto } from '@motioncomplex/cosmos-lib'
 *
 * const observer = { lat: 47.05, lng: 8.31, date: new Date('2024-08-15') }
 *
 * // Session plan for tonight
 * const plan = AstroPhoto.sessionPlan(observer, ['m31', 'm42', 'm45'])
 *
 * // Milky Way visibility
 * const mw = AstroPhoto.milkyWay(observer)
 *
 * // Exposure calculator
 * const maxSec = AstroPhoto.maxExposure({ focalLength: 200, pixelSize: 5.93 })
 * ```
 */
export const AstroPhoto = {
  // ── Session Planner ──────────────────────────────────────────────────

  /**
   * Generate a scored imaging plan for a night.
   *
   * Computes optimal windows for each target, scores them by altitude,
   * airmass, and moon interference, and sequences them by set-time-first
   * strategy (shoot western targets first).
   *
   * @param observer - Observer location and date.
   * @param targets - Array of object IDs to plan.
   * @param options - Constraints.
   * @returns Scored targets sorted by suggested imaging order.
   */
  sessionPlan(
    observer: ObserverParams,
    targets: string[],
    options: SessionPlanOptions = {},
  ): SessionTarget[] {
    const { minAltitude = 25, maxAirmass = 2.0, minMoonSeparation = 30 } = options
    const date = observer.date ?? new Date()
    const tw = Sun.twilight({ ...observer, date })
    const dusk = tw.astronomicalDusk
    const nextTw = Sun.twilight({ ...observer, date: new Date(date.valueOf() + 86_400_000) })
    const dawn = nextTw.astronomicalDawn

    if (!dusk || !dawn) return []

    const moonPhase = Moon.phase(date)
    const moonPos = Moon.position(date)
    const moonEq: EquatorialCoord = { ra: moonPos.ra, dec: moonPos.dec }

    const results: SessionTarget[] = []

    for (const targetId of targets) {
      const obj = Data.get(targetId)
      if (!obj || obj.ra === null || obj.dec === null) continue

      const eq: EquatorialCoord = { ra: obj.ra, dec: obj.dec }

      // Sample altitude during darkness
      let peakAlt = -90
      let transitDate = dusk
      let startDate: Date | null = null
      let endDate: Date | null = null
      let minAM = Infinity
      let maxAM = 0

      for (let t = dusk.valueOf(); t <= dawn.valueOf(); t += 900_000) { // every 15 min
        const d = new Date(t)
        const hor = AstroMath.equatorialToHorizontal(eq, { ...observer, date: d })
        const am = airmass(hor.alt)

        if (hor.alt >= minAltitude && am <= maxAirmass) {
          if (!startDate) startDate = d
          endDate = d
          if (am < minAM) minAM = am
          if (am > maxAM) maxAM = am
        }

        if (hor.alt > peakAlt) {
          peakAlt = hor.alt
          transitDate = d
        }
      }

      if (!startDate || !endDate || peakAlt < minAltitude) continue

      // Moon interference
      const moonSep = AstroMath.angularSeparation(eq, moonEq)
      const proximityFactor = Math.max(0, Math.min(1, (120 - moonSep) / 115))
      const moonInterference = moonPhase.illumination * proximityFactor

      if (moonSep < minMoonSeparation && moonPhase.illumination > 0.3) continue

      // Score: altitude (40%), low airmass (30%), low moon interference (30%)
      const altScore = Math.min(peakAlt / 90, 1) * 40
      const amScore = (1 - Math.min(minAM - 1, 2) / 2) * 30
      const moonScore = (1 - moonInterference) * 30
      const score = Math.round(altScore + amScore + moonScore)

      results.push({
        objectId: targetId,
        name: obj.name,
        start: startDate,
        end: endDate,
        transit: transitDate,
        peakAltitude: peakAlt,
        airmassRange: [Math.round(minAM * 100) / 100, Math.round(maxAM * 100) / 100],
        moonSeparation: Math.round(moonSep),
        moonInterference: Math.round(moonInterference * 100) / 100,
        score,
      })
    }

    // Sort by set-time-first strategy (earliest end time first)
    results.sort((a, b) => a.end.valueOf() - b.end.valueOf())
    return results
  },

  /**
   * Optimal imaging window for a single target.
   *
   * @param objectId - Catalog object ID.
   * @param observer - Observer location and date.
   * @param maxAirmass - Maximum acceptable airmass. @defaultValue `2.0`
   */
  imagingWindow(objectId: string, observer: ObserverParams, maxAirmass = 2.0): ImagingWindow | null {
    const window = Planner.bestWindow(objectId, observer, 15)
    if (!window) return null

    const obj = Data.get(objectId)
    if (!obj || obj.ra === null || obj.dec === null) return null

    const rts = AstroMath.riseTransitSet({ ra: obj.ra, dec: obj.dec }, observer)

    // Estimate usable hours
    const tw = Sun.twilight(observer)
    const dusk = tw.astronomicalDusk
    const nextTw = Sun.twilight({ ...observer, date: new Date((observer.date ?? new Date()).valueOf() + 86_400_000) })
    const dawn = nextTw.astronomicalDawn
    const darknessHours = dusk && dawn ? (dawn.valueOf() - dusk.valueOf()) / 3_600_000 : 8

    const hours = window.rise && window.set
      ? (window.set.valueOf() - window.rise.valueOf()) / 3_600_000
      : darknessHours // up all night or no rise/set data

    return {
      start: window.rise,
      end: window.set,
      transit: rts.transit,
      peakAltitude: window.peakAltitude,
      hours: Math.round(hours * 10) / 10,
    }
  },

  // ── Exposure Calculators ─────────────────────────────────────────────

  /**
   * NPF rule — max untracked exposure before star trails.
   *
   * Formula: `(35 × aperture + 30 × pixelPitch) / focalLength`
   *
   * @param params - Optical parameters.
   * @param params.focalLength - Focal length in mm.
   * @param params.aperture - Aperture in mm. Defaults to focalLength / 5.
   * @param params.pixelSize - Pixel size in μm. Defaults to 4.0.
   * @param params.declination - Target declination in degrees (optional, corrects for pole proximity).
   */
  maxExposure(params: { focalLength: number; aperture?: number; pixelSize?: number; declination?: number }): number {
    const { focalLength, pixelSize = 4.0 } = params
    const aperture = params.aperture ?? focalLength / 5
    let sec = (35 * aperture + 30 * pixelSize) / focalLength
    if (params.declination !== undefined) {
      const cosDec = Math.cos(params.declination * Math.PI / 180)
      if (cosDec > 0.01) sec /= cosDec
    }
    return Math.round(sec * 10) / 10
  },

  /**
   * Rule of 500 — quick max exposure estimate.
   *
   * @param focalLength - Focal length in mm.
   * @param cropFactor - Sensor crop factor. @defaultValue `1.0`
   */
  ruleOf500(focalLength: number, cropFactor = 1.0): number {
    return Math.round(500 / (focalLength * cropFactor) * 10) / 10
  },

  /**
   * Optimal sub-exposure length so sky noise dominates read noise.
   *
   * @param params.readNoise - Camera read noise in electrons.
   * @param params.skyBrightness - Sky background in electrons/pixel/second.
   * @param params.targetRatio - Sky-to-read noise ratio. @defaultValue `3`
   */
  subExposure(params: { readNoise: number; skyBrightness: number; targetRatio?: number }): number {
    const { readNoise, skyBrightness, targetRatio = 3 } = params
    if (skyBrightness <= 0) return 300 // default 5 min if unknown
    const sec = (targetRatio * readNoise) ** 2 / skyBrightness
    return Math.round(sec)
  },

  /**
   * Total integration time needed for a target SNR.
   *
   * @param params.subLength - Single sub-exposure length in seconds.
   * @param params.subSNR - SNR achieved in a single sub.
   * @param params.targetSNR - Desired final SNR.
   * @returns Total integration time in hours and number of subs.
   */
  totalIntegration(params: { subLength: number; subSNR: number; targetSNR: number }): { hours: number; subs: number } {
    const { subLength, subSNR, targetSNR } = params
    const subs = Math.ceil((targetSNR / subSNR) ** 2)
    const hours = Math.round((subs * subLength / 3600) * 10) / 10
    return { hours, subs }
  },

  // ── Milky Way ────────────────────────────────────────────────────────

  /**
   * Galactic center (Sgr A*) position and rise/set/transit times.
   *
   * @param observer - Observer location and date.
   */
  milkyWay(observer: ObserverParams): MilkyWayInfo {
    const date = observer.date ?? new Date()
    const hor = AstroMath.equatorialToHorizontal(SGR_A_STAR, { ...observer, date })
    const rts = AstroMath.riseTransitSet(SGR_A_STAR, observer)

    return {
      position: { ...SGR_A_STAR },
      altitude: hor.alt,
      azimuth: hor.az,
      aboveHorizon: hor.alt > 0,
      rise: rts.rise,
      set: rts.set,
      transit: rts.transit,
    }
  },

  /**
   * Milky Way core season — months when the galactic center is visible
   * during astronomical darkness.
   *
   * @param observer - Observer location.
   * @returns Array of month numbers (1–12) when the core is visible at night.
   */
  milkyWaySeason(observer: ObserverParams): number[] {
    const year = (observer.date ?? new Date()).getFullYear()
    const months: number[] = []

    for (let m = 1; m <= 12; m++) {
      const date = new Date(year, m - 1, 15) // mid-month
      const tw = Sun.twilight({ ...observer, date })
      if (!tw.astronomicalDusk) continue

      // Check if galactic center is above horizon during darkness
      const dusk = tw.astronomicalDusk
      const nextTw = Sun.twilight({ ...observer, date: new Date(date.valueOf() + 86_400_000) })
      const dawn = nextTw.astronomicalDawn
      if (!dawn) continue

      for (let t = dusk.valueOf(); t <= dawn.valueOf(); t += 3_600_000) {
        const hor = AstroMath.equatorialToHorizontal(SGR_A_STAR, { ...observer, date: new Date(t) })
        if (hor.alt > 10) { months.push(m); break }
      }
    }
    return months
  },

  // ── Polar Alignment ──────────────────────────────────────────────────

  /**
   * Polar alignment info — Polaris offset from true NCP.
   *
   * @param observer - Observer location and date.
   */
  polarAlignment(observer: ObserverParams): PolarAlignmentInfo {
    const date = observer.date ?? new Date()
    const isNorth = observer.lat >= 0

    const poleStar = isNorth ? POLARIS : SIGMA_OCT
    const hor = AstroMath.equatorialToHorizontal(poleStar, { ...observer, date })

    // Offset from true pole
    const poleDecl = isNorth ? 90 : -90
    const offset = Math.abs(poleStar.dec - poleDecl)

    // Position angle of Polaris relative to NCP
    const lst = AstroMath.lst(date, observer.lng)
    const ha = ((lst - poleStar.ra) % 360 + 360) % 360
    const posAngle = ((ha + 180) % 360) // simplified PA

    return {
      polarisOffset: Math.round(offset * 1000) / 1000,
      positionAngle: Math.round(posAngle * 10) / 10,
      polarisAltitude: hor.alt,
      polarisAzimuth: hor.az,
      hemisphere: isNorth ? 'north' : 'south',
    }
  },

  // ── Utilities ────────────────────────────────────────────────────────

  /**
   * Golden hour times (sun altitude +6° to -4°).
   */
  goldenHour(observer: ObserverParams): { morning: { start: Date; end: Date } | null; evening: { start: Date; end: Date } | null } {
    const date = observer.date ?? new Date()
    const sunPos = Sun.position(date)

    const rts6 = AstroMath.riseTransitSet(sunPos, { ...observer, date }, 6)
    const rtsN4 = AstroMath.riseTransitSet(sunPos, { ...observer, date }, -4)

    return {
      morning: rtsN4.rise && rts6.rise ? { start: rtsN4.rise, end: rts6.rise } : null,
      evening: rts6.set && rtsN4.set ? { start: rts6.set, end: rtsN4.set } : null,
    }
  },

  /**
   * Blue hour times (sun altitude -4° to -6°).
   */
  blueHour(observer: ObserverParams): { morning: { start: Date; end: Date } | null; evening: { start: Date; end: Date } | null } {
    const date = observer.date ?? new Date()
    const sunPos = Sun.position(date)

    const rtsN4 = AstroMath.riseTransitSet(sunPos, { ...observer, date }, -4)
    const rtsN6 = AstroMath.riseTransitSet(sunPos, { ...observer, date }, -6)

    return {
      morning: rtsN6.rise && rtsN4.rise ? { start: rtsN6.rise, end: rtsN4.rise } : null,
      evening: rtsN4.set && rtsN6.set ? { start: rtsN4.set, end: rtsN6.set } : null,
    }
  },

  /**
   * Optimal flat frame window — twilight with even sky brightness (sun at -2° to -6°).
   */
  flatFrameWindow(observer: ObserverParams): { morning: { start: Date; end: Date } | null; evening: { start: Date; end: Date } | null } {
    const date = observer.date ?? new Date()
    const sunPos = Sun.position(date)

    const rtsN2 = AstroMath.riseTransitSet(sunPos, { ...observer, date }, -2)
    const rtsN6 = AstroMath.riseTransitSet(sunPos, { ...observer, date }, -6)

    return {
      morning: rtsN6.rise && rtsN2.rise ? { start: rtsN6.rise, end: rtsN2.rise } : null,
      evening: rtsN2.set && rtsN6.set ? { start: rtsN2.set, end: rtsN6.set } : null,
    }
  },

  /**
   * Brightest star near zenith — ideal for collimation and focusing.
   *
   * @param observer - Observer location and time.
   */
  collimationStar(observer: ObserverParams): { name: string; altitude: number; azimuth: number } | null {
    const visible = Planner.whatsUp(observer, { types: ['star'], magnitudeLimit: 3, minAltitude: 50, limit: 10 })
    if (visible.length === 0) return null

    // Sort by altitude (highest = closest to zenith)
    const best = visible.sort((a, b) => b.alt - a.alt)[0]!
    return { name: best.object.name, altitude: best.alt, azimuth: best.az }
  },

  /**
   * Convert SQM (mag/arcsec²) to Bortle class.
   */
  bortleClass(sqm: number): number {
    if (sqm >= 21.99) return 1
    if (sqm >= 21.89) return 2
    if (sqm >= 21.69) return 3
    if (sqm >= 20.49) return 4
    if (sqm >= 19.50) return 5
    if (sqm >= 18.94) return 6
    if (sqm >= 18.38) return 7
    if (sqm >= 17.80) return 8
    return 9
  },

  /**
   * Convert SQM to naked-eye limiting magnitude.
   */
  sqmToNELM(sqm: number): number {
    // Schaefer formula approximation
    return Math.round((7.93 - 5 * Math.log10(1 + Math.pow(10, 4.316 - sqm / 5))) * 10) / 10
  },
} as const
