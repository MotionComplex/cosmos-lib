import type { ObserverParams } from './types.js';
/** Event types emitted by {@link AstroClock}. */
export interface AstroClockEventMap {
    /** Fired on each tick with the current simulation date. */
    tick: {
        date: Date;
        speed: number;
        playing: boolean;
    };
    /** Fired when playback starts or resumes. */
    play: {
        date: Date;
        speed: number;
    };
    /** Fired when playback pauses. */
    pause: {
        date: Date;
    };
    /** Fired when the date is set programmatically (including snap-to-event). */
    datechange: {
        date: Date;
        reason: 'set' | 'snap';
    };
    /** Fired when the speed multiplier changes. */
    speedchange: {
        speed: number;
    };
}
/** Options for creating an {@link AstroClock}. */
export interface AstroClockOptions {
    /** Initial simulation date. @defaultValue `new Date()` */
    startDate?: Date;
    /** Speed multiplier (1 = real-time, 60 = 1 minute/second, -1 = reverse). @defaultValue `1` */
    speed?: number;
    /** Tick interval in milliseconds (used in timer mode). @defaultValue `1000` */
    tickInterval?: number;
    /** Use `requestAnimationFrame` for frame-accurate ticking. @defaultValue `false` */
    useRAF?: boolean;
    /** Auto-start playback on creation. @defaultValue `false` */
    autoPlay?: boolean;
}
/** An astronomical event type for snap-to-event navigation. */
export type AstroEventType = 'sunrise' | 'sunset' | 'moonrise' | 'moonset' | 'solar-noon' | 'moon-transit' | 'civil-dawn' | 'civil-dusk' | 'nautical-dawn' | 'nautical-dusk' | 'astro-dawn' | 'astro-dusk';
/**
 * A simulation clock that decouples observation time from wall-clock time.
 *
 * `AstroClock` maintains a virtual date that advances at a configurable speed
 * multiplier. It supports forward and reverse playback, pause/resume, snap-to-event
 * navigation, and both timer-based and `requestAnimationFrame`-based ticking.
 *
 * @remarks
 * The clock advances the simulation date by `elapsed_ms * speed` on each tick.
 * A speed of 1 means real-time; 60 means 1 minute of simulated time per second
 * of wall-clock time; -1 means reverse real-time. The clock emits typed events
 * via `on()`/`off()` for integration with UI frameworks.
 *
 * @example
 * ```ts
 * import { AstroClock } from '@motioncomplex/cosmos-lib'
 *
 * const clock = new AstroClock({ speed: 60, useRAF: true, autoPlay: true })
 *
 * clock.on('tick', ({ date }) => {
 *   updateSkyMap(date)
 *   updateUI(date)
 * })
 *
 * // Jump to a specific date
 * clock.setDate(new Date('2024-12-21T00:00:00Z'))
 *
 * // Snap to next sunset
 * clock.snapTo('sunset', { lat: 47.05, lng: 8.31 })
 *
 * // Reverse playback at 10x speed
 * clock.setSpeed(-10)
 *
 * // Clean up
 * clock.dispose()
 * ```
 */
export declare class AstroClock {
    private _date;
    private _speed;
    private _tickInterval;
    private _useRAF;
    private _playing;
    private _disposed;
    private _lastWallTime;
    private _timerId;
    private _rafId;
    private _listeners;
    constructor(options?: AstroClockOptions);
    /**
     * Subscribe to a clock event.
     *
     * @param event   - Event name.
     * @param handler - Callback invoked when the event fires.
     *
     * @example
     * ```ts
     * clock.on('tick', ({ date, speed }) => console.log(date, speed))
     * clock.on('pause', () => console.log('Paused'))
     * ```
     */
    on<K extends keyof AstroClockEventMap>(event: K, handler: (data: AstroClockEventMap[K]) => void): void;
    /**
     * Unsubscribe from a clock event.
     */
    off<K extends keyof AstroClockEventMap>(event: K, handler: (data: AstroClockEventMap[K]) => void): void;
    private _emit;
    /**
     * Start or resume playback.
     *
     * The simulation date advances by `elapsed_ms * speed` on each tick.
     * If already playing, this is a no-op.
     */
    play(): void;
    /**
     * Pause playback. The simulation date freezes at its current value.
     */
    pause(): void;
    /** Whether the clock is currently playing. */
    get playing(): boolean;
    /**
     * Set the simulation date. Emits `'datechange'`.
     *
     * @param date - The new simulation date.
     */
    setDate(date: Date): void;
    /** Get the current simulation date. */
    get date(): Date;
    /**
     * Set the speed multiplier. Emits `'speedchange'`.
     *
     * @param speed - New speed (1 = real-time, 60 = 1min/sec, -1 = reverse real-time).
     *
     * @example
     * ```ts
     * clock.setSpeed(3600) // 1 hour per second
     * clock.setSpeed(-60)  // reverse, 1 minute per second
     * clock.setSpeed(0)    // frozen (like pause but still "playing")
     * ```
     */
    setSpeed(speed: number): void;
    /** Get the current speed multiplier. */
    get speed(): number;
    /**
     * Jump to the next occurrence of an astronomical event.
     *
     * Computes the next rise, set, or transit for the Sun or Moon from the
     * current simulation date and observer location, then sets the clock to
     * that time.
     *
     * @param eventType - The event to snap to.
     * @param observer  - Observer location (date is ignored; current sim date is used).
     * @returns The date snapped to, or `null` if the event doesn't occur.
     *
     * @example
     * ```ts
     * clock.snapTo('sunset', { lat: 47.05, lng: 8.31 })
     * clock.snapTo('moonrise', { lat: 51.5, lng: -0.1 })
     * ```
     */
    snapTo(eventType: AstroEventType, observer: ObserverParams): Date | null;
    /**
     * If the event time is in the past (relative to current sim date),
     * try the next day. Returns null if the event is null.
     */
    private _nextOccurrence;
    /**
     * Stop the clock, remove all listeners, and release resources.
     * The instance should not be used after calling `dispose()`.
     */
    dispose(): void;
    private _advance;
    private _tick;
    private _rafTick;
    private _emitTick;
    private _scheduleNext;
    private _cancelScheduled;
}
