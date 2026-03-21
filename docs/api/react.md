# React Hooks API

React hooks for cosmos-lib. Import from the `/react` sub-path:

```ts
import { useSkyPosition, useMoonPhase, useWhatsUp, useTwilight, useAstroClock, SkyMap } from '@motioncomplex/cosmos-lib/react'
```

All hooks are **SSR-safe** — they return sensible defaults during server rendering and only start intervals/effects in the browser. React (`>=18`) is an optional peer dependency.

---

## `useSkyPosition`

Reactive altitude/azimuth for any catalog object. Recomputes at a configurable interval.

```tsx
const pos = useSkyPosition('sirius', { lat: 47.05, lng: 8.31 })
// pos: { alt: number, az: number } | null
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `objectId` | `string` | -- | Catalog object ID |
| `observer` | `ObserverParams` | -- | Observer location |
| `intervalMs` | `number` | `10000` | Update interval in ms |

Works for stars, planets, Moon, Sun, and deep-sky objects. Returns `null` for unknown objects.

```tsx
function StarTracker() {
  const pos = useSkyPosition('sirius', { lat: 47.05, lng: 8.31 }, 5000)
  if (!pos) return <p>Unknown object</p>
  return <p>Sirius: {pos.alt.toFixed(1)}° alt, {pos.az.toFixed(1)}° az</p>
}
```

---

## `useMoonPhase`

Reactive Moon phase data with auto-updating.

```tsx
const phase = useMoonPhase()
// phase: { phase, illumination, age, name }
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | `Date` | live | Fixed date, or omit for live updates |
| `intervalMs` | `number` | `60000` | Update interval (when live) |

```tsx
function MoonWidget() {
  const { name, illumination } = useMoonPhase()
  return <p>{name} — {(illumination * 100).toFixed(0)}%</p>
}
```

---

## `useAstroClock`

Managed `AstroClock` instance with React state integration.

```tsx
const { date, speed, playing, play, pause, setDate, setSpeed, clock } = useAstroClock({ speed: 60 })
```

Returns reactive `date`, `speed`, `playing` state plus control functions. The clock is created once and disposed on unmount.

```tsx
function TimeControl() {
  const { date, playing, play, pause, setSpeed } = useAstroClock({ speed: 60 })
  return (
    <div>
      <p>{date.toLocaleTimeString()}</p>
      <button onClick={playing ? pause : play}>{playing ? '⏸' : '▶'}</button>
      <button onClick={() => setSpeed(3600)}>1h/s</button>
    </div>
  )
}
```

---

## `useWhatsUp`

Reactive visible objects list powered by `Planner.whatsUp`.

```tsx
const visible = useWhatsUp({ lat: 47, lng: 8 }, { magnitudeLimit: 4, limit: 10 })
// visible: VisibleObject[]
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `observer` | `ObserverParams` | -- | Observer location |
| `options` | `WhatsUpOptions` | `{}` | Filtering options |
| `intervalMs` | `number` | `30000` | Update interval |

```tsx
function WhatsUpList() {
  const visible = useWhatsUp({ lat: 47, lng: 8 }, { magnitudeLimit: 3, limit: 8 })
  return (
    <ul>
      {visible.map(v => (
        <li key={v.object.id}>
          {v.object.name} — {v.alt.toFixed(0)}° alt
          {v.moonInterference > 0.3 && ` (moon: ${(v.moonInterference * 100).toFixed(0)}%)`}
        </li>
      ))}
    </ul>
  )
}
```

---

## `useTwilight`

Reactive twilight times (sunrise, sunset, dawn, dusk).

```tsx
const tw = useTwilight({ lat: 51.5, lng: -0.1 })
// tw: TwilightTimes
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `observer` | `ObserverParams` | -- | Observer location |
| `date` | `Date` | today | Fixed date |

Recomputes when observer or date changes (memoized).

---

## `<SkyMap />`

React component wrapping `InteractiveSkyMap`. Manages canvas lifecycle, DPI scaling, resize handling, and event wiring.

```tsx
<SkyMap
  projection="stereographic"
  center={{ ra: 83.8, dec: -5.4 }}
  scale={400}
  observer={{ lat: 47.05, lng: 8.31 }}
  onSelect={obj => console.log(obj.name)}
  width="100%"
  height="500px"
/>
```

### Props

All `InteractiveSkyMapOptions` are accepted as props, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `objects` | `CelestialObject[]` | `Data.all()` | Objects to render |
| `width` | `string \| number` | `'100%'` | Container width |
| `height` | `string \| number` | `'400px'` | Container height |
| `onSelect` | `(object) => void` | -- | Selection callback |
| `onHover` | `(object \| null) => void` | -- | Hover callback |
| `skymapRef` | `RefObject<InteractiveSkyMap>` | -- | Access the underlying instance |

---

## Combining hooks

```tsx
function ObservationDashboard() {
  const { date, playing, play, pause } = useAstroClock({ speed: 60 })
  const visible = useWhatsUp({ lat: 47, lng: 8, date }, { magnitudeLimit: 5 })
  const twilight = useTwilight({ lat: 47, lng: 8 }, date)
  const moonPhase = useMoonPhase(date)

  return (
    <div>
      <button onClick={playing ? pause : play}>{playing ? 'Pause' : 'Play'}</button>
      <p>Time: {date.toLocaleTimeString()}</p>
      <p>Moon: {moonPhase.name} ({(moonPhase.illumination * 100).toFixed(0)}%)</p>
      <p>Sunset: {twilight.sunset?.toLocaleTimeString()}</p>
      <ul>
        {visible.map(v => <li key={v.object.id}>{v.object.name}</li>)}
      </ul>
    </div>
  )
}
```

---

## SSR safety

All hooks check `typeof window !== 'undefined'` before starting intervals or accessing DOM APIs. On the server:
- `useSkyPosition` returns the initial computed value (no interval)
- `useMoonPhase` returns the initial phase (no interval)
- `useWhatsUp` returns the initial list (no interval)
- `useTwilight` is a pure `useMemo` (always safe)
- `useAstroClock` creates the clock but doesn't start timers
- `<SkyMap />` renders an empty `<canvas>` element
