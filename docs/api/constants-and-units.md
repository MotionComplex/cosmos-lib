# Constants & Units

Fundamental astronomical constants and unit-conversion utilities.

```ts
import { CONSTANTS, Units } from '@motioncomplex/cosmos-lib'
```

---

## CONSTANTS

All values follow IAU 2012 / IERS conventions unless otherwise noted. The object is typed `as const` so every value is a literal type.

| Constant | Value | Description |
|---|---|---|
| `AU_TO_KM` | `149_597_870.7` | One Astronomical Unit in kilometres (IAU 2012 exact). |
| `LY_TO_KM` | `9_460_730_472_580.8` | One light-year in kilometres. |
| `PC_TO_LY` | `3.261_563_777` | One parsec in light-years. |
| `PC_TO_KM` | `3.085_677_581e13` | One parsec in kilometres. |
| `C_KM_S` | `299_792.458` | Speed of light in km/s (exact, SI definition). |
| `G` | `6.674e-11` | Newtonian gravitational constant in m^3 kg^-1 s^-2 (CODATA 2018). |
| `SOLAR_MASS_KG` | `1.989e30` | Solar mass in kilograms. |
| `SOLAR_RADIUS_KM` | `695_700` | Solar radius in kilometres. |
| `EARTH_MASS_KG` | `5.972e24` | Earth mass in kilograms. |
| `EARTH_RADIUS_KM` | `6_371` | Mean Earth radius in kilometres (IUGG). |
| `J2000` | `2_451_545.0` | Julian Date of the J2000.0 epoch (2000-01-01T12:00:00 TT). |
| `ECLIPTIC_OBL` | `23.439_291_1` | Mean obliquity of the ecliptic at J2000.0, in degrees. |
| `DEG_TO_RAD` | `Math.PI / 180` | Conversion factor: degrees to radians (~0.01745329). |
| `RAD_TO_DEG` | `180 / Math.PI` | Conversion factor: radians to degrees (~57.29577951). |

### Example

```ts
import { CONSTANTS } from '@motioncomplex/cosmos-lib'

// Distance from Earth to Sun in km
const earthSunKm = 1 * CONSTANTS.AU_TO_KM // 149597870.7

// Convert 23.44 degrees to radians
const oblRad = CONSTANTS.ECLIPTIC_OBL * CONSTANTS.DEG_TO_RAD

// Gravitational parameter of the Sun
const mu = CONSTANTS.G * CONSTANTS.SOLAR_MASS_KG
```

---

## Units

A collection of pure-function converters and formatters. All functions are synchronous and side-effect free.

### Distance Conversions

| Function | Signature | Description |
|---|---|---|
| `auToKm` | `(au: number) => number` | Astronomical Units to kilometres. |
| `kmToAu` | `(km: number) => number` | Kilometres to Astronomical Units. |
| `lyToPc` | `(ly: number) => number` | Light-years to parsecs. |
| `pcToLy` | `(pc: number) => number` | Parsecs to light-years. |
| `pcToKm` | `(pc: number) => number` | Parsecs to kilometres. |
| `lyToKm` | `(ly: number) => number` | Light-years to kilometres. |
| `kmToLy` | `(km: number) => number` | Kilometres to light-years. |

#### Example

```ts
import { Units } from '@motioncomplex/cosmos-lib'

Units.auToKm(1)       // 149597870.7
Units.kmToAu(149_597_870.7) // 1

Units.pcToLy(1)        // 3.261563777
Units.lyToPc(3.26)     // ~0.9995

Units.lyToKm(4.37)     // ~41,343,392,165,177.9 (Alpha Centauri)
Units.kmToLy(9.461e12) // ~1.0
```

### Angular Conversions

| Function | Signature | Description |
|---|---|---|
| `degToRad` | `(d: number) => number` | Degrees to radians. |
| `radToDeg` | `(r: number) => number` | Radians to degrees. |
| `arcsecToDeg` | `(a: number) => number` | Arcseconds to degrees (divides by 3600). |
| `degToArcsec` | `(d: number) => number` | Degrees to arcseconds (multiplies by 3600). |
| `hrsToDeg` | `(h: number) => number` | Right Ascension hours to degrees (multiplies by 15). |
| `degToHrs` | `(d: number) => number` | Degrees to Right Ascension hours (divides by 15). |

#### Example

```ts
import { Units } from '@motioncomplex/cosmos-lib'

Units.degToRad(180)      // Math.PI
Units.radToDeg(Math.PI)  // 180

Units.arcsecToDeg(3600)  // 1.0
Units.degToArcsec(0.5)   // 1800

Units.hrsToDeg(6)        // 90
Units.degToHrs(90)       // 6
```

### Formatters

#### `formatDistance(km: number): string`

Formats a distance in kilometres into a human-readable string, automatically choosing the best unit (km, AU, ly, or Mly).

| Input range | Output unit |
|---|---|
| < 0.01 AU | `km` (integer) |
| 0.01 -- 1000 AU | `AU` (4 significant figures) |
| 1000 AU -- 1,000,000 ly | `ly` (4 significant figures) |
| > 1,000,000 ly | `Mly` (4 significant figures) |

```ts
Units.formatDistance(384_400)                    // '0.002570 AU'
Units.formatDistance(9_460_730_472_580.8 * 8.6)  // '8.600 ly'
Units.formatDistance(100)                        // '100 km'
```

#### `formatAngle(deg: number): string`

Formats decimal degrees as a degrees/arcminutes/arcseconds string (`d'm's"`).

```ts
Units.formatAngle(-16.716)  // '-16°42′57.6″'
Units.formatAngle(83.822)   // '83°49′19.2″'
```

#### `formatRA(deg: number): string`

Formats Right Ascension from decimal degrees into hours/minutes/seconds notation. The input is normalised to [0, 360).

```ts
Units.formatRA(83.822)  // '5h 35m 17.3s'
Units.formatRA(0)       // '0h 0m 0.0s'
Units.formatRA(359.99)  // '23h 59m 57.6s'
```
