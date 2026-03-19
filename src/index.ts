// ── Core modules ──────────────────────────────────────────────────────────────
export { CONSTANTS }                           from './constants.js'
export { Units }                               from './units.js'
export { AstroMath }                           from './math.js'
export { Sun }                                 from './sun.js'
export { Moon }                                from './moon.js'
export { Eclipse }                             from './eclipse.js'
export type { EclipseEvent }                   from './eclipse.js'
export { Data, SOLAR_SYSTEM, DEEP_SKY_EXTRAS, BRIGHT_STARS, CONSTELLATIONS, MESSIER_CATALOG, METEOR_SHOWERS, IMAGE_FALLBACKS, resolveImages } from './data/index.js'
export type { SolarSystemBody, BrightStar, Constellation, MessierObject, MeteorShower, ResolvedImage, ResolveImageOptions } from './data/index.js'
export { PLANET_TEXTURES, STAR_TEXTURES }      from './data/textures.js'
export type { TextureInfo }                    from './data/textures.js'
export { Media }                               from './media.js'
export { NASA, ESA, resolveSimbad }            from './api.js'
export { renderSkyMap, stereographic, mollweide, gnomonic, SkyMap } from './skymap.js'
export {
  morph,
  staggerIn,
  staggerOut,
  fade,
  crossfade,
  heroExpand,
  heroCollapse,
  Transitions,
} from './transitions.js'

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  ObjectType,
  DistanceUnit,
  Distance,
  CelestialObject,
  SearchResult,
  ProximityResult,
  EquatorialCoord,
  HorizontalCoord,
  GalacticCoord,
  EclipticCoord,
  ObserverParams,
  ProjectedPoint,
  PlanetName,
  PlanetPosition,
  NutationResult,
  RiseTransitSet,
  MoonPhaseName,
  MoonPhase,
  MoonPosition,
  SunPosition,
  TwilightTimes,
  NASAImageResult,
  APODResult,
  ESAHubbleResult,
  SimbadResult,
  ImageRef,
  ProgressiveImageOptions,
  CloudinaryOptions,
  ProjectionName,
  SkyMapRenderOptions,
  MorphOptions,
  StaggerOptions,
  HeroExpandOptions,
} from './types.js'

// ── Convenience default export — mirrors the original cosmos.js namespace ─────
import { CONSTANTS }                           from './constants.js'
import { Units }                               from './units.js'
import { AstroMath }                           from './math.js'
import { Sun }                                 from './sun.js'
import { Moon }                                from './moon.js'
import { Eclipse }                             from './eclipse.js'
import { Data }                                from './data/index.js'
import { Media }                               from './media.js'
import { NASA, ESA, resolveSimbad }            from './api.js'
import { renderSkyMap, stereographic, mollweide, gnomonic } from './skymap.js'
import { morph, staggerIn, staggerOut, fade, crossfade, heroExpand, heroCollapse } from './transitions.js'

const Cosmos = {
  CONSTANTS,
  Units,
  Math:        AstroMath,
  Sun,
  Moon,
  Eclipse,
  Data,
  Media,
  API:         { NASA, ESA, resolveSimbad },
  SkyMap:      { render: renderSkyMap, stereographic, mollweide, gnomonic },
  Transitions: { morph, staggerIn, staggerOut, fade, crossfade, heroExpand, heroCollapse },
} as const

export default Cosmos
