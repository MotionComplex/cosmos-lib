/**
 * `@motioncomplex/cosmos-lib` -- Astronomical calculation and visualisation library.
 *
 * This is the main entry point. It re-exports every core module as named
 * exports so consumers can tree-shake to only what they use:
 *
 * ```ts
 * import { Sun, Moon, Units, CONSTANTS } from '@motioncomplex/cosmos-lib'
 * ```
 *
 * A convenience `Cosmos` default export is also available that bundles all
 * modules into a single namespace object (see {@link Cosmos}).
 *
 * Three.js scene helpers (planet/nebula factories, camera flights, LOD
 * management) live in the separate `/three` sub-path and are **not** included
 * here to keep the core bundle free of any Three.js dependency:
 *
 * ```ts
 * import { createPlanet, CameraFlight } from '@motioncomplex/cosmos-lib/three'
 * ```
 *
 * @packageDocumentation
 */

// ── Core modules ──────────────────────────────────────────────────────────────
export { CONSTANTS }                           from './constants.js'
export { Units }                               from './units.js'
export { AstroMath }                           from './math.js'
export { Sun }                                 from './sun.js'
export { Moon }                                from './moon.js'
export { Eclipse }                             from './eclipse.js'
export { Planner }                             from './planner.js'
export type { VisibleObject, WhatsUpOptions, VisibilityCurvePoint, BestWindowResult, PlanetEvent, MoonInterference, AirmassPoint } from './planner.js'
export { AstroClock }                          from './clock.js'
export { Events }                              from './events.js'
export { Equipment, Rig }                      from './equipment.js'
export { AstroPhoto }                          from './astro-photo.js'
export type { SessionTarget, ImagingWindow, MilkyWayInfo, PolarAlignmentInfo, SessionPlanOptions, RigPlanTarget, RigPlanResult, RigPlanOptions, SkySite, CaptureSettings } from './astro-photo.js'
export type { Camera, Telescope, Lens, Tracker, FOV, FramingResult, SamplingAdvice, RigOptions } from './equipment.js'
export type { AstroEvent, AstroEventCategory, NextEventsOptions, EventVisibility } from './events.js'
export type { AstroClockOptions, AstroClockEventMap, AstroEventType } from './clock.js'
export type { EclipseEvent }                   from './eclipse.js'
export { Data, SOLAR_SYSTEM, DEEP_SKY_EXTRAS, BRIGHT_STARS, CONSTELLATIONS, MESSIER_CATALOG, METEOR_SHOWERS, IMAGE_FALLBACKS, resolveImages, getObjectImage, prefetchImages, computeFov, tryPanSTARRS, tryDSS } from './data/index.js'
export type { SolarSystemBody, BrightStar, Constellation, MessierObject, MeteorShower, ResolvedImage, ResolveImageOptions, CutoutResult, CutoutOptions, TierStar } from './data/index.js'
export { PLANET_TEXTURES, STAR_TEXTURES }      from './data/textures.js'
export type { TextureInfo }                    from './data/textures.js'
export { Media }                               from './media.js'
export { NASA, ESA, resolveSimbad }            from './api.js'
export { Astrobin }                            from './astrobin.js'
export type { AstrobinCamera, AstrobinTelescope, AstrobinSearchOptions } from './astrobin.js'
export { renderSkyMap, stereographic, mollweide, gnomonic, spectralColor, SkyMap } from './skymap.js'
export { InteractiveSkyMap, createInteractiveSkyMap } from './skymap-interactive.js'
export { canvasToEquatorial } from './skymap-hittest.js'
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
  ObjectImageResult,
  GetImageOptions,
  ProjectionName,
  SkyMapRenderOptions,
  ProjectedObject,
  SkyMapViewState,
  SkyMapEventMap,
  FOVOverlayOptions,
  HUDOptions,
  InteractiveSkyMapOptions,
  MorphOptions,
  StaggerOptions,
  HeroExpandOptions,
} from './types.js'

// ── Convenience default export -- mirrors the original cosmos.js namespace ────
import { CONSTANTS }                           from './constants.js'
import { Units }                               from './units.js'
import { AstroMath }                           from './math.js'
import { Sun }                                 from './sun.js'
import { Moon }                                from './moon.js'
import { Eclipse }                             from './eclipse.js'
import { Planner }                             from './planner.js'
import { AstroClock }                          from './clock.js'
import { Events }                              from './events.js'
import { Equipment }                           from './equipment.js'
import { AstroPhoto }                          from './astro-photo.js'
import { Data }                                from './data/index.js'
import { Media }                               from './media.js'
import { NASA, ESA, resolveSimbad }            from './api.js'
import { Astrobin }                            from './astrobin.js'
import { renderSkyMap, stereographic, mollweide, gnomonic } from './skymap.js'
import { InteractiveSkyMap, createInteractiveSkyMap } from './skymap-interactive.js'
import { morph, staggerIn, staggerOut, fade, crossfade, heroExpand, heroCollapse } from './transitions.js'

/**
 * Convenience namespace object that mirrors the original `cosmos.js` API.
 *
 * Use the default import when you prefer a single namespace over individual
 * named imports:
 *
 * ```ts
 * import Cosmos from '@motioncomplex/cosmos-lib'
 *
 * const jd = Cosmos.Math.julianDate(new Date())
 * const sunPos = Cosmos.Sun.position(jd)
 * ```
 *
 * For tree-shaking, prefer the named exports instead:
 *
 * ```ts
 * import { AstroMath, Sun } from '@motioncomplex/cosmos-lib'
 * ```
 */
const Cosmos = {
  CONSTANTS,
  Units,
  Math:        AstroMath,
  Sun,
  Moon,
  Eclipse,
  Planner,
  AstroClock,
  Events,
  Equipment,
  AstroPhoto,
  Data,
  Media,
  API:         { NASA, ESA, Astrobin, resolveSimbad },
  SkyMap:      { render: renderSkyMap, stereographic, mollweide, gnomonic, Interactive: InteractiveSkyMap, create: createInteractiveSkyMap },
  Transitions: { morph, staggerIn, staggerOut, fade, crossfade, heroExpand, heroCollapse },
} as const

export default Cosmos
