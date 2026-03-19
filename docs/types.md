# Type Reference

Quick-reference for all exported TypeScript types and interfaces in `@motioncomplex/cosmos-lib`.

---

## Coordinates

Types for representing positions in different astronomical coordinate systems.

| Type | Description | Module |
|------|-------------|--------|
| [`EquatorialCoord`](#equatorialcoord) | Right Ascension / Declination pair (J2000 epoch) | `types.ts` |
| [`HorizontalCoord`](#horizontalcoord) | Altitude / Azimuth pair relative to an observer | `types.ts` |
| [`GalacticCoord`](#galacticcoord) | Galactic longitude / latitude pair (IAU 1958) | `types.ts` |
| [`EclipticCoord`](#eclipticcoord) | Ecliptic longitude / latitude pair (J2000 mean ecliptic) | `types.ts` |
| [`ObserverParams`](#observerparams) | Geographic location and time of an observer | `types.ts` |
| [`ProjectedPoint`](#projectedpoint) | 2-D projected point on a sky map canvas | `types.ts` |

---

## Celestial Objects

Core types for representing and querying objects in the unified catalog.

| Type | Description | Module |
|------|-------------|--------|
| [`ObjectType`](#objecttype) | Union of celestial object classifications: star, planet, nebula, galaxy, cluster, black-hole, moon | `types.ts` |
| [`CelestialObject`](#celestialobject) | Unified catalog entry with position, magnitude, distance, and metadata | `types.ts` |
| [`Distance`](#distance) | A numeric distance value paired with its unit of measurement | `types.ts` |
| [`DistanceUnit`](#distanceunit) | Unit of measurement for astronomical distances: km, AU, ly, pc, kpc, Mpc | `types.ts` |
| [`SearchResult`](#searchresult) | A catalog search result with a relevance score | `types.ts` |
| [`ProximityResult`](#proximityresult) | A proximity-search result with angular separation in degrees | `types.ts` |

---

## Catalog Types

Typed records for individual catalogs (bright stars, Messier, constellations, meteor showers, solar system).

| Type | Description | Module |
|------|-------------|--------|
| [`BrightStar`](#brightstar) | IAU named bright star with position, magnitude, spectral type, and proper motion | `data/stars.ts` |
| [`MessierObject`](#messierobject) | Messier catalog entry (1--110) with position, classification, and NGC cross-reference | `data/messier.ts` |
| [`Constellation`](#constellation) | IAU constellation with abbreviation, area, center position, and stick-figure asterism data | `data/constellations.ts` |
| [`MeteorShower`](#meteorshower) | Meteor shower with radiant position, peak solar longitude, activity window, and ZHR | `data/showers.ts` |
| [`SolarSystemBody`](#solarsystembody) | Solar system body extending CelestialObject with diameter, mass, moons, and temperature | `data/solar-system.ts` |

---

## Ephemeris

Types returned by Sun, Moon, Eclipse, and planetary position calculations.

| Type | Description | Module |
|------|-------------|--------|
| [`PlanetName`](#planetname) | Union of planet names supported by `AstroMath.planetEcliptic` | `types.ts` |
| [`PlanetPosition`](#planetposition) | Heliocentric ecliptic position with distance, mean anomaly, and true anomaly | `types.ts` |
| [`SunPosition`](#sunposition) | Geocentric equatorial position of the Sun with ecliptic longitude and distance in AU | `types.ts` |
| [`MoonPosition`](#moonposition) | Geocentric equatorial position of the Moon with distance, ecliptic coords, and parallax | `types.ts` |
| [`MoonPhase`](#moonphase) | Lunar phase information: phase angle, illumination fraction, age, and phase name | `types.ts` |
| [`MoonPhaseName`](#moonphasename) | Human-readable lunar phase name (new, waxing-crescent, first-quarter, etc.) | `types.ts` |
| [`TwilightTimes`](#twilighttimes) | Civil, nautical, and astronomical dawn/dusk times plus sunrise, sunset, and solar noon | `types.ts` |
| [`NutationResult`](#nutationresult) | Nutation corrections in longitude and obliquity | `types.ts` |
| [`RiseTransitSet`](#risetransitset) | Rise, transit (meridian crossing), and set times for a celestial object | `types.ts` |
| [`EclipseEvent`](#eclipseevent) | Predicted eclipse event with type, subtype, date, and magnitude | `eclipse.ts` |

---

## API

Types for NASA, ESA, and SIMBAD API responses and query options.

| Type | Description | Module |
|------|-------------|--------|
| [`NASAImageResult`](#nasaimageresult) | A result from the NASA Image and Video Library search | `types.ts` |
| [`APODResult`](#apodresult) | Astronomy Picture of the Day result with title, URLs, and metadata | `types.ts` |
| [`ESAHubbleResult`](#esahubbleresult) | A result from the ESA Hubble Space Telescope image archive | `types.ts` |
| [`SimbadResult`](#simbadresult) | Resolved object from the CDS SIMBAD TAP service with RA/Dec and type code | `types.ts` |
| [`NASASearchOptions`](#nasasearchoptions) | Filtering and pagination options for NASA image searches | `api.ts` |

---

## Media

Types for image loading, URL generation, and progressive image display.

| Type | Description | Module |
|------|-------------|--------|
| [`ProgressiveImageOptions`](#progressiveimageoptions) | Configuration for blur-up progressive image loading (placeholder, src, srcHD) | `types.ts` |
| [`CloudinaryOptions`](#cloudinaryoptions) | Cloudinary transformation options: width, height, quality, format, crop mode | `types.ts` |
| [`ImageRef`](#imageref) | Reference to a Wikimedia Commons image with filename and credit string | `types.ts` |
| [`ResolvedImage`](#resolvedimage) | Multi-resolution image result from NASA/ESA APIs with URLs, preview, and attribution | `data/images.ts` |
| [`ResolveImageOptions`](#resolveimageoptions) | Options for `resolveImages`: API source selection and result limit | `data/images.ts` |

---

## Sky Map

Types for sky map rendering and projection configuration.

| Type | Description | Module |
|------|-------------|--------|
| [`ProjectionName`](#projectionname) | Map projection type: stereographic, mollweide, or gnomonic | `types.ts` |
| [`SkyMapRenderOptions`](#skymaprenderptions) | Full configuration for `renderSkyMap`: projection, center, scale, grid, labels, constellation display | `types.ts` |

---

## Transitions

Types for View Transitions API animation wrappers.

| Type | Description | Module |
|------|-------------|--------|
| [`MorphOptions`](#morphoptions) | Options for `morph`: duration, easing, and abort signal | `types.ts` |
| [`StaggerOptions`](#staggeroptions) | Options for `staggerIn`/`staggerOut`: delay, stagger interval, direction, distance, abort signal | `types.ts` |
| [`HeroExpandOptions`](#heroexpandoptions) | Options for `heroExpand`/`heroCollapse`: duration, easing, completion callback, abort signal | `types.ts` |

---

## Three.js

Types for the optional Three.js integration layer. Import from `@motioncomplex/cosmos-lib/three`.

| Type | Description | Module |
|------|-------------|--------|
| [`PlanetOptions`](#planetoptions) | Configuration for `createPlanet`: radius, textures, color, atmosphere, rings, black-hole mode | `three/types.ts` |
| [`PlanetResult`](#planetresult) | Return value of `createPlanet`: group, mesh, and dispose function | `three/types.ts` |
| [`NebulaOptions`](#nebulaoptions) | Configuration for `createNebula`: radius, aspect ratio, texture URLs, opacity | `three/types.ts` |
| [`NebulaResult`](#nebularesult) | Return value of `createNebula`: group, sprite, hit mesh, and dispose function | `three/types.ts` |
| [`StarFieldOptions`](#starfieldoptions) | Configuration for `createStarField`: count, radius range, point size range, opacity | `three/types.ts` |
| [`OrbitOptions`](#orbitoptions) | Configuration for `createOrbit`: line color, opacity, segment count | `three/types.ts` |
| [`FlightOptions`](#flightoptions) | Options for `CameraFlight.flyTo`: duration, easing curve, completion callback | `three/types.ts` |
| [`OrbitAroundOptions`](#orbitaroundoptions) | Options for `CameraFlight.orbitAround`: radius, angular speed, elevation | `three/types.ts` |

---

## Type Details

### EquatorialCoord

Equatorial coordinate pair in the J2000 epoch. Fields: `ra` (Right Ascension, 0--360 degrees) and `dec` (Declination, -90 to +90 degrees).

### HorizontalCoord

Horizontal (topocentric) coordinate pair. Fields: `alt` (altitude in degrees, positive above horizon) and `az` (azimuth in degrees, 0 = North).

### GalacticCoord

Galactic coordinate pair (IAU 1958). Fields: `l` (galactic longitude, 0--360 degrees) and `b` (galactic latitude, -90 to +90 degrees).

### EclipticCoord

Ecliptic coordinate pair referred to the J2000 mean ecliptic. Fields: `lon` (ecliptic longitude) and `lat` (ecliptic latitude).

### ObserverParams

Geographic location and time for topocentric calculations. Fields: `lat`, `lng` (degrees), and optional `date` (defaults to now).

### ProjectedPoint

A 2-D point on a sky map canvas. Fields: `x`, `y` (pixel offsets) and `visible` (whether the point is on the visible hemisphere).

### ObjectType

Union type: `'star' | 'planet' | 'nebula' | 'galaxy' | 'cluster' | 'black-hole' | 'moon'`.

### CelestialObject

Unified catalog entry. Key fields: `id`, `name`, `aliases`, `type`, `ra`, `dec`, `magnitude`, `distance`, `description`, `tags`. Optional fields for physical properties: `diameter_km`, `mass_kg`, `moons`, `surface_temp_K`, `spectral`, `binary`, `triple`.

### Distance

A distance value with unit. Fields: `value` (number) and `unit` (DistanceUnit).

### DistanceUnit

Union type: `'km' | 'AU' | 'ly' | 'pc' | 'kpc' | 'Mpc'`.

### SearchResult

Returned by `Data.search`. Fields: `object` (CelestialObject) and `score` (relevance, higher is better).

### ProximityResult

Returned by `Data.nearby`. Fields: `object` (CelestialObject) and `separation` (angular distance in degrees).

### BrightStar

IAU named star record. Fields: `id`, `name`, `con` (constellation abbreviation), `hr` (Harvard Revised number), `ra`, `dec`, `mag`, `spec` (spectral type), proper motion fields.

### MessierObject

Messier catalog entry. Fields: `messier` (1--110), `name`, `ngc` (optional cross-ref), `type` (`'nebula' | 'cluster' | 'galaxy'`), `subtype`, `constellation`, `ra`, `dec`, `mag`, angular size, and `description`.

### Constellation

IAU constellation record. Fields: `abbr` (3-letter code), `name`, `genitive`, `ra`, `dec` (center), `area` (square degrees), `stickFigure` (line segment array), `brightestStar`.

### MeteorShower

Meteor shower record. Fields: `id`, `name`, `code` (IAU 3-letter), `radiantRA`, `radiantDec`, `solarLon`, `peakDate`, `start`, `end`, `zhr`, and `speed`.

### SolarSystemBody

Extends CelestialObject with `diameter_km`, optional `mass_kg`, `moons`, and `surface_temp_K`. RA/Dec are `null` (positions computed at runtime).

### PlanetName

Union type: `'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune'`.

### PlanetPosition

Extends EclipticCoord. Adds `r` (heliocentric distance in AU), `M` (mean anomaly), `nu` (true anomaly).

### SunPosition

Extends EquatorialCoord. Adds `distance_AU` and `eclipticLon`.

### MoonPosition

Extends EquatorialCoord. Adds `distance_km`, `eclipticLon`, `eclipticLat`, `parallax`.

### MoonPhase

Lunar phase info. Fields: `phase` (0--1 angle), `illumination` (0--1 fraction), `age` (days since new moon), `name` (MoonPhaseName).

### MoonPhaseName

Union type: `'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent'`.

### TwilightTimes

Dawn/dusk times for an observer. Fields: `astronomicalDawn`, `nauticalDawn`, `civilDawn`, `sunrise`, `solarNoon`, `sunset`, `civilDusk`, `nauticalDusk`, `astronomicalDusk`. All nullable except `solarNoon`.

### NutationResult

Nutation corrections. Fields: `dPsi` (longitude, degrees) and `dEpsilon` (obliquity, degrees).

### RiseTransitSet

Rise/transit/set times. Fields: `rise` (Date or null), `transit` (Date), `set` (Date or null). Null for circumpolar or never-rising objects.

### EclipseEvent

Predicted eclipse. Fields: `type` (`'solar' | 'lunar'`), `subtype` (`'total' | 'annular' | 'partial' | 'penumbral'`), `date`, `magnitude`.

### NASAImageResult

NASA image search result. Fields: `nasaId`, `title`, `description`, `date`, `center`, `keywords`, `previewUrl`, `href`.

### APODResult

Astronomy Picture of the Day. Fields: `title`, `date`, `explanation`, `url`, `hdUrl`, `mediaType`, `copyright`.

### ESAHubbleResult

ESA Hubble image result. Fields: `id`, `title`, `description`, `credit`, `date`, `imageUrl`, `thumbUrl`, `tags`.

### SimbadResult

SIMBAD resolved object. Fields: `id` (main identifier), `ra`, `dec` (J2000 degrees), `type` (SIMBAD object-type code).

### NASASearchOptions

NASA search filters. Fields: `mediaType`, `yearStart`, `yearEnd`, `pageSize`, `page`.

### ProgressiveImageOptions

Progressive image loading config. Fields: `placeholder` (tiny blurred URL), `src` (medium quality), `srcHD` (full resolution).

### CloudinaryOptions

Cloudinary transform options. Fields: `w` (width), `h` (height), `q` (quality), `f` (format), `crop` (mode).

### ImageRef

Wikimedia Commons image reference. Fields: `filename` and `credit`.

### ResolvedImage

API-resolved image. Fields: `urls` (multiple resolutions, highest first), `previewUrl`, `title`, `credit`, `source` (`'nasa' | 'esa'`).

### ResolveImageOptions

Image resolution options. Fields: `source` (`'nasa' | 'esa' | 'all'`) and `limit`.

### ProjectionName

Union type: `'stereographic' | 'mollweide' | 'gnomonic'`.

### SkyMapRenderOptions

Sky map configuration. Fields: `projection`, `center`, `scale`, `showGrid`, `showLabels`, `showMagnitudeLimit`, `background`, `gridColor`, `labelColor`, `showConstellationLines`, `showConstellationLabels`, `constellationLineColor`, `constellationLabelColor`, `constellations`.

### MorphOptions

View Transition morph options. Fields: `duration` (ms), `easing` (CSS string), `signal` (AbortSignal).

### StaggerOptions

Stagger animation options. Fields: `delay`, `stagger`, `duration` (all ms), `from` (direction), `distance` (CSS length), `signal`.

### HeroExpandOptions

Hero expand/collapse options. Fields: `duration` (ms), `easing`, `onDone` (callback), `signal`.

### PlanetOptions

Three.js planet configuration. Fields: `radius`, `textureUrl`, `textureUrls`, `bumpUrl`, `color`, `emissive`, `emissiveIntensity`, `atmosphere` (color + intensity), `rings` (inner/outer/color/opacity/tilt), `isBlackHole`.

### PlanetResult

Three.js planet result. Fields: `group` (THREE.Group), `mesh` (THREE.Mesh), `dispose` (cleanup function).

### NebulaOptions

Three.js nebula configuration. Fields: `radius`, `aspect`, `textureUrls`, `opacity`.

### NebulaResult

Three.js nebula result. Fields: `group`, `sprite`, `hitMesh`, `dispose`.

### StarFieldOptions

Three.js star field configuration. Fields: `count`, `minRadius`, `maxRadius`, `sizeMin`, `sizeMax`, `opacity`.

### OrbitOptions

Three.js orbit ring configuration. Fields: `color`, `opacity`, `segments`.

### FlightOptions

Camera flight options. Fields: `duration` (ms), `easing` (`'in' | 'out' | 'inOut'`), `onDone` (callback).

### OrbitAroundOptions

Camera orbit options. Fields: `radius` (scene units), `speed` (radians/sec), `elevation` (scene units).
