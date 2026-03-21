import type { ObserverParams } from './types.js';
/** All supported astronomical event categories. */
export type AstroEventCategory = 'moon-phase' | 'eclipse' | 'meteor-shower' | 'opposition' | 'conjunction' | 'equinox' | 'solstice' | 'elongation';
/**
 * A unified astronomical event — the common shape returned by all event
 * detection functions.
 */
export interface AstroEvent {
    /** Event category. */
    category: AstroEventCategory;
    /** Human-readable title (e.g. "Full Moon", "Mars opposition", "Perseid meteor shower peak"). */
    title: string;
    /** Approximate date/time of the event. */
    date: Date;
    /** Optional additional detail. */
    detail?: string;
    /** Sky position in equatorial coordinates (J2000), if applicable. For meteor showers this is the radiant; for planet events this is the planet's position. */
    ra?: number | undefined;
    /** Declination in degrees, if applicable. */
    dec?: number | undefined;
    /** Constellation where the event occurs (3-letter IAU abbreviation), if applicable. */
    constellation?: string | undefined;
    /** Observer-specific visibility assessment, if an observer was provided. */
    visibility?: EventVisibility | undefined;
}
/**
 * Observer-specific visibility assessment for an astronomical event.
 *
 * Computed when an observer location is provided to `nextEvents()`.
 * Tells you whether the event is visible from your location and how
 * good the conditions are.
 */
export interface EventVisibility {
    /** Whether the event target is above the horizon during darkness at the observer's location. */
    visible: boolean;
    /** Peak altitude of the target above horizon during darkness (degrees). Negative means never rises. */
    peakAltitude: number;
    /** Moon interference score 0–1 (0 = no interference, 1 = full moon nearby). */
    moonInterference: number;
    /** Human-readable summary (e.g. "Excellent — radiant at 72° alt, no moon"). */
    summary: string;
}
/** Options for {@link Events.nextEvents}. */
export interface NextEventsOptions {
    /** Number of days to scan forward. @defaultValue `90` */
    days?: number;
    /** Filter by event categories. @defaultValue all categories */
    categories?: AstroEventCategory[];
    /** Maximum results. @defaultValue `50` */
    limit?: number;
}
/**
 * Astronomical event calendar — upcoming events feed.
 *
 * Aggregates moon phases, eclipses, meteor shower peaks, planet
 * oppositions/conjunctions, equinoxes, and solstices into a unified
 * timeline. Supports filtering by category, date range, and iCal export.
 *
 * @example
 * ```ts
 * import { Events } from '@motioncomplex/cosmos-lib'
 *
 * const upcoming = Events.nextEvents(
 *   { lat: 47, lng: 8, date: new Date() },
 *   { days: 90, limit: 20 }
 * )
 * upcoming.forEach(e => console.log(e.date.toLocaleDateString(), e.title))
 *
 * const nextFull = Events.nextEvent('moon-phase', { lat: 47, lng: 8 })
 * ```
 */
export declare const Events: {
    /**
     * Find upcoming astronomical events within a date range.
     *
     * Scans forward from the observer's date, aggregating events from
     * multiple sources: moon phases, eclipses, meteor showers, planet
     * events, equinoxes, and solstices. Results are sorted by date.
     *
     * @param observer - Observer location and start date.
     * @param options - Filtering and limit options.
     * @returns Array of events sorted by date.
     *
     * @example
     * ```ts
     * const events = Events.nextEvents(
     *   { lat: 47, lng: 8, date: new Date('2024-01-01') },
     *   { days: 365, categories: ['eclipse', 'opposition'] }
     * )
     * ```
     */
    readonly nextEvents: (observer: ObserverParams, options?: NextEventsOptions) => AstroEvent[];
    /**
     * Find the next occurrence of a specific event category.
     *
     * @param category - The event category to search for.
     * @param observer - Observer location and start date.
     * @param days - How far to search forward. @defaultValue `365`
     * @returns The next event, or `null` if none found in the range.
     *
     * @example
     * ```ts
     * const nextEclipse = Events.nextEvent('eclipse', { lat: 47, lng: 8 })
     * const nextOpposition = Events.nextEvent('opposition', { lat: 47, lng: 8 })
     * ```
     */
    readonly nextEvent: (category: AstroEventCategory, observer: ObserverParams, days?: number) => AstroEvent | null;
    /**
     * Export events as an iCal (`.ics`) string.
     *
     * Generates a valid iCalendar file with VEVENT entries for each event.
     * Events are all-day events (no specific time) since most astronomical
     * events span hours or occur at observer-dependent times.
     *
     * @param events - Array of events to export.
     * @param calendarName - Calendar name. @defaultValue `'Astronomical Events'`
     * @returns A string in iCalendar format, ready to save as `.ics`.
     *
     * @example
     * ```ts
     * const events = Events.nextEvents(observer, { days: 365 })
     * const ical = Events.toICal(events)
     * download('astro-events.ics', ical, 'text/calendar')
     * ```
     */
    readonly toICal: (events: AstroEvent[], calendarName?: string) => string;
};
