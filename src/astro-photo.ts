import { AstroMath } from './math.js'
import { Sun } from './sun.js'
import { Moon } from './moon.js'
import { Data } from './data/index.js'
import { Planner } from './planner.js'
import { Rig } from './equipment.js'
import type { FramingResult, FOV } from './equipment.js'
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

/**
 * Semantic sky site labels mapped to Bortle classes.
 *
 * Use these human-readable labels instead of raw Bortle numbers.
 * Each maps to a Bortle class for sky brightness estimation.
 */
export type SkySite =
  | 'city-center'      // Bortle 9 — bright inner city
  | 'bright-suburban'  // Bortle 8 — city sky
  | 'suburban'         // Bortle 6 — typical suburban neighborhood
  | 'rural-suburban'   // Bortle 5 — suburban/rural transition
  | 'rural'            // Bortle 4 — rural countryside
  | 'dark-site'        // Bortle 3 — dark sky park, no nearby towns
  | 'remote'           // Bortle 2 — remote, minimal light domes
  | 'pristine'         // Bortle 1 — excellent dark sky, mountaintop

/** Recommended capture settings for a target. */
export interface CaptureSettings {
  /** Focal ratio (f-number) of the optics. */
  focalRatio: number
  /** Recommended ISO (DSLR/mirrorless), or null for dedicated cameras. */
  iso: number | null
  /** Recommended gain (dedicated astro cameras), or null for DSLR/mirrorless. */
  gain: number | null
  /** Optimal sub-exposure length in seconds. */
  subExposure: number
  /** Total integration time needed in hours. */
  totalIntegration: number
  /** Number of light frames needed. */
  subs: number
  /** Calibration frame recommendations. */
  calibration: {
    /** Recommended number of dark frames. */
    darks: number
    /** Recommended number of flat frames. */
    flats: number
    /** Recommended number of bias/offset frames. */
    bias: number
    /** Contextual note for darks (matching settings). */
    darkNote: string
    /** Contextual note for flats (when to shoot). */
    flatNote: string
  }
}

/** A target in a rig-aware session plan. */
export interface RigPlanTarget {
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
  /** Framing analysis for this rig + target. */
  framing: FramingResult
  /** Max trail-free exposure in seconds for this rig + target declination. */
  maxExposure: number
  /** Recommended capture settings (ISO/gain, sub-exposure, subs, calibration). */
  capture: CaptureSettings
  /** Overall quality score 0–100 (60% observing conditions, 40% framing). */
  score: number
  /** Whether this target was auto-discovered or explicitly requested. */
  source: 'auto' | 'explicit'
}

/** Result of a rig-aware session plan. */
export interface RigPlanResult {
  /** Targets sorted by suggested imaging order (set-time-first). */
  targets: RigPlanTarget[]
  /** Darkness window used for planning. */
  darkness: { start: Date; end: Date }
  /** Total usable darkness hours. */
  darknessHours: number
  /** Rig summary for reference. */
  rig: { focalLength: number; fov: FOV; pixelScale: number; isTracked: boolean }
}

/** Options for rig-aware session planning. */
export interface RigPlanOptions {
  /** Explicit target IDs to include (even if framing isn't ideal). */
  targets?: string[] | undefined
  /** Max auto-discovered targets. @defaultValue `15` */
  autoLimit?: number | undefined
  /** Minimum fill % for auto-discovered targets. @defaultValue `10` */
  minFillPercent?: number | undefined
  /** Maximum fill % for auto-discovered targets. @defaultValue `150` */
  maxFillPercent?: number | undefined
  /** Minimum altitude in degrees. @defaultValue `25` */
  minAltitude?: number | undefined
  /** Maximum airmass. @defaultValue `2.0` */
  maxAirmass?: number | undefined
  /** Minimum moon separation in degrees. @defaultValue `30` */
  minMoonSeparation?: number | undefined
  /** Direct Bortle class (1–9). Overrides `skySite`. @defaultValue `6` (suburban) */
  bortle?: number | undefined
  /** Semantic sky site label. Used if `bortle` is not provided. @defaultValue `'suburban'` */
  skySite?: SkySite | undefined
  /** Target signal-to-noise ratio for integration time calculation. @defaultValue `25` */
  targetSNR?: number | undefined
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

/** Map SkySite label to Bortle class. */
const SKY_SITE_BORTLE: Record<SkySite, number> = {
  'city-center': 9,
  'bright-suburban': 8,
  'suburban': 6,
  'rural-suburban': 5,
  'rural': 4,
  'dark-site': 3,
  'remote': 2,
  'pristine': 1,
}

/** Map Bortle class to SQM (mag/arcsec²). */
const BORTLE_SQM: Record<number, number> = {
  1: 22.0, 2: 21.9, 3: 21.7, 4: 20.5, 5: 19.5,
  6: 18.9, 7: 18.4, 8: 17.8, 9: 17.0,
}

/**
 * Estimate sky brightness in electrons/pixel/second from Bortle class and optics.
 * Uses SQM → surface brightness → e/px/s conversion accounting for pixel size and focal ratio.
 */
function skyBrightness(bortle: number, pixelSizeUm: number, focalRatio: number): number {
  const sqm = BORTLE_SQM[Math.max(1, Math.min(9, Math.round(bortle)))] ?? 18.9
  // Convert SQM (mag/arcsec²) to photons per arcsec² per second (approximate)
  // Reference: SQM 22.0 ≈ 0.2 e/arcsec²/s for a typical QE~0.5 detector
  const surfaceBrightness = 0.2 * Math.pow(10, (22.0 - sqm) / 2.5)
  // Pixel FOV in arcsec²: (pixelSize / focalLength)² × 206265² = (pixelSize_um / (focalRatio × pixelSize_um × 206.265 / pixelSize_um))²
  // Simpler: pixel scale in arcsec = pixelSize_um / focalLength_mm × 206265 ≈ pixelSize / (focalRatio * pixelSize) ... no.
  // Pixel scale = pixelSize_um / focalLength_mm × 206.265
  // But we don't have focalLength directly, we have focalRatio. However pixelArea in arcsec² can be derived:
  // pixelScale = 206.265 * pixelSize_um / focalLength_mm
  // Pixel area = pixelScale². We need: skyE = surfaceBrightness × pixelArea
  // For a given focalRatio, equivalent aperture per pixel: pixelSize_um² / focalRatio²
  // This is proportional to light gathering per pixel. Use:
  const pixelAreaArcsec2 = (pixelSizeUm / focalRatio) ** 2 * (206.265 ** 2 / 1e6)
  // That simplifies: pixelScale = 206.265 * pixelSize_um / (focalRatio * aperture_mm)
  // Actually, this doesn't work without knowing focalLength independently.
  // Let's use the direct approach: for a typical f/5 scope with 4μm pixels at SQM 20:
  // ≈ 0.5 e/px/s. Scale from there.
  // Reference point: f/5, 4μm pixel, SQM 18.9 (Bortle 6) → ~2.0 e/px/s
  const refEps = 2.0 // e/px/s at f/5, 4μm, Bortle 6 (SQM 18.9)
  const refSqm = 18.9
  const refPixel = 4.0
  const refFR = 5.0
  const sqmFactor = Math.pow(10, (refSqm - sqm) / 2.5)
  const pixelFactor = (pixelSizeUm / refPixel) ** 2
  const frFactor = (refFR / focalRatio) ** 2
  return refEps * sqmFactor * pixelFactor * frFactor
}

/** Resolve Bortle class from options (bortle param > skySite > default 6). */
function resolveBortle(options: { bortle?: number | undefined; skySite?: SkySite | undefined }): number {
  if (options.bortle !== undefined) return Math.max(1, Math.min(9, Math.round(options.bortle)))
  if (options.skySite) return SKY_SITE_BORTLE[options.skySite] ?? 6
  return 6
}

/** Score framing quality 0–100 based on sensor fill percentage. */
function framingScore(fillPercent: number): number {
  if (fillPercent >= 50 && fillPercent <= 80) return 100
  if (fillPercent >= 30 && fillPercent < 50) return 60 + (fillPercent - 30) / 20 * 40
  if (fillPercent > 80 && fillPercent <= 100) return 60 + (100 - fillPercent) / 20 * 40
  if (fillPercent >= 10 && fillPercent < 30) return 20 + (fillPercent - 10) / 20 * 40
  if (fillPercent > 100 && fillPercent <= 150) return 20 + (150 - fillPercent) / 50 * 40
  if (fillPercent > 150) return 10
  return 0
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

  // ── Rig-Aware Session Planner ───────────────────────────────────────

  /**
   * Generate a capture plan for a specific rig and observer.
   *
   * Combines target discovery, framing analysis, observing-condition
   * scoring, and exposure guidance into a single result. Auto-discovers
   * targets that fit well in the rig's FOV, and optionally includes
   * explicit targets regardless of framing quality.
   *
   * Targets are scored by a weighted blend of observing conditions (60%)
   * and framing quality (40%), then sequenced by set-time-first strategy
   * (shoot western targets first).
   *
   * @param rig - The astrophotography rig (camera + optics + optional tracker).
   * @param observer - Observer location and date.
   * @param options - Planning constraints and target overrides.
   * @returns Complete capture plan with per-target framing, exposure, and scoring.
   *
   * @example
   * ```ts
   * import { Equipment, AstroPhoto } from '@motioncomplex/cosmos-lib'
   *
   * const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Sky-Watcher Esprit 100ED' })
   * const observer = { lat: 47.05, lng: 8.31, date: new Date('2024-08-15') }
   *
   * const plan = AstroPhoto.rigPlan(rig, observer)
   * for (const t of plan.targets) {
   *   console.log(`${t.name}: score ${t.score}, fills ${t.framing.fillPercent}% of sensor`)
   *   console.log(`  Image ${t.start.toLocaleTimeString()}–${t.end.toLocaleTimeString()}`)
   *   console.log(`  Max exposure: ${t.maxExposure}s, panels: ${t.framing.panels}`)
   * }
   * ```
   */
  rigPlan(rig: Rig, observer: ObserverParams, options: RigPlanOptions = {}): RigPlanResult | null {
    const {
      targets: explicitIds = [],
      autoLimit = 15,
      minFillPercent = 10,
      maxFillPercent = 150,
      minAltitude = 25,
      maxAirmass = 2.0,
      minMoonSeparation = 30,
      targetSNR = 25,
    } = options

    const bortleClass = resolveBortle(options)
    const date = observer.date ?? new Date()

    // Compute darkness window
    const tw = Sun.twilight({ ...observer, date })
    const dusk = tw.astronomicalDusk
    const nextTw = Sun.twilight({ ...observer, date: new Date(date.valueOf() + 86_400_000) })
    const dawn = nextTw.astronomicalDawn
    if (!dusk || !dawn) return null

    const darknessHours = (dawn.valueOf() - dusk.valueOf()) / 3_600_000

    // Flat frame window for calibration notes
    const ffWindow = AstroPhoto.flatFrameWindow({ ...observer, date })
    const flatWindow = ffWindow.evening ?? ffWindow.morning

    const moonPhase = Moon.phase(date)
    const moonPos = Moon.position(date)
    const moonEq: EquatorialCoord = { ra: moonPos.ra, dec: moonPos.dec }

    const fovWidthArcmin = rig.fov().width * 60

    // ── Auto-discover targets that fit the FOV ──
    const visible = Planner.whatsUp(observer, { minAltitude: 20, magnitudeLimit: 10, limit: 100 })
    const autoTargetIds = new Set<string>()

    for (const v of visible) {
      const size = v.object.size_arcmin ?? 0
      if (size === 0) continue // skip point sources for auto-discovery
      const fill = (size / fovWidthArcmin) * 100
      if (fill >= minFillPercent && fill <= maxFillPercent) {
        autoTargetIds.add(v.object.id)
      }
      if (autoTargetIds.size >= autoLimit) break
    }

    // ── Merge with explicit targets (explicit wins on collision) ──
    const explicitSet = new Set(explicitIds.map(id => id.toLowerCase()))
    const allTargetIds = new Map<string, 'auto' | 'explicit'>()

    for (const id of explicitSet) {
      allTargetIds.set(id, 'explicit')
    }
    for (const id of autoTargetIds) {
      if (!allTargetIds.has(id)) {
        allTargetIds.set(id, 'auto')
      }
    }

    // ── Score each target ──
    const results: RigPlanTarget[] = []

    for (const [targetId, source] of allTargetIds) {
      const obj = Data.get(targetId)
      if (!obj || obj.ra === null || obj.dec === null) continue

      const eq: EquatorialCoord = { ra: obj.ra, dec: obj.dec }

      // Sample altitude during darkness (every 15 min)
      let peakAlt = -90
      let transitDate = dusk
      let startDate: Date | null = null
      let endDate: Date | null = null
      let minAM = Infinity
      let maxAM = 0

      for (let t = dusk.valueOf(); t <= dawn.valueOf(); t += 900_000) {
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

      // Framing
      const fr = rig.framing(targetId)
      if (!fr) continue

      // Exposure guidance (declination-corrected)
      const maxExp = rig.maxExposure(observer, targetId)

      // ── Capture settings ──
      const focalRatio = rig.aperture ? Math.round(rig.focalLength / rig.aperture * 10) / 10 : 5
      const cam = rig.camera
      const readNoise = cam.readNoise ?? (cam.type === 'dedicated' ? 1.5 : cam.type === 'mirrorless' ? 3.0 : 3.5)
      const skyE = skyBrightness(bortleClass, cam.pixelSize, focalRatio)

      // Sub-exposure: sky-noise-dominated, capped at trailing limit
      const optimalSub = AstroPhoto.subExposure({ readNoise, skyBrightness: skyE })
      const subExp = Math.min(optimalSub, maxExp)

      // Estimate per-sub SNR and total integration
      const subSNR = Math.sqrt(skyE * subExp) / Math.sqrt(skyE * subExp + readNoise ** 2)
      // Scale: subSNR is the ratio of signal to total noise for one sub. For practical
      // purposes, use a simple model: SNR_sub ≈ sqrt(subExp * skyE) (sky-limited regime)
      const effectiveSubSNR = Math.max(1, Math.sqrt(subExp * skyE * 0.1)) // 0.1 = signal fraction vs sky
      const integration = AstroPhoto.totalIntegration({ subLength: subExp, subSNR: effectiveSubSNR, targetSNR })

      const iso = cam.recommendedISO ?? null
      const gain = cam.recommendedGain ?? null

      // Calibration frame notes
      const isoGainStr = iso ? `ISO ${iso}` : gain !== null ? `Gain ${gain}` : ''
      const capture: CaptureSettings = {
        focalRatio,
        iso,
        gain,
        subExposure: subExp,
        totalIntegration: integration.hours,
        subs: integration.subs,
        calibration: {
          darks: 30,
          flats: 30,
          bias: 50,
          darkNote: `Match ${subExp}s${isoGainStr ? ', ' + isoGainStr : ''}, same temperature`,
          flatNote: flatWindow
            ? `Shoot during twilight flat window (${flatWindow.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${flatWindow.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
            : 'Shoot during twilight or use an even light source',
        },
      }

      // Observing score (same formula as sessionPlan)
      const altScore = Math.min(peakAlt / 90, 1) * 40
      const amScore = (1 - Math.min(minAM - 1, 2) / 2) * 30
      const moonScore = (1 - moonInterference) * 30
      const observingScore = altScore + amScore + moonScore

      // Framing score
      const fScore = framingScore(fr.fillPercent)

      // Combined: 60% observing, 40% framing
      const score = Math.round(observingScore * 0.6 + fScore * 0.4)

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
        framing: fr,
        maxExposure: maxExp,
        capture,
        score,
        source,
      })
    }

    // Sort by set-time-first (shoot western targets first)
    results.sort((a, b) => a.end.valueOf() - b.end.valueOf())

    return {
      targets: results,
      darkness: { start: dusk, end: dawn },
      darknessHours: Math.round(darknessHours * 10) / 10,
      rig: {
        focalLength: rig.focalLength,
        fov: rig.fov(),
        pixelScale: rig.pixelScale(),
        isTracked: rig.isTracked,
      },
    }
  },
} as const
