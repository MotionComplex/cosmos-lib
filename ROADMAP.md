# cosmos-lib Roadmap

> Priority-ranked feature tracking for making cosmos-lib the definitive astronomy toolkit for the web.

---

## P1 — Interactive Sky Map

**Status:** Not started
**Entry point:** `src/skymap.ts` (extend existing renderer)

Transform the current render-only `renderSkyMap` into a fully interactive experience.

- [ ] Pan & zoom (mouse drag, scroll wheel, touch pinch)
- [ ] Click-to-identify — tap a star/object, return its `CelestialObject` data
- [ ] Hover detection — highlight objects, show name/magnitude
- [ ] FOV indicator overlay — telescope/binocular field of view circle
- [ ] Real-time mode — auto-update as sidereal time advances
- [ ] Configurable HUD (cardinal directions, horizon line, zenith marker)
- [ ] Event emitter for interactions (`onSelect`, `onHover`, `onViewChange`)

---

## P2 — Observation Planning (`whatsUp`)

**Status:** Not started
**Entry point:** New `src/planner.ts` module

The killer utility: "What can I see tonight?"

- [ ] `whatsUp(observer, options)` — objects above horizon, sorted by altitude, filtered by magnitude limit
- [ ] `bestWindow(objectId, observer, date)` — when an object reaches max altitude on a given night
- [ ] `visibilityCurve(objectId, observer, date)` — altitude vs. time array for plotting
- [ ] Opposition/conjunction detection for planets
- [ ] Moon interference scoring (angular separation + illumination)
- [ ] Airmass calculation for photometry-aware planning
- [ ] Filter by object type, constellation, catalog

---

## P3 — Simulation Clock

**Status:** Not started
**Entry point:** New `src/clock.ts` module

Decouple observation time from wall-clock time.

- [ ] `AstroClock` class with configurable speed multiplier
- [ ] `play()`, `pause()`, `setDate()`, `setSpeed()` controls
- [ ] `onTick(callback)` with configurable interval
- [ ] Forward and reverse playback
- [ ] Snap-to-event (jump to next rise/set/transit)
- [ ] Integration with sky map (drive rendering automatically)
- [ ] Frame-accurate timing via `requestAnimationFrame`

---

## P4 — React Hooks

**Status:** Not started
**Entry point:** New `src/react/` directory, exported as `@motioncomplex/cosmos-lib/react`

Meet developers where they are.

- [ ] `useSkyPosition(objectId, observer)` — reactive alt/az
- [ ] `useMoonPhase(date?)` — current phase, illumination, name
- [ ] `useAstroClock(options)` — clock instance with React lifecycle
- [ ] `useWhatsUp(observer, options)` — reactive visible objects list
- [ ] `useTwilight(observer, date?)` — dawn/dusk times
- [ ] `<SkyMap />` component wrapping the interactive sky map
- [ ] SSR-safe — no DOM access during server render
- [ ] React as optional peer dependency (like Three.js pattern)

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

*Last updated: 2026-03-19*
