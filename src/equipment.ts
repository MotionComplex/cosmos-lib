import { AstroMath } from './math.js'
import { Data } from './data/index.js'
import { Planner } from './planner.js'
import { CAMERAS } from './data/equipment/cameras.js'
import { TELESCOPES } from './data/equipment/telescopes.js'
import { LENSES } from './data/equipment/lenses.js'
import { TRACKERS } from './data/equipment/trackers.js'
import type { Camera } from './data/equipment/cameras.js'
import type { Telescope } from './data/equipment/telescopes.js'
import type { Lens } from './data/equipment/lenses.js'
import type { Tracker } from './data/equipment/trackers.js'
import type { ObserverParams } from './types.js'
import type { VisibleObject } from './planner.js'

// Re-export types
export type { Camera } from './data/equipment/cameras.js'
export type { Telescope } from './data/equipment/telescopes.js'
export type { Lens } from './data/equipment/lenses.js'
export type { Tracker } from './data/equipment/trackers.js'

// ── Types ────────────────────────────────────────────────────────────────────

/** Field of view in degrees. */
export interface FOV {
  /** Horizontal FOV in degrees. */
  width: number
  /** Vertical FOV in degrees. */
  height: number
  /** Diagonal FOV in degrees. */
  diagonal: number
}

/** Framing analysis for a specific object. */
export interface FramingResult {
  /** How much of the sensor the object fills (percentage). >100 means object is larger than FOV. */
  fillPercent: number
  /** Whether the object fits within the FOV. */
  fits: boolean
  /** Best orientation for fitting the object. */
  orientation: 'landscape' | 'portrait' | 'either'
  /** Number of mosaic panels needed if the object doesn't fit (with 20% overlap). */
  panels: number
  /** Object angular size in arcminutes. */
  objectSize: number
  /** FOV width in arcminutes. */
  fovWidth: number
}

/** Sampling advice based on pixel scale vs. seeing. */
export interface SamplingAdvice {
  /** Pixel scale in arcseconds per pixel. */
  pixelScale: number
  /** Seeing value used for comparison (arcseconds). */
  seeing: number
  /** Whether the setup is oversampled, undersampled, or well-matched. */
  status: 'oversampled' | 'undersampled' | 'optimal'
  /** Human-readable advice. */
  advice: string
}

/** Options for rig creation. */
export interface RigOptions {
  /** Camera name (looked up from database) or Camera object. */
  camera: string | Camera
  /** Telescope name (looked up from database) or Telescope object. */
  telescope?: string | Telescope | undefined
  /** Lens name (looked up from database) or Lens object. */
  lens?: string | Lens | undefined
  /** Tracker/mount name (looked up from database) or Tracker object. */
  tracker?: string | Tracker | undefined
  /** Barlow/reducer multiplier (e.g. 2.0 for 2x Barlow, 0.63 for focal reducer). */
  barlow?: number | undefined
  /** Custom focal length in mm (used when no telescope or lens is specified). */
  focalLength?: number | undefined
  /** Custom aperture in mm. */
  aperture?: number | undefined
}

// ── Rig class ────────────────────────────────────────────────────────────────

/**
 * An astrophotography rig — a camera paired with optics.
 *
 * Provides FOV, pixel scale, framing analysis, exposure calculation,
 * target recommendations, and sampling advice.
 *
 * @example
 * ```ts
 * const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
 * console.log(rig.fov())         // { width: 0.60°, height: 0.40° }
 * console.log(rig.pixelScale())  // 0.60 arcsec/px
 * console.log(rig.framing('m42')) // { fillPercent: 140, fits: false, panels: 2 }
 * ```
 */
export class Rig {
  /** The camera. */
  readonly camera: Camera
  /** Effective focal length in mm (after barlow/reducer). */
  readonly focalLength: number
  /** Aperture in mm (if known). */
  readonly aperture: number | null
  /** Barlow/reducer multiplier applied. */
  readonly barlowFactor: number
  /** The tracker/mount, if specified. */
  readonly tracker: Tracker | null

  constructor(camera: Camera, focalLength: number, aperture: number | null, barlowFactor: number, tracker: Tracker | null = null) {
    this.camera = camera
    this.focalLength = focalLength * barlowFactor
    this.aperture = aperture
    this.barlowFactor = barlowFactor
    this.tracker = tracker
  }

  /**
   * Field of view in degrees.
   */
  fov(): FOV {
    const width = 2 * Math.atan(this.camera.sensorWidth / (2 * this.focalLength)) * 180 / Math.PI
    const height = 2 * Math.atan(this.camera.sensorHeight / (2 * this.focalLength)) * 180 / Math.PI
    const diag = Math.sqrt(this.camera.sensorWidth ** 2 + this.camera.sensorHeight ** 2)
    const diagonal = 2 * Math.atan(diag / (2 * this.focalLength)) * 180 / Math.PI
    return { width, height, diagonal }
  }

  /**
   * Pixel scale in arcseconds per pixel.
   */
  pixelScale(): number {
    return (this.camera.pixelSize / this.focalLength) * 206.265
  }

  /**
   * Framing analysis for a catalog object.
   *
   * @param objectId - Catalog object ID (e.g. `'m42'`, `'m31'`).
   * @param overlapPercent - Mosaic overlap percentage. @defaultValue `20`
   */
  framing(objectId: string, overlapPercent = 20): FramingResult | null {
    const obj = Data.get(objectId)
    if (!obj) return null

    const sizArcmin = obj.size_arcmin ?? 0
    if (sizArcmin === 0) {
      // Point source — always fits
      return { fillPercent: 0, fits: true, orientation: 'either', panels: 1, objectSize: 0, fovWidth: this.fov().width * 60 }
    }

    const fovDeg = this.fov()
    const fovWidthArcmin = fovDeg.width * 60
    const fovHeightArcmin = fovDeg.height * 60

    const fillLandscape = (sizArcmin / fovWidthArcmin) * 100
    const fillPortrait = (sizArcmin / fovHeightArcmin) * 100
    const bestFill = Math.min(fillLandscape, fillPortrait)
    const fits = bestFill <= 100

    const orientation: 'landscape' | 'portrait' | 'either' =
      Math.abs(fillLandscape - fillPortrait) < 5 ? 'either' :
      fillLandscape < fillPortrait ? 'landscape' : 'portrait'

    // Mosaic panels (assumes square-ish panels with overlap)
    let panels = 1
    if (!fits) {
      const effectiveWidth = fovWidthArcmin * (1 - overlapPercent / 100)
      const effectiveHeight = fovHeightArcmin * (1 - overlapPercent / 100)
      const nx = Math.ceil(sizArcmin / effectiveWidth)
      const ny = Math.ceil(sizArcmin / effectiveHeight)
      panels = nx * ny
    }

    return { fillPercent: Math.round(bestFill), fits, orientation, panels, objectSize: sizArcmin, fovWidth: fovWidthArcmin }
  }

  /**
   * Maximum exposure time before star trails.
   *
   * **Without tracker:** Uses the NPF formula (untracked).
   * **With tracker:** Scales the tracker's reference max exposure by
   * focal length ratio, giving a practical tracked exposure limit.
   *
   * @param observer - Observer location (used for declination correction if objectId provided).
   * @param objectId - Optional target — adjusts for declination.
   */
  maxExposure(observer?: ObserverParams, objectId?: string): number {
    let maxSec: number

    if (this.tracker && this.tracker.maxUnguidedExposure && this.tracker.referenceFocalLength) {
      // Tracked: scale reference exposure by focal length ratio
      // Longer focal length = shorter max exposure (tracking errors magnified)
      maxSec = this.tracker.maxUnguidedExposure * (this.tracker.referenceFocalLength / this.focalLength)
    } else {
      // Untracked: NPF rule
      const aperture = this.aperture ?? this.focalLength / 5
      const pixelPitch = this.camera.pixelSize
      maxSec = (35 * aperture + 30 * pixelPitch) / this.focalLength
    }

    // Declination correction — stars near poles trail slower
    if (objectId && observer) {
      const obj = Data.get(objectId)
      if (obj && obj.dec !== null) {
        const cosDec = Math.cos(obj.dec * Math.PI / 180)
        if (cosDec > 0.01) maxSec /= cosDec
      }
    }

    return Math.round(maxSec * 10) / 10
  }

  /**
   * Check if the tracker can handle this rig's payload.
   *
   * Estimates the camera + optics weight and compares to the tracker's
   * max payload capacity. Returns null if no tracker is set.
   *
   * @param opticsWeightKg - Weight of telescope/lens in kg. Estimated if not provided.
   */
  payloadCheck(opticsWeightKg?: number): { withinLimits: boolean; estimatedPayloadKg: number; maxPayloadKg: number; headroomPercent: number } | null {
    if (!this.tracker) return null

    // Rough weight estimates if not provided
    const cameraWeightKg = this.camera.type === 'dedicated' ? 0.5 : 0.8
    const optics = opticsWeightKg ?? (this.focalLength > 500 ? 4.0 : this.focalLength > 200 ? 2.0 : 1.0)
    const totalKg = Math.round((cameraWeightKg + optics) * 10) / 10

    const headroom = Math.round(((this.tracker.maxPayloadKg - totalKg) / this.tracker.maxPayloadKg) * 100)

    return {
      withinLimits: totalKg <= this.tracker.maxPayloadKg,
      estimatedPayloadKg: totalKg,
      maxPayloadKg: this.tracker.maxPayloadKg,
      headroomPercent: Math.max(0, headroom),
    }
  }

  /**
   * Whether this rig is tracked (has a tracker/mount).
   */
  get isTracked(): boolean {
    return this.tracker !== null
  }

  /**
   * Best targets visible tonight that fit well in this rig's FOV.
   *
   * Returns objects where `size_arcmin` is between 10% and 100% of the
   * FOV width — well-framed, not too small, not too large.
   *
   * @param observer - Observer location and time.
   * @param limit - Max results. @defaultValue `10`
   */
  bestTargets(observer: ObserverParams, limit = 10): Array<VisibleObject & { framing: FramingResult }> {
    const visible = Planner.whatsUp(observer, { minAltitude: 20, magnitudeLimit: 10, limit: 50 })
    const fovWidthArcmin = this.fov().width * 60

    return visible
      .filter(v => {
        const size = v.object.size_arcmin ?? 0
        if (size === 0) return false // skip point sources for "best targets"
        const fill = (size / fovWidthArcmin) * 100
        return fill >= 10 && fill <= 150 // well-framed range
      })
      .map(v => ({
        ...v,
        framing: this.framing(v.object.id)!,
      }))
      .sort((a, b) => {
        // Prefer objects closer to 50-80% fill
        const scoreA = Math.abs(a.framing.fillPercent - 65)
        const scoreB = Math.abs(b.framing.fillPercent - 65)
        return scoreA - scoreB
      })
      .slice(0, limit)
  }

  /**
   * Effective resolution and comparison to typical seeing.
   */
  resolution(): { pixelScale: number; dawesLimit: number; raleighLimit: number } {
    const ps = this.pixelScale()
    const apertureMM = this.aperture ?? this.focalLength / 5
    const dawes = 116.0 / apertureMM // Dawes limit in arcseconds
    const raleigh = 138.4 / apertureMM // Rayleigh limit in arcseconds
    return { pixelScale: ps, dawesLimit: dawes, raleighLimit: raleigh }
  }

  /**
   * Sampling advice — is this setup oversampled, undersampled, or optimal?
   *
   * @param seeing - Typical seeing in arcseconds. @defaultValue `2.5`
   */
  samplingAdvice(seeing = 2.5): SamplingAdvice {
    const ps = this.pixelScale()
    const ratio = ps / seeing

    let status: SamplingAdvice['status']
    let advice: string

    if (ratio < 0.3) {
      status = 'oversampled'
      advice = `Heavily oversampled (${ps.toFixed(2)}"/px vs ${seeing}" seeing). Consider binning 2×2 or using a shorter focal length.`
    } else if (ratio < 0.5) {
      status = 'oversampled'
      advice = `Slightly oversampled (${ps.toFixed(2)}"/px vs ${seeing}" seeing). Good for lucky imaging, may benefit from 2×2 binning for faint targets.`
    } else if (ratio <= 1.0) {
      status = 'optimal'
      advice = `Well-matched to seeing (${ps.toFixed(2)}"/px vs ${seeing}" seeing). Optimal Nyquist sampling.`
    } else if (ratio <= 2.0) {
      status = 'undersampled'
      advice = `Slightly undersampled (${ps.toFixed(2)}"/px vs ${seeing}" seeing). Fine for wide-field, may lose fine detail.`
    } else {
      status = 'undersampled'
      advice = `Undersampled (${ps.toFixed(2)}"/px vs ${seeing}" seeing). Good for wide-field mosaics, not ideal for small targets.`
    }

    return { pixelScale: ps, seeing, status, advice }
  }
}

// ── Equipment module ─────────────────────────────────────────────────────────

/**
 * Equipment database and rig builder for astrophotography.
 *
 * Browse cameras, telescopes, and lenses, then combine them into a
 * {@link Rig} that computes FOV, pixel scale, framing, exposure limits,
 * and target recommendations.
 *
 * @example
 * ```ts
 * import { Equipment } from '@motioncomplex/cosmos-lib'
 *
 * // Browse the database
 * const cameras = Equipment.cameras()
 * const sony = Equipment.camera('Sony A7 III')
 *
 * // Build a rig
 * const rig = Equipment.rig({ camera: 'ZWO ASI2600MC Pro', telescope: 'Sky-Watcher Esprit 100ED' })
 * console.log(rig.fov())        // { width: 2.45°, height: 1.63° }
 * console.log(rig.pixelScale()) // 1.41 arcsec/px
 *
 * // With a reducer
 * const rig2 = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8', barlow: 0.63 })
 * ```
 */
export const Equipment = {
  /**
   * Get all cameras in the database.
   */
  cameras(): readonly Camera[] {
    return CAMERAS
  },

  /**
   * Look up a camera by name (case-insensitive partial match).
   */
  camera(name: string): Camera | null {
    const q = name.toLowerCase()
    return CAMERAS.find(c => c.name.toLowerCase() === q || c.id === q)
      ?? CAMERAS.find(c => c.name.toLowerCase().includes(q))
      ?? null
  },

  /**
   * Get all telescopes in the database.
   */
  telescopes(): readonly Telescope[] {
    return TELESCOPES
  },

  /**
   * Look up a telescope by name (case-insensitive partial match).
   */
  telescope(name: string): Telescope | null {
    const q = name.toLowerCase()
    return TELESCOPES.find(t => t.name.toLowerCase() === q || t.id === q)
      ?? TELESCOPES.find(t => t.name.toLowerCase().includes(q))
      ?? null
  },

  /**
   * Get all lenses in the database.
   */
  lenses(): readonly Lens[] {
    return LENSES
  },

  /**
   * Look up a lens by name (case-insensitive partial match).
   */
  lens(name: string): Lens | null {
    const q = name.toLowerCase()
    return LENSES.find(l => l.name.toLowerCase() === q || l.id === q)
      ?? LENSES.find(l => l.name.toLowerCase().includes(q))
      ?? null
  },

  /**
   * Get all trackers/mounts in the database.
   */
  trackers(): readonly Tracker[] {
    return TRACKERS
  },

  /**
   * Look up a tracker/mount by name (case-insensitive partial match).
   */
  tracker(name: string): Tracker | null {
    const q = name.toLowerCase()
    return TRACKERS.find(t => t.name.toLowerCase() === q || t.id === q)
      ?? TRACKERS.find(t => t.name.toLowerCase().includes(q))
      ?? null
  },

  /**
   * Build an astrophotography rig from equipment names or specs.
   *
   * @example
   * ```ts
   * // From database names
   * const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
   *
   * // With a focal reducer
   * const rig2 = Equipment.rig({ camera: 'ZWO ASI294MC Pro', telescope: 'Sky-Watcher 200PDS', barlow: 0.73 })
   *
   * // Camera + lens
   * const rig3 = Equipment.rig({ camera: 'Canon EOS Ra', lens: 'Canon EF 135mm f/2L USM' })
   *
   * // Custom specs
   * const rig4 = Equipment.rig({
   *   camera: { id: 'custom', name: 'My Camera', brand: 'Custom', type: 'dedicated',
   *     sensorWidth: 17.6, sensorHeight: 13.2, pixelSize: 3.8, pixelsX: 4656, pixelsY: 3520 },
   *   focalLength: 530,
   *   aperture: 100,
   * })
   * ```
   */
  rig(options: RigOptions): Rig {
    // Resolve camera
    const camera = typeof options.camera === 'string'
      ? this.camera(options.camera)
      : options.camera
    if (!camera) throw new Error(`Camera not found: ${options.camera}`)

    // Resolve optics
    let focalLength: number
    let aperture: number | null = options.aperture ?? null

    if (options.telescope) {
      const scope = typeof options.telescope === 'string'
        ? this.telescope(options.telescope)
        : options.telescope
      if (!scope) throw new Error(`Telescope not found: ${options.telescope}`)
      focalLength = scope.focalLength
      aperture = scope.aperture
    } else if (options.lens) {
      const lens = typeof options.lens === 'string'
        ? this.lens(options.lens)
        : options.lens
      if (!lens) throw new Error(`Lens not found: ${options.lens}`)
      focalLength = lens.focalLength
      aperture = lens.maxAperture
    } else if (options.focalLength) {
      focalLength = options.focalLength
    } else {
      throw new Error('Must provide telescope, lens, or focalLength')
    }

    // Resolve tracker
    let tracker: Tracker | null = null
    if (options.tracker) {
      tracker = typeof options.tracker === 'string'
        ? this.tracker(options.tracker)
        : options.tracker
      if (!tracker) throw new Error(`Tracker not found: ${options.tracker}`)
    }

    return new Rig(camera, focalLength, aperture, options.barlow ?? 1, tracker)
  },

  /**
   * Search all equipment (cameras, telescopes, lenses) by name.
   *
   * Returns a unified list of matches across all categories, scored
   * by relevance. Useful for a single search bar UI.
   *
   * @param query - Search query (case-insensitive partial match).
   * @param limit - Max results. @defaultValue `20`
   * @returns Matches with category label and the equipment object.
   *
   * @example
   * ```ts
   * const results = Equipment.search('ASI')
   * // => [{ category: 'camera', name: 'ZWO ASI2600MC Pro', item: Camera }, ...]
   *
   * const results2 = Equipment.search('200mm')
   * // => cameras, telescopes, AND lenses matching "200mm"
   * ```
   */
  search(query: string, limit = 20): Array<{ category: 'camera' | 'telescope' | 'lens' | 'tracker'; name: string; item: Camera | Telescope | Lens | Tracker }> {
    const q = query.toLowerCase()
    if (!q) return []

    const results: Array<{ category: 'camera' | 'telescope' | 'lens' | 'tracker'; name: string; item: Camera | Telescope | Lens | Tracker; score: number }> = []

    for (const c of CAMERAS) {
      const name = `${c.brand} ${c.name}`.toLowerCase()
      let score = 0
      if (name === q) score = 100
      else if (name.startsWith(q)) score = 60
      else if (name.includes(q)) score = 30
      else if (c.id.includes(q)) score = 20
      if (score > 0) results.push({ category: 'camera', name: `${c.brand} ${c.name}`, item: c, score })
    }

    for (const t of TELESCOPES) {
      const name = `${t.brand} ${t.name}`.toLowerCase()
      let score = 0
      if (name === q) score = 100
      else if (name.startsWith(q)) score = 60
      else if (name.includes(q)) score = 30
      else if (t.id.includes(q)) score = 20
      if (score > 0) results.push({ category: 'telescope', name: `${t.brand} ${t.name}`, item: t, score })
    }

    for (const l of LENSES) {
      const name = `${l.brand} ${l.name}`.toLowerCase()
      let score = 0
      if (name === q) score = 100
      else if (name.startsWith(q)) score = 60
      else if (name.includes(q)) score = 30
      else if (l.id.includes(q)) score = 20
      if (score > 0) results.push({ category: 'lens', name: `${l.brand} ${l.name}`, item: l, score })
    }

    for (const tr of TRACKERS) {
      const name = `${tr.brand} ${tr.name}`.toLowerCase()
      let score = 0
      if (name === q) score = 100
      else if (name.startsWith(q)) score = 60
      else if (name.includes(q)) score = 30
      else if (tr.id.includes(q)) score = 20
      if (score > 0) results.push({ category: 'tracker', name: `${tr.brand} ${tr.name}`, item: tr, score })
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ category, name, item }) => ({ category, name, item }))
  },
} as const
