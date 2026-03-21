# Event Calendar API

Aggregates upcoming astronomical events into a unified timeline: moon phases, eclipses, meteor shower peaks, planet oppositions/conjunctions, equinoxes, solstices, and greatest elongations.

```ts
import { Events } from '@motioncomplex/cosmos-lib'
```

---

## `Events.nextEvents`

Find upcoming events within a date range, sorted by date.

```ts
const events = Events.nextEvents(
  { lat: 47, lng: 8, date: new Date('2024-01-01') },
  { days: 90, limit: 20 }
)
events.forEach(e => console.log(e.date.toLocaleDateString(), e.title))
```

### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `days` | `number` | `90` | Days to scan forward |
| `categories` | `AstroEventCategory[]` | all | Filter by event type |
| `limit` | `number` | `50` | Max results |

### Event categories

| Category | What it detects |
|----------|----------------|
| `moon-phase` | New, first quarter, full, last quarter |
| `eclipse` | Solar and lunar eclipses (total, annular, partial, penumbral) |
| `meteor-shower` | Annual shower peak dates (Perseids, Geminids, etc.) |
| `opposition` | Outer planet oppositions (Mars, Jupiter, Saturn, etc.) |
| `conjunction` | Planet conjunctions with the Sun |
| `elongation` | Mercury/Venus greatest elongation (east/west) |
| `equinox` | March and September equinoxes |
| `solstice` | June and December solstices |

### `AstroEvent`

| Property | Type | Description |
|----------|------|-------------|
| `category` | `AstroEventCategory` | Event type |
| `title` | `string` | Human-readable title |
| `date` | `Date` | Event date/time |
| `detail` | `string?` | Additional info (magnitude, ZHR, elongation, etc.) |

---

## `Events.nextEvent`

Find the next single event of a specific category.

```ts
const nextFull = Events.nextEvent('moon-phase', { lat: 47, lng: 8 })
const nextEclipse = Events.nextEvent('eclipse', { lat: 47, lng: 8 })
const nextOpposition = Events.nextEvent('opposition', { lat: 47, lng: 8 }, 730) // 2 years
```

---

## `Events.toICal`

Export events as an iCalendar (`.ics`) file.

```ts
const events = Events.nextEvents(observer, { days: 365 })
const ical = Events.toICal(events, 'My Astro Calendar')

// Download in browser
const blob = new Blob([ical], { type: 'text/calendar' })
const url = URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'astro-events.ics'
a.click()
```

---

## Filtering examples

```ts
// Only eclipses and oppositions
Events.nextEvents(observer, { categories: ['eclipse', 'opposition'], days: 365 })

// Only moon phases (next 30 days)
Events.nextEvents(observer, { categories: ['moon-phase'], days: 30 })

// Everything for a full year
Events.nextEvents(observer, { days: 365, limit: 100 })
```
