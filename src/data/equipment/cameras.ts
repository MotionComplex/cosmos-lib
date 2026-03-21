/**
 * Camera database — popular astrophotography cameras.
 *
 * Covers DSLR, mirrorless, and dedicated astronomy cameras from Canon, Nikon,
 * Sony, ZWO, QHY, and others. Sensor dimensions in mm, pixel size in μm.
 *
 * @module
 */

/** A camera body with sensor specifications. */
export interface Camera {
  /** Unique identifier (slugified name). */
  id: string
  /** Display name. */
  name: string
  /** Manufacturer. */
  brand: string
  /** Camera type. */
  type: 'dslr' | 'mirrorless' | 'dedicated' | 'ccd'
  /** Sensor width in mm. */
  sensorWidth: number
  /** Sensor height in mm. */
  sensorHeight: number
  /** Pixel size in μm (micrometers). */
  pixelSize: number
  /** Horizontal pixel count. */
  pixelsX: number
  /** Vertical pixel count. */
  pixelsY: number
  /** Whether the IR-cut filter is modified/removed for Ha sensitivity. */
  astroModified?: boolean | undefined
}

export const CAMERAS: readonly Camera[] = [
  // Canon DSLR
  { id: 'canon-6d-mk2', name: 'Canon EOS 6D Mark II', brand: 'Canon', type: 'dslr', sensorWidth: 35.9, sensorHeight: 24.0, pixelSize: 5.73, pixelsX: 6240, pixelsY: 4160 },
  { id: 'canon-5d-mk4', name: 'Canon EOS 5D Mark IV', brand: 'Canon', type: 'dslr', sensorWidth: 36.0, sensorHeight: 24.0, pixelSize: 5.36, pixelsX: 6720, pixelsY: 4480 },
  { id: 'canon-80d', name: 'Canon EOS 80D', brand: 'Canon', type: 'dslr', sensorWidth: 22.5, sensorHeight: 15.0, pixelSize: 3.72, pixelsX: 6000, pixelsY: 4000 },
  { id: 'canon-t7i', name: 'Canon EOS Rebel T7i', brand: 'Canon', type: 'dslr', sensorWidth: 22.3, sensorHeight: 14.9, pixelSize: 3.72, pixelsX: 6000, pixelsY: 4000 },
  // Canon Mirrorless
  { id: 'canon-eos-r', name: 'Canon EOS R', brand: 'Canon', type: 'mirrorless', sensorWidth: 36.0, sensorHeight: 24.0, pixelSize: 5.36, pixelsX: 6720, pixelsY: 4480 },
  { id: 'canon-eos-ra', name: 'Canon EOS Ra', brand: 'Canon', type: 'mirrorless', sensorWidth: 36.0, sensorHeight: 24.0, pixelSize: 5.36, pixelsX: 6720, pixelsY: 4480, astroModified: true },
  { id: 'canon-eos-r5', name: 'Canon EOS R5', brand: 'Canon', type: 'mirrorless', sensorWidth: 36.0, sensorHeight: 24.0, pixelSize: 4.39, pixelsX: 8192, pixelsY: 5464 },
  { id: 'canon-eos-r6-mk2', name: 'Canon EOS R6 Mark II', brand: 'Canon', type: 'mirrorless', sensorWidth: 36.0, sensorHeight: 24.0, pixelSize: 5.97, pixelsX: 6000, pixelsY: 4000 },
  // Nikon
  { id: 'nikon-d810a', name: 'Nikon D810A', brand: 'Nikon', type: 'dslr', sensorWidth: 35.9, sensorHeight: 24.0, pixelSize: 4.88, pixelsX: 7360, pixelsY: 4912, astroModified: true },
  { id: 'nikon-d850', name: 'Nikon D850', brand: 'Nikon', type: 'dslr', sensorWidth: 35.9, sensorHeight: 23.9, pixelSize: 4.34, pixelsX: 8256, pixelsY: 5504 },
  { id: 'nikon-z6-iii', name: 'Nikon Z6 III', brand: 'Nikon', type: 'mirrorless', sensorWidth: 35.9, sensorHeight: 23.9, pixelSize: 5.94, pixelsX: 6048, pixelsY: 4032 },
  { id: 'nikon-z8', name: 'Nikon Z8', brand: 'Nikon', type: 'mirrorless', sensorWidth: 35.9, sensorHeight: 23.9, pixelSize: 4.34, pixelsX: 8256, pixelsY: 5504 },
  // Sony
  { id: 'sony-a7iii', name: 'Sony A7 III', brand: 'Sony', type: 'mirrorless', sensorWidth: 35.6, sensorHeight: 23.8, pixelSize: 5.93, pixelsX: 6000, pixelsY: 4000 },
  { id: 'sony-a7iv', name: 'Sony A7 IV', brand: 'Sony', type: 'mirrorless', sensorWidth: 35.9, sensorHeight: 23.9, pixelSize: 5.09, pixelsX: 7008, pixelsY: 4672 },
  { id: 'sony-a7cr', name: 'Sony A7CR', brand: 'Sony', type: 'mirrorless', sensorWidth: 35.7, sensorHeight: 23.8, pixelSize: 3.73, pixelsX: 9568, pixelsY: 6380 },
  { id: 'sony-a7s-iii', name: 'Sony A7S III', brand: 'Sony', type: 'mirrorless', sensorWidth: 35.6, sensorHeight: 23.8, pixelSize: 8.40, pixelsX: 4240, pixelsY: 2832 },
  // ZWO Dedicated Astro
  { id: 'zwo-asi294mc-pro', name: 'ZWO ASI294MC Pro', brand: 'ZWO', type: 'dedicated', sensorWidth: 19.1, sensorHeight: 13.0, pixelSize: 4.63, pixelsX: 4144, pixelsY: 2822 },
  { id: 'zwo-asi2600mc-pro', name: 'ZWO ASI2600MC Pro', brand: 'ZWO', type: 'dedicated', sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176 },
  { id: 'zwo-asi533mc-pro', name: 'ZWO ASI533MC Pro', brand: 'ZWO', type: 'dedicated', sensorWidth: 11.31, sensorHeight: 11.31, pixelSize: 3.76, pixelsX: 3008, pixelsY: 3008 },
  { id: 'zwo-asi585mc', name: 'ZWO ASI585MC', brand: 'ZWO', type: 'dedicated', sensorWidth: 12.84, sensorHeight: 9.64, pixelSize: 2.9, pixelsX: 4432, pixelsY: 3326 },
  { id: 'zwo-asi071mc-pro', name: 'ZWO ASI071MC Pro', brand: 'ZWO', type: 'dedicated', sensorWidth: 23.6, sensorHeight: 15.6, pixelSize: 4.78, pixelsX: 4944, pixelsY: 3284 },
  { id: 'zwo-asi183mc-pro', name: 'ZWO ASI183MC Pro', brand: 'ZWO', type: 'dedicated', sensorWidth: 13.2, sensorHeight: 8.8, pixelSize: 2.4, pixelsX: 5496, pixelsY: 3672 },
  // QHY
  { id: 'qhy268c', name: 'QHY268C', brand: 'QHY', type: 'dedicated', sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6252, pixelsY: 4176 },
  { id: 'qhy600m', name: 'QHY600M', brand: 'QHY', type: 'dedicated', sensorWidth: 36.0, sensorHeight: 24.0, pixelSize: 3.76, pixelsX: 9576, pixelsY: 6388 },
  { id: 'qhy163c', name: 'QHY163C', brand: 'QHY', type: 'dedicated', sensorWidth: 13.2, sensorHeight: 8.8, pixelSize: 3.8, pixelsX: 4656, pixelsY: 3522 },
  { id: 'qhy533m', name: 'QHY533M', brand: 'QHY', type: 'dedicated', sensorWidth: 11.31, sensorHeight: 11.31, pixelSize: 3.76, pixelsX: 3008, pixelsY: 3008 },
  { id: 'qhy294c', name: 'QHY294C', brand: 'QHY', type: 'dedicated', sensorWidth: 19.1, sensorHeight: 13.0, pixelSize: 4.63, pixelsX: 4144, pixelsY: 2822 },
  // Fujifilm
  { id: 'fuji-x-t5', name: 'Fujifilm X-T5', brand: 'Fujifilm', type: 'mirrorless', sensorWidth: 23.5, sensorHeight: 15.6, pixelSize: 3.49, pixelsX: 6720, pixelsY: 4480 },
  { id: 'fuji-x-h2', name: 'Fujifilm X-H2', brand: 'Fujifilm', type: 'mirrorless', sensorWidth: 23.5, sensorHeight: 15.6, pixelSize: 2.84, pixelsX: 8256, pixelsY: 5504 },
  // Player One
  { id: 'player-one-poseidon-c', name: 'Player One Poseidon-C Pro', brand: 'Player One', type: 'dedicated', sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176 },
  { id: 'player-one-uranus-c', name: 'Player One Uranus-C Pro', brand: 'Player One', type: 'dedicated', sensorWidth: 12.84, sensorHeight: 9.64, pixelSize: 2.9, pixelsX: 4432, pixelsY: 3326 },
  // Canon additional
  { id: 'canon-eos-r8', name: 'Canon EOS R8', brand: 'Canon', type: 'mirrorless', sensorWidth: 36.0, sensorHeight: 24.0, pixelSize: 5.97, pixelsX: 6000, pixelsY: 4000 },
  { id: 'canon-90d', name: 'Canon EOS 90D', brand: 'Canon', type: 'dslr', sensorWidth: 22.3, sensorHeight: 14.9, pixelSize: 3.22, pixelsX: 6960, pixelsY: 4640 },
  // Nikon additional
  { id: 'nikon-z5', name: 'Nikon Z5', brand: 'Nikon', type: 'mirrorless', sensorWidth: 35.9, sensorHeight: 23.9, pixelSize: 5.94, pixelsX: 6048, pixelsY: 4032 },
  { id: 'nikon-d7500', name: 'Nikon D7500', brand: 'Nikon', type: 'dslr', sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 4.22, pixelsX: 5568, pixelsY: 3712 },
  // Sony additional
  { id: 'sony-a6700', name: 'Sony A6700', brand: 'Sony', type: 'mirrorless', sensorWidth: 23.5, sensorHeight: 15.6, pixelSize: 3.92, pixelsX: 6000, pixelsY: 4000 },
  { id: 'sony-a7rv', name: 'Sony A7R V', brand: 'Sony', type: 'mirrorless', sensorWidth: 35.7, sensorHeight: 23.8, pixelSize: 3.73, pixelsX: 9568, pixelsY: 6380 },
  // ZWO additional
  { id: 'zwo-asi2600mm-pro', name: 'ZWO ASI2600MM Pro', brand: 'ZWO', type: 'dedicated', sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176 },
  { id: 'zwo-asi533mm-pro', name: 'ZWO ASI533MM Pro', brand: 'ZWO', type: 'dedicated', sensorWidth: 11.31, sensorHeight: 11.31, pixelSize: 3.76, pixelsX: 3008, pixelsY: 3008 },
  { id: 'zwo-asi678mc', name: 'ZWO ASI678MC', brand: 'ZWO', type: 'dedicated', sensorWidth: 7.7, sensorHeight: 4.3, pixelSize: 2.0, pixelsX: 3840, pixelsY: 2160 },
  { id: 'zwo-asi462mc', name: 'ZWO ASI462MC', brand: 'ZWO', type: 'dedicated', sensorWidth: 5.6, sensorHeight: 3.2, pixelSize: 2.9, pixelsX: 1936, pixelsY: 1096 },
  { id: 'zwo-asi120mm', name: 'ZWO ASI120MM Mini', brand: 'ZWO', type: 'dedicated', sensorWidth: 4.8, sensorHeight: 3.6, pixelSize: 3.75, pixelsX: 1280, pixelsY: 960 },
  // Altair
  { id: 'altair-26c', name: 'Altair Hypercam 26C', brand: 'Altair', type: 'dedicated', sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176 },
  // Touptek
  { id: 'touptek-2600c', name: 'Touptek ATR2600C', brand: 'Touptek', type: 'dedicated', sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176 },
  // Pentax
  { id: 'pentax-k-1-mk2', name: 'Pentax K-1 Mark II', brand: 'Pentax', type: 'dslr', sensorWidth: 35.9, sensorHeight: 24.0, pixelSize: 4.88, pixelsX: 7360, pixelsY: 4912 },
  // Olympus/OM System (MFT)
  { id: 'om-system-om-1', name: 'OM System OM-1', brand: 'OM System', type: 'mirrorless', sensorWidth: 17.4, sensorHeight: 13.0, pixelSize: 3.32, pixelsX: 5184, pixelsY: 3888 },
] as const
