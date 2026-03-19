// ── Core modules ──────────────────────────────────────────────────────────────
export { CONSTANTS }                           from './constants.js'
export { Units }                               from './units.js'
export { AstroMath }                           from './math.js'
export { Data }                                from './data/index.js'
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
  NASAImageResult,
  APODResult,
  ESAHubbleResult,
  SimbadResult,
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
import { Data }                                from './data/index.js'
import { Media }                               from './media.js'
import { NASA, ESA, resolveSimbad }            from './api.js'
import { renderSkyMap, stereographic, mollweide, gnomonic } from './skymap.js'
import { morph, staggerIn, staggerOut, fade, crossfade, heroExpand, heroCollapse } from './transitions.js'

const Cosmos = {
  CONSTANTS,
  Units,
  Math:        AstroMath,
  Data,
  Media,
  API:         { NASA, ESA, resolveSimbad },
  SkyMap:      { render: renderSkyMap, stereographic, mollweide, gnomonic },
  Transitions: { morph, staggerIn, staggerOut, fade, crossfade, heroExpand, heroCollapse },
} as const

export default Cosmos
