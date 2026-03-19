/**
 * Major meteor showers -- ~23 significant annual showers.
 *
 * Source: IAU Meteor Data Center + IMO Working List.
 *
 * @module
 */
/**
 * A meteor shower with radiant position, timing, and activity data.
 *
 * Activity windows are defined by solar longitude and approximate calendar
 * dates. The zenithal hourly rate (ZHR) represents the theoretical peak
 * rate under ideal conditions.
 */
export interface MeteorShower {
    /** Unique identifier */
    id: string;
    /** Common name */
    name: string;
    /** IAU 3-letter code */
    code: string;
    /** Radiant Right Ascension in degrees */
    radiantRA: number;
    /** Radiant Declination in degrees */
    radiantDec: number;
    /** Peak solar longitude in degrees */
    solarLon: number;
    /** Approximate peak date (MMM DD) */
    peakDate: string;
    /** Activity start date (MMM DD) */
    start: string;
    /** Activity end date (MMM DD) */
    end: string;
    /** Zenithal Hourly Rate at peak */
    zhr: number;
    /** Geocentric velocity in km/s */
    speed: number;
    /** Parent body (comet or asteroid) */
    parentBody?: string;
}
/**
 * All major annual meteor showers with radiant positions, peak dates,
 * activity windows, and zenithal hourly rates.
 *
 * Solar longitudes can be compared against the Sun's ecliptic longitude
 * (from `AstroMath.planetEcliptic`) to determine which showers are
 * currently active. See {@link Data.getActiveShowers} for a convenience method.
 *
 * @example
 * ```ts
 * import { METEOR_SHOWERS } from '@motioncomplex/cosmos-lib'
 *
 * const perseids = METEOR_SHOWERS.find(s => s.id === 'perseids')
 * console.log(perseids?.zhr)        // 100
 * console.log(perseids?.parentBody) // '109P/Swift-Tuttle'
 * console.log(perseids?.peakDate)   // 'Aug 12'
 *
 * // Get showers with ZHR > 50
 * const major = METEOR_SHOWERS.filter(s => s.zhr > 50)
 * ```
 */
export declare const METEOR_SHOWERS: readonly MeteorShower[];
