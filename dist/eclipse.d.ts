/**
 * Describes a predicted eclipse event, returned by the {@link Eclipse} search methods.
 *
 * @remarks
 * The `magnitude` field represents the fraction of the Sun's (solar eclipse) or
 * Moon's (lunar eclipse) diameter covered at maximum eclipse. A magnitude of 1.0
 * indicates a total eclipse; values between 0 and 1 indicate partial coverage.
 * For annular solar eclipses, the magnitude equals the ratio of the Moon's
 * apparent diameter to the Sun's apparent diameter.
 */
export interface EclipseEvent {
    /** Whether this is a `'solar'` or `'lunar'` eclipse. */
    type: 'solar' | 'lunar';
    /** Eclipse subtype: `'total'`, `'annular'`, `'partial'`, or `'penumbral'` (lunar only). */
    subtype: 'total' | 'annular' | 'partial' | 'penumbral';
    /** Date and time of maximum eclipse (approximate). */
    date: Date;
    /** Eclipse magnitude: fraction of diameter covered at maximum (0 to 1+). */
    magnitude: number;
}
/**
 * Eclipse prediction using a simplified Besselian approach.
 *
 * Checks for eclipses near new moons (solar) and full moons (lunar) by
 * computing the angular separation between the Sun and Moon and comparing
 * it against their apparent angular radii. Solar eclipses are classified
 * as total, annular, or partial; lunar eclipses as total, partial, or
 * penumbral.
 *
 * @remarks
 * Based on Jean Meeus, "Astronomical Algorithms" (2nd ed.), Chapters 54-55.
 * This is a simplified geometric approach that does not perform a full
 * Besselian element calculation. It iterates over lunations (new moons for
 * solar eclipses, full moons for lunar eclipses) and tests whether the
 * Moon's ecliptic latitude is small enough for an eclipse to occur.
 *
 * Accuracy is sufficient for predicting whether an eclipse occurs and its
 * approximate type and magnitude, but not for computing local circumstances
 * (contact times, path of totality, etc.).
 *
 * @example
 * ```ts
 * import { Eclipse } from '@motioncomplex/cosmos-lib'
 *
 * // Find the next solar eclipse after the 2024 vernal equinox
 * const solar = Eclipse.nextSolar(new Date('2024-03-20'))
 * if (solar) {
 *   console.log(`${solar.subtype} solar eclipse on ${solar.date.toISOString()}`)
 *   console.log(`Magnitude: ${solar.magnitude.toFixed(3)}`)
 * }
 *
 * // Search for all eclipses in 2024
 * const eclipses = Eclipse.search(
 *   new Date('2024-01-01'),
 *   new Date('2025-01-01'),
 * )
 * eclipses.forEach(e => console.log(`${e.type} ${e.subtype} — ${e.date.toISOString()}`))
 * ```
 */
export declare const Eclipse: {
    /**
     * Find the next solar eclipse after the given date.
     *
     * Iterates through upcoming new moons (up to 26 lunations, approximately
     * 2 years) and checks each one for a solar eclipse condition.
     *
     * @param date - Start date from which to search forward. Defaults to the current date/time.
     * @returns An {@link EclipseEvent} describing the next solar eclipse, or `null` if none is found within approximately 2 years.
     *
     * @example
     * ```ts
     * import { Eclipse } from '@motioncomplex/cosmos-lib'
     *
     * const next = Eclipse.nextSolar(new Date('2024-03-20'))
     * if (next) {
     *   console.log(`Next solar eclipse: ${next.subtype} on ${next.date.toISOString()}`)
     *   console.log(`Magnitude: ${next.magnitude.toFixed(3)}`)
     * }
     * ```
     */
    readonly nextSolar: (date?: Date) => EclipseEvent | null;
    /**
     * Find the next lunar eclipse after the given date.
     *
     * Iterates through upcoming full moons (up to 26 lunations, approximately
     * 2 years) and checks each one for a lunar eclipse condition.
     *
     * @param date - Start date from which to search forward. Defaults to the current date/time.
     * @returns An {@link EclipseEvent} describing the next lunar eclipse, or `null` if none is found within approximately 2 years.
     *
     * @example
     * ```ts
     * import { Eclipse } from '@motioncomplex/cosmos-lib'
     *
     * const next = Eclipse.nextLunar(new Date('2024-03-20'))
     * if (next) {
     *   console.log(`Next lunar eclipse: ${next.subtype} on ${next.date.toISOString()}`)
     *   console.log(`Magnitude: ${next.magnitude.toFixed(3)}`)
     * }
     * ```
     */
    readonly nextLunar: (date?: Date) => EclipseEvent | null;
    /**
     * Search for all eclipses in a date range.
     *
     * Scans the interval from `startDate` to `endDate` in steps of approximately
     * 15 days, checking both new moons (solar) and full moons (lunar) for eclipse
     * conditions. Results are sorted chronologically and deduplicated (eclipses
     * found within 1 day of each other are treated as the same event).
     *
     * @remarks
     * The search advances by 15-day increments to ensure both new and full moons
     * within each lunation are tested. When `type` is specified, only that eclipse
     * type is checked, improving performance for targeted searches. Deduplication
     * uses a 1-day threshold to handle cases where the same eclipse is detected
     * from adjacent search windows.
     *
     * @param startDate - The beginning of the search window (inclusive).
     * @param endDate - The end of the search window (exclusive).
     * @param type - Optional filter: `'solar'` to search only for solar eclipses, `'lunar'` for only lunar eclipses, or omit for both.
     * @returns An array of {@link EclipseEvent} objects sorted by date, with duplicates removed.
     *
     * @example
     * ```ts
     * import { Eclipse } from '@motioncomplex/cosmos-lib'
     *
     * // Find all eclipses in 2024
     * const all = Eclipse.search(new Date('2024-01-01'), new Date('2025-01-01'))
     * console.log(`Found ${all.length} eclipses in 2024`)
     * all.forEach(e => console.log(`${e.type} ${e.subtype} — ${e.date.toISOString()}`))
     *
     * // Only solar eclipses in a 5-year span
     * const solar = Eclipse.search(
     *   new Date('2024-01-01'),
     *   new Date('2029-01-01'),
     *   'solar',
     * )
     * solar.forEach(e => console.log(`${e.subtype} solar eclipse: ${e.date.toISOString()}`))
     * ```
     */
    readonly search: (startDate: Date, endDate: Date, type?: "solar" | "lunar") => EclipseEvent[];
    /**
     * Check if a new moon produces a solar eclipse.
     *
     * Computes the Moon's ecliptic latitude and angular separation from the Sun
     * at the instant of new moon. If the Moon is within 1.5° of the ecliptic plane
     * and the angular separation is less than 1.5 times the sum of the apparent
     * solar and lunar radii, an eclipse is predicted. The subtype (total, annular,
     * or partial) is determined by comparing the apparent radii and the separation.
     *
     * @internal
     * @param newMoon - The date/time of the new moon to test.
     * @returns An {@link EclipseEvent} if a solar eclipse occurs at this new moon, or `null` otherwise.
     */
    readonly _checkSolarEclipse: (newMoon: Date) => EclipseEvent | null;
    /**
     * Check if a full moon produces a lunar eclipse.
     *
     * Computes the Moon's ecliptic latitude at the instant of full moon and
     * compares it against the angular radii of Earth's umbral and penumbral
     * shadow cones at the Moon's distance. The subtype (total, partial, or
     * penumbral) is determined by where the Moon's latitude falls relative
     * to the umbral and penumbral boundaries.
     *
     * @remarks
     * The umbral cone angular radius is approximated as 2.6 times the Earth's
     * angular radius at the Moon's distance, and the penumbral cone as 4.3 times.
     * These are simplified multipliers; a full calculation would use solar parallax
     * and Earth's atmospheric extension.
     *
     * @internal
     * @param fullMoon - The date/time of the full moon to test.
     * @returns An {@link EclipseEvent} if a lunar eclipse occurs at this full moon, or `null` otherwise.
     */
    readonly _checkLunarEclipse: (fullMoon: Date) => EclipseEvent | null;
};
