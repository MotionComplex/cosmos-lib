import type { Camera } from './data/equipment/cameras.js'
import type { Telescope } from './data/equipment/telescopes.js'

// ── Types ────────────────────────────────────────────────────────────────────

/** Raw Astrobin camera result. */
export interface AstrobinCamera {
  /** Astrobin resource URI. */
  id: string
  /** Brand name. */
  make: string
  /** Model name. */
  name: string
  /** Whether it's been modified for astrophotography. */
  modified: boolean
  /** Camera type on Astrobin. */
  type: string
}

/** Raw Astrobin telescope result. */
export interface AstrobinTelescope {
  /** Astrobin resource URI. */
  id: string
  /** Brand name. */
  make: string
  /** Model name. */
  name: string
  /** Telescope type on Astrobin. */
  type: string
  /** Aperture in mm (may be null). */
  aperture: number | null
  /** Focal length in mm (may be null). */
  min_focal_length: number | null
  /** Max focal length for zoom scopes (may be null). */
  max_focal_length: number | null
}

/** Options for Astrobin equipment search. */
export interface AstrobinSearchOptions {
  /** Maximum results to return. @defaultValue `20` */
  limit?: number
}

// ── API Client ───────────────────────────────────────────────────────────────

const BASE = 'https://www.astrobin.com/api/v1'

let _apiKey = ''
let _apiSecret = ''

/**
 * Astrobin equipment search API.
 *
 * Search the Astrobin community database for cameras, telescopes, and
 * other astrophotography equipment. Results can be converted to cosmos-lib
 * equipment types for use with {@link Equipment.rig}.
 *
 * @remarks
 * Requires an Astrobin API key and secret. Get them at
 * {@link https://www.astrobin.com/api/request-key/}. Without keys,
 * search requests will fail with 401.
 *
 * @example
 * ```ts
 * import { Astrobin } from '@motioncomplex/cosmos-lib'
 *
 * Astrobin.setCredentials('your-api-key', 'your-api-secret')
 *
 * const cameras = await Astrobin.searchCameras('ASI2600')
 * const scopes = await Astrobin.searchTelescopes('Esprit')
 *
 * // Convert to cosmos-lib Camera for use with Equipment.rig()
 * const cam = Astrobin.toCamera(cameras[0], { pixelSize: 3.76, sensorWidth: 23.5, sensorHeight: 15.7 })
 * ```
 */
export const Astrobin = {
  /**
   * Set Astrobin API credentials.
   *
   * @param apiKey - Your Astrobin API key.
   * @param apiSecret - Your Astrobin API secret.
   */
  setCredentials(apiKey: string, apiSecret: string): void {
    _apiKey = apiKey
    _apiSecret = apiSecret
  },

  /**
   * Search for cameras on Astrobin.
   *
   * @param query - Search query (brand, model name, etc.).
   * @param options - Search options.
   * @returns Array of matching cameras.
   *
   * @example
   * ```ts
   * const results = await Astrobin.searchCameras('ZWO ASI')
   * results.forEach(c => console.log(c.make, c.name))
   * ```
   */
  async searchCameras(query: string, options: AstrobinSearchOptions = {}): Promise<AstrobinCamera[]> {
    const { limit = 20 } = options
    const url = `${BASE}/camera/?format=json&name__icontains=${encodeURIComponent(query)}&limit=${limit}&api_key=${_apiKey}&api_secret=${_apiSecret}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Astrobin API error: ${res.status} ${res.statusText}`)
    const data = await res.json()
    return (data.objects ?? []).map((obj: any) => ({
      id: obj.resource_uri ?? '',
      make: obj.make ?? '',
      name: obj.name ?? '',
      modified: obj.modified ?? false,
      type: obj.type ?? '',
    }))
  },

  /**
   * Search for telescopes on Astrobin.
   *
   * @param query - Search query (brand, model name, etc.).
   * @param options - Search options.
   * @returns Array of matching telescopes.
   *
   * @example
   * ```ts
   * const results = await Astrobin.searchTelescopes('Celestron C8')
   * results.forEach(t => console.log(t.make, t.name, t.aperture))
   * ```
   */
  async searchTelescopes(query: string, options: AstrobinSearchOptions = {}): Promise<AstrobinTelescope[]> {
    const { limit = 20 } = options
    const url = `${BASE}/telescope/?format=json&name__icontains=${encodeURIComponent(query)}&limit=${limit}&api_key=${_apiKey}&api_secret=${_apiSecret}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Astrobin API error: ${res.status} ${res.statusText}`)
    const data = await res.json()
    return (data.objects ?? []).map((obj: any) => ({
      id: obj.resource_uri ?? '',
      make: obj.make ?? '',
      name: obj.name ?? '',
      type: obj.type ?? '',
      aperture: obj.aperture ?? null,
      min_focal_length: obj.min_focal_length ?? null,
      max_focal_length: obj.max_focal_length ?? null,
    }))
  },

  /**
   * Convert an Astrobin camera result to a cosmos-lib Camera.
   *
   * Astrobin doesn't store sensor dimensions or pixel size, so you must
   * provide them. Use this when you find a camera on Astrobin and want
   * to use it with `Equipment.rig()`.
   *
   * @param astrobinCamera - The Astrobin camera result.
   * @param specs - Sensor specs not available from Astrobin.
   * @returns A Camera object compatible with `Equipment.rig()`.
   *
   * @example
   * ```ts
   * const results = await Astrobin.searchCameras('ASI2600')
   * const cam = Astrobin.toCamera(results[0], {
   *   sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176
   * })
   * const rig = Equipment.rig({ camera: cam, telescope: 'Celestron C8' })
   * ```
   */
  toCamera(
    astrobinCamera: AstrobinCamera,
    specs: { sensorWidth: number; sensorHeight: number; pixelSize: number; pixelsX?: number; pixelsY?: number },
  ): Camera {
    const pixelsX = specs.pixelsX ?? Math.round(specs.sensorWidth * 1000 / specs.pixelSize)
    const pixelsY = specs.pixelsY ?? Math.round(specs.sensorHeight * 1000 / specs.pixelSize)
    return {
      id: `astrobin-${astrobinCamera.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: `${astrobinCamera.make} ${astrobinCamera.name}`.trim(),
      brand: astrobinCamera.make,
      type: astrobinCamera.modified ? 'dedicated' : 'mirrorless',
      sensorWidth: specs.sensorWidth,
      sensorHeight: specs.sensorHeight,
      pixelSize: specs.pixelSize,
      pixelsX,
      pixelsY,
      astroModified: astrobinCamera.modified || undefined,
    }
  },

  /**
   * Convert an Astrobin telescope result to a cosmos-lib Telescope.
   *
   * Astrobin usually provides aperture and focal length.
   *
   * @param astrobinTelescope - The Astrobin telescope result.
   * @param overrides - Override aperture/focal length if Astrobin data is missing.
   * @returns A Telescope object compatible with `Equipment.rig()`.
   *
   * @example
   * ```ts
   * const results = await Astrobin.searchTelescopes('Esprit 100')
   * const scope = Astrobin.toTelescope(results[0])
   * const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: scope })
   * ```
   */
  toTelescope(
    astrobinTelescope: AstrobinTelescope,
    overrides?: { aperture?: number; focalLength?: number },
  ): Telescope {
    const aperture = overrides?.aperture ?? astrobinTelescope.aperture ?? 100
    const focalLength = overrides?.focalLength ?? astrobinTelescope.min_focal_length ?? 500
    const focalRatio = Math.round((focalLength / aperture) * 10) / 10

    const typeMap: Record<string, Telescope['type']> = {
      'refractor': 'refractor',
      'reflector': 'reflector',
      'catadioptric': 'sct',
      'camera_lens': 'refractor',
    }

    return {
      id: `astrobin-${astrobinTelescope.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: `${astrobinTelescope.make} ${astrobinTelescope.name}`.trim(),
      brand: astrobinTelescope.make,
      type: typeMap[astrobinTelescope.type] ?? 'refractor',
      aperture,
      focalLength,
      focalRatio,
    }
  },
} as const
