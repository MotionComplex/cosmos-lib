// ─── Celestial object types ───────────────────────────────────────────────────

export type ObjectType =
  | 'star'
  | 'planet'
  | 'nebula'
  | 'galaxy'
  | 'cluster'
  | 'black-hole'
  | 'moon'

export type DistanceUnit = 'km' | 'AU' | 'ly' | 'pc' | 'kpc' | 'Mpc'

export interface Distance {
  value: number
  unit: DistanceUnit
}

export interface CelestialObject {
  id: string
  name: string
  aliases: string[]
  type: ObjectType
  subtype?: string
  /** Right Ascension in degrees (J2000). Null for solar-system bodies. */
  ra: number | null
  /** Declination in degrees (J2000). Null for solar-system bodies. */
  dec: number | null
  magnitude: number | null
  distance?: Distance
  description: string
  tags: string[]
  // Physical properties (optional — populated where known)
  diameter_km?: number
  mass_kg?: number
  moons?: number
  surface_temp_K?: number
  spectral?: string
  binary?: boolean
  triple?: boolean
  // Imagery
  imgs?: string[]
  credit?: string
}

export interface SearchResult {
  object: CelestialObject
  score: number
}

export interface ProximityResult {
  object: CelestialObject
  /** Angular separation in degrees */
  separation: number
}

// ─── Coordinate types ─────────────────────────────────────────────────────────

export interface EquatorialCoord {
  /** Right Ascension in degrees */
  ra: number
  /** Declination in degrees */
  dec: number
}

export interface HorizontalCoord {
  /** Altitude in degrees (+ = above horizon) */
  alt: number
  /** Azimuth in degrees (0 = N, 90 = E) */
  az: number
}

export interface GalacticCoord {
  /** Galactic longitude in degrees */
  l: number
  /** Galactic latitude in degrees */
  b: number
}

export interface EclipticCoord {
  /** Ecliptic longitude in degrees */
  lon: number
  /** Ecliptic latitude in degrees */
  lat: number
}

export interface ObserverParams {
  /** Geographic latitude in degrees */
  lat: number
  /** Geographic longitude in degrees (east positive) */
  lng: number
  date?: Date
}

export interface ProjectedPoint {
  x: number
  y: number
  /** Whether the point is on the visible side of the projection */
  visible: boolean
}

// ─── Planet ephemeris ─────────────────────────────────────────────────────────

export type PlanetName =
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'

export interface PlanetPosition extends EclipticCoord {
  /** Heliocentric distance in AU */
  r: number
  /** Mean anomaly in degrees */
  M: number
  /** True anomaly in degrees */
  nu: number
}

// ─── NASA API types ───────────────────────────────────────────────────────────

export interface NASAImageResult {
  nasaId: string
  title: string
  description: string
  date: string
  center: string
  keywords: string[]
  previewUrl: string | null
  href: string
}

export interface APODResult {
  title: string
  date: string
  explanation: string
  url: string
  hdUrl: string
  mediaType: 'image' | 'video'
  copyright: string
}

export interface ESAHubbleResult {
  id: string
  title: string
  description: string
  credit: string
  date: string
  imageUrl: string | null
  thumbUrl: string | null
  tags: string[]
}

export interface SimbadResult {
  id: string
  ra: number
  dec: number
  type: string
}

// ─── Media types ──────────────────────────────────────────────────────────────

export interface ProgressiveImageOptions {
  /** Tiny blurred base64 or low-res URL shown immediately */
  placeholder?: string
  /** Medium-quality URL (shown while HD loads) */
  src: string
  /** Full-resolution URL loaded last */
  srcHD?: string
}

export interface CloudinaryOptions {
  w?: number
  h?: number
  q?: number | 'auto'
  f?: string | 'auto'
  crop?: string
}

// ─── SkyMap types ─────────────────────────────────────────────────────────────

export type ProjectionName = 'stereographic' | 'mollweide' | 'gnomonic'

export interface SkyMapRenderOptions {
  projection?: ProjectionName
  center?: EquatorialCoord
  scale?: number
  showGrid?: boolean
  showLabels?: boolean
  showMagnitudeLimit?: number
  background?: string
  gridColor?: string
  labelColor?: string
}

// ─── Transition types ─────────────────────────────────────────────────────────

export interface MorphOptions {
  duration?: number
  easing?: string
}

export interface StaggerOptions {
  delay?: number
  stagger?: number
  duration?: number
  from?: 'top' | 'bottom' | 'left' | 'right'
  distance?: string
}

export interface HeroExpandOptions {
  duration?: number
  easing?: string
  onDone?: () => void
}
