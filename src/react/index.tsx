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

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
  type RefObject,
} from 'react'
import { AstroMath } from '../math.js'
import { Sun } from '../sun.js'
import { Moon } from '../moon.js'
import { Planner } from '../planner.js'
import { AstroClock } from '../clock.js'
import { Data } from '../data/index.js'
import { InteractiveSkyMap } from '../skymap-interactive.js'
import type {
  ObserverParams,
  HorizontalCoord,
  EquatorialCoord,
  MoonPhase,
  TwilightTimes,
  CelestialObject,
  InteractiveSkyMapOptions,
  PlanetName,
} from '../types.js'
import type { VisibleObject, WhatsUpOptions } from '../planner.js'
import type { AstroClockOptions, AstroClockEventMap } from '../clock.js'

// ── SSR guard ────────────────────────────────────────────────────────────────

const isBrowser = typeof window !== 'undefined'

// ── useSkyPosition ───────────────────────────────────────────────────────────

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
export function useSkyPosition(
  objectId: string,
  observer: ObserverParams,
  intervalMs = 10_000,
): HorizontalCoord | null {
  const [pos, setPos] = useState<HorizontalCoord | null>(null)

  useEffect(() => {
    const compute = () => {
      const obj = Data.get(objectId)
      if (!obj) { setPos(null); return }

      const now = new Date()
      const eq = getEquatorial(obj, now)
      if (!eq) { setPos(null); return }

      setPos(AstroMath.equatorialToHorizontal(eq, { ...observer, date: now }))
    }

    compute()
    if (!isBrowser) return

    const id = setInterval(compute, intervalMs)
    return () => clearInterval(id)
  }, [objectId, observer.lat, observer.lng, intervalMs])

  return pos
}

// ── useMoonPhase ─────────────────────────────────────────────────────────────

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
export function useMoonPhase(date?: Date, intervalMs = 60_000): MoonPhase {
  const [phase, setPhase] = useState<MoonPhase>(() => Moon.phase(date ?? new Date()))

  useEffect(() => {
    if (date) {
      setPhase(Moon.phase(date))
      return
    }

    const compute = () => setPhase(Moon.phase(new Date()))
    compute()
    if (!isBrowser) return

    const id = setInterval(compute, intervalMs)
    return () => clearInterval(id)
  }, [date?.valueOf(), intervalMs])

  return phase
}

// ── useAstroClock ────────────────────────────────────────────────────────────

/** Return value of {@link useAstroClock}. */
export interface UseAstroClockReturn {
  /** Current simulation date (updates on each tick). */
  date: Date
  /** Current speed multiplier. */
  speed: number
  /** Whether the clock is playing. */
  playing: boolean
  /** Start or resume playback. */
  play: () => void
  /** Pause playback. */
  pause: () => void
  /** Set the simulation date. */
  setDate: (date: Date) => void
  /** Set the speed multiplier. */
  setSpeed: (speed: number) => void
  /** The underlying AstroClock instance. */
  clock: AstroClock
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
export function useAstroClock(options: AstroClockOptions = {}): UseAstroClockReturn {
  const [date, setDate] = useState(() => options.startDate ?? new Date())
  const [speed, setSpeed] = useState(options.speed ?? 1)
  const [playing, setPlaying] = useState(options.autoPlay ?? false)
  const clockRef = useRef<AstroClock | null>(null)

  // Create the clock once
  if (clockRef.current === null) {
    clockRef.current = new AstroClock(options)
  }

  useEffect(() => {
    const clock = clockRef.current!
    const onTick = (e: AstroClockEventMap['tick']) => setDate(e.date)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onDateChange = (e: AstroClockEventMap['datechange']) => setDate(e.date)
    const onSpeedChange = (e: AstroClockEventMap['speedchange']) => setSpeed(e.speed)

    clock.on('tick', onTick)
    clock.on('play', onPlay)
    clock.on('pause', onPause)
    clock.on('datechange', onDateChange)
    clock.on('speedchange', onSpeedChange)

    return () => {
      clock.off('tick', onTick)
      clock.off('play', onPlay)
      clock.off('pause', onPause)
      clock.off('datechange', onDateChange)
      clock.off('speedchange', onSpeedChange)
      clock.dispose()
      clockRef.current = null
    }
  }, [])

  const playFn = useCallback(() => clockRef.current?.play(), [])
  const pauseFn = useCallback(() => clockRef.current?.pause(), [])
  const setDateFn = useCallback((d: Date) => clockRef.current?.setDate(d), [])
  const setSpeedFn = useCallback((s: number) => clockRef.current?.setSpeed(s), [])

  return {
    date,
    speed,
    playing,
    play: playFn,
    pause: pauseFn,
    setDate: setDateFn,
    setSpeed: setSpeedFn,
    clock: clockRef.current!,
  }
}

// ── useWhatsUp ───────────────────────────────────────────────────────────────

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
export function useWhatsUp(
  observer: ObserverParams,
  options: WhatsUpOptions = {},
  intervalMs = 30_000,
): VisibleObject[] {
  const [results, setResults] = useState<VisibleObject[]>([])

  useEffect(() => {
    const compute = () => {
      const obs = { ...observer, date: observer.date ?? new Date() }
      setResults(Planner.whatsUp(obs, options))
    }

    compute()
    if (!isBrowser) return

    const id = setInterval(compute, intervalMs)
    return () => clearInterval(id)
  }, [observer.lat, observer.lng, observer.date?.valueOf(), intervalMs,
      options.minAltitude, options.magnitudeLimit, options.limit,
      options.tag, options.constellation, options.types?.join(',')])

  return results
}

// ── useTwilight ──────────────────────────────────────────────────────────────

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
export function useTwilight(observer: ObserverParams, date?: Date): TwilightTimes {
  return useMemo(() => {
    const obs = { ...observer, date: date ?? observer.date ?? new Date() }
    return Sun.twilight(obs)
  }, [observer.lat, observer.lng, date?.valueOf(), observer.date?.valueOf()])
}

// ── SkyMap component ─────────────────────────────────────────────────────────

/** Props for {@link SkyMap}. */
export interface SkyMapProps extends InteractiveSkyMapOptions {
  /** Objects to render. Defaults to `Data.all()`. */
  objects?: CelestialObject[]
  /** Width CSS value. @defaultValue `'100%'` */
  width?: string | number
  /** Height CSS value. @defaultValue `'400px'` */
  height?: string | number
  /** Callback when an object is selected. */
  onSelect?: (object: CelestialObject) => void
  /** Callback when a hover changes. */
  onHover?: (object: CelestialObject | null) => void
  /** Ref to access the underlying InteractiveSkyMap instance. */
  skymapRef?: RefObject<InteractiveSkyMap | null>
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
export function SkyMap({
  objects,
  width = '100%',
  height = '400px',
  onSelect,
  onHover,
  skymapRef,
  ...opts
}: SkyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const internalRef = useRef<InteractiveSkyMap | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isBrowser) return

    const container = canvas.parentElement
    if (!container) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const objs = objects ?? Data.all().filter(o => o.ra != null && o.dec != null)
    const skymap = new InteractiveSkyMap(canvas, objs, opts)
    internalRef.current = skymap
    if (skymapRef && 'current' in skymapRef) {
      (skymapRef as { current: InteractiveSkyMap | null }).current = skymap
    }

    if (onSelect) skymap.on('select', ({ object }) => onSelect(object))
    if (onHover) skymap.on('hover', ({ object }) => onHover(object))

    const handleResize = () => {
      const r = container.getBoundingClientRect()
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      skymap.render()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      skymap.dispose()
      internalRef.current = null
      if (skymapRef && 'current' in skymapRef) {
        (skymapRef as { current: InteractiveSkyMap | null }).current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width, height, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-label="Interactive sky map"
      />
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve equatorial coords for any catalog object (fixed or solar-system). */
function getEquatorial(obj: CelestialObject, date: Date): EquatorialCoord | null {
  if (obj.ra !== null && obj.dec !== null) return { ra: obj.ra, dec: obj.dec }

  if (obj.type === 'planet') {
    try {
      const ecl = AstroMath.planetEcliptic(obj.id as PlanetName, date)
      return AstroMath.eclipticToEquatorial(ecl)
    } catch { return null }
  }
  if (obj.id === 'sun') { const p = Sun.position(date); return { ra: p.ra, dec: p.dec } }
  if (obj.id === 'moon') { const p = Moon.position(date); return { ra: p.ra, dec: p.dec } }

  return null
}
