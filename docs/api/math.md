# AstroMath

Core coordinate-transformation, ephemeris, and time-conversion module. All angular inputs and outputs are in **degrees** unless explicitly noted otherwise.

```ts
import { AstroMath } from '@motioncomplex/cosmos-lib'
```

Many algorithms are drawn from Jean Meeus, *Astronomical Algorithms* (2nd ed., Willmann-Bell, 1998).

---

## Time

### `toJulian(date?: Date): number`

Convert a JavaScript `Date` to a Julian Date number.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | The date/time to convert. |

**Returns:** `number` -- Julian Date as a floating-point number.

```ts
AstroMath.toJulian(new Date('2000-01-01T12:00:00Z'))
// => 2451545.0
```

### `fromJulian(jd: number): Date`

Convert a Julian Date number back to a JavaScript `Date`.

| Parameter | Type | Description |
|---|---|---|
| `jd` | `number` | The Julian Date to convert. |

**Returns:** `Date`

```ts
AstroMath.fromJulian(2451545.0)
// => Date('2000-01-01T12:00:00.000Z')
```

### `j2000Days(date?: Date): number`

Compute fractional days elapsed since the J2000.0 epoch (JD 2451545.0). Negative for dates before the epoch.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | The observation date. |

**Returns:** `number` -- fractional days since J2000.0.

```ts
AstroMath.j2000Days(new Date('2100-01-01T12:00:00Z'))
// => ~36525.0 (one Julian century)
```

---

## Sidereal Time

### `gmst(date?: Date): number`

Greenwich Mean Sidereal Time in degrees, normalised to [0, 360). Accurate to ~0.1 s over several centuries around J2000. Uses the linear approximation from Meeus Chapter 12.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | The observation date. |

**Returns:** `number` -- GMST in degrees.

```ts
AstroMath.gmst(new Date('2000-01-01T12:00:00Z'))
// => 280.46061837
```

### `lst(date: Date, longitudeDeg: number): number`

Local Sidereal Time in degrees. Equals GMST plus the observer's geographic longitude.

| Parameter | Type | Description |
|---|---|---|
| `date` | `Date` | The observation date/time. |
| `longitudeDeg` | `number` | Observer's longitude in degrees (east positive). |

**Returns:** `number` -- LST in degrees, normalised to [0, 360).

```ts
AstroMath.lst(new Date('2000-01-01T12:00:00Z'), -0.1)
// => ~280.36
```

### `gast(date?: Date): number`

Greenwich Apparent Sidereal Time in degrees. Equals GMST corrected by the equation of the equinoxes (nutation in longitude projected onto the equator). The correction is typically on the order of a few arcseconds.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | The observation date. |

**Returns:** `number` -- GAST in degrees, normalised to [0, 360).

```ts
AstroMath.gast(new Date('2000-01-01T12:00:00Z'))
// => ~280.46 (GMST + small nutation correction)
```

---

## Coordinate Transforms

### `equatorialToHorizontal(eq: EquatorialCoord, obs: ObserverParams): HorizontalCoord`

Convert equatorial coordinates (RA/Dec) to horizontal coordinates (Altitude/Azimuth). Azimuth is measured from North (0) through East (90), South (180), West (270).

| Parameter | Type | Description |
|---|---|---|
| `eq` | `EquatorialCoord` | `{ ra, dec }` in degrees. |
| `obs` | `ObserverParams` | `{ lat, lng, date? }` -- observer location. |

**Returns:** `HorizontalCoord` -- `{ alt, az }` in degrees.

```ts
const sirius = { ra: 101.287, dec: -16.716 }
const london = { lat: 51.5, lng: -0.1, date: new Date('2024-01-15T22:00:00Z') }
AstroMath.equatorialToHorizontal(sirius, london)
// => { alt: <altitude>, az: <azimuth> }
```

### `horizontalToEquatorial(hor: HorizontalCoord, obs: ObserverParams): EquatorialCoord`

Inverse of `equatorialToHorizontal`. Convert horizontal coordinates back to equatorial.

| Parameter | Type | Description |
|---|---|---|
| `hor` | `HorizontalCoord` | `{ alt, az }` in degrees. |
| `obs` | `ObserverParams` | `{ lat, lng, date? }` -- observer location. |

**Returns:** `EquatorialCoord` -- `{ ra, dec }` in degrees.

```ts
const hor = { alt: 25, az: 180 }
const lucerne = { lat: 47.05, lng: 8.31, date: new Date('2024-03-20T21:00:00Z') }
AstroMath.horizontalToEquatorial(hor, lucerne)
// => { ra: <right ascension>, dec: <declination> }
```

### `eclipticToEquatorial(ecl: EclipticCoord): EquatorialCoord`

Convert ecliptic coordinates to J2000 equatorial coordinates. Uses the mean obliquity of the ecliptic at J2000.0 (23.4393 degrees).

| Parameter | Type | Description |
|---|---|---|
| `ecl` | `EclipticCoord` | `{ lon, lat }` in degrees. |

**Returns:** `EquatorialCoord` -- `{ ra, dec }` with RA in [0, 360).

```ts
AstroMath.eclipticToEquatorial({ lon: 0, lat: 0 })
// => { ra: 0, dec: 0 }  (vernal equinox)

AstroMath.eclipticToEquatorial({ lon: 90, lat: 0 })
// => { ra: ~90, dec: ~23.44 }
```

### `galacticToEquatorial(gal: GalacticCoord): EquatorialCoord`

Convert IAU galactic coordinates to J2000 equatorial coordinates. Uses the standard IAU (1958) galactic coordinate system with the North Galactic Pole at RA=192.85948, Dec=27.12825.

| Parameter | Type | Description |
|---|---|---|
| `gal` | `GalacticCoord` | `{ l, b }` in degrees. |

**Returns:** `EquatorialCoord` -- `{ ra, dec }` with RA in [0, 360).

```ts
// Galactic centre
AstroMath.galacticToEquatorial({ l: 0, b: 0 })
// => { ra: ~266.4, dec: ~-28.9 } (near Sagittarius A*)
```

---

## Angular Separation

### `angularSeparation(a: EquatorialCoord, b: EquatorialCoord): number`

Great-circle angular separation between two equatorial positions using the haversine formula (numerically stable at small separations).

| Parameter | Type | Description |
|---|---|---|
| `a` | `EquatorialCoord` | First position `{ ra, dec }` in degrees. |
| `b` | `EquatorialCoord` | Second position `{ ra, dec }` in degrees. |

**Returns:** `number` -- angular separation in degrees [0, 180].

```ts
const sirius     = { ra: 101.287, dec: -16.716 }
const betelgeuse = { ra: 88.793, dec: 7.407 }
AstroMath.angularSeparation(sirius, betelgeuse)
// => ~27.07 degrees
```

---

## Photometry

### `apparentMagnitude(absoluteMag: number, distancePc: number): number`

Compute apparent magnitude from absolute magnitude and distance using the distance modulus formula: `m = M + 5 * log10(d / 10)`.

| Parameter | Type | Description |
|---|---|---|
| `absoluteMag` | `number` | Absolute magnitude (M). |
| `distancePc` | `number` | Distance in parsecs. |

**Returns:** `number` -- apparent magnitude (m).

```ts
// Sirius: M=1.42, d=2.64 pc
AstroMath.apparentMagnitude(1.42, 2.64)
// => ~-1.46
```

### `absoluteMagnitude(apparentMag: number, distancePc: number): number`

Compute absolute magnitude from apparent magnitude and distance: `M = m - 5 * log10(d / 10)`.

| Parameter | Type | Description |
|---|---|---|
| `apparentMag` | `number` | Apparent magnitude (m). |
| `distancePc` | `number` | Distance in parsecs. |

**Returns:** `number` -- absolute magnitude (M).

```ts
AstroMath.absoluteMagnitude(-1.46, 2.64)
// => ~1.42
```

### `parallaxToDistance(parallaxArcsec: number): number`

Convert stellar parallax to distance. By definition, 1 pc = 1 / parallax(arcsec).

| Parameter | Type | Description |
|---|---|---|
| `parallaxArcsec` | `number` | Trigonometric parallax in arcseconds (must be positive). |

**Returns:** `number` -- distance in parsecs.

```ts
// Sirius parallax: 0.37921"
AstroMath.parallaxToDistance(0.37921)
// => ~2.637 parsecs
```

---

## Kepler Solver

### `solveKepler(M: number, e: number, tol?: number): number`

Solve Kepler's equation `M = E - e * sin(E)` for the eccentric anomaly E using Newton-Raphson iteration. Converges in 3-6 iterations for all planetary eccentricities.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `M` | `number` | | Mean anomaly in **radians**. |
| `e` | `number` | | Orbital eccentricity (0 <= e < 1). |
| `tol` | `number` | `1e-12` | Convergence tolerance in radians. |

**Returns:** `number` -- eccentric anomaly E in **radians**.

> **Note:** This function operates in radians, unlike most other AstroMath functions which use degrees.

```ts
// Earth's orbit: e=0.0167, M=1.0 rad
AstroMath.solveKepler(1.0, 0.0167)
// => ~1.0166 radians

// Mars: e=0.0934, M=pi/2
AstroMath.solveKepler(Math.PI / 2, 0.0934)
// => ~1.6521 radians
```

---

## Planetary Ephemeris

### `planetEcliptic(planet: PlanetName, date?: Date): PlanetPosition`

Compute the heliocentric ecliptic position of a planet. Uses J2000 orbital elements with linear secular rates from JPL (Standish 1992). Accurate to ~0.1 degrees within several centuries of J2000.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `planet` | `PlanetName` | | `'mercury'` \| `'venus'` \| `'earth'` \| `'mars'` \| `'jupiter'` \| `'saturn'` \| `'uranus'` \| `'neptune'` |
| `date` | `Date` | `new Date()` | The observation date. |

**Returns:** `PlanetPosition` -- `{ lon, lat, r, M, nu }` where `lon`/`lat` are heliocentric ecliptic degrees, `r` is distance in AU, `M` is mean anomaly in degrees, and `nu` is true anomaly in degrees.

```ts
const mars = AstroMath.planetEcliptic('mars', new Date('2024-07-04T00:00:00Z'))
// => { lon, lat, r, M, nu }

const jupiter = AstroMath.planetEcliptic('jupiter', new Date('2000-01-01T12:00:00Z'))
// => { lon: ~34.4, lat: ~-1.3, r: ~5.03, ... }
```

---

## Precession

### `precess(eq: EquatorialCoord, jdFrom: number, jdTo: number): EquatorialCoord`

Precess equatorial coordinates from one epoch to another using the rigorous rotation-matrix method with Lieske (1979) precession polynomials. Accurate to ~0.1 arcsecond over a few centuries around J2000.0.

| Parameter | Type | Description |
|---|---|---|
| `eq` | `EquatorialCoord` | `{ ra, dec }` at the source epoch, in degrees. |
| `jdFrom` | `number` | Julian Date of the source epoch. |
| `jdTo` | `number` | Julian Date of the target epoch. |

**Returns:** `EquatorialCoord` -- `{ ra, dec }` at the target epoch.

```ts
const sirius = { ra: 101.287, dec: -16.716 }
const j2000 = 2451545.0
const j2050 = 2451545.0 + 50 * 365.25
AstroMath.precess(sirius, j2000, j2050)
// => { ra: ~101.61, dec: ~-16.79 }
```

---

## Nutation

### `nutation(jd: number): NutationResult`

Compute nutation in longitude (dPsi) and nutation in obliquity (dEpsilon) using the first 13 terms of the IAU 1980 nutation series.

| Parameter | Type | Description |
|---|---|---|
| `jd` | `number` | Julian Date. |

**Returns:** `NutationResult` -- `{ dPsi, dEpsilon }` both in degrees.

```ts
AstroMath.nutation(2451545.0)
// => { dPsi: ~-0.00385, dEpsilon: ~-0.00165 }
```

### `trueObliquity(jd: number): number`

True obliquity of the ecliptic (mean obliquity + nutation in obliquity). The mean obliquity polynomial is from Laskar (1986).

| Parameter | Type | Description |
|---|---|---|
| `jd` | `number` | Julian Date. |

**Returns:** `number` -- true obliquity in degrees.

```ts
AstroMath.trueObliquity(2451545.0)
// => ~23.439 degrees
```

---

## Atmospheric Refraction

### `refraction(apparentAlt: number, tempC?: number, pressureMb?: number): number`

Atmospheric refraction correction using Saemundsson's formula with pressure and temperature scaling. Returns 0 for objects below -1 degree altitude.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `apparentAlt` | `number` | | Apparent altitude in degrees. |
| `tempC` | `number` | `10` | Air temperature in degrees Celsius. |
| `pressureMb` | `number` | `1010` | Atmospheric pressure in millibars. |

**Returns:** `number` -- refraction correction in degrees (non-negative). Add to true altitude to get apparent, or subtract from apparent to get true.

```ts
// At the horizon, standard conditions
AstroMath.refraction(0)
// => ~0.57 degrees (~34 arcminutes)

// At 45 degrees altitude, mountain conditions
AstroMath.refraction(45, 5, 955)
// => ~0.016 degrees (~58 arcseconds)
```

---

## Proper Motion

### `applyProperMotion(eq: EquatorialCoord, pmRA: number, pmDec: number, fromEpoch: number, toEpoch: number): EquatorialCoord`

Apply proper motion to propagate star coordinates to a different epoch. Linear approximation accurate for time spans of a few hundred years.

| Parameter | Type | Description |
|---|---|---|
| `eq` | `EquatorialCoord` | `{ ra, dec }` at the source epoch, in degrees. |
| `pmRA` | `number` | Proper motion in RA in milliarcseconds/year (must include cos(dec) factor, as in Hipparcos/Gaia catalogs). |
| `pmDec` | `number` | Proper motion in Dec in milliarcseconds/year. |
| `fromEpoch` | `number` | Source epoch as a Julian year (e.g. `2000.0`). |
| `toEpoch` | `number` | Target epoch as a Julian year (e.g. `2025.0`). |

**Returns:** `EquatorialCoord` -- `{ ra, dec }` at the target epoch. RA is normalised to [0, 360); Dec is clamped to [-90, 90].

```ts
// Propagate Sirius from J2000.0 to J2025.0
// pmRA = -546.01 mas/yr, pmDec = -1223.14 mas/yr
const sirius = { ra: 101.287, dec: -16.716 }
AstroMath.applyProperMotion(sirius, -546.01, -1223.14, 2000.0, 2025.0)
// => { ra: ~101.283, dec: ~-16.724 }
```

---

## Rise / Transit / Set

### `riseTransitSet(eq: EquatorialCoord, obs: ObserverParams, h0?: number): RiseTransitSet`

Compute rise, transit (culmination), and set times for a celestial object on the given date. Based on Meeus Chapter 15. Assumes fixed RA/Dec over the day (adequate for stars; approximate for Sun/Moon).

| Parameter | Type | Default | Description |
|---|---|---|---|
| `eq` | `EquatorialCoord` | | `{ ra, dec }` in degrees (J2000). |
| `obs` | `ObserverParams` | | `{ lat, lng, date? }` -- observer location and date. |
| `h0` | `number` | `-0.5667` | Standard altitude in degrees defining rise/set. |

Common values for `h0`:
- **Stars:** `-0.5667` (default, accounts for atmospheric refraction)
- **Sun (upper limb):** `-0.8333`
- **Moon (upper limb):** `+0.125`

**Returns:** `RiseTransitSet` -- `{ rise, transit, set }` as `Date` objects. `rise` and `set` are `null` if the object is circumpolar or never rises.

```ts
// Sirius from London on 2024-01-15
const sirius = { ra: 101.287, dec: -16.716 }
const london = { lat: 51.5, lng: -0.1, date: new Date('2024-01-15T00:00:00Z') }
const rts = AstroMath.riseTransitSet(sirius, london)
// => { rise: Date(~17:08 UTC), transit: Date(~00:02 UTC), set: Date(~06:56 UTC) }

// Sun rise/set on the March equinox from Lucerne
const sunEquinox = { ra: 0, dec: 0 }
const lucerne = { lat: 47.05, lng: 8.31, date: new Date('2024-03-20T00:00:00Z') }
AstroMath.riseTransitSet(sunEquinox, lucerne, -0.8333)
// => { rise: Date(~05:30 UTC), transit: Date(~11:25 UTC), set: Date(~17:20 UTC) }
```

---

## Type Reference

The coordinate and result types used by AstroMath:

```ts
interface EquatorialCoord { ra: number; dec: number }
interface HorizontalCoord { alt: number; az: number }
interface EclipticCoord   { lon: number; lat: number }
interface GalacticCoord   { l: number; b: number }
interface ObserverParams  { lat: number; lng: number; date?: Date }
interface NutationResult  { dPsi: number; dEpsilon: number }
interface RiseTransitSet  { rise: Date | null; transit: Date; set: Date | null }
interface PlanetPosition  { lon: number; lat: number; r: number; M: number; nu: number }
type PlanetName = 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune'
```
