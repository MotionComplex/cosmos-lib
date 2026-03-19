/**
 * Classification of celestial objects in the catalog.
 *
 * @example
 * ```ts
 * import { Data } from '@motioncomplex/cosmos-lib'
 * const stars = Data.getByType('star')
 * ```
 */
export type ObjectType = 'star' | 'planet' | 'nebula' | 'galaxy' | 'cluster' | 'black-hole' | 'moon';
/** Unit of measurement for astronomical distances. */
export type DistanceUnit = 'km' | 'AU' | 'ly' | 'pc' | 'kpc' | 'Mpc';
/**
 * A distance value paired with its unit of measurement.
 *
 * @example
 * ```ts
 * const d: Distance = { value: 8.6, unit: 'ly' } // Sirius
 * ```
 */
export interface Distance {
    /** Numeric distance value. */
    value: number;
    /** Unit of the distance measurement. */
    unit: DistanceUnit;
}
/**
 * A celestial object in the catalog — star, planet, nebula, galaxy, cluster, or moon.
 *
 * This is the unified type returned by all `Data` query methods. Objects from
 * different catalogs (Messier, bright stars, solar system) are normalised into
 * this shape.
 *
 * @example
 * ```ts
 * import { Data } from '@motioncomplex/cosmos-lib'
 * const obj = Data.getByName('Sirius')
 * if (obj) console.log(obj.type, obj.magnitude) // 'star', -1.46
 * ```
 */
export interface CelestialObject {
    /** Unique identifier (e.g. `'sirius'`, `'m42'`, `'earth'`). */
    id: string;
    /** Primary display name. */
    name: string;
    /** Alternative names or catalog designations. */
    aliases: string[];
    /** Object classification. */
    type: ObjectType;
    /** Optional sub-classification (e.g. `'emission'` for a nebula). */
    subtype?: string;
    /** Right Ascension in degrees (J2000). Null for solar-system bodies. */
    ra: number | null;
    /** Declination in degrees (J2000). Null for solar-system bodies. */
    dec: number | null;
    /** Apparent visual magnitude. Null if unknown. */
    magnitude: number | null;
    /** Distance from Earth. */
    distance?: Distance;
    /** Human-readable description. */
    description: string;
    /** Searchable tags (e.g. `['star', 'binary']`). */
    tags: string[];
    /** Equatorial diameter in kilometres. */
    diameter_km?: number;
    /** Mass in kilograms. */
    mass_kg?: number;
    /** Number of known natural satellites. */
    moons?: number;
    /** Mean surface temperature in Kelvin. */
    surface_temp_K?: number;
    /** Spectral type (e.g. `'A1V'` for Sirius). */
    spectral?: string;
    /** Whether the object is a known binary system. */
    binary?: boolean;
    /** Whether the object is a known triple system. */
    triple?: boolean;
}
/**
 * A search result with a relevance score, returned by {@link Data.search}.
 *
 * @example
 * ```ts
 * const results = Data.search('orion')
 * results[0].score // higher = better match
 * ```
 */
export interface SearchResult {
    /** The matched celestial object. */
    object: CelestialObject;
    /** Relevance score (higher is better). */
    score: number;
}
/**
 * A proximity-search result returned by {@link Data.nearby}.
 *
 * @example
 * ```ts
 * const near = Data.nearby({ ra: 83.8, dec: -5.4 }, 10)
 * near[0].separation // angular distance in degrees
 * ```
 */
export interface ProximityResult {
    /** The matched celestial object. */
    object: CelestialObject;
    /** Angular separation in degrees from the search centre. */
    separation: number;
}
/**
 * Equatorial coordinate pair (J2000 epoch).
 *
 * The standard reference frame for star catalogues and telescope pointing.
 *
 * @example
 * ```ts
 * const sirius: EquatorialCoord = { ra: 101.287, dec: -16.716 }
 * ```
 */
export interface EquatorialCoord {
    /** Right Ascension in degrees (0–360). */
    ra: number;
    /** Declination in degrees (-90 to +90). */
    dec: number;
}
/**
 * Horizontal (topocentric) coordinate pair relative to an observer.
 *
 * @example
 * ```ts
 * const pos: HorizontalCoord = { alt: 42.3, az: 180 } // due south, 42° up
 * ```
 */
export interface HorizontalCoord {
    /** Altitude in degrees (+ = above horizon, - = below). */
    alt: number;
    /** Azimuth in degrees (0 = North, 90 = East, 180 = South, 270 = West). */
    az: number;
}
/**
 * Galactic coordinate pair in the IAU 1958 system.
 *
 * @example
 * ```ts
 * const gc: GalacticCoord = { l: 0, b: 0 } // galactic centre
 * ```
 */
export interface GalacticCoord {
    /** Galactic longitude in degrees (0–360). */
    l: number;
    /** Galactic latitude in degrees (-90 to +90). */
    b: number;
}
/**
 * Ecliptic coordinate pair referred to the mean ecliptic of J2000.
 *
 * @example
 * ```ts
 * const ec: EclipticCoord = { lon: 79.3, lat: 1.2 }
 * ```
 */
export interface EclipticCoord {
    /** Ecliptic longitude in degrees (0–360). */
    lon: number;
    /** Ecliptic latitude in degrees (-90 to +90). */
    lat: number;
}
/**
 * Geographic location and time of an observer, required by functions
 * that compute topocentric positions (e.g. rise/set, alt/az).
 *
 * @example
 * ```ts
 * const lucerne: ObserverParams = { lat: 47.05, lng: 8.31, date: new Date() }
 * ```
 */
export interface ObserverParams {
    /** Geographic latitude in degrees (-90 to +90). */
    lat: number;
    /** Geographic longitude in degrees (east positive, -180 to +180). */
    lng: number;
    /** Observation date/time. Defaults to `new Date()` when omitted. */
    date?: Date;
}
/**
 * A 2-D projected point on a sky map canvas.
 */
export interface ProjectedPoint {
    /** Horizontal pixel offset. */
    x: number;
    /** Vertical pixel offset. */
    y: number;
    /** Whether the point is on the visible side of the projection. */
    visible: boolean;
}
/**
 * Name of a planet supported by {@link AstroMath.planetEcliptic}.
 */
export type PlanetName = 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune';
/**
 * Heliocentric ecliptic position of a planet, returned by
 * {@link AstroMath.planetEcliptic}.
 */
export interface PlanetPosition extends EclipticCoord {
    /** Heliocentric distance in AU. */
    r: number;
    /** Mean anomaly in degrees. */
    M: number;
    /** True anomaly in degrees. */
    nu: number;
}
/**
 * Nutation corrections returned by {@link AstroMath.nutation}.
 */
export interface NutationResult {
    /** Nutation in longitude (degrees). */
    dPsi: number;
    /** Nutation in obliquity (degrees). */
    dEpsilon: number;
}
/**
 * Rise, transit, and set times for a celestial object at a given location.
 *
 * `rise` and `set` are `null` for circumpolar objects or objects that never
 * rise above the horizon.
 *
 * @example
 * ```ts
 * const rts = AstroMath.riseTransitSet(sirius, observer)
 * if (rts.rise) console.log('Rises at', rts.rise.toLocaleTimeString())
 * ```
 */
export interface RiseTransitSet {
    /** Rise time, or `null` if the object is circumpolar or never rises. */
    rise: Date | null;
    /** Transit (meridian crossing) time. */
    transit: Date;
    /** Set time, or `null` if the object is circumpolar or never sets. */
    set: Date | null;
}
/**
 * Human-readable lunar phase name.
 */
export type MoonPhaseName = 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
/**
 * Lunar phase information returned by {@link Moon.phase}.
 *
 * @example
 * ```ts
 * const p = Moon.phase()
 * console.log(p.name, `${(p.illumination * 100).toFixed(0)}%`)
 * ```
 */
export interface MoonPhase {
    /** Phase angle 0–1 (0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter). */
    phase: number;
    /** Illuminated fraction 0–1. */
    illumination: number;
    /** Days since last new moon (0–29.5). */
    age: number;
    /** Human-readable phase name. */
    name: MoonPhaseName;
}
/**
 * Geocentric equatorial position of the Moon, returned by {@link Moon.position}.
 */
export interface MoonPosition extends EquatorialCoord {
    /** Distance from Earth's centre in kilometres. */
    distance_km: number;
    /** Ecliptic longitude in degrees. */
    eclipticLon: number;
    /** Ecliptic latitude in degrees. */
    eclipticLat: number;
    /** Horizontal parallax in degrees. */
    parallax: number;
}
/**
 * Geocentric equatorial position of the Sun, returned by {@link Sun.position}.
 */
export interface SunPosition extends EquatorialCoord {
    /** Distance from Earth in AU. */
    distance_AU: number;
    /** Ecliptic longitude in degrees. */
    eclipticLon: number;
}
/**
 * Civil, nautical, and astronomical twilight times for a given observer,
 * returned by {@link Sun.twilight}.
 *
 * Values are `null` for polar locations where that twilight phase does not
 * occur on the given date.
 *
 * @example
 * ```ts
 * const tw = Sun.twilight({ lat: 51.5, lng: -0.1 })
 * console.log('Sunrise:', tw.sunrise?.toLocaleTimeString())
 * ```
 */
export interface TwilightTimes {
    /** Sun centre at -18° altitude (earliest meaningful dawn). */
    astronomicalDawn: Date | null;
    /** Sun centre at -12° altitude. */
    nauticalDawn: Date | null;
    /** Sun centre at -6° altitude. */
    civilDawn: Date | null;
    /** Upper limb crosses the horizon (accounting for refraction). */
    sunrise: Date | null;
    /** Sun transits the local meridian. */
    solarNoon: Date;
    /** Upper limb crosses the horizon. */
    sunset: Date | null;
    /** Sun centre at -6° altitude. */
    civilDusk: Date | null;
    /** Sun centre at -12° altitude. */
    nauticalDusk: Date | null;
    /** Sun centre at -18° altitude (full darkness). */
    astronomicalDusk: Date | null;
}
/**
 * A single result from the NASA Image and Video Library search,
 * returned by {@link NASA.searchImages}.
 */
export interface NASAImageResult {
    /** NASA-assigned unique identifier. */
    nasaId: string;
    /** Title of the image or video. */
    title: string;
    /** Full description text. */
    description: string;
    /** ISO-8601 date string of the asset. */
    date: string;
    /** Originating NASA centre (e.g. `'JPL'`, `'GSFC'`). */
    center: string;
    /** Associated keywords. */
    keywords: string[];
    /** Preview image URL, or `null` if unavailable. */
    previewUrl: string | null;
    /** Collection asset URL. */
    href: string;
}
/**
 * Astronomy Picture of the Day result, returned by {@link NASA.apod}.
 */
export interface APODResult {
    /** Title of today's picture. */
    title: string;
    /** ISO-8601 date string. */
    date: string;
    /** Explanatory text written by a professional astronomer. */
    explanation: string;
    /** Standard-resolution media URL. */
    url: string;
    /** High-definition media URL. */
    hdUrl: string;
    /** Whether the APOD is an image or a video (e.g. YouTube embed). */
    mediaType: 'image' | 'video';
    /** Copyright holder, or empty string for public-domain images. */
    copyright: string;
}
/**
 * A result from the ESA/Hubble image archive, returned by {@link ESA.searchHubble}.
 */
export interface ESAHubbleResult {
    /** ESA-assigned identifier. */
    id: string;
    /** Title of the observation. */
    title: string;
    /** Description text. */
    description: string;
    /** Image credit / attribution. */
    credit: string;
    /** ISO-8601 date string. */
    date: string;
    /** Full-resolution image URL, or `null` if unavailable. */
    imageUrl: string | null;
    /** Thumbnail URL, or `null` if unavailable. */
    thumbUrl: string | null;
    /** Descriptive tags. */
    tags: string[];
}
/**
 * A resolved object from the CDS Simbad service, returned by {@link resolveSimbad}.
 */
export interface SimbadResult {
    /** Simbad main identifier. */
    id: string;
    /** Right Ascension in degrees (J2000). */
    ra: number;
    /** Declination in degrees (J2000). */
    dec: number;
    /** Simbad object type code. */
    type: string;
}
/**
 * A reference to a Wikimedia Commons image with attribution.
 */
export interface ImageRef {
    /** Wikimedia Commons filename (no URL prefix). */
    filename: string;
    /** Attribution / credit string. */
    credit: string;
}
/**
 * Configuration for {@link Media.progressive} blur-up image loading.
 *
 * @example
 * ```ts
 * await Media.progressive(imgEl, {
 *   placeholder: 'data:image/jpeg;base64,/9j/4A...',
 *   src: 'nebula-800w.jpg',
 *   srcHD: 'nebula-4k.jpg',
 * })
 * ```
 */
export interface ProgressiveImageOptions {
    /** Tiny blurred base64 or low-res URL shown immediately. */
    placeholder?: string;
    /** Medium-quality URL (shown while HD loads). */
    src: string;
    /** Full-resolution URL loaded last. */
    srcHD?: string;
}
/**
 * Cloudinary transformation options passed to {@link Media.cloudinaryUrl}.
 */
export interface CloudinaryOptions {
    /** Width in pixels. */
    w?: number;
    /** Height in pixels. */
    h?: number;
    /** Quality (1–100) or `'auto'` for adaptive quality. */
    q?: number | 'auto';
    /** Format (e.g. `'webp'`) or `'auto'` for automatic format. */
    f?: string | 'auto';
    /** Crop mode (e.g. `'fill'`, `'fit'`). */
    crop?: string;
}
/** Map projection type supported by the sky map renderer. */
export type ProjectionName = 'stereographic' | 'mollweide' | 'gnomonic';
/**
 * Configuration for {@link renderSkyMap}.
 *
 * @example
 * ```ts
 * renderSkyMap(canvas, Data.all(), {
 *   projection: 'stereographic',
 *   center: { ra: 83.8, dec: -5.4 },
 *   scale: 300,
 *   showGrid: true,
 *   showMagnitudeLimit: 8,
 * })
 * ```
 */
export interface SkyMapRenderOptions {
    /** Projection type. @defaultValue `'stereographic'` */
    projection?: ProjectionName;
    /** Centre point of the map in equatorial coordinates. */
    center?: EquatorialCoord;
    /** Zoom scale factor (pixels per radian). @defaultValue `200` */
    scale?: number;
    /** Draw an RA/Dec coordinate grid. @defaultValue `false` */
    showGrid?: boolean;
    /** Label stars and objects by name. @defaultValue `false` */
    showLabels?: boolean;
    /** Only render objects brighter than this magnitude. */
    showMagnitudeLimit?: number;
    /** Canvas background CSS colour. @defaultValue `'#000'` */
    background?: string;
    /** Grid line CSS colour. */
    gridColor?: string;
    /** Label text CSS colour. */
    labelColor?: string;
    /** Show constellation stick-figure lines. Requires constellation data. */
    showConstellationLines?: boolean;
    /** Show constellation name labels at centre positions. */
    showConstellationLabels?: boolean;
    /** CSS colour for constellation stick-figure lines. */
    constellationLineColor?: string;
    /** CSS colour for constellation name labels. */
    constellationLabelColor?: string;
    /** Constellation data to render. Pass `CONSTELLATIONS` from the data module. */
    constellations?: Array<{
        ra: number;
        dec: number;
        name: string;
        stickFigure: number[][];
    }>;
}
/**
 * Options for {@link morph}, which wraps a DOM mutation in a View Transition.
 */
export interface MorphOptions {
    /** Animation duration in milliseconds. @defaultValue `300` */
    duration?: number;
    /** CSS easing function. @defaultValue `'ease'` */
    easing?: string;
    /** Abort signal to cancel the transition. */
    signal?: AbortSignal;
}
/**
 * Options for {@link staggerIn} and {@link staggerOut}.
 */
export interface StaggerOptions {
    /** Initial delay before the first child animates, in ms. @defaultValue `0` */
    delay?: number;
    /** Delay between successive children, in ms. @defaultValue `50` */
    stagger?: number;
    /** Animation duration per child, in ms. @defaultValue `400` */
    duration?: number;
    /** Direction children slide in from. @defaultValue `'bottom'` */
    from?: 'top' | 'bottom' | 'left' | 'right';
    /** CSS distance to slide (e.g. `'20px'`). @defaultValue `'20px'` */
    distance?: string;
    /** Abort signal to cancel the animation. */
    signal?: AbortSignal;
}
/**
 * Options for {@link heroExpand} and {@link heroCollapse}.
 */
export interface HeroExpandOptions {
    /** Animation duration in milliseconds. @defaultValue `500` */
    duration?: number;
    /** CSS easing function. @defaultValue `'ease'` */
    easing?: string;
    /** Callback invoked when the animation completes. */
    onDone?: () => void;
    /** Abort signal to cancel the animation. */
    signal?: AbortSignal;
}
