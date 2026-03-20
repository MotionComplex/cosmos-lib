# Simulation Clock API

`AstroClock` decouples observation time from wall-clock time. It maintains a virtual date that advances at a configurable speed multiplier, supporting forward and reverse playback, snap-to-event navigation, and both timer-based and `requestAnimationFrame`-based ticking.

```ts
import { AstroClock } from '@motioncomplex/cosmos-lib'
```

---

## Creating a clock

```ts
const clock = new AstroClock({
  startDate: new Date('2024-08-15T20:00:00Z'),
  speed: 60,         // 1 minute of sim time per second
  tickInterval: 1000, // tick every second (timer mode)
  useRAF: false,      // true for requestAnimationFrame mode
  autoPlay: false,    // start paused
})
```

### `AstroClockOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `startDate` | `Date` | `new Date()` | Initial simulation date |
| `speed` | `number` | `1` | Speed multiplier (1 = real-time, 60 = 1min/sec, -1 = reverse) |
| `tickInterval` | `number` | `1000` | Tick interval in ms (timer mode only) |
| `useRAF` | `boolean` | `false` | Use `requestAnimationFrame` for frame-accurate ticks |
| `autoPlay` | `boolean` | `false` | Start playback immediately |

---

## Playback controls

```ts
clock.play()     // start or resume
clock.pause()    // freeze at current sim date

clock.playing    // boolean — is the clock running?
clock.date       // Date — current simulation date (copy)
clock.speed      // number — current speed multiplier
```

### Setting the date

```ts
clock.setDate(new Date('2024-12-21T00:00:00Z'))
```

### Speed control

```ts
clock.setSpeed(1)      // real-time
clock.setSpeed(60)     // 1 minute per second
clock.setSpeed(3600)   // 1 hour per second
clock.setSpeed(-60)    // reverse, 1 minute per second
clock.setSpeed(0)      // frozen (ticks still fire, date doesn't advance)
```

---

## Events

Subscribe with `on()`, unsubscribe with `off()`:

```ts
clock.on('tick', ({ date, speed, playing }) => {
  updateSkyMap(date)
})

clock.on('play', ({ date, speed }) => console.log('Playing'))
clock.on('pause', ({ date }) => console.log('Paused'))
clock.on('datechange', ({ date, reason }) => console.log(reason)) // 'set' or 'snap'
clock.on('speedchange', ({ speed }) => console.log('Speed:', speed))
```

### Event types

| Event | Payload | Fires when |
|-------|---------|------------|
| `tick` | `{ date, speed, playing }` | Each tick interval (or animation frame) |
| `play` | `{ date, speed }` | Playback starts or resumes |
| `pause` | `{ date }` | Playback pauses |
| `datechange` | `{ date, reason }` | Date set programmatically or via snap |
| `speedchange` | `{ speed }` | Speed multiplier changes |

---

## Snap-to-event

Jump to the next occurrence of an astronomical event:

```ts
clock.snapTo('sunset', { lat: 47.05, lng: 8.31 })
clock.snapTo('sunrise', { lat: 47.05, lng: 8.31 })
clock.snapTo('moonrise', { lat: 51.5, lng: -0.1 })
clock.snapTo('solar-noon', { lat: 47.05, lng: 8.31 })
```

### Supported event types

| Event | Description |
|-------|-------------|
| `sunrise` / `sunset` | Sun upper limb crosses the horizon |
| `solar-noon` | Sun transits the local meridian |
| `civil-dawn` / `civil-dusk` | Sun at -6° altitude |
| `nautical-dawn` / `nautical-dusk` | Sun at -12° altitude |
| `astro-dawn` / `astro-dusk` | Sun at -18° altitude |
| `moonrise` / `moonset` | Moon crosses the horizon |
| `moon-transit` | Moon transits the local meridian |

Returns the snapped `Date`, or `null` if the event doesn't occur at that location.

---

## Sky map integration

Drive an `InteractiveSkyMap` from the clock:

```ts
import { AstroClock, createInteractiveSkyMap, AstroMath, Data } from '@motioncomplex/cosmos-lib'

const clock = new AstroClock({ speed: 60, autoPlay: true })
const skymap = createInteractiveSkyMap(canvas, Data.all(), {
  observer: { lat: 47.05, lng: 8.31 },
})

clock.on('tick', ({ date }) => {
  const lst = AstroMath.lst(date, 8.31)
  skymap.setView({ center: { ra: lst, dec: 47.05 } })
})
```

---

## `requestAnimationFrame` mode

For smooth visual updates (60fps), use RAF mode:

```ts
const clock = new AstroClock({ speed: 60, useRAF: true, autoPlay: true })

clock.on('tick', ({ date }) => {
  // Called every animation frame (~16ms)
  render(date)
})
```

---

## Lifecycle

Always call `dispose()` when done:

```ts
// In a React component
useEffect(() => {
  const clock = new AstroClock({ speed: 60, autoPlay: true })
  clock.on('tick', handleTick)
  return () => clock.dispose()
}, [])
```
