# cosmos-lib Roadmap

> Priority-ranked feature tracking for making cosmos-lib the definitive astronomy toolkit for the web.

---

## P1 — Interactive Sky Map

**Status:** Not started
**Entry point:** `src/skymap.ts` (extend existing renderer)

Transform the current render-only `renderSkyMap` into a fully interactive experience.

- [x] Pan & zoom (mouse drag, scroll wheel, touch pinch)
- [x] Click-to-identify — tap a star/object, return its `CelestialObject` data
- [x] Hover detection — highlight objects, show name/magnitude
- [x] FOV indicator overlay — telescope/binocular field of view circle
- [x] Real-time mode — auto-update as sidereal time advances
- [x] Configurable HUD (cardinal directions, horizon line, zenith marker)
- [x] Event emitter for interactions (`onSelect`, `onHover`, `onViewChange`)
- [x] **Docs & examples:**
  - [x] TypeDoc comments on all public API (classes, methods, options, events)
  - [x] Usage guide with code samples (pan/zoom, hit-testing, event listeners, HUD, FOV overlays)
  - [x] `observatory-app`: already integrated (`SkyMapView.tsx`) — docs link verified in `DocsReference`
  - [x] `react-native-app`: N/A (canvas-based renderer, no RN equivalent)

---

## P2 — Observation Planning (`whatsUp`)

**Status:** Complete
**Entry point:** `src/planner.ts`

The killer utility: "What can I see tonight?"

- [x] `whatsUp(observer, options)` — objects above horizon, sorted by altitude, filtered by magnitude limit
- [x] `bestWindow(objectId, observer, date)` — when an object reaches max altitude on a given night
- [x] `visibilityCurve(objectId, observer, date)` — altitude vs. time array for plotting
- [x] Opposition/conjunction detection for planets
- [x] Moon interference scoring (angular separation + illumination)
- [x] Airmass calculation for photometry-aware planning
- [x] Filter by object type, constellation, catalog
- [x] **Docs & examples:**
  - [x] TypeDoc comments on `Planner` module, all methods, option interfaces, and result types
  - [x] Usage guide with code samples (`whatsUp` basics, filtering, `bestWindow`, `visibilityCurve` plotting, moon interference, airmass)
  - [x] `observatory-app`: "Visible Now" panel uses `Planner.whatsUp` with moon interference indicators; `ObjectDetail` shows visibility curve sparkline + moon interference card
  - [x] `react-native-app`: Tonight screen uses `Planner.whatsUp`; moon interference badges on object rows

---

## P3 — Simulation Clock

**Status:** Complete
**Entry point:** `src/clock.ts`

Decouple observation time from wall-clock time.

- [x] `AstroClock` class with configurable speed multiplier
- [x] `play()`, `pause()`, `setDate()`, `setSpeed()` controls
- [x] `onTick(callback)` with configurable interval
- [x] Forward and reverse playback
- [x] Snap-to-event (jump to next rise/set/transit)
- [x] Integration with sky map (drive rendering automatically)
- [x] Frame-accurate timing via `requestAnimationFrame`
- [x] **Docs & examples:**
  - [x] TypeDoc comments on `AstroClock` class, all methods, events, and options
  - [x] Usage guide with code samples (basic playback, speed control, snap-to-event, sky map integration)
  - [x] `observatory-app`: play/pause/speed transport controls in `SkyMapView` with snap-to-sunrise/sunset, reverse mode, and sim date display
  - [x] `react-native-app`: time-travel stepper on Tonight screen (-3h/-1h/Now/+1h/+3h) that recomputes all sky data for the offset time

---

## P4 — React Hooks

**Status:** Complete
**Entry point:** `src/react/index.tsx`, exported as `@motioncomplex/cosmos-lib/react`

Meet developers where they are.

- [x] `useSkyPosition(objectId, observer)` — reactive alt/az
- [x] `useMoonPhase(date?)` — current phase, illumination, name
- [x] `useAstroClock(options)` — clock instance with React lifecycle
- [x] `useWhatsUp(observer, options)` — reactive visible objects list
- [x] `useTwilight(observer, date?)` — dawn/dusk times
- [x] `<SkyMap />` component wrapping the interactive sky map
- [x] SSR-safe — no DOM access during server render
- [x] React as optional peer dependency (like Three.js pattern)
- [x] **Docs & examples:**
  - [x] TypeDoc comments on every hook (params, return value, re-render behaviour, SSR safety)
  - [x] Usage guide with code samples (basic usage, combining hooks, SSR patterns)
  - [x] `observatory-app`: `Observatory.tsx` refactored to use `useMoonPhase`, `useTwilight`, `useWhatsUp` hooks replacing manual `useMemo` chains
  - [x] `react-native-app`: Tonight screen refactored to use `useMoonPhase` and `useTwilight` hooks

---

## P5 — Public npm Publish

**Status:** Not started
**Tracking:** Package registry & distribution

Remove adoption friction — most developers search npmjs.com.

- [ ] Switch from GitHub Package Registry to public npm
- [ ] Reserve `@motioncomplex/cosmos-lib` on npmjs.com (or consider unscoped `cosmos-lib`)
- [ ] Update `publishConfig` in package.json
- [ ] Add npm badge to README
- [ ] Publish initial public release
- [ ] Set up provenance attestations (npm `--provenance`)
- [ ] **Docs & examples:**
  - [ ] Update README installation instructions with public npm registry
  - [ ] Add npm version/download badges to README
  - [ ] `observatory-app`: update `package.json` to install from public npm instead of monorepo link
  - [ ] `react-native-app`: update `package.json` to install from public npm instead of monorepo link

---

## P6 — Expanded Star Catalog (Tiered)

**Status:** Not started
**Entry point:** Extend `src/data/stars.ts` + new lazy-load system

Support serious charting apps without bloating the default bundle.

- [ ] **Tier 0** (current): ~200 brightest stars — always bundled (~15 KB)
- [ ] **Tier 1**: HYG subset to magnitude 6.5 (~9,000 stars) — lazy-loadable JSON chunk
- [ ] **Tier 2**: Full HYG to magnitude 9+ (~120,000 stars) — separate download / CDN
- [ ] Lazy-load API: `Data.loadStarTier(1)` returns promise
- [ ] Integrate loaded tiers into `Data.search()`, `Data.nearby()`, sky map rendering
- [ ] Binary format option (compact typed arrays) for Tier 2
- [ ] Attribution & license compliance for HYG database
- [ ] **Docs & examples:**
  - [ ] TypeDoc comments on `Data.loadStarTier()`, tier constants, and binary format options
  - [ ] Usage guide with code samples (lazy loading, progress feedback, bundle-size implications)
  - [ ] `observatory-app`: add "Load more stars" toggle in `SkyMapView` that loads Tier 1/2 on demand; extend `Catalog` magnitude slider to show deeper stars when loaded
  - [ ] `react-native-app`: add Tier 1 lazy-load button in Catalog screen with loading indicator

---

## P7 — Event Calendar

**Status:** Not started
**Entry point:** New `src/events.ts` module

Upcoming astronomical events feed — a unique differentiator.

- [ ] `nextEvents(observer, options)` — upcoming events within a date range
- [ ] Event types: conjunctions, oppositions, elongations, eclipses, meteor shower peaks, equinoxes, solstices, moon phases
- [ ] `nextEvent(type)` — next occurrence of a specific event type
- [ ] Planetary conjunction detection (angular separation threshold)
- [ ] Integration with existing eclipse module
- [ ] Integration with existing meteor shower data (peak dates → alerts)
- [ ] iCal export for calendar integration
- [ ] **Docs & examples:**
  - [ ] TypeDoc comments on `nextEvents()`, `nextEvent()`, event types, and iCal export
  - [ ] Usage guide with code samples (upcoming events list, calendar integration, type filtering)
  - [ ] `observatory-app`: add new `/events` route with a timeline view (reuse `EclipseView` card pattern), show next 3 events on `Observatory` dashboard
  - [ ] `react-native-app`: add "Events" tab showing upcoming events list with date/type badges, tappable cards linking to detail

---

## P8 — Satellite & ISS Tracking

**Status:** Not started
**Entry point:** New `src/satellites.ts` module

TLE parsing + SGP4/SDP4 propagation.

- [ ] TLE two-line element parser
- [ ] SGP4/SDP4 orbit propagator
- [ ] `Satellite.fromTLE(tle)` — create satellite instance
- [ ] `satellite.positionAt(date, observer)` — alt/az/range
- [ ] `satellite.nextPass(observer)` — predict next visible pass (rise, peak, set, max altitude)
- [ ] `Satellites.fromCelestrak(name)` — fetch TLE from CelesTrak API
- [ ] Batch pass prediction for multiple satellites
- [ ] Iridium flare prediction (stretch goal)
- [ ] ISS-specific convenience (`Satellites.iss()`)
- [ ] **Docs & examples:**
  - [ ] TypeDoc comments on `Satellite` class, TLE parser, pass prediction, and CelesTrak integration
  - [ ] Usage guide with code samples (TLE parsing, pass prediction, ISS tracking, batch queries)
  - [ ] `observatory-app`: add satellite layer toggle in `SkyMapView` (ISS track overlay), new `/satellites` route with upcoming pass table
  - [ ] `react-native-app`: add "ISS" card on Tonight screen showing next visible pass with countdown timer

---

## Future Considerations (Unranked)

These are valuable but lower priority than the P1–P8 items above.

### Astrophotography Helpers

- Milky Way core position & visibility
- Golden hour / blue hour explicit API
- Moon interference scoring for deep-sky targets
- FOV calculator (sensor size + focal length → sky overlay)
- Polar alignment helper (Polaris offset from true pole)

### WebGL/WebGPU Sky Renderer

- GPU-accelerated renderer for 100K+ star smooth pan/zoom
- Milky Way background texture
- Atmosphere gradient (horizon glow)
- Separate `/webgl` entry point alongside Canvas

### Coordinate I/O & Interop

- FITS WCS header parsing
- VOTable XML parsing
- Multi-resolver name resolution (Simbad + NED + VizieR)
- Export formats: KML, CSV, JSON observation logs

### Offline-First & SSR

- Ensure all math/data modules are DOM-free for Node.js SSR
- Service worker recipe for caching NASA/ESA API responses
- `isServer` / `isBrowser` guards where needed

### Framework Bindings (beyond React)

- Vue composables (`/vue` entry point)
- Svelte stores (`/svelte` entry point)
- Solid.js signals

### Developer Experience

- `playground/` demo app (interactive, deployable)
- CLI tool (`npx cosmos tonight --lat 40 --lon -74`)
- Storybook or similar for visual component testing

---

_Last updated: 2026-03-22_
