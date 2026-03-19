export const CONSTANTS = {
  AU_TO_KM:        149_597_870.7,
  LY_TO_KM:        9_460_730_472_580.8,
  PC_TO_LY:        3.261_563_777,
  PC_TO_KM:        3.085_677_581e13,
  C_KM_S:          299_792.458,
  G:               6.674e-11,
  SOLAR_MASS_KG:   1.989e30,
  SOLAR_RADIUS_KM: 695_700,
  EARTH_MASS_KG:   5.972e24,
  EARTH_RADIUS_KM: 6_371,
  /** Julian date of the J2000.0 epoch */
  J2000:           2_451_545.0,
  /** Obliquity of the ecliptic at J2000.0 (degrees) */
  ECLIPTIC_OBL:    23.439_291_1,
  DEG_TO_RAD:      Math.PI / 180,
  RAD_TO_DEG:      180 / Math.PI,
} as const

export type Constants = typeof CONSTANTS
