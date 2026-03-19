/**
 * Eclipse event result.
 */
export interface EclipseEvent {
    /** 'solar' or 'lunar' */
    type: 'solar' | 'lunar';
    /** Eclipse subtype */
    subtype: 'total' | 'annular' | 'partial' | 'penumbral';
    /** Date/time of maximum eclipse */
    date: Date;
    /** Eclipse magnitude (fraction of diameter covered) */
    magnitude: number;
}
/**
 * Eclipse prediction using simplified Besselian approach.
 * Based on Meeus, Chapters 54-55.
 *
 * Checks for eclipses near new moons (solar) and full moons (lunar)
 * by computing the angular separation between Sun and Moon.
 */
export declare const Eclipse: {
    /**
     * Find the next solar eclipse after the given date.
     * Returns null if none found within ~2 years.
     */
    readonly nextSolar: (date?: Date) => EclipseEvent | null;
    /**
     * Find the next lunar eclipse after the given date.
     * Returns null if none found within ~2 years.
     */
    readonly nextLunar: (date?: Date) => EclipseEvent | null;
    /**
     * Search for all eclipses in a date range.
     */
    readonly search: (startDate: Date, endDate: Date, type?: "solar" | "lunar") => EclipseEvent[];
    /**
     * Check if a new moon produces a solar eclipse.
     * @internal
     */
    readonly _checkSolarEclipse: (newMoon: Date) => EclipseEvent | null;
    /**
     * Check if a full moon produces a lunar eclipse.
     * @internal
     */
    readonly _checkLunarEclipse: (fullMoon: Date) => EclipseEvent | null;
};
