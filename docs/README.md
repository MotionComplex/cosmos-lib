# @motioncomplex/cosmos-lib Documentation

Astronomical utilities library with zero runtime dependencies. Provides coordinate math, celestial catalogs (300+ stars, 110 Messier objects, 88 constellations, 20 meteor showers), NASA/ESA API integrations, sky map rendering, progressive image loading, View Transitions animations, and optional Three.js scene helpers.

---

## Table of Contents

### Getting Started

- [Getting Started](./getting-started.md) -- Installation, imports, and quick-start examples

### API Reference

- [Constants & Units](./api/constants-units.md) -- Physical constants (AU, light-year, parsec, solar/earth mass) and unit conversion utilities
- [Math](./api/math.md) -- `AstroMath` module: Julian dates, coordinate transforms, angular separation, planet ephemeris, nutation, rise/transit/set
- [Sun / Moon / Eclipse](./api/sun-moon-eclipse.md) -- `Sun` position and twilight, `Moon` position and phase, `Eclipse` predictions
- [Data & Catalogs](./api/data-catalogs.md) -- `Data` facade for unified queries, bright stars, Messier catalog, constellations, meteor showers, solar system, and image helpers
- [API Integrations](./api/api-integrations.md) -- `NASA` (image search, APOD, asset URLs), `ESA` (Hubble archive), `resolveSimbad` (CDS SIMBAD TAP)
- [Sky Map](./api/sky-map.md) -- `renderSkyMap`, `SkyMap` class, projection functions (stereographic, mollweide, gnomonic)
- [Media](./api/media.md) -- `Media` utilities: chain loading, progressive image loading, Wikimedia/Cloudinary URL builders, srcset generation
- [Transitions](./api/transitions.md) -- View Transitions wrappers: `morph`, `staggerIn`/`staggerOut`, `fade`, `crossfade`, `heroExpand`/`heroCollapse`
- [Three.js](./api/threejs.md) -- Scene factories (`createPlanet`, `createNebula`, `createStarField`, `createOrbit`), `CameraFlight`, `LODTextureManager`, GLSL shaders

### Guides

- [Coordinate Systems](./guides/coordinate-systems.md) -- Equatorial, horizontal, galactic, and ecliptic coordinate systems and conversions
- [Catalog Data](./guides/catalog-data.md) -- Working with the built-in star, Messier, constellation, and meteor shower catalogs
- [Three.js Integration](./guides/threejs-integration.md) -- Setting up Three.js scene helpers, texture loading, camera flights, and LOD management

### Type Reference

- [Type Reference](./types.md) -- Quick-reference table of all exported TypeScript types and interfaces

---

## Auto-Generated API Reference

A complete TypeDoc-generated API reference is available in the [`api-reference/`](./api-reference/) directory. Generate it locally with:

```bash
npm run docs
```

This produces detailed documentation for every exported function, class, type, and constant, including full JSDoc descriptions, parameter tables, and usage examples.
