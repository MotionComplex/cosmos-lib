/**
 * Major meteor showers — ~30 significant annual showers.
 * Source: IAU Meteor Data Center + IMO Working List.
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
export declare const METEOR_SHOWERS: readonly MeteorShower[];
