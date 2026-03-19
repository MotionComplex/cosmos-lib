# Guide: Celestial Coordinate Systems

This guide explains the four coordinate systems used in astronomy, when to use each one, and how to convert between them using `AstroMath` from cosmos-lib.

---

## The Four Coordinate Systems

### Equatorial (RA/Dec)

The standard reference frame for star catalogues and telescope pointing. Fixed to the celestial sphere (tied to distant stars), so coordinates change only slowly due to precession.

- **Right Ascension (RA):** Angle measured eastward along the celestial equator from the vernal equinox (0-360 degrees, or equivalently 0-24 hours).
- **Declination (Dec):** Angle north (+) or south (-) of the celestial equator (-90 to +90 degrees).

```ts
interface EquatorialCoord {
  ra: number   // degrees, 0-360
  dec: number  // degrees, -90 to +90
}
```

**When to use:** Almost always. This is the default for catalogue positions, telescope slewing, and sky map plotting. All positions in cosmos-lib are stored in J2000 equatorial coordinates.

### Horizontal (Alt/Az)

Tied to the local observer -- depends on your geographic location and the time of observation.

- **Altitude (Alt):** Angle above (+) or below (-) the horizon in degrees.
- **Azimuth (Az):** Angle measured clockwise from due North (0 = North, 90 = East, 180 = South, 270 = West).

```ts
interface HorizontalCoord {
  alt: number  // degrees, + above horizon
  az: number   // degrees, 0=North, 90=East, 180=South, 270=West
}
```

**When to use:** When you need to know where something appears in the sky from a specific location at a specific time. Essential for "can I see this object tonight?" calculations, rise/set times, and planetarium displays.

### Galactic (l/b)

Centred on the Milky Way, with the galactic plane as the equator.

- **Galactic longitude (l):** Angle along the galactic plane, measured from the galactic centre (0-360 degrees).
- **Galactic latitude (b):** Angle above (+) or below (-) the galactic plane (-90 to +90 degrees).

```ts
interface GalacticCoord {
  l: number  // degrees, 0-360
  b: number  // degrees, -90 to +90
}
```

**When to use:** When studying the distribution of objects relative to the Milky Way's structure -- dust lanes, spiral arms, the galactic centre. Useful for research contexts but rarely needed for visual observing.

### Ecliptic (lon/lat)

Based on Earth's orbital plane around the Sun.

- **Ecliptic longitude (lon):** Angle along the ecliptic from the vernal equinox (0-360 degrees).
- **Ecliptic latitude (lat):** Angle north (+) or south (-) of the ecliptic (-90 to +90 degrees).

```ts
interface EclipticCoord {
  lon: number  // degrees, 0-360
  lat: number  // degrees, -90 to +90
}
```

**When to use:** For planetary positions and solar system work. Planets orbit near the ecliptic plane, so their ecliptic latitudes are always small. The `AstroMath.planetEcliptic` function returns positions in this system.

---

## Converting Between Systems

### Equatorial to Horizontal

Requires knowing **where** and **when** you are observing:

```ts
import { AstroMath } from '@motioncomplex/cosmos-lib'

const sirius = { ra: 101.287, dec: -16.716 }
const observer = {
  lat: 47.05,    // Lucerne, Switzerland
  lng: 8.31,
  date: new Date('2025-01-15T22:00:00Z'),
}

const { alt, az } = AstroMath.equatorialToHorizontal(sirius, observer)
// alt > 0 means the star is above the horizon
```

### Horizontal to Equatorial

The inverse transform -- useful when you have observed alt/az coordinates and want to identify what object is there:

```ts
const observed = { alt: 25, az: 180 } // due south, 25 degrees up
const { ra, dec } = AstroMath.horizontalToEquatorial(observed, observer)
```

### Ecliptic to Equatorial

Uses the mean obliquity of the ecliptic at J2000.0 (23.4393 degrees):

```ts
// Convert Mars's ecliptic position to equatorial
const marsEcl = AstroMath.planetEcliptic('mars')
const marsEq = AstroMath.eclipticToEquatorial({ lon: marsEcl.lon, lat: marsEcl.lat })
```

### Galactic to Equatorial

Uses the standard IAU galactic coordinate system (North Galactic Pole at RA=192.86, Dec=27.13):

```ts
// Galactic centre -> equatorial
const gc = AstroMath.galacticToEquatorial({ l: 0, b: 0 })
// gc is approximately { ra: 266.4, dec: -28.9 } -- near Sagittarius A*
```

---

## Understanding Sidereal Time

Sidereal time is the key to connecting equatorial coordinates (fixed to the stars) with horizontal coordinates (fixed to your local horizon). It tells you which Right Ascension is currently crossing your local meridian.

### Greenwich Mean Sidereal Time (GMST)

The sidereal time at the Prime Meridian (longitude 0). Increases by about 360.985 degrees per solar day (because Earth rotates slightly faster relative to the stars than relative to the Sun).

```ts
const gmst = AstroMath.gmst(new Date('2025-01-15T22:00:00Z'))
// GMST in degrees (0-360)
```

### Local Sidereal Time (LST)

GMST adjusted for your geographic longitude:

```ts
const lst = AstroMath.lst(new Date('2025-01-15T22:00:00Z'), 8.31) // Lucerne
// LST tells you which RA is on your meridian right now
```

**Practical meaning:** If LST equals 100 degrees, then objects with RA near 100 degrees are currently transiting (crossing your meridian at their highest point). An object's **hour angle** is `LST - RA`. When the hour angle is 0, the object is on the meridian.

### Greenwich Apparent Sidereal Time (GAST)

GMST corrected by the equation of the equinoxes (nutation in longitude projected onto the equator). The correction is typically a few arcseconds:

```ts
const gast = AstroMath.gast(new Date('2025-01-15T22:00:00Z'))
```

---

## Worked Example: Tracking Sirius from Lucerne

Let us track Sirius (the brightest star) from Lucerne, Switzerland (lat 47.05, lng 8.31) on the evening of January 15, 2025.

### Step 1: Look up Sirius

```ts
import { Data, AstroMath } from '@motioncomplex/cosmos-lib'

const sirius = Data.getStarByName('Sirius')!
// sirius.ra = 101.287, sirius.dec = -16.716 (J2000)
```

### Step 2: Compute rise, transit, and set times

```ts
const observer = { lat: 47.05, lng: 8.31, date: new Date('2025-01-15T00:00:00Z') }
const rts = AstroMath.riseTransitSet(
  { ra: sirius.ra, dec: sirius.dec },
  observer,
)

if (rts.rise) console.log('Rises at', rts.rise.toUTCString())
console.log('Transits at', rts.transit.toUTCString())
if (rts.set) console.log('Sets at', rts.set.toUTCString())
```

### Step 3: Check altitude at 10pm local time

```ts
const tenPM = new Date('2025-01-15T21:00:00Z') // 22:00 CET = 21:00 UTC
const { alt, az } = AstroMath.equatorialToHorizontal(
  { ra: sirius.ra, dec: sirius.dec },
  { lat: 47.05, lng: 8.31, date: tenPM },
)

console.log(`Altitude: ${alt.toFixed(1)} degrees`)
console.log(`Azimuth: ${az.toFixed(1)} degrees`)

if (alt > 0) {
  console.log('Sirius is above the horizon!')
} else {
  console.log('Sirius is below the horizon.')
}
```

### Step 4: Account for atmospheric refraction

Near the horizon, atmospheric refraction bends light upward by about 0.57 degrees. The `refraction` function gives the correction:

```ts
const refractionDeg = AstroMath.refraction(alt)
const apparentAlt = alt + refractionDeg
console.log(`Apparent altitude (with refraction): ${apparentAlt.toFixed(2)} degrees`)
```

### Step 5: Apply proper motion to get current-epoch coordinates

Star positions drift over time due to proper motion. Sirius moves significantly:

```ts
const currentCoords = AstroMath.applyProperMotion(
  { ra: sirius.ra, dec: sirius.dec },
  sirius.pmRa,   // -546.01 mas/yr
  sirius.pmDec,  // -1223.07 mas/yr
  2000.0,        // from J2000
  2025.0,        // to current epoch
)
console.log(`Current RA: ${currentCoords.ra.toFixed(3)}`)
console.log(`Current Dec: ${currentCoords.dec.toFixed(3)}`)
```

### Step 6: Find nearby objects

What else is near Sirius in the sky?

```ts
const nearby = Data.nearbyStars({ ra: sirius.ra, dec: sirius.dec }, 15)
nearby.forEach(r => {
  console.log(`${r.star.name}: ${r.separation.toFixed(1)} degrees away`)
})
```

---

## Quick Reference

| Task | Function |
|------|----------|
| RA/Dec to Alt/Az | `AstroMath.equatorialToHorizontal(eq, obs)` |
| Alt/Az to RA/Dec | `AstroMath.horizontalToEquatorial(hor, obs)` |
| Ecliptic to RA/Dec | `AstroMath.eclipticToEquatorial(ecl)` |
| Galactic to RA/Dec | `AstroMath.galacticToEquatorial(gal)` |
| Planet ecliptic position | `AstroMath.planetEcliptic(name, date)` |
| Angular separation | `AstroMath.angularSeparation(a, b)` |
| Rise/transit/set | `AstroMath.riseTransitSet(eq, obs, h0?)` |
| Greenwich sidereal time | `AstroMath.gmst(date)` |
| Local sidereal time | `AstroMath.lst(date, longitude)` |
| Atmospheric refraction | `AstroMath.refraction(alt, tempC?, pressureMb?)` |
| Proper motion | `AstroMath.applyProperMotion(eq, pmRA, pmDec, from, to)` |
| Precession | `AstroMath.precess(eq, jdFrom, jdTo)` |
