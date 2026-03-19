import { CONSTANTS } from './constants.js'

export const Units = {
  // ── Distance ───────────────────────────────────────────────────────────────
  auToKm:    (au: number): number => au * CONSTANTS.AU_TO_KM,
  kmToAu:    (km: number): number => km / CONSTANTS.AU_TO_KM,
  lyToPc:    (ly: number): number => ly / CONSTANTS.PC_TO_LY,
  pcToLy:    (pc: number): number => pc * CONSTANTS.PC_TO_LY,
  pcToKm:    (pc: number): number => pc * CONSTANTS.PC_TO_KM,
  lyToKm:    (ly: number): number => ly * CONSTANTS.LY_TO_KM,
  kmToLy:    (km: number): number => km / CONSTANTS.LY_TO_KM,

  // ── Angular ────────────────────────────────────────────────────────────────
  degToRad:    (d: number): number => d * CONSTANTS.DEG_TO_RAD,
  radToDeg:    (r: number): number => r * CONSTANTS.RAD_TO_DEG,
  arcsecToDeg: (a: number): number => a / 3600,
  degToArcsec: (d: number): number => d * 3600,
  /** Right Ascension: hours → degrees */
  hrsToDeg:    (h: number): number => h * 15,
  /** Right Ascension: degrees → hours */
  degToHrs:    (d: number): number => d / 15,

  /**
   * Format a distance in km into a human-readable string,
   * automatically choosing the most appropriate unit.
   */
  formatDistance(km: number): string {
    const au = km / CONSTANTS.AU_TO_KM
    if (au < 0.01) return `${km.toFixed(0)} km`
    if (au < 1_000) return `${au.toPrecision(4)} AU`
    const ly = km / CONSTANTS.LY_TO_KM
    if (ly < 1_000_000) return `${ly.toPrecision(4)} ly`
    return `${(ly / 1_000_000).toPrecision(4)} Mly`
  },

  /**
   * Format decimal degrees as d°m′s″ (signed).
   * e.g. -16.716 → "-16°42′57.6″"
   */
  formatAngle(deg: number): string {
    const sign = deg < 0 ? '-' : ''
    const abs  = Math.abs(deg)
    const d    = Math.floor(abs)
    const m    = Math.floor((abs - d) * 60)
    const s    = ((abs - d) * 60 - m) * 60
    return `${sign}${d}°${m}′${s.toFixed(1)}″`
  },

  /**
   * Format Right Ascension in decimal degrees → HH h MM m SS.s s
   * e.g. 83.822 → "5h 35m 17.3s"
   */
  formatRA(deg: number): string {
    const total = ((deg % 360) + 360) % 360  // normalise to [0, 360)
    const h = Math.floor(total / 15)
    const m = Math.floor(((total / 15) - h) * 60)
    const s = (((total / 15) - h) * 60 - m) * 60
    return `${h}h ${m}m ${s.toFixed(1)}s`
  },
} as const
