# Cosmos Mobile

A beautiful React Native (Expo) mobile app showcasing `@motioncomplex/cosmos-lib`.

## Screenshots

The app features three main screens:

- **Tonight** — Moon phase visualization, sunrise/sunset times, bright stars currently above the horizon, and planet positions
- **Catalog** — Browse and search 400+ celestial objects with type filters (stars, planets, nebulae, galaxies, clusters)
- **APOD** — NASA's Astronomy Picture of the Day + image search

## Getting Started

```bash
cd examples/react-native-app
npm install
npx expo start
```

Then scan the QR code with Expo Go (iOS/Android) or press `w` for web.

## cosmos-lib Modules Used

| Module | Usage |
|--------|-------|
| `Data` | Catalog search, type filtering, object lookup |
| `AstroMath` | Coordinate transforms (equatorial → horizontal), rise/transit/set times |
| `Sun` | Solar position, sunrise/sunset, twilight times |
| `Moon` | Lunar phase, illumination, position |
| `NASA` | APOD fetch, image library search |
| `Units` | RA/Dec formatting (HMS/DMS) |

## React Native Compatibility

The **pure computation** modules (`Data`, `AstroMath`, `Sun`, `Moon`, `Eclipse`, `Units`, `CONSTANTS`) and **API clients** (`NASA`, `ESA`, `resolveSimbad`) work perfectly in React Native with zero polyfills.

DOM-dependent modules (`Media`, `SkyMap`, `Transitions`) require browser APIs and are **not used** in this app. For sky map rendering in React Native, consider using `react-native-canvas` or `react-native-skia` with the library's projection math (`stereographic`, `mollweide`, `gnomonic`).

## Project Structure

```
app/
  _layout.tsx    — Tab navigation with dark theme
  index.tsx      — Tonight's Sky dashboard
  catalog.tsx    — Searchable object catalog
  detail.tsx     — Object detail view
  apod.tsx       — NASA APOD viewer
src/
  components/    — Reusable UI components
  constants/     — Theme (dark astronomy palette)
```
