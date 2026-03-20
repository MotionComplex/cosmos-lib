import { AstroMath } from './math.js'
import { Sun } from './sun.js'
import { Moon } from './moon.js'
import type { ObserverParams, EquatorialCoord } from './types.js'

// ── Types ────────────────────────────────────────────────────────────────────

/** Event types emitted by {@link AstroClock}. */
export interface AstroClockEventMap {
  /** Fired on each tick with the current simulation date. */
  tick: { date: Date; speed: number; playing: boolean }
  /** Fired when playback starts or resumes. */
  play: { date: Date; speed: number }
  /** Fired when playback pauses. */
  pause: { date: Date }
  /** Fired when the date is set programmatically (including snap-to-event). */
  datechange: { date: Date; reason: 'set' | 'snap' }
  /** Fired when the speed multiplier changes. */
  speedchange: { speed: number }
}

/** Options for creating an {@link AstroClock}. */
export interface AstroClockOptions {
  /** Initial simulation date. @defaultValue `new Date()` */
  startDate?: Date
  /** Speed multiplier (1 = real-time, 60 = 1 minute/second, -1 = reverse). @defaultValue `1` */
  speed?: number
  /** Tick interval in milliseconds (used in timer mode). @defaultValue `1000` */
  tickInterval?: number
  /** Use `requestAnimationFrame` for frame-accurate ticking. @defaultValue `false` */
  useRAF?: boolean
  /** Auto-start playback on creation. @defaultValue `false` */
  autoPlay?: boolean
}

/** An astronomical event type for snap-to-event navigation. */
export type AstroEventType =
  | 'sunrise' | 'sunset'
  | 'moonrise' | 'moonset'
  | 'solar-noon' | 'moon-transit'
  | 'civil-dawn' | 'civil-dusk'
  | 'nautical-dawn' | 'nautical-dusk'
  | 'astro-dawn' | 'astro-dusk'

// ── Class ────────────────────────────────────────────────────────────────────

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
export class AstroClock {
  private _date: Date
  private _speed: number
  private _tickInterval: number
  private _useRAF: boolean
  private _playing = false
  private _disposed = false
  private _lastWallTime: number | null = null
  private _timerId: ReturnType<typeof setTimeout> | null = null
  private _rafId: number | null = null
  private _listeners = new Map<string, Set<Function>>()

  constructor(options: AstroClockOptions = {}) {
    this._date = options.startDate ? new Date(options.startDate.valueOf()) : new Date()
    this._speed = options.speed ?? 1
    this._tickInterval = options.tickInterval ?? 1000
    this._useRAF = options.useRAF ?? false

    if (options.autoPlay) {
      this.play()
    }
  }

  // ── Event emitter ──────────────────────────────────────────────────────

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
  on<K extends keyof AstroClockEventMap>(
    event: K,
    handler: (data: AstroClockEventMap[K]) => void,
  ): void {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set())
    this._listeners.get(event)!.add(handler)
  }

  /**
   * Unsubscribe from a clock event.
   */
  off<K extends keyof AstroClockEventMap>(
    event: K,
    handler: (data: AstroClockEventMap[K]) => void,
  ): void {
    this._listeners.get(event)?.delete(handler)
  }

  private _emit<K extends keyof AstroClockEventMap>(event: K, data: AstroClockEventMap[K]): void {
    const handlers = this._listeners.get(event)
    if (!handlers) return
    for (const fn of handlers) (fn as (d: AstroClockEventMap[K]) => void)(data)
  }

  // ── Playback controls ─────────────────────────────────────────────────

  /**
   * Start or resume playback.
   *
   * The simulation date advances by `elapsed_ms * speed` on each tick.
   * If already playing, this is a no-op.
   */
  play(): void {
    if (this._disposed || this._playing) return
    this._playing = true
    this._lastWallTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this._emit('play', { date: new Date(this._date.valueOf()), speed: this._speed })
    this._scheduleNext()
  }

  /**
   * Pause playback. The simulation date freezes at its current value.
   */
  pause(): void {
    if (!this._playing) return
    this._playing = false
    this._cancelScheduled()
    this._lastWallTime = null
    this._emit('pause', { date: new Date(this._date.valueOf()) })
  }

  /** Whether the clock is currently playing. */
  get playing(): boolean {
    return this._playing
  }

  /**
   * Set the simulation date. Emits `'datechange'`.
   *
   * @param date - The new simulation date.
   */
  setDate(date: Date): void {
    this._date = new Date(date.valueOf())
    this._lastWallTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
    this._emit('datechange', { date: new Date(this._date.valueOf()), reason: 'set' })
    if (this._playing) {
      this._emitTick()
    }
  }

  /** Get the current simulation date. */
  get date(): Date {
    return new Date(this._date.valueOf())
  }

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
  setSpeed(speed: number): void {
    // Advance to current wall time before changing speed
    if (this._playing) {
      this._advance()
    }
    this._speed = speed
    this._emit('speedchange', { speed })
  }

  /** Get the current speed multiplier. */
  get speed(): number {
    return this._speed
  }

  // ── Snap-to-event ─────────────────────────────────────────────────────

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
  snapTo(eventType: AstroEventType, observer: ObserverParams): Date | null {
    const obs = { ...observer, date: this._date }
    let target: Date | null = null

    switch (eventType) {
      case 'sunrise': {
        const tw = Sun.twilight(obs)
        target = this._nextOccurrence(tw.sunrise)
        break
      }
      case 'sunset': {
        const tw = Sun.twilight(obs)
        target = this._nextOccurrence(tw.sunset)
        break
      }
      case 'solar-noon': {
        const tw = Sun.twilight(obs)
        target = this._nextOccurrence(tw.solarNoon)
        break
      }
      case 'civil-dawn': {
        const tw = Sun.twilight(obs)
        target = this._nextOccurrence(tw.civilDawn)
        break
      }
      case 'civil-dusk': {
        const tw = Sun.twilight(obs)
        target = this._nextOccurrence(tw.civilDusk)
        break
      }
      case 'nautical-dawn': {
        const tw = Sun.twilight(obs)
        target = this._nextOccurrence(tw.nauticalDawn)
        break
      }
      case 'nautical-dusk': {
        const tw = Sun.twilight(obs)
        target = this._nextOccurrence(tw.nauticalDusk)
        break
      }
      case 'astro-dawn': {
        const tw = Sun.twilight(obs)
        target = this._nextOccurrence(tw.astronomicalDawn)
        break
      }
      case 'astro-dusk': {
        const tw = Sun.twilight(obs)
        target = this._nextOccurrence(tw.astronomicalDusk)
        break
      }
      case 'moonrise': {
        const rts = Moon.riseTransitSet(obs)
        target = this._nextOccurrence(rts.rise)
        break
      }
      case 'moonset': {
        const rts = Moon.riseTransitSet(obs)
        target = this._nextOccurrence(rts.set)
        break
      }
      case 'moon-transit': {
        const rts = Moon.riseTransitSet(obs)
        target = this._nextOccurrence(rts.transit)
        break
      }
    }

    if (target) {
      this._date = target
      this._lastWallTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
      this._emit('datechange', { date: new Date(this._date.valueOf()), reason: 'snap' })
      if (this._playing) this._emitTick()
    }

    return target
  }

  /**
   * If the event time is in the past (relative to current sim date),
   * try the next day. Returns null if the event is null.
   */
  private _nextOccurrence(eventDate: Date | null): Date | null {
    if (!eventDate) return null
    if (eventDate.valueOf() > this._date.valueOf()) return eventDate

    // Try next day
    const nextDayObs = new Date(this._date.valueOf() + 86_400_000)
    // Return the event date shifted forward by ~1 day
    const shifted = new Date(eventDate.valueOf() + 86_400_000)
    return shifted.valueOf() > this._date.valueOf() ? shifted : null
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────

  /**
   * Stop the clock, remove all listeners, and release resources.
   * The instance should not be used after calling `dispose()`.
   */
  dispose(): void {
    this._disposed = true
    this._playing = false
    this._cancelScheduled()
    this._listeners.clear()
  }

  // ── Internal timing ───────────────────────────────────────────────────

  private _advance(): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (this._lastWallTime !== null) {
      const elapsed = now - this._lastWallTime
      this._date = new Date(this._date.valueOf() + elapsed * this._speed)
    }
    this._lastWallTime = now
  }

  private _tick = (): void => {
    if (this._disposed || !this._playing) return
    this._advance()
    this._emitTick()
    this._scheduleNext()
  }

  private _rafTick = (_timestamp: number): void => {
    if (this._disposed || !this._playing) return
    this._advance()
    this._emitTick()
    this._rafId = requestAnimationFrame(this._rafTick)
  }

  private _emitTick(): void {
    this._emit('tick', {
      date: new Date(this._date.valueOf()),
      speed: this._speed,
      playing: this._playing,
    })
  }

  private _scheduleNext(): void {
    if (this._disposed || !this._playing) return
    if (this._useRAF && typeof requestAnimationFrame !== 'undefined') {
      this._rafId = requestAnimationFrame(this._rafTick)
    } else {
      this._timerId = setTimeout(this._tick, this._tickInterval)
    }
  }

  private _cancelScheduled(): void {
    if (this._timerId !== null) {
      clearTimeout(this._timerId)
      this._timerId = null
    }
    if (this._rafId !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
  }
}
