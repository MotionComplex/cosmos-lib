import type { CelestialObject, ObserverParams, ObjectType, PlanetName } from './types.js';
/** A visible object with its current horizontal position and metadata. */
export interface VisibleObject {
    /** The catalog object. */
    object: CelestialObject;
    /** Current altitude in degrees (above horizon). */
    alt: number;
    /** Current azimuth in degrees (0=N, 90=E, 180=S, 270=W). */
    az: number;
    /** Angular separation from the Moon in degrees, or `null` if Moon position unavailable. */
    moonSeparation: number | null;
    /** Moon interference score 0–1 (0 = no interference, 1 = full moon on top of object). */
    moonInterference: number;
}
/** Options for {@link Planner.whatsUp}. */
export interface WhatsUpOptions {
    /** Minimum altitude in degrees above horizon. @defaultValue `10` */
    minAltitude?: number;
    /** Maximum (faintest) apparent magnitude to include. @defaultValue `6` */
    magnitudeLimit?: number;
    /** Filter by object type(s). */
    types?: ObjectType[];
    /** Filter by constellation abbreviation (3-letter, case-insensitive). */
    constellation?: string;
    /** Filter by catalog tag (e.g. `'messier'`). */
    tag?: string;
    /** Maximum number of results. @defaultValue `50` */
    limit?: number;
}
/** A point on the altitude-vs-time visibility curve. */
export interface VisibilityCurvePoint {
    /** The date/time of this sample. */
    date: Date;
    /** Altitude in degrees at this time. */
    alt: number;
    /** Azimuth in degrees at this time. */
    az: number;
}
/** Result from {@link Planner.bestWindow}. */
export interface BestWindowResult {
    /** Time of maximum altitude. */
    peak: Date;
    /** Maximum altitude in degrees. */
    peakAltitude: number;
    /** Rise time (altitude crosses `minAlt`), or `null` if already up at start of night. */
    rise: Date | null;
    /** Set time (altitude drops below `minAlt`), or `null` if still up at end of night. */
    set: Date | null;
}
/** Result from planet opposition/conjunction detection. */
export interface PlanetEvent {
    /** The planet involved. */
    planet: PlanetName;
    /** Type of event. */
    type: 'opposition' | 'conjunction';
    /** Approximate date of the event. */
    date: Date;
    /** Elongation from the Sun in degrees at the event. */
    elongation: number;
}
/** Moon interference details for a target. */
export interface MoonInterference {
    /** Angular separation from the Moon in degrees. */
    separation: number;
    /** Moon illumination fraction 0–1. */
    illumination: number;
    /** Combined interference score 0–1 (0 = no interference, 1 = worst case). */
    score: number;
}
/** Airmass at a given time. */
export interface AirmassPoint {
    /** The date/time of this sample. */
    date: Date;
    /** Altitude in degrees. */
    alt: number;
    /** Airmass value (1.0 at zenith, higher near horizon). */
    airmass: number;
}
/**
 * Observation planning utilities — "What can I see tonight?"
 *
 * Provides functions to determine which objects are visible for a given
 * observer, compute optimal viewing windows, altitude curves, moon
 * interference scoring, airmass calculations, and planet event detection.
 *
 * @example
 * ```ts
 * import { Planner } from '@motioncomplex/cosmos-lib'
 *
 * const observer = { lat: 47.05, lng: 8.31, date: new Date('2024-08-15') }
 *
 * // What's visible tonight?
 * const visible = Planner.whatsUp(observer)
 * visible.forEach(v => console.log(v.object.name, `alt: ${v.alt.toFixed(1)}°`))
 *
 * // Best time to observe M42
 * const window = Planner.bestWindow('m42', observer)
 * console.log('Peak altitude:', window?.peakAltitude.toFixed(1))
 *
 * // Altitude curve for Sirius
 * const curve = Planner.visibilityCurve('sirius', observer)
 * ```
 */
export declare const Planner: {
    /**
     * Objects currently above the horizon, sorted by altitude (highest first).
     *
     * Returns all catalog objects that are above the specified minimum altitude
     * at the observer's date/time, filtered by optional magnitude limit,
     * object type, constellation, or catalog tag. Each result includes the
     * current alt/az position and moon interference scoring.
     *
     * @param observer - Observer location and time.
     * @param options - Filtering and sorting options.
     * @returns Visible objects sorted by altitude (highest first).
     *
     * @example
     * ```ts
     * const visible = Planner.whatsUp(
     *   { lat: 47.05, lng: 8.31, date: new Date('2024-08-15T22:00:00Z') },
     *   { minAltitude: 15, magnitudeLimit: 5, types: ['nebula', 'cluster', 'galaxy'] }
     * )
     * ```
     */
    readonly whatsUp: (observer: ObserverParams, options?: WhatsUpOptions) => VisibleObject[];
    /**
     * Find the best observation window for an object on a given night.
     *
     * Samples the object's altitude between astronomical dusk and dawn,
     * returning the peak altitude time and the rise/set times relative
     * to the minimum observable altitude.
     *
     * @param objectId - Catalog object ID (e.g. `'m42'`, `'sirius'`, `'jupiter'`).
     * @param observer - Observer location and date (date determines which night).
     * @param minAlt - Minimum useful altitude in degrees. @defaultValue `10`
     * @returns The best window, or `null` if the object is never above `minAlt` during darkness.
     *
     * @example
     * ```ts
     * const window = Planner.bestWindow('m42', { lat: 47.05, lng: 8.31, date: new Date('2024-01-15') })
     * if (window) {
     *   console.log('Peak at', window.peak, `(${window.peakAltitude.toFixed(1)}°)`)
     * }
     * ```
     */
    readonly bestWindow: (objectId: string, observer: ObserverParams, minAlt?: number) => BestWindowResult | null;
    /**
     * Compute altitude vs. time for an object over a night.
     *
     * Returns an array of altitude/azimuth samples from astronomical dusk
     * to astronomical dawn, suitable for plotting a visibility curve.
     *
     * @param objectId - Catalog object ID.
     * @param observer - Observer location and date.
     * @param steps - Number of samples. @defaultValue `100`
     * @returns Array of time/alt/az points, or `null` if the object is unknown or no darkness occurs.
     *
     * @example
     * ```ts
     * const curve = Planner.visibilityCurve('sirius', { lat: 47.05, lng: 8.31, date: new Date('2024-01-15') })
     * // Plot curve.map(p => ({ x: p.date, y: p.alt }))
     * ```
     */
    readonly visibilityCurve: (objectId: string, observer: ObserverParams, steps?: number) => VisibilityCurvePoint[] | null;
    /**
     * Detect oppositions and conjunctions for outer planets near a given date.
     *
     * Scans a date range (default: 1 year forward) for dates where a planet's
     * elongation from the Sun is near 180° (opposition) or 0° (conjunction).
     *
     * @param observer - Observer with date as the start of the search range.
     * @param options - Search options.
     * @returns Array of detected planet events, sorted by date.
     *
     * @example
     * ```ts
     * const events = Planner.planetEvents({ lat: 47, lng: 8, date: new Date('2024-01-01') })
     * events.forEach(e => console.log(e.planet, e.type, e.date.toISOString()))
     * ```
     */
    readonly planetEvents: (observer: ObserverParams, options?: {
        planets?: PlanetName[];
        days?: number;
    }) => PlanetEvent[];
    /**
     * Moon interference score for a specific target.
     *
     * Combines angular separation from the Moon with the current lunar
     * illumination to produce a 0–1 interference score. Score of 0 means
     * no interference (new moon or far away), 1 means maximum interference
     * (full moon very close to the target).
     *
     * @param objectId - Catalog object ID.
     * @param observer - Observer location and time.
     * @returns Moon interference details, or `null` if the object is unknown.
     *
     * @example
     * ```ts
     * const mi = Planner.moonInterference('m42', { lat: 47, lng: 8, date: new Date() })
     * if (mi && mi.score > 0.5) console.log('Significant moon interference!')
     * ```
     */
    readonly moonInterference: (objectId: string, observer: ObserverParams) => MoonInterference | null;
    /**
     * Airmass curve for an object over a night.
     *
     * Returns airmass values (using Kasten & Young 1989 formula) sampled
     * from astronomical dusk to dawn. Airmass is 1.0 at zenith and increases
     * toward the horizon. Only points where the object is above the horizon
     * are included (airmass at or below 0° altitude is infinite).
     *
     * @param objectId - Catalog object ID.
     * @param observer - Observer location and date.
     * @param steps - Number of samples. @defaultValue `100`
     * @returns Array of time/alt/airmass points (only above-horizon), or `null`.
     *
     * @example
     * ```ts
     * const am = Planner.airmassCurve('sirius', { lat: 47, lng: 8, date: new Date('2024-01-15') })
     * // Plot am.map(p => ({ x: p.date, y: p.airmass }))
     * ```
     */
    readonly airmassCurve: (objectId: string, observer: ObserverParams, steps?: number) => AirmassPoint[] | null;
};
