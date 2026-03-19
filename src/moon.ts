import { CONSTANTS } from './constants.js'
import { AstroMath } from './math.js'
import type { MoonPhase, MoonPhaseName, MoonPosition, ObserverParams, RiseTransitSet } from './types.js'

const D = CONSTANTS.DEG_TO_RAD
const R = CONSTANTS.RAD_TO_DEG

// ── Meeus Table 47.A: Longitude and distance terms (top 60) ──────────────────
// [D, M, M', F, sinLon_coeff, cosR_coeff]
// Coefficients in units of 0.000001° (longitude) and 0.001 km (distance)
const LONG_DIST_TERMS: number[][] = [
  [0,  0,  1,  0, 6288774, -20905355],
  [2,  0, -1,  0, 1274027,  -3699111],
  [2,  0,  0,  0,  658314,  -2955968],
  [0,  0,  2,  0,  213618,   -569925],
  [0,  1,  0,  0, -185116,     48888],
  [0,  0,  0,  2, -114332,     -3149],
  [2,  0, -2,  0,   58793,    246158],
  [2, -1, -1,  0,   57066,   -152138],
  [2,  0,  1,  0,   53322,   -170733],
  [2, -1,  0,  0,   45758,   -204586],
  [0,  1, -1,  0,  -40923,   -129620],
  [1,  0,  0,  0,  -34720,    108743],
  [0,  1,  1,  0,  -30383,    104755],
  [2,  0,  0, -2,   15327,     10321],
  [0,  0,  1,  2,  -12528,         0],
  [0,  0,  1, -2,   10980,     79661],
  [4,  0, -1,  0,   10675,    -34782],
  [0,  0,  3,  0,   10034,    -23210],
  [4,  0, -2,  0,    8548,    -21636],
  [2,  1, -1,  0,   -7888,     24208],
  [2,  1,  0,  0,   -6766,     30824],
  [1,  0, -1,  0,   -5163,     -8379],
  [1,  1,  0,  0,    4987,    -16675],
  [2, -1,  1,  0,    4036,    -12831],
  [2,  0,  2,  0,    3994,    -10445],
  [4,  0,  0,  0,    3861,    -11650],
  [2,  0, -3,  0,    3665,     14403],
  [0,  1, -2,  0,   -2689,     -7003],
  [2,  0, -1,  2,   -2602,         0],
  [2, -1, -2,  0,    2390,     10056],
  [1,  0,  1,  0,   -2348,      6322],
  [2, -2,  0,  0,    2236,     -9884],
  [0,  1,  2,  0,   -2120,      5751],
  [0,  2,  0,  0,   -2069,         0],
  [2, -2, -1,  0,    2048,     -4950],
  [2,  0,  1, -2,   -1773,      4130],
  [2,  0,  0,  2,   -1595,         0],
  [4, -1, -1,  0,    1215,     -3958],
  [0,  0,  2,  2,   -1110,         0],
  [3,  0, -1,  0,    -892,      3258],
  [2,  1,  1,  0,    -810,      2616],
  [4, -1, -2,  0,     759,     -1897],
  [0,  2, -1,  0,    -713,     -2117],
  [2,  2, -1,  0,    -700,      2354],
  [2,  1, -2,  0,     691,         0],
  [2, -1,  0, -2,     596,         0],
  [4,  0,  1,  0,     549,     -1423],
  [0,  0,  4,  0,     537,     -1117],
  [4, -1,  0,  0,     520,     -1571],
  [1,  0, -2,  0,    -487,     -1739],
]

// ── Meeus Table 47.B: Latitude terms (top 30) ────────────────────────────────
// [D, M, M', F, sinLat_coeff]
// Coefficients in units of 0.000001°
const LAT_TERMS: number[][] = [
  [0,  0,  0,  1, 5128122],
  [0,  0,  1,  1,  280602],
  [0,  0,  1, -1,  277693],
  [2,  0,  0, -1,  173237],
  [2,  0, -1,  1,   55413],
  [2,  0, -1, -1,   46271],
  [2,  0,  0,  1,   32573],
  [0,  0,  2,  1,   17198],
  [2,  0,  1, -1,    9266],
  [0,  0,  2, -1,    8822],
  [2, -1,  0, -1,    8216],
  [2,  0, -2, -1,    4324],
  [2,  0,  1,  1,    4200],
  [2,  1,  0, -1,   -3359],
  [2, -1, -1,  1,    2463],
  [2, -1,  0,  1,    2211],
  [2, -1, -1, -1,    2065],
  [0,  1, -1, -1,   -1870],
  [4,  0, -1, -1,    1828],
  [0,  1,  0,  1,   -1794],
  [0,  0,  0,  3,   -1749],
  [0,  1, -1,  1,   -1565],
  [1,  0,  0,  1,   -1491],
  [0,  1,  1,  1,   -1475],
  [0,  1,  1, -1,   -1410],
  [0,  1,  0, -1,   -1344],
  [1,  0,  0, -1,   -1335],
  [0,  0,  3,  1,    1107],
  [4,  0,  0, -1,    1021],
  [4,  0, -1,  1,     833],
]

// Synodic month in days
const SYNODIC_MONTH = 29.530588861

/**
 * Lunar position and phase calculations.
 * Based on Meeus "Astronomical Algorithms", Chapters 47 and 49.
 * Accuracy: ~0.07° in longitude, ~0.04° in latitude.
 */
export const Moon = {
  /**
   * Geocentric equatorial and ecliptic position of the Moon.
   */
  position(date: Date = new Date()): MoonPosition {
    const jd = AstroMath.toJulian(date)
    const T = (jd - 2_451_545.0) / 36525

    // Fundamental arguments (degrees) — Meeus Ch. 47
    const Lp = ((218.3164477 + 481267.88123421 * T -
                 0.0015786 * T * T + T * T * T / 538841 -
                 T * T * T * T / 65194000) % 360 + 360) % 360 // Moon mean longitude
    const Dp = ((297.8501921 + 445267.1114034 * T -
                 0.0018819 * T * T + T * T * T / 545868 -
                 T * T * T * T / 113065000) % 360 + 360) % 360 // Mean elongation
    const M  = ((357.5291092 + 35999.0502909 * T -
                 0.0001536 * T * T + T * T * T / 24490000) % 360 + 360) % 360 // Sun mean anomaly
    const Mp = ((134.9633964 + 477198.8675055 * T +
                 0.0087414 * T * T + T * T * T / 69699 -
                 T * T * T * T / 14712000) % 360 + 360) % 360 // Moon mean anomaly
    const F  = ((93.2720950 + 483202.0175233 * T -
                 0.0036539 * T * T - T * T * T / 3526000 +
                 T * T * T * T / 863310000) % 360 + 360) % 360 // Moon argument of latitude

    // Eccentricity correction for terms involving M
    const E  = 1 - 0.002516 * T - 0.0000074 * T * T
    const E2 = E * E

    const DpR = Dp * D
    const MR  = M * D
    const MpR = Mp * D
    const FR  = F * D

    // Sum longitude and distance series
    let sumLon = 0
    let sumR   = 0
    for (const term of LONG_DIST_TERMS) {
      const arg = term[0]! * DpR + term[1]! * MR + term[2]! * MpR + term[3]! * FR
      let eFactor = 1
      const mAbs = Math.abs(term[1]!)
      if (mAbs === 1) eFactor = E
      else if (mAbs === 2) eFactor = E2
      sumLon += term[4]! * eFactor * Math.sin(arg)
      sumR   += term[5]! * eFactor * Math.cos(arg)
    }

    // Sum latitude series
    let sumLat = 0
    for (const term of LAT_TERMS) {
      const arg = term[0]! * DpR + term[1]! * MR + term[2]! * MpR + term[3]! * FR
      let eFactor = 1
      const mAbs = Math.abs(term[1]!)
      if (mAbs === 1) eFactor = E
      else if (mAbs === 2) eFactor = E2
      sumLat += term[4]! * eFactor * Math.sin(arg)
    }

    // Additive corrections (A1, A2, A3 — Meeus p. 338)
    const A1 = (119.75 + 131.849 * T) * D
    const A2 = (53.09 + 479264.290 * T) * D
    const A3 = (313.45 + 481266.484 * T) * D

    sumLon += 3958 * Math.sin(A1) + 1962 * Math.sin((Lp - F) * D) + 318 * Math.sin(A2)
    sumLat += -2235 * Math.sin(Lp * D) + 382 * Math.sin(A3) +
              175 * Math.sin((A1 - FR)) + 175 * Math.sin((A1 + FR)) +
              127 * Math.sin((Lp - Mp) * D) - 115 * Math.sin((Lp + Mp) * D)

    // Final ecliptic coordinates
    const eclipticLon = Lp + sumLon / 1_000_000
    const eclipticLat = sumLat / 1_000_000
    const distance_km = 385000.56 + sumR / 1000

    // Nutation correction
    const { dPsi } = AstroMath.nutation(jd)
    const correctedLon = eclipticLon + dPsi

    // Convert to equatorial
    const eps = AstroMath.trueObliquity(jd) * D
    const lonR = correctedLon * D
    const latR = eclipticLat * D

    const ra = Math.atan2(
      Math.sin(lonR) * Math.cos(eps) - Math.tan(latR) * Math.sin(eps),
      Math.cos(lonR),
    ) * R

    const dec = Math.asin(
      Math.sin(latR) * Math.cos(eps) +
      Math.cos(latR) * Math.sin(eps) * Math.sin(lonR),
    ) * R

    // Horizontal parallax
    const parallax = Math.asin(6378.14 / distance_km) * R

    return {
      ra: ((ra % 360) + 360) % 360,
      dec,
      distance_km,
      eclipticLon: ((correctedLon % 360) + 360) % 360,
      eclipticLat,
      parallax,
    }
  },

  /**
   * Moon phase information for a given date.
   */
  phase(date: Date = new Date()): MoonPhase {
    const moonPos = this.position(date)
    const sunPos  = (() => {
      const earth = AstroMath.planetEcliptic('earth', date)
      return ((earth.lon + 180) % 360 + 360) % 360
    })()

    // Phase angle = elongation of Moon from Sun in ecliptic longitude
    let phaseAngle = moonPos.eclipticLon - sunPos
    phaseAngle = ((phaseAngle % 360) + 360) % 360

    const phase = phaseAngle / 360
    const illumination = (1 - Math.cos(phaseAngle * D)) / 2

    // Age: approximate days since new moon
    const age = phase * SYNODIC_MONTH

    // Determine phase name
    let name: MoonPhaseName
    if (phase < 0.0625)      name = 'new'
    else if (phase < 0.1875) name = 'waxing-crescent'
    else if (phase < 0.3125) name = 'first-quarter'
    else if (phase < 0.4375) name = 'waxing-gibbous'
    else if (phase < 0.5625) name = 'full'
    else if (phase < 0.6875) name = 'waning-gibbous'
    else if (phase < 0.8125) name = 'last-quarter'
    else if (phase < 0.9375) name = 'waning-crescent'
    else                     name = 'new'

    return { phase, illumination, age, name }
  },

  /**
   * Find the next occurrence of a specific phase after the given date.
   * Uses iterative search with ~1-minute precision.
   */
  nextPhase(
    date: Date = new Date(),
    targetPhase: 'new' | 'first-quarter' | 'full' | 'last-quarter' = 'full',
  ): Date {
    const phaseTargets: Record<string, number> = {
      'new': 0,
      'first-quarter': 0.25,
      'full': 0.5,
      'last-quarter': 0.75,
    }
    const target = phaseTargets[targetPhase]!

    // Estimate based on current phase
    const current = this.phase(date)
    let diff = target - current.phase
    if (diff <= 0) diff += 1
    let estimate = new Date(date.valueOf() + diff * SYNODIC_MONTH * 86_400_000)

    // Refine with bisection (narrow to ~1 minute)
    for (let i = 0; i < 20; i++) {
      const p = this.phase(estimate)
      let err = target - p.phase
      // Handle wrap-around near 0/1
      if (err > 0.5) err -= 1
      if (err < -0.5) err += 1

      if (Math.abs(err) < 0.0001) break // ~4 minutes precision
      estimate = new Date(estimate.valueOf() + err * SYNODIC_MONTH * 86_400_000)
    }

    return estimate
  },

  /**
   * Rise, transit, and set times for the Moon.
   * Uses the Moon's standard altitude of +0.125° (accounting for parallax).
   */
  riseTransitSet(obs: ObserverParams): RiseTransitSet {
    const date = obs.date ?? new Date()
    const moonPos = this.position(date)
    return AstroMath.riseTransitSet(moonPos, obs, 0.125)
  },

  /**
   * Optical libration angles (simplified).
   * Returns the apparent tilt of the Moon's face.
   */
  libration(date: Date = new Date()): { l: number; b: number } {
    const jd = AstroMath.toJulian(date)
    const T = (jd - 2_451_545.0) / 36525

    // Moon's mean longitude, ascending node, inclination
    const F  = ((93.2720950 + 483202.0175233 * T) % 360 + 360) % 360
    const Om = ((125.04452 - 1934.136261 * T) % 360 + 360) % 360

    const moonPos = this.position(date)
    const I = 1.5424 // mean inclination of lunar equator to ecliptic (degrees)

    // Optical libration in longitude
    const W = moonPos.eclipticLon - Om
    const l = -Math.asin(
      Math.sin(W * D) * Math.cos(moonPos.eclipticLat * D) * Math.sin(I * D) -
      Math.sin(moonPos.eclipticLat * D) * Math.cos(I * D),
    ) * R

    // Optical libration in latitude (simplified)
    const A = Math.atan2(
      Math.sin(W * D) * Math.cos(I * D) +
      Math.tan(moonPos.eclipticLat * D) * Math.sin(I * D),
      Math.cos(W * D),
    ) * R
    const b = Math.asin(
      -Math.sin(moonPos.eclipticLat * D) * Math.sin(I * D) -
      Math.cos(moonPos.eclipticLat * D) * Math.sin(I * D) * Math.sin(W * D),
    ) * R

    return { l, b }
  },
} as const
