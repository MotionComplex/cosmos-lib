import type { ObserverParams, SunPosition, TwilightTimes } from './types.js';
/**
 * Solar position and twilight calculations.
 * Derives geocentric Sun from the Earth ephemeris (heliocentric Earth + 180°).
 */
export declare const Sun: {
    /**
     * Geocentric equatorial position of the Sun.
     * Accuracy: ~0.01° for dates within a few centuries of J2000.
     */
    readonly position: (date?: Date) => SunPosition;
    /**
     * Solar noon (transit) for a given observer.
     */
    readonly solarNoon: (obs: ObserverParams) => Date;
    /**
     * Equation of time in minutes.
     * Difference between apparent solar time and mean solar time.
     */
    readonly equationOfTime: (date?: Date) => number;
    /**
     * Complete twilight times for an observer.
     * Returns sunrise/sunset plus civil, nautical, and astronomical twilight.
     */
    readonly twilight: (obs: ObserverParams) => TwilightTimes;
};
