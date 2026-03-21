/**
 * Lens database — popular lenses for wide-field astrophotography.
 *
 * Covers wide-angle to telephoto primes commonly used for Milky Way,
 * constellation, and tracked deep-sky photography.
 *
 * @module
 */

/** A camera lens with optical specs. */
export interface Lens {
  /** Unique identifier (slugified name). */
  id: string
  /** Display name. */
  name: string
  /** Manufacturer. */
  brand: string
  /** Focal length in mm. */
  focalLength: number
  /** Maximum aperture diameter in mm (focal length / f-number). */
  maxAperture: number
  /** Maximum aperture f-number. */
  fNumber: number
  /** Mount type. */
  mount: 'canon-ef' | 'canon-rf' | 'nikon-f' | 'nikon-z' | 'sony-e' | 'fuji-x' | 'mft' | 'universal'
}

export const LENSES: readonly Lens[] = [
  // Ultra-wide (Milky Way)
  { id: 'rokinon-14mm-f2.8', name: 'Rokinon 14mm f/2.8', brand: 'Rokinon', focalLength: 14, maxAperture: 5.0, fNumber: 2.8, mount: 'universal' },
  { id: 'sigma-14mm-f1.8', name: 'Sigma 14mm f/1.8 DG HSM Art', brand: 'Sigma', focalLength: 14, maxAperture: 7.78, fNumber: 1.8, mount: 'universal' },
  { id: 'sigma-20mm-f1.4', name: 'Sigma 20mm f/1.4 DG DN Art', brand: 'Sigma', focalLength: 20, maxAperture: 14.29, fNumber: 1.4, mount: 'sony-e' },
  { id: 'canon-rf-15-35-f2.8', name: 'Canon RF 15-35mm f/2.8L IS USM', brand: 'Canon', focalLength: 15, maxAperture: 5.36, fNumber: 2.8, mount: 'canon-rf' },
  { id: 'nikon-z-14-24-f2.8', name: 'Nikon Z 14-24mm f/2.8 S', brand: 'Nikon', focalLength: 14, maxAperture: 5.0, fNumber: 2.8, mount: 'nikon-z' },
  // Wide-field (constellations, tracked MW)
  { id: 'sigma-24mm-f1.4', name: 'Sigma 24mm f/1.4 DG DN Art', brand: 'Sigma', focalLength: 24, maxAperture: 17.14, fNumber: 1.4, mount: 'sony-e' },
  { id: 'sony-24mm-f1.4-gm', name: 'Sony FE 24mm f/1.4 GM', brand: 'Sony', focalLength: 24, maxAperture: 17.14, fNumber: 1.4, mount: 'sony-e' },
  { id: 'rokinon-35mm-f1.4', name: 'Rokinon 35mm f/1.4', brand: 'Rokinon', focalLength: 35, maxAperture: 25.0, fNumber: 1.4, mount: 'universal' },
  { id: 'sigma-35mm-f1.4', name: 'Sigma 35mm f/1.4 DG DN Art', brand: 'Sigma', focalLength: 35, maxAperture: 25.0, fNumber: 1.4, mount: 'sony-e' },
  // Standard (tracked deep-sky)
  { id: 'canon-ef-50mm-f1.8', name: 'Canon EF 50mm f/1.8 STM', brand: 'Canon', focalLength: 50, maxAperture: 27.78, fNumber: 1.8, mount: 'canon-ef' },
  { id: 'sigma-50mm-f1.4', name: 'Sigma 50mm f/1.4 DG DN Art', brand: 'Sigma', focalLength: 50, maxAperture: 35.71, fNumber: 1.4, mount: 'sony-e' },
  { id: 'sony-50mm-f1.2-gm', name: 'Sony FE 50mm f/1.2 GM', brand: 'Sony', focalLength: 50, maxAperture: 41.67, fNumber: 1.2, mount: 'sony-e' },
  // Short telephoto (nebulae, galaxies)
  { id: 'sigma-85mm-f1.4', name: 'Sigma 85mm f/1.4 DG DN Art', brand: 'Sigma', focalLength: 85, maxAperture: 60.71, fNumber: 1.4, mount: 'sony-e' },
  { id: 'sigma-105mm-f1.4', name: 'Sigma 105mm f/1.4 DG HSM Art', brand: 'Sigma', focalLength: 105, maxAperture: 75.0, fNumber: 1.4, mount: 'universal' },
  { id: 'canon-ef-135mm-f2', name: 'Canon EF 135mm f/2L USM', brand: 'Canon', focalLength: 135, maxAperture: 67.5, fNumber: 2.0, mount: 'canon-ef' },
  { id: 'sony-135mm-f1.8-gm', name: 'Sony FE 135mm f/1.8 GM', brand: 'Sony', focalLength: 135, maxAperture: 75.0, fNumber: 1.8, mount: 'sony-e' },
  // Telephoto (deep-sky targets)
  { id: 'canon-ef-200mm-f2.8', name: 'Canon EF 200mm f/2.8L II USM', brand: 'Canon', focalLength: 200, maxAperture: 71.43, fNumber: 2.8, mount: 'canon-ef' },
  { id: 'sony-200-600mm-f5.6-6.3', name: 'Sony FE 200-600mm f/5.6-6.3 G', brand: 'Sony', focalLength: 200, maxAperture: 35.71, fNumber: 5.6, mount: 'sony-e' },
  { id: 'sigma-150-600mm-f5-6.3', name: 'Sigma 150-600mm f/5-6.3 DG OS HSM', brand: 'Sigma', focalLength: 150, maxAperture: 30.0, fNumber: 5.0, mount: 'universal' },
  { id: 'canon-rf-100-500mm-f4.5-7.1', name: 'Canon RF 100-500mm f/4.5-7.1L IS USM', brand: 'Canon', focalLength: 100, maxAperture: 22.22, fNumber: 4.5, mount: 'canon-rf' },
  // Additional ultra-wide
  { id: 'sigma-14-24mm-f2.8', name: 'Sigma 14-24mm f/2.8 DG DN Art', brand: 'Sigma', focalLength: 14, maxAperture: 5.0, fNumber: 2.8, mount: 'sony-e' },
  { id: 'laowa-12mm-f2.8', name: 'Laowa 12mm f/2.8 Zero-D', brand: 'Laowa', focalLength: 12, maxAperture: 4.29, fNumber: 2.8, mount: 'universal' },
  { id: 'irix-15mm-f2.4', name: 'Irix 15mm f/2.4 Blackstone', brand: 'Irix', focalLength: 15, maxAperture: 6.25, fNumber: 2.4, mount: 'universal' },
  { id: 'tokina-11-20mm-f2.8', name: 'Tokina ATX-i 11-20mm f/2.8 CF', brand: 'Tokina', focalLength: 11, maxAperture: 3.93, fNumber: 2.8, mount: 'canon-ef' },
  { id: 'samyang-12mm-f2', name: 'Samyang 12mm f/2.0 NCS CS', brand: 'Samyang', focalLength: 12, maxAperture: 6.0, fNumber: 2.0, mount: 'fuji-x' },
  // Additional wide
  { id: 'canon-rf-16mm-f2.8', name: 'Canon RF 16mm f/2.8 STM', brand: 'Canon', focalLength: 16, maxAperture: 5.71, fNumber: 2.8, mount: 'canon-rf' },
  { id: 'nikon-z-20mm-f1.8', name: 'Nikon Z 20mm f/1.8 S', brand: 'Nikon', focalLength: 20, maxAperture: 11.11, fNumber: 1.8, mount: 'nikon-z' },
  { id: 'sony-20mm-f1.8-g', name: 'Sony FE 20mm f/1.8 G', brand: 'Sony', focalLength: 20, maxAperture: 11.11, fNumber: 1.8, mount: 'sony-e' },
  { id: 'sigma-24-70mm-f2.8', name: 'Sigma 24-70mm f/2.8 DG DN Art', brand: 'Sigma', focalLength: 24, maxAperture: 8.57, fNumber: 2.8, mount: 'sony-e' },
  { id: 'tamron-17-28mm-f2.8', name: 'Tamron 17-28mm f/2.8 Di III RXD', brand: 'Tamron', focalLength: 17, maxAperture: 6.07, fNumber: 2.8, mount: 'sony-e' },
  { id: 'canon-ef-24mm-f1.4', name: 'Canon EF 24mm f/1.4L II USM', brand: 'Canon', focalLength: 24, maxAperture: 17.14, fNumber: 1.4, mount: 'canon-ef' },
  // Additional standard
  { id: 'nikon-z-50mm-f1.8', name: 'Nikon Z 50mm f/1.8 S', brand: 'Nikon', focalLength: 50, maxAperture: 27.78, fNumber: 1.8, mount: 'nikon-z' },
  { id: 'sony-50mm-f1.4-gm', name: 'Sony FE 50mm f/1.4 GM', brand: 'Sony', focalLength: 50, maxAperture: 35.71, fNumber: 1.4, mount: 'sony-e' },
  { id: 'canon-rf-50mm-f1.8', name: 'Canon RF 50mm f/1.8 STM', brand: 'Canon', focalLength: 50, maxAperture: 27.78, fNumber: 1.8, mount: 'canon-rf' },
  // Additional telephoto
  { id: 'samyang-135mm-f2', name: 'Samyang 135mm f/2.0 ED UMC', brand: 'Samyang', focalLength: 135, maxAperture: 67.5, fNumber: 2.0, mount: 'universal' },
  { id: 'canon-rf-70-200mm-f2.8', name: 'Canon RF 70-200mm f/2.8L IS USM', brand: 'Canon', focalLength: 70, maxAperture: 25.0, fNumber: 2.8, mount: 'canon-rf' },
  { id: 'nikon-z-70-200mm-f2.8', name: 'Nikon Z 70-200mm f/2.8 VR S', brand: 'Nikon', focalLength: 70, maxAperture: 25.0, fNumber: 2.8, mount: 'nikon-z' },
  { id: 'sony-70-200mm-f2.8-gm2', name: 'Sony FE 70-200mm f/2.8 GM II', brand: 'Sony', focalLength: 70, maxAperture: 25.0, fNumber: 2.8, mount: 'sony-e' },
  { id: 'tamron-70-300mm-f4.5-6.3', name: 'Tamron 70-300mm f/4.5-6.3 Di III RXD', brand: 'Tamron', focalLength: 70, maxAperture: 15.56, fNumber: 4.5, mount: 'sony-e' },
  { id: 'sigma-100-400mm-f5-6.3', name: 'Sigma 100-400mm f/5-6.3 DG DN OS', brand: 'Sigma', focalLength: 100, maxAperture: 20.0, fNumber: 5.0, mount: 'sony-e' },
  { id: 'canon-ef-70-200mm-f2.8', name: 'Canon EF 70-200mm f/2.8L IS III USM', brand: 'Canon', focalLength: 70, maxAperture: 25.0, fNumber: 2.8, mount: 'canon-ef' },
  { id: 'nikon-200-500mm-f5.6', name: 'Nikon AF-S 200-500mm f/5.6E ED VR', brand: 'Nikon', focalLength: 200, maxAperture: 35.71, fNumber: 5.6, mount: 'nikon-f' },
  { id: 'canon-ef-100mm-f2.8-macro', name: 'Canon EF 100mm f/2.8L Macro IS USM', brand: 'Canon', focalLength: 100, maxAperture: 35.71, fNumber: 2.8, mount: 'canon-ef' },
  { id: 'tamron-150-500mm-f5-6.7', name: 'Tamron 150-500mm f/5-6.7 Di III VC VXD', brand: 'Tamron', focalLength: 150, maxAperture: 30.0, fNumber: 5.0, mount: 'sony-e' },
  // MFT lenses
  { id: 'olympus-12mm-f2', name: 'Olympus M.Zuiko 12mm f/2.0', brand: 'Olympus', focalLength: 12, maxAperture: 6.0, fNumber: 2.0, mount: 'mft' },
  { id: 'olympus-25mm-f1.2', name: 'Olympus M.Zuiko 25mm f/1.2 Pro', brand: 'Olympus', focalLength: 25, maxAperture: 20.83, fNumber: 1.2, mount: 'mft' },
] as const
