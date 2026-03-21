/**
 * React hooks for `@motioncomplex/cosmos-lib`.
 *
 * Import from the `/react` sub-path:
 *
 * ```ts
 * import { useSkyPosition, useMoonPhase, useWhatsUp } from '@motioncomplex/cosmos-lib/react'
 * ```
 *
 * All hooks are SSR-safe — they return sensible defaults during server
 * rendering and only start intervals/effects in the browser. React is an
 * optional peer dependency; this module is not included in the core bundle.
 *
 * @packageDocumentation
 */
import { type RefObject } from 'react';
import { AstroClock } from '../clock.js';
import { InteractiveSkyMap } from '../skymap-interactive.js';
import type { ObserverParams, HorizontalCoord, MoonPhase, TwilightTimes, CelestialObject, InteractiveSkyMapOptions } from '../types.js';
import type { VisibleObject, WhatsUpOptions } from '../planner.js';
import type { AstroClockOptions } from '../clock.js';
/**
 * Reactive altitude/azimuth for any catalog object.
 *
 * Recomputes the horizontal position at a configurable interval (default 10s).
 * For solar-system bodies, dynamically computes the current RA/Dec.
 *
 * @param objectId - Catalog object ID (e.g. `'sirius'`, `'mars'`, `'m42'`).
 * @param observer - Observer location.
 * @param intervalMs - Update interval in milliseconds. @defaultValue `10000`
 * @returns Current `{ alt, az }` or `null` if the object is unknown.
 *
 * @example
 * ```tsx
 * const pos = useSkyPosition('sirius', { lat: 47.05, lng: 8.31 })
 * return <p>Sirius: {pos?.alt.toFixed(1)}° alt</p>
 * ```
 */
export declare function useSkyPosition(objectId: string, observer: ObserverParams, intervalMs?: number): HorizontalCoord | null;
/**
 * Reactive Moon phase data.
 *
 * Returns current phase, illumination, age, and name, updating at
 * the specified interval (default 60s).
 *
 * @param date - Fixed date, or omit for live updates.
 * @param intervalMs - Update interval in ms (only used when `date` is omitted). @defaultValue `60000`
 * @returns Current {@link MoonPhase} data.
 *
 * @example
 * ```tsx
 * const phase = useMoonPhase()
 * return <p>{phase.name} — {(phase.illumination * 100).toFixed(0)}%</p>
 * ```
 */
export declare function useMoonPhase(date?: Date, intervalMs?: number): MoonPhase;
/** Return value of {@link useAstroClock}. */
export interface UseAstroClockReturn {
    /** Current simulation date (updates on each tick). */
    date: Date;
    /** Current speed multiplier. */
    speed: number;
    /** Whether the clock is playing. */
    playing: boolean;
    /** Start or resume playback. */
    play: () => void;
    /** Pause playback. */
    pause: () => void;
    /** Set the simulation date. */
    setDate: (date: Date) => void;
    /** Set the speed multiplier. */
    setSpeed: (speed: number) => void;
    /** The underlying AstroClock instance. */
    clock: AstroClock;
}
/**
 * AstroClock instance managed by React lifecycle.
 *
 * Creates, controls, and disposes an {@link AstroClock} automatically.
 * State updates (date, speed, playing) trigger re-renders.
 *
 * @param options - AstroClock options.
 * @returns Controls and reactive state for the clock.
 *
 * @example
 * ```tsx
 * const { date, playing, play, pause, setSpeed } = useAstroClock({ speed: 60 })
 * return (
 *   <div>
 *     <p>{date.toLocaleTimeString()}</p>
 *     <button onClick={playing ? pause : play}>{playing ? 'Pause' : 'Play'}</button>
 *   </div>
 * )
 * ```
 */
export declare function useAstroClock(options?: AstroClockOptions): UseAstroClockReturn;
/**
 * Reactive list of visible objects above the horizon.
 *
 * Recomputes at the specified interval using {@link Planner.whatsUp}.
 *
 * @param observer - Observer location.
 * @param options - WhatsUp filtering options.
 * @param intervalMs - Update interval in ms. @defaultValue `30000`
 * @returns Array of visible objects with alt/az and moon interference.
 *
 * @example
 * ```tsx
 * const visible = useWhatsUp({ lat: 47, lng: 8 }, { magnitudeLimit: 4, limit: 10 })
 * return <ul>{visible.map(v => <li key={v.object.id}>{v.object.name} ({v.alt.toFixed(0)}°)</li>)}</ul>
 * ```
 */
export declare function useWhatsUp(observer: ObserverParams, options?: WhatsUpOptions, intervalMs?: number): VisibleObject[];
/**
 * Reactive twilight times (sunrise, sunset, dawn, dusk).
 *
 * Recomputes daily or when the observer changes.
 *
 * @param observer - Observer location.
 * @param date - Fixed date, or omit for today.
 * @returns {@link TwilightTimes} for the given location and date.
 *
 * @example
 * ```tsx
 * const tw = useTwilight({ lat: 51.5, lng: -0.1 })
 * return <p>Sunset: {tw.sunset?.toLocaleTimeString()}</p>
 * ```
 */
export declare function useTwilight(observer: ObserverParams, date?: Date): TwilightTimes;
/** Props for {@link SkyMap}. */
export interface SkyMapProps extends InteractiveSkyMapOptions {
    /** Objects to render. Defaults to `Data.all()`. */
    objects?: CelestialObject[];
    /** Width CSS value. @defaultValue `'100%'` */
    width?: string | number;
    /** Height CSS value. @defaultValue `'400px'` */
    height?: string | number;
    /** Callback when an object is selected. */
    onSelect?: (object: CelestialObject) => void;
    /** Callback when a hover changes. */
    onHover?: (object: CelestialObject | null) => void;
    /** Ref to access the underlying InteractiveSkyMap instance. */
    skymapRef?: RefObject<InteractiveSkyMap | null>;
}
/**
 * React component wrapping {@link InteractiveSkyMap}.
 *
 * Manages canvas lifecycle, DPI scaling, resize handling, and event
 * wiring automatically. SSR-safe — renders an empty `<canvas>` on the
 * server and initialises the sky map on mount.
 *
 * @example
 * ```tsx
 * import { SkyMap } from '@motioncomplex/cosmos-lib/react'
 *
 * <SkyMap
 *   projection="stereographic"
 *   center={{ ra: 83.8, dec: -5.4 }}
 *   scale={400}
 *   observer={{ lat: 47.05, lng: 8.31 }}
 *   onSelect={obj => console.log(obj.name)}
 *   width="100%"
 *   height="500px"
 * />
 * ```
 */
export declare function SkyMap({ objects, width, height, onSelect, onHover, skymapRef, ...opts }: SkyMapProps): import("react/jsx-runtime").JSX.Element;
