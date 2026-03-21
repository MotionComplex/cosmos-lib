import type { ObserverParams, EquatorialCoord } from './types.js';
/** A scored target in a session plan. */
export interface SessionTarget {
    /** Object ID. */
    objectId: string;
    /** Object name. */
    name: string;
    /** Optimal imaging start time. */
    start: Date;
    /** Optimal imaging end time. */
    end: Date;
    /** Transit (meridian crossing) time. */
    transit: Date;
    /** Peak altitude in degrees. */
    peakAltitude: number;
    /** Airmass range [min, max] during the window. */
    airmassRange: [number, number];
    /** Moon separation in degrees. */
    moonSeparation: number;
    /** Moon interference score 0–1. */
    moonInterference: number;
    /** Overall quality score 0–100 (higher = better). */
    score: number;
}
/** Imaging window for a single target. */
export interface ImagingWindow {
    /** When the target rises above the airmass threshold. */
    start: Date | null;
    /** When the target drops below the airmass threshold. */
    end: Date | null;
    /** Transit time. */
    transit: Date;
    /** Peak altitude. */
    peakAltitude: number;
    /** Hours of usable imaging time. */
    hours: number;
}
/** Milky Way visibility information. */
export interface MilkyWayInfo {
    /** Galactic center (Sgr A*) equatorial position. */
    position: EquatorialCoord;
    /** Current altitude of galactic center. */
    altitude: number;
    /** Current azimuth of galactic center. */
    azimuth: number;
    /** Whether the core is above the horizon. */
    aboveHorizon: boolean;
    /** Rise time (null if circumpolar or never rises). */
    rise: Date | null;
    /** Set time. */
    set: Date | null;
    /** Transit time. */
    transit: Date;
}
/** Polar alignment info. */
export interface PolarAlignmentInfo {
    /** Angular offset of Polaris from true NCP in degrees. */
    polarisOffset: number;
    /** Position angle of Polaris relative to NCP in degrees (0=N, 90=E). */
    positionAngle: number;
    /** Polaris current altitude. */
    polarisAltitude: number;
    /** Polaris current azimuth. */
    polarisAzimuth: number;
    /** Hemisphere. */
    hemisphere: 'north' | 'south';
}
/** Session plan options. */
export interface SessionPlanOptions {
    /** Minimum altitude in degrees. @defaultValue `25` */
    minAltitude?: number | undefined;
    /** Maximum airmass. @defaultValue `2.0` */
    maxAirmass?: number | undefined;
    /** Minimum moon separation in degrees. @defaultValue `30` */
    minMoonSeparation?: number | undefined;
}
/**
 * Astrophotography planning utilities.
 *
 * Session planning, exposure calculators, Milky Way tracking, polar
 * alignment, and light pollution tools.
 *
 * @example
 * ```ts
 * import { AstroPhoto } from '@motioncomplex/cosmos-lib'
 *
 * const observer = { lat: 47.05, lng: 8.31, date: new Date('2024-08-15') }
 *
 * // Session plan for tonight
 * const plan = AstroPhoto.sessionPlan(observer, ['m31', 'm42', 'm45'])
 *
 * // Milky Way visibility
 * const mw = AstroPhoto.milkyWay(observer)
 *
 * // Exposure calculator
 * const maxSec = AstroPhoto.maxExposure({ focalLength: 200, pixelSize: 5.93 })
 * ```
 */
export declare const AstroPhoto: {
    /**
     * Generate a scored imaging plan for a night.
     *
     * Computes optimal windows for each target, scores them by altitude,
     * airmass, and moon interference, and sequences them by set-time-first
     * strategy (shoot western targets first).
     *
     * @param observer - Observer location and date.
     * @param targets - Array of object IDs to plan.
     * @param options - Constraints.
     * @returns Scored targets sorted by suggested imaging order.
     */
    readonly sessionPlan: (observer: ObserverParams, targets: string[], options?: SessionPlanOptions) => SessionTarget[];
    /**
     * Optimal imaging window for a single target.
     *
     * @param objectId - Catalog object ID.
     * @param observer - Observer location and date.
     * @param maxAirmass - Maximum acceptable airmass. @defaultValue `2.0`
     */
    readonly imagingWindow: (objectId: string, observer: ObserverParams, maxAirmass?: number) => ImagingWindow | null;
    /**
     * NPF rule — max untracked exposure before star trails.
     *
     * Formula: `(35 × aperture + 30 × pixelPitch) / focalLength`
     *
     * @param params - Optical parameters.
     * @param params.focalLength - Focal length in mm.
     * @param params.aperture - Aperture in mm. Defaults to focalLength / 5.
     * @param params.pixelSize - Pixel size in μm. Defaults to 4.0.
     * @param params.declination - Target declination in degrees (optional, corrects for pole proximity).
     */
    readonly maxExposure: (params: {
        focalLength: number;
        aperture?: number;
        pixelSize?: number;
        declination?: number;
    }) => number;
    /**
     * Rule of 500 — quick max exposure estimate.
     *
     * @param focalLength - Focal length in mm.
     * @param cropFactor - Sensor crop factor. @defaultValue `1.0`
     */
    readonly ruleOf500: (focalLength: number, cropFactor?: number) => number;
    /**
     * Optimal sub-exposure length so sky noise dominates read noise.
     *
     * @param params.readNoise - Camera read noise in electrons.
     * @param params.skyBrightness - Sky background in electrons/pixel/second.
     * @param params.targetRatio - Sky-to-read noise ratio. @defaultValue `3`
     */
    readonly subExposure: (params: {
        readNoise: number;
        skyBrightness: number;
        targetRatio?: number;
    }) => number;
    /**
     * Total integration time needed for a target SNR.
     *
     * @param params.subLength - Single sub-exposure length in seconds.
     * @param params.subSNR - SNR achieved in a single sub.
     * @param params.targetSNR - Desired final SNR.
     * @returns Total integration time in hours and number of subs.
     */
    readonly totalIntegration: (params: {
        subLength: number;
        subSNR: number;
        targetSNR: number;
    }) => {
        hours: number;
        subs: number;
    };
    /**
     * Galactic center (Sgr A*) position and rise/set/transit times.
     *
     * @param observer - Observer location and date.
     */
    readonly milkyWay: (observer: ObserverParams) => MilkyWayInfo;
    /**
     * Milky Way core season — months when the galactic center is visible
     * during astronomical darkness.
     *
     * @param observer - Observer location.
     * @returns Array of month numbers (1–12) when the core is visible at night.
     */
    readonly milkyWaySeason: (observer: ObserverParams) => number[];
    /**
     * Polar alignment info — Polaris offset from true NCP.
     *
     * @param observer - Observer location and date.
     */
    readonly polarAlignment: (observer: ObserverParams) => PolarAlignmentInfo;
    /**
     * Golden hour times (sun altitude +6° to -4°).
     */
    readonly goldenHour: (observer: ObserverParams) => {
        morning: {
            start: Date;
            end: Date;
        } | null;
        evening: {
            start: Date;
            end: Date;
        } | null;
    };
    /**
     * Blue hour times (sun altitude -4° to -6°).
     */
    readonly blueHour: (observer: ObserverParams) => {
        morning: {
            start: Date;
            end: Date;
        } | null;
        evening: {
            start: Date;
            end: Date;
        } | null;
    };
    /**
     * Optimal flat frame window — twilight with even sky brightness (sun at -2° to -6°).
     */
    readonly flatFrameWindow: (observer: ObserverParams) => {
        morning: {
            start: Date;
            end: Date;
        } | null;
        evening: {
            start: Date;
            end: Date;
        } | null;
    };
    /**
     * Brightest star near zenith — ideal for collimation and focusing.
     *
     * @param observer - Observer location and time.
     */
    readonly collimationStar: (observer: ObserverParams) => {
        name: string;
        altitude: number;
        azimuth: number;
    } | null;
    /**
     * Convert SQM (mag/arcsec²) to Bortle class.
     */
    readonly bortleClass: (sqm: number) => number;
    /**
     * Convert SQM to naked-eye limiting magnitude.
     */
    readonly sqmToNELM: (sqm: number) => number;
};
