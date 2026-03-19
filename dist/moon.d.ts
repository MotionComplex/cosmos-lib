import type { MoonPhase, MoonPosition, ObserverParams, RiseTransitSet } from './types.js';
/**
 * Lunar position and phase calculations.
 * Based on Meeus "Astronomical Algorithms", Chapters 47 and 49.
 * Accuracy: ~0.07° in longitude, ~0.04° in latitude.
 */
export declare const Moon: {
    /**
     * Geocentric equatorial and ecliptic position of the Moon.
     */
    readonly position: (date?: Date) => MoonPosition;
    /**
     * Moon phase information for a given date.
     */
    readonly phase: (date?: Date) => MoonPhase;
    /**
     * Find the next occurrence of a specific phase after the given date.
     * Uses iterative search with ~1-minute precision.
     */
    readonly nextPhase: (date?: Date, targetPhase?: "new" | "first-quarter" | "full" | "last-quarter") => Date;
    /**
     * Rise, transit, and set times for the Moon.
     * Uses the Moon's standard altitude of +0.125° (accounting for parallax).
     */
    readonly riseTransitSet: (obs: ObserverParams) => RiseTransitSet;
    /**
     * Optical libration angles (simplified).
     * Returns the apparent tilt of the Moon's face.
     */
    readonly libration: (date?: Date) => {
        l: number;
        b: number;
    };
};
