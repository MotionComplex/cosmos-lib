/**
 * Star tracker / mount database — popular portable tracking mounts.
 *
 * Covers star trackers, portable EQ mounts, and GoTo mounts used
 * for tracked astrophotography.
 *
 * @module
 */

/** A star tracker or tracking mount. */
export interface Tracker {
  /** Unique identifier (slugified name). */
  id: string
  /** Display name. */
  name: string
  /** Manufacturer. */
  brand: string
  /** Mount type. */
  type: 'star-tracker' | 'eq-mount' | 'goto-mount' | 'alt-az-tracker'
  /** Maximum payload capacity in kg (excluding counterweights). */
  maxPayloadKg: number
  /** Periodic error in arcseconds (peak-to-peak, if known). Lower is better. */
  periodicError?: number | undefined
  /** Whether the tracker has autoguiding support. */
  autoguide: boolean
  /** Whether GoTo / object finding is supported. */
  goto: boolean
  /** Practical max unguided exposure in seconds at a given focal length reference. */
  maxUnguidedExposure?: number | undefined
  /** Reference focal length in mm for maxUnguidedExposure. */
  referenceFocalLength?: number | undefined
}

export const TRACKERS: readonly Tracker[] = [
  // Star trackers (lightweight, portable)
  { id: 'ioptron-skyguider-pro', name: 'iOptron SkyGuider Pro', brand: 'iOptron', type: 'star-tracker', maxPayloadKg: 5.0, periodicError: 10, autoguide: true, goto: false, maxUnguidedExposure: 120, referenceFocalLength: 200 },
  { id: 'ioptron-skytracker-pro', name: 'iOptron SkyTracker Pro', brand: 'iOptron', type: 'star-tracker', maxPayloadKg: 3.0, periodicError: 25, autoguide: false, goto: false, maxUnguidedExposure: 60, referenceFocalLength: 200 },
  { id: 'sw-star-adventurer-gti', name: 'Sky-Watcher Star Adventurer GTi', brand: 'Sky-Watcher', type: 'star-tracker', maxPayloadKg: 5.0, periodicError: 10, autoguide: true, goto: true, maxUnguidedExposure: 120, referenceFocalLength: 200 },
  { id: 'sw-star-adventurer-2i', name: 'Sky-Watcher Star Adventurer 2i', brand: 'Sky-Watcher', type: 'star-tracker', maxPayloadKg: 5.0, periodicError: 12, autoguide: true, goto: false, maxUnguidedExposure: 90, referenceFocalLength: 200 },
  { id: 'sw-star-adventurer-mini', name: 'Sky-Watcher Star Adventurer Mini', brand: 'Sky-Watcher', type: 'star-tracker', maxPayloadKg: 3.0, periodicError: 20, autoguide: false, goto: false, maxUnguidedExposure: 30, referenceFocalLength: 135 },
  { id: 'move-shoot-move', name: 'Move Shoot Move Rotator', brand: 'Move Shoot Move', type: 'star-tracker', maxPayloadKg: 3.0, periodicError: 30, autoguide: false, goto: false, maxUnguidedExposure: 30, referenceFocalLength: 50 },
  { id: 'benro-polaris', name: 'Benro Polaris', brand: 'Benro', type: 'star-tracker', maxPayloadKg: 5.0, periodicError: 15, autoguide: false, goto: true, maxUnguidedExposure: 90, referenceFocalLength: 200 },
  { id: 'vixen-polarie-u', name: 'Vixen Polarie U', brand: 'Vixen', type: 'star-tracker', maxPayloadKg: 3.5, periodicError: 15, autoguide: false, goto: false, maxUnguidedExposure: 60, referenceFocalLength: 100 },

  // Portable EQ mounts
  { id: 'ioptron-cem26', name: 'iOptron CEM26', brand: 'iOptron', type: 'eq-mount', maxPayloadKg: 12.7, periodicError: 8, autoguide: true, goto: true, maxUnguidedExposure: 180, referenceFocalLength: 500 },
  { id: 'ioptron-gem28', name: 'iOptron GEM28', brand: 'iOptron', type: 'eq-mount', maxPayloadKg: 12.7, periodicError: 10, autoguide: true, goto: true, maxUnguidedExposure: 120, referenceFocalLength: 500 },
  { id: 'sw-heq5', name: 'Sky-Watcher HEQ5 Pro', brand: 'Sky-Watcher', type: 'eq-mount', maxPayloadKg: 13.6, periodicError: 8, autoguide: true, goto: true, maxUnguidedExposure: 120, referenceFocalLength: 750 },
  { id: 'sw-eq6r-pro', name: 'Sky-Watcher EQ6-R Pro', brand: 'Sky-Watcher', type: 'eq-mount', maxPayloadKg: 20.4, periodicError: 6, autoguide: true, goto: true, maxUnguidedExposure: 180, referenceFocalLength: 1000 },
  { id: 'sw-az-gti', name: 'Sky-Watcher AZ-GTi', brand: 'Sky-Watcher', type: 'alt-az-tracker', maxPayloadKg: 5.0, periodicError: 20, autoguide: false, goto: true, maxUnguidedExposure: 30, referenceFocalLength: 200 },
  { id: 'celestron-avx', name: 'Celestron Advanced VX', brand: 'Celestron', type: 'eq-mount', maxPayloadKg: 13.6, periodicError: 12, autoguide: true, goto: true, maxUnguidedExposure: 90, referenceFocalLength: 750 },
  { id: 'celestron-cgx', name: 'Celestron CGX', brand: 'Celestron', type: 'eq-mount', maxPayloadKg: 24.9, periodicError: 8, autoguide: true, goto: true, maxUnguidedExposure: 180, referenceFocalLength: 1000 },

  // Premium mounts
  { id: 'ioptron-cem70', name: 'iOptron CEM70', brand: 'iOptron', type: 'eq-mount', maxPayloadKg: 31.8, periodicError: 5, autoguide: true, goto: true, maxUnguidedExposure: 300, referenceFocalLength: 1000 },
  { id: 'sw-eq8r-pro', name: 'Sky-Watcher EQ8-R Pro', brand: 'Sky-Watcher', type: 'eq-mount', maxPayloadKg: 50.0, periodicError: 5, autoguide: true, goto: true, maxUnguidedExposure: 300, referenceFocalLength: 2000 },
  { id: 'rainbow-rsth', name: 'Rainbow Astro RST-135', brand: 'Rainbow Astro', type: 'eq-mount', maxPayloadKg: 13.0, periodicError: 3, autoguide: true, goto: true, maxUnguidedExposure: 300, referenceFocalLength: 1000 },
  { id: 'zwo-am5', name: 'ZWO AM5', brand: 'ZWO', type: 'eq-mount', maxPayloadKg: 13.0, periodicError: 5, autoguide: true, goto: true, maxUnguidedExposure: 300, referenceFocalLength: 1000 },
  { id: 'zwo-am3', name: 'ZWO AM3', brand: 'ZWO', type: 'eq-mount', maxPayloadKg: 9.0, periodicError: 7, autoguide: true, goto: true, maxUnguidedExposure: 180, referenceFocalLength: 500 },
] as const
