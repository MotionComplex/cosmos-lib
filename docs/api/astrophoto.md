# Astrophotography & Equipment API

Two modules for astrophotography planning: `Equipment` (camera/telescope/lens/tracker database, unified search, and rig builder) and `AstroPhoto` (session planning, exposure calculators, Milky Way tracker, polar alignment, and imaging utilities).

```ts
import { Equipment, AstroPhoto } from '@motioncomplex/cosmos-lib'
```

---

## Equipment Database

Browse ~160 items across four categories:

```ts
Equipment.cameras()     // ~49 cameras (DSLR, mirrorless, dedicated astro: Canon, Nikon, Sony, ZWO, QHY, Fuji, Pentax, OM System, Player One, Altair)
Equipment.telescopes()  // ~45 telescopes (refractors, reflectors, SCTs, Maksutovs, RCs: Sky-Watcher, Celestron, Takahashi, William Optics, Askar, Bresser, SVBony)
Equipment.lenses()      // ~46 lenses (ultra-wide to telephoto: Sigma, Canon, Nikon, Sony, Rokinon, Samyang, Tamron, Laowa, Tokina, Olympus)
Equipment.trackers()    // ~20 trackers/mounts (star trackers, EQ mounts, GoTo: iOptron, Sky-Watcher, ZWO, Celestron, Rainbow Astro)
```

### Lookup by name

All lookups are case-insensitive with partial matching:

```ts
Equipment.camera('Sony A7 III')              // exact match
Equipment.telescope('C8')                    // partial → Celestron C8
Equipment.lens('135mm f/2')                  // partial match
Equipment.tracker('Star Adventurer')         // partial → Sky-Watcher Star Adventurer GTi
```

### Unified search

Search across all categories with relevance scoring:

```ts
const results = Equipment.search('ZWO')
// => [{ category: 'camera', name: 'ZWO ASI2600MC Pro', item: Camera },
//     { category: 'tracker', name: 'ZWO AM5', item: Tracker }, ...]

Equipment.search('200mm')    // cameras, telescopes, AND lenses matching "200mm"
Equipment.search('Sky-Watcher')  // all Sky-Watcher gear across all categories
```

Returns `{ category, name, item }` objects sorted by relevance.

---

## Rig Builder

Combine a camera + optics (telescope or lens) + optional tracker into a rig:

```ts
// Camera + telescope
const rig = Equipment.rig({
  camera: 'ZWO ASI2600MC Pro',
  telescope: 'Sky-Watcher Esprit 100ED',
  tracker: 'iOptron SkyGuider Pro',
})

// Camera + lens (for wide-field)
const rig2 = Equipment.rig({
  camera: 'Sony A7 III',
  lens: 'Sigma 14mm f/1.8 DG HSM Art',
  tracker: 'Sky-Watcher Star Adventurer GTi',
})

// With focal reducer
Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8', barlow: 0.63 })

// Custom specs (no database lookup)
Equipment.rig({ camera: 'Sony A7 III', focalLength: 500, aperture: 100 })
```

### Rig calculations

```ts
rig.fov()              // { width: 2.45°, height: 1.63°, diagonal: 2.94° }
rig.pixelScale()       // 1.41 arcsec/px
rig.maxExposure()      // tracked: 120s, untracked: NPF rule
rig.framing('m42')     // { fillPercent: 55, fits: true, panels: 1, orientation: 'landscape' }
rig.samplingAdvice()   // { status: 'optimal', advice: '...' }
rig.resolution()       // { pixelScale, dawesLimit, raleighLimit }
rig.isTracked          // true if a tracker is attached
rig.payloadCheck()     // { withinLimits: true, estimatedPayloadKg: 3.2, maxPayloadKg: 5.0, headroomPercent: 36 }
```

### Max exposure (tracked vs untracked)

With a tracker, `maxExposure()` scales the tracker's reference exposure by focal length ratio. Without, it uses the NPF rule:

```ts
const untracked = Equipment.rig({ camera: 'Sony A7 III', lens: 'Sigma 14mm f/1.8' })
untracked.maxExposure() // 21.5s (NPF rule)

const tracked = Equipment.rig({ camera: 'Sony A7 III', lens: 'Sigma 14mm f/1.8', tracker: 'Star Adventurer GTi' })
tracked.maxExposure()   // 1714s (tracker reference scaled by focal length)
```

### Payload check

Estimates whether your tracker can handle the camera + optics weight:

```ts
const pc = rig.payloadCheck()
if (!pc.withinLimits) {
  console.log(`Overloaded! ${pc.estimatedPayloadKg}kg exceeds ${pc.maxPayloadKg}kg limit`)
}
```

### Framing analysis

```ts
const frame = rig.framing('m31')
// { fillPercent: 340, fits: false, panels: 4, orientation: 'landscape', objectSize: 178, fovWidth: 147 }

const frame2 = rig.framing('m57')
// { fillPercent: 2, fits: true, panels: 1, orientation: 'either', objectSize: 1.4, fovWidth: 147 }
```

### Best targets for your rig

Objects visible tonight that frame well (10–150% fill) in your FOV:

```ts
const targets = rig.bestTargets({ lat: 47, lng: 8, date: new Date() })
targets.forEach(t => console.log(t.object.name, `${t.framing.fillPercent}% fill`, `alt: ${t.alt.toFixed(0)}°`))
```

---

## Session Planner

Generate a scored imaging plan for a night. Targets are sorted by **set-time-first** strategy (shoot western targets before they set):

```ts
const plan = AstroPhoto.sessionPlan(
  { lat: 47, lng: 8, date: new Date('2024-08-15') },
  ['m31', 'm27', 'm57', 'ngc7000'],
  { minAltitude: 25, maxAirmass: 2.0, minMoonSeparation: 30 }
)

plan.forEach(t => {
  console.log(`#${i+1} ${t.name}: ${t.start.toLocaleTimeString()} → ${t.end.toLocaleTimeString()}`)
  console.log(`  Peak: ${t.peakAltitude}° | Airmass: ${t.airmassRange} | Moon: ${t.moonSeparation}° | Score: ${t.score}/100`)
})
```

### Score breakdown

| Factor | Weight | Best case |
|--------|--------|-----------|
| Peak altitude | 40% | Target near zenith |
| Minimum airmass | 30% | Close to 1.0 |
| Moon interference | 30% | Far from Moon, low illumination |

### Imaging window (single target)

```ts
const w = AstroPhoto.imagingWindow('m42', observer, 2.0) // maxAirmass = 2.0
// { start, end, transit, peakAltitude, hours: 5.3 }
```

---

## Exposure Calculators

```ts
// NPF rule — most accurate untracked max
AstroPhoto.maxExposure({ focalLength: 200, aperture: 71, pixelSize: 5.93 })           // 14.2s
AstroPhoto.maxExposure({ focalLength: 200, pixelSize: 5.93, declination: 80 })         // longer near pole

// Rule of 500 — quick estimate
AstroPhoto.ruleOf500(200)                  // 2.5s
AstroPhoto.ruleOf500(200, 1.5)             // 1.7s (APS-C crop factor)

// Optimal sub-exposure — sky-noise dominates read-noise
AstroPhoto.subExposure({ readNoise: 3.5, skyBrightness: 0.5 })    // 220s

// Total integration for target SNR
AstroPhoto.totalIntegration({ subLength: 300, subSNR: 5, targetSNR: 50 })
// { subs: 100, hours: 8.3 }
```

---

## Milky Way Tracker

```ts
const mw = AstroPhoto.milkyWay({ lat: 47, lng: 8, date: new Date('2024-07-15T23:00:00Z') })
console.log(mw.altitude, mw.azimuth)    // current position of galactic center
console.log(mw.aboveHorizon)             // true/false
console.log(mw.rise, mw.transit, mw.set) // rise/transit/set times

// Which months is the core visible at night?
AstroPhoto.milkyWaySeason({ lat: 47, lng: 8 }) // [3, 4, 5, 6, 7, 8, 9, 10]
```

---

## Polar Alignment

```ts
const pa = AstroPhoto.polarAlignment({ lat: 47, lng: 8, date: new Date() })
pa.polarisOffset     // 0.659° from true NCP
pa.positionAngle     // current PA for polar scope reticle
pa.polarisAltitude   // ~47° (matches observer latitude)
pa.hemisphere        // 'north' or 'south'
```

Southern hemisphere returns Sigma Octantis data instead of Polaris.

---

## Utilities

```ts
// Golden hour (sun +6° to -4°)
AstroPhoto.goldenHour(observer)   // { morning: { start, end }, evening: { start, end } }

// Blue hour (sun -4° to -6°)
AstroPhoto.blueHour(observer)     // { morning, evening }

// Optimal flat frame window (sun -2° to -6°)
AstroPhoto.flatFrameWindow(observer)

// Brightest star near zenith (for collimation/focusing)
AstroPhoto.collimationStar(observer) // { name: 'Vega', altitude: 82, azimuth: 15 }

// Light pollution conversions
AstroPhoto.bortleClass(21.5)   // 3 (rural sky)
AstroPhoto.bortleClass(19.0)   // 6 (suburban)
AstroPhoto.sqmToNELM(21.5)    // 6.2 (naked-eye limiting magnitude)
```

| Bortle | SQM (mag/arcsec²) | Description |
|--------|-------------------|-------------|
| 1 | ≥22.0 | Pristine dark site |
| 3 | ≥21.7 | Rural sky |
| 5 | ≥19.5 | Suburban |
| 7 | ≥18.4 | Urban/suburban transition |
| 9 | <17.8 | City center |

---

## Tracker database reference

| Type | Examples | Key features |
|------|----------|-------------|
| **Star tracker** | iOptron SkyGuider Pro, Star Adventurer GTi, Move Shoot Move | Lightweight (3–5 kg payload), portable, some with autoguide |
| **EQ mount** | HEQ5, EQ6-R, ZWO AM5, iOptron CEM26 | Medium payload (9–25 kg), GoTo, autoguide, longer exposures |
| **Premium mount** | CEM70, EQ8-R, Rainbow RST-135 | Heavy payload (13–50 kg), low PE, precision tracking |

Each tracker includes: `maxPayloadKg`, `periodicError` (arcsec), `autoguide` support, `goto` support, and practical `maxUnguidedExposure` at a reference focal length.
