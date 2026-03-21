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
export { CONSTANTS } from './constants.js';
export { Units } from './units.js';
export { AstroMath } from './math.js';
export { Sun } from './sun.js';
export { Moon } from './moon.js';
export { Eclipse } from './eclipse.js';
export { Planner } from './planner.js';
export type { VisibleObject, WhatsUpOptions, VisibilityCurvePoint, BestWindowResult, PlanetEvent, MoonInterference, AirmassPoint } from './planner.js';
export { AstroClock } from './clock.js';
export { Events } from './events.js';
export { Equipment, Rig } from './equipment.js';
export { AstroPhoto } from './astro-photo.js';
export type { SessionTarget, ImagingWindow, MilkyWayInfo, PolarAlignmentInfo, SessionPlanOptions } from './astro-photo.js';
export type { Camera, Telescope, Lens, Tracker, FOV, FramingResult, SamplingAdvice, RigOptions } from './equipment.js';
export type { AstroEvent, AstroEventCategory, NextEventsOptions, EventVisibility } from './events.js';
export type { AstroClockOptions, AstroClockEventMap, AstroEventType } from './clock.js';
export type { EclipseEvent } from './eclipse.js';
export { Data, SOLAR_SYSTEM, DEEP_SKY_EXTRAS, BRIGHT_STARS, CONSTELLATIONS, MESSIER_CATALOG, METEOR_SHOWERS, IMAGE_FALLBACKS, resolveImages, getObjectImage, prefetchImages, computeFov, tryPanSTARRS, tryDSS } from './data/index.js';
export type { SolarSystemBody, BrightStar, Constellation, MessierObject, MeteorShower, ResolvedImage, ResolveImageOptions, CutoutResult, CutoutOptions, TierStar } from './data/index.js';
export { PLANET_TEXTURES, STAR_TEXTURES } from './data/textures.js';
export type { TextureInfo } from './data/textures.js';
export { Media } from './media.js';
export { NASA, ESA, resolveSimbad } from './api.js';
export { Astrobin } from './astrobin.js';
export type { AstrobinCamera, AstrobinTelescope, AstrobinSearchOptions } from './astrobin.js';
export { renderSkyMap, stereographic, mollweide, gnomonic, spectralColor, SkyMap } from './skymap.js';
export { InteractiveSkyMap, createInteractiveSkyMap } from './skymap-interactive.js';
export { canvasToEquatorial } from './skymap-hittest.js';
export { morph, staggerIn, staggerOut, fade, crossfade, heroExpand, heroCollapse, Transitions, } from './transitions.js';
export type { ObjectType, DistanceUnit, Distance, CelestialObject, SearchResult, ProximityResult, EquatorialCoord, HorizontalCoord, GalacticCoord, EclipticCoord, ObserverParams, ProjectedPoint, PlanetName, PlanetPosition, NutationResult, RiseTransitSet, MoonPhaseName, MoonPhase, MoonPosition, SunPosition, TwilightTimes, NASAImageResult, APODResult, ESAHubbleResult, SimbadResult, ImageRef, ProgressiveImageOptions, CloudinaryOptions, ObjectImageResult, GetImageOptions, ProjectionName, SkyMapRenderOptions, ProjectedObject, SkyMapViewState, SkyMapEventMap, FOVOverlayOptions, HUDOptions, InteractiveSkyMapOptions, MorphOptions, StaggerOptions, HeroExpandOptions, } from './types.js';
import { AstroClock } from './clock.js';
import { resolveSimbad } from './api.js';
import { renderSkyMap, stereographic, mollweide, gnomonic } from './skymap.js';
import { InteractiveSkyMap, createInteractiveSkyMap } from './skymap-interactive.js';
import { morph, staggerIn, staggerOut, fade, crossfade, heroExpand, heroCollapse } from './transitions.js';
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
declare const Cosmos: {
    readonly CONSTANTS: {
        readonly AU_TO_KM: 149597870.7;
        readonly LY_TO_KM: 9460730472580.8;
        readonly PC_TO_LY: 3.261563777;
        readonly PC_TO_KM: 30856775810000;
        readonly C_KM_S: 299792.458;
        readonly G: 6.674e-11;
        readonly SOLAR_MASS_KG: 1.989e+30;
        readonly SOLAR_RADIUS_KM: 695700;
        readonly EARTH_MASS_KG: 5.972e+24;
        readonly EARTH_RADIUS_KM: 6371;
        readonly J2000: 2451545;
        readonly ECLIPTIC_OBL: 23.4392911;
        readonly DEG_TO_RAD: number;
        readonly RAD_TO_DEG: number;
    };
    readonly Units: {
        readonly auToKm: (au: number) => number;
        readonly kmToAu: (km: number) => number;
        readonly lyToPc: (ly: number) => number;
        readonly pcToLy: (pc: number) => number;
        readonly pcToKm: (pc: number) => number;
        readonly lyToKm: (ly: number) => number;
        readonly kmToLy: (km: number) => number;
        readonly degToRad: (d: number) => number;
        readonly radToDeg: (r: number) => number;
        readonly arcsecToDeg: (a: number) => number;
        readonly degToArcsec: (d: number) => number;
        readonly hrsToDeg: (h: number) => number;
        readonly degToHrs: (d: number) => number;
        readonly formatDistance: (km: number) => string;
        readonly formatAngle: (deg: number) => string;
        readonly formatRA: (deg: number) => string;
    };
    readonly Math: {
        readonly toJulian: (date?: Date) => number;
        readonly fromJulian: (jd: number) => Date;
        readonly j2000Days: (date?: Date) => number;
        readonly gmst: (date?: Date) => number;
        readonly lst: (date: Date, longitudeDeg: number) => number;
        readonly equatorialToHorizontal: (eq: import("./types.js").EquatorialCoord, obs: import("./types.js").ObserverParams) => import("./types.js").HorizontalCoord;
        readonly horizontalToEquatorial: (hor: import("./types.js").HorizontalCoord, obs: import("./types.js").ObserverParams) => import("./types.js").EquatorialCoord;
        readonly eclipticToEquatorial: (ecl: import("./types.js").EclipticCoord) => import("./types.js").EquatorialCoord;
        readonly galacticToEquatorial: (gal: import("./types.js").GalacticCoord) => import("./types.js").EquatorialCoord;
        readonly angularSeparation: (a: import("./types.js").EquatorialCoord, b: import("./types.js").EquatorialCoord) => number;
        readonly apparentMagnitude: (absoluteMag: number, distancePc: number) => number;
        readonly absoluteMagnitude: (apparentMag: number, distancePc: number) => number;
        readonly parallaxToDistance: (parallaxArcsec: number) => number;
        readonly solveKepler: (M: number, e: number, tol?: number) => number;
        readonly planetEcliptic: (planet: import("./types.js").PlanetName, date?: Date) => import("./types.js").PlanetPosition;
        readonly precess: (eq: import("./types.js").EquatorialCoord, jdFrom: number, jdTo: number) => import("./types.js").EquatorialCoord;
        readonly nutation: (jd: number) => import("./types.js").NutationResult;
        readonly trueObliquity: (jd: number) => number;
        readonly gast: (date?: Date) => number;
        readonly refraction: (apparentAlt: number, tempC?: number, pressureMb?: number) => number;
        readonly applyProperMotion: (eq: import("./types.js").EquatorialCoord, pmRA: number, pmDec: number, fromEpoch: number, toEpoch: number) => import("./types.js").EquatorialCoord;
        readonly riseTransitSet: (eq: import("./types.js").EquatorialCoord, obs: import("./types.js").ObserverParams, h0?: number) => import("./types.js").RiseTransitSet;
    };
    readonly Sun: {
        readonly position: (date?: Date) => import("./types.js").SunPosition;
        readonly solarNoon: (obs: import("./types.js").ObserverParams) => Date;
        readonly equationOfTime: (date?: Date) => number;
        readonly twilight: (obs: import("./types.js").ObserverParams) => import("./types.js").TwilightTimes;
    };
    readonly Moon: {
        readonly position: (date?: Date) => import("./types.js").MoonPosition;
        readonly phase: (date?: Date) => import("./types.js").MoonPhase;
        readonly nextPhase: (date?: Date, targetPhase?: "new" | "first-quarter" | "full" | "last-quarter") => Date;
        readonly riseTransitSet: (obs: import("./types.js").ObserverParams) => import("./types.js").RiseTransitSet;
        readonly libration: (date?: Date) => {
            l: number;
            b: number;
        };
    };
    readonly Eclipse: {
        readonly nextSolar: (date?: Date) => import("./eclipse.js").EclipseEvent | null;
        readonly nextLunar: (date?: Date) => import("./eclipse.js").EclipseEvent | null;
        readonly search: (startDate: Date, endDate: Date, type?: "solar" | "lunar") => import("./eclipse.js").EclipseEvent[];
        readonly _checkSolarEclipse: (newMoon: Date) => import("./eclipse.js").EclipseEvent | null;
        readonly _checkLunarEclipse: (fullMoon: Date) => import("./eclipse.js").EclipseEvent | null;
    };
    readonly Planner: {
        readonly whatsUp: (observer: import("./types.js").ObserverParams, options?: import("./planner.js").WhatsUpOptions) => import("./planner.js").VisibleObject[];
        readonly bestWindow: (objectId: string, observer: import("./types.js").ObserverParams, minAlt?: number) => import("./planner.js").BestWindowResult | null;
        readonly visibilityCurve: (objectId: string, observer: import("./types.js").ObserverParams, steps?: number) => import("./planner.js").VisibilityCurvePoint[] | null;
        readonly planetEvents: (observer: import("./types.js").ObserverParams, options?: {
            planets?: import("./types.js").PlanetName[];
            days?: number;
        }) => import("./planner.js").PlanetEvent[];
        readonly moonInterference: (objectId: string, observer: import("./types.js").ObserverParams) => import("./planner.js").MoonInterference | null;
        readonly airmassCurve: (objectId: string, observer: import("./types.js").ObserverParams, steps?: number) => import("./planner.js").AirmassPoint[] | null;
    };
    readonly AstroClock: typeof AstroClock;
    readonly Events: {
        readonly nextEvents: (observer: import("./types.js").ObserverParams, options?: import("./events.js").NextEventsOptions) => import("./events.js").AstroEvent[];
        readonly nextEvent: (category: import("./events.js").AstroEventCategory, observer: import("./types.js").ObserverParams, days?: number) => import("./events.js").AstroEvent | null;
        readonly toICal: (events: import("./events.js").AstroEvent[], calendarName?: string) => string;
    };
    readonly Equipment: {
        readonly cameras: () => readonly import("./equipment.js").Camera[];
        readonly camera: (name: string) => import("./equipment.js").Camera | null;
        readonly telescopes: () => readonly import("./equipment.js").Telescope[];
        readonly telescope: (name: string) => import("./equipment.js").Telescope | null;
        readonly lenses: () => readonly import("./equipment.js").Lens[];
        readonly lens: (name: string) => import("./equipment.js").Lens | null;
        readonly trackers: () => readonly import("./equipment.js").Tracker[];
        readonly tracker: (name: string) => import("./equipment.js").Tracker | null;
        readonly rig: (options: import("./equipment.js").RigOptions) => import("./equipment.js").Rig;
        readonly search: (query: string, limit?: number) => Array<{
            category: "camera" | "telescope" | "lens" | "tracker";
            name: string;
            item: import("./equipment.js").Camera | import("./equipment.js").Telescope | import("./equipment.js").Lens | import("./equipment.js").Tracker;
        }>;
    };
    readonly AstroPhoto: {
        readonly sessionPlan: (observer: import("./types.js").ObserverParams, targets: string[], options?: import("./astro-photo.js").SessionPlanOptions) => import("./astro-photo.js").SessionTarget[];
        readonly imagingWindow: (objectId: string, observer: import("./types.js").ObserverParams, maxAirmass?: number) => import("./astro-photo.js").ImagingWindow | null;
        readonly maxExposure: (params: {
            focalLength: number;
            aperture?: number;
            pixelSize?: number;
            declination?: number;
        }) => number;
        readonly ruleOf500: (focalLength: number, cropFactor?: number) => number;
        readonly subExposure: (params: {
            readNoise: number;
            skyBrightness: number;
            targetRatio?: number;
        }) => number;
        readonly totalIntegration: (params: {
            subLength: number;
            subSNR: number;
            targetSNR: number;
        }) => {
            hours: number;
            subs: number;
        };
        readonly milkyWay: (observer: import("./types.js").ObserverParams) => import("./astro-photo.js").MilkyWayInfo;
        readonly milkyWaySeason: (observer: import("./types.js").ObserverParams) => number[];
        readonly polarAlignment: (observer: import("./types.js").ObserverParams) => import("./astro-photo.js").PolarAlignmentInfo;
        readonly goldenHour: (observer: import("./types.js").ObserverParams) => {
            morning: {
                start: Date;
                end: Date;
            } | null;
            evening: {
                start: Date;
                end: Date;
            } | null;
        };
        readonly blueHour: (observer: import("./types.js").ObserverParams) => {
            morning: {
                start: Date;
                end: Date;
            } | null;
            evening: {
                start: Date;
                end: Date;
            } | null;
        };
        readonly flatFrameWindow: (observer: import("./types.js").ObserverParams) => {
            morning: {
                start: Date;
                end: Date;
            } | null;
            evening: {
                start: Date;
                end: Date;
            } | null;
        };
        readonly collimationStar: (observer: import("./types.js").ObserverParams) => {
            name: string;
            altitude: number;
            azimuth: number;
        } | null;
        readonly bortleClass: (sqm: number) => number;
        readonly sqmToNELM: (sqm: number) => number;
    };
    readonly Data: {
        get(id: string): import("./types.js").CelestialObject | null;
        getByName(name: string): import("./types.js").CelestialObject | null;
        all(): import("./types.js").CelestialObject[];
        getByType(type: import("./types.js").ObjectType): import("./types.js").CelestialObject[];
        getByTag(tag: string): import("./types.js").CelestialObject[];
        search(query: string): import("./types.js").CelestialObject[];
        nearby(center: import("./types.js").EquatorialCoord, radiusDeg: number): import("./types.js").ProximityResult[];
        imageUrls(id: string, width?: number): string[];
        progressiveImage(id: string, width?: number): import("./types.js").ProgressiveImageOptions | null;
        imageSrcset(id: string, widths?: number[]): string | null;
        resolveImages: typeof import("./index.js").resolveImages;
        getImage: typeof import("./index.js").getObjectImage;
        prefetchImages: typeof import("./index.js").prefetchImages;
        stars(): readonly import("./index.js").BrightStar[];
        getStarByName(name: string): import("./index.js").BrightStar | null;
        getStarsByConstellation(con: string): import("./index.js").BrightStar[];
        nearbyStars(center: import("./types.js").EquatorialCoord, radiusDeg: number): Array<{
            star: import("./index.js").BrightStar;
            separation: number;
        }>;
        constellations(): readonly import("./index.js").Constellation[];
        getConstellation(abbr: string): import("./index.js").Constellation | null;
        messier(): readonly import("./index.js").MessierObject[];
        getMessier(number: number): import("./index.js").MessierObject | null;
        showers(): readonly import("./index.js").MeteorShower[];
        getActiveShowers(date: Date): import("./index.js").MeteorShower[];
        loadStarTier(tier: 1 | 2): Promise<number>;
        loadedStarTiers(): ReadonlySet<number>;
    };
    readonly Media: {
        readonly chainLoad: (urls: string[]) => Promise<string>;
        readonly progressive: (target: HTMLImageElement | HTMLElement, opts: import("./types.js").ProgressiveImageOptions) => Promise<void>;
        readonly preload: (urls: string[]) => Promise<string[]>;
        readonly wikimediaUrl: (filename: string, width?: number) => string;
        readonly cloudinaryUrl: (cloudName: string, publicId: string, opts?: import("./types.js").CloudinaryOptions) => string;
        readonly srcset: (widths: number[], transformer: (w: number) => string) => string;
        readonly optimalSize: (element: Element) => {
            width: number;
            height: number;
        };
        readonly _loadImage: (url: string) => Promise<string>;
    };
    readonly API: {
        readonly NASA: {
            setApiKey(key: string): void;
            searchImages(query: string, opts?: import("./api.js").NASASearchOptions): Promise<import("./types.js").NASAImageResult[]>;
            getAssets(nasaId: string): Promise<string[]>;
            getBestImageUrl(nasaId: string): Promise<string | null>;
            apod(date?: string | Date): Promise<import("./types.js").APODResult>;
            recentAPOD(count?: number): Promise<import("./types.js").APODResult[]>;
        };
        readonly ESA: {
            searchHubble(query: string, limit?: number): Promise<import("./types.js").ESAHubbleResult[]>;
        };
        readonly Astrobin: {
            readonly setCredentials: (apiKey: string, apiSecret: string) => void;
            readonly searchCameras: (query: string, options?: import("./astrobin.js").AstrobinSearchOptions) => Promise<import("./astrobin.js").AstrobinCamera[]>;
            readonly searchTelescopes: (query: string, options?: import("./astrobin.js").AstrobinSearchOptions) => Promise<import("./astrobin.js").AstrobinTelescope[]>;
            readonly toCamera: (astrobinCamera: import("./astrobin.js").AstrobinCamera, specs: {
                sensorWidth: number;
                sensorHeight: number;
                pixelSize: number;
                pixelsX?: number;
                pixelsY?: number;
            }) => import("./equipment.js").Camera;
            readonly toTelescope: (astrobinTelescope: import("./astrobin.js").AstrobinTelescope, overrides?: {
                aperture?: number;
                focalLength?: number;
            }) => import("./equipment.js").Telescope;
        };
        readonly resolveSimbad: typeof resolveSimbad;
    };
    readonly SkyMap: {
        readonly render: typeof renderSkyMap;
        readonly stereographic: typeof stereographic;
        readonly mollweide: typeof mollweide;
        readonly gnomonic: typeof gnomonic;
        readonly Interactive: typeof InteractiveSkyMap;
        readonly create: typeof createInteractiveSkyMap;
    };
    readonly Transitions: {
        readonly morph: typeof morph;
        readonly staggerIn: typeof staggerIn;
        readonly staggerOut: typeof staggerOut;
        readonly fade: typeof fade;
        readonly crossfade: typeof crossfade;
        readonly heroExpand: typeof heroExpand;
        readonly heroCollapse: typeof heroCollapse;
    };
};
export default Cosmos;
