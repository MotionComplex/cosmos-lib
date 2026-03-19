import { describe, it, expect } from 'vitest'
import { CONSTANTS } from '../src/constants'

describe('CONSTANTS', () => {
  it('has the correct AU to km conversion', () => {
    expect(CONSTANTS.AU_TO_KM).toBeCloseTo(149_597_870.7, 0)
  })

  it('has the correct light-year to km conversion', () => {
    // 1 ly ≈ 9.461 × 10^12 km
    expect(CONSTANTS.LY_TO_KM).toBeGreaterThan(9.46e12)
    expect(CONSTANTS.LY_TO_KM).toBeLessThan(9.47e12)
  })

  it('has the correct parsec to light-year conversion', () => {
    expect(CONSTANTS.PC_TO_LY).toBeCloseTo(3.2616, 3)
  })

  it('J2000 epoch is correct Julian date', () => {
    expect(CONSTANTS.J2000).toBe(2_451_545.0)
  })

  it('DEG_TO_RAD and RAD_TO_DEG are reciprocals', () => {
    expect(CONSTANTS.DEG_TO_RAD * CONSTANTS.RAD_TO_DEG).toBeCloseTo(1, 10)
  })

  it('ECLIPTIC_OBL is approximately 23.44 degrees', () => {
    expect(CONSTANTS.ECLIPTIC_OBL).toBeCloseTo(23.439, 2)
  })
})
