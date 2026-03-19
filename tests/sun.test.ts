import { describe, it, expect } from 'vitest'
import { Sun } from '../src/sun'
import { AstroMath } from '../src/math'

const J2000_DATE = new Date('2000-01-01T12:00:00Z')

describe('Sun', () => {
  describe('position', () => {
    it('returns valid equatorial coordinates', () => {
      const pos = Sun.position(J2000_DATE)
      expect(pos.ra).toBeGreaterThanOrEqual(0)
      expect(pos.ra).toBeLessThan(360)
      expect(pos.dec).toBeGreaterThanOrEqual(-90)
      expect(pos.dec).toBeLessThanOrEqual(90)
    })

    it('distance is approximately 1 AU', () => {
      const pos = Sun.position(J2000_DATE)
      expect(pos.distance_AU).toBeCloseTo(1.0, 1)
    })

    it('ecliptic longitude at J2000 is near 280° (winter)', () => {
      // Jan 1 is in Sagittarius/Capricorn region
      const pos = Sun.position(J2000_DATE)
      expect(pos.eclipticLon).toBeGreaterThan(270)
      expect(pos.eclipticLon).toBeLessThan(290)
    })

    it('summer solstice (June 21) has ecliptic lon near 90°', () => {
      const summer = new Date('2024-06-21T12:00:00Z')
      const pos = Sun.position(summer)
      expect(pos.eclipticLon).toBeCloseTo(90, -1) // within ~10°
    })

    it('declination is positive in northern summer', () => {
      const summer = new Date('2024-06-21T12:00:00Z')
      const pos = Sun.position(summer)
      expect(pos.dec).toBeGreaterThan(20)
      expect(pos.dec).toBeLessThan(24)
    })

    it('declination is negative in northern winter', () => {
      const winter = new Date('2024-12-21T12:00:00Z')
      const pos = Sun.position(winter)
      expect(pos.dec).toBeLessThan(-20)
      expect(pos.dec).toBeGreaterThan(-24)
    })
  })

  describe('equationOfTime', () => {
    it('returns a value in reasonable range (-17 to +17 minutes)', () => {
      const eot = Sun.equationOfTime(J2000_DATE)
      expect(eot).toBeGreaterThan(-17)
      expect(eot).toBeLessThan(17)
    })
  })

  describe('solarNoon', () => {
    it('returns a Date', () => {
      const noon = Sun.solarNoon({ lat: 51.5, lng: 0, date: new Date('2024-06-15T12:00:00Z') })
      expect(noon).toBeInstanceOf(Date)
    })

    it('noon at Greenwich is near 12:00 UTC', () => {
      const noon = Sun.solarNoon({ lat: 51.5, lng: 0, date: new Date('2024-06-15T12:00:00Z') })
      const hours = noon.getUTCHours() + noon.getUTCMinutes() / 60
      expect(hours).toBeCloseTo(12, 0) // within ~30 min
    })
  })

  describe('twilight', () => {
    it('returns all twilight times for a mid-latitude observer', () => {
      const tw = Sun.twilight({
        lat: 51.5,
        lng: -0.1278,
        date: new Date('2024-06-15T12:00:00Z'),
      })
      expect(tw.sunrise).toBeInstanceOf(Date)
      expect(tw.sunset).toBeInstanceOf(Date)
      expect(tw.solarNoon).toBeInstanceOf(Date)
      expect(tw.civilDawn).toBeInstanceOf(Date)
      expect(tw.civilDusk).toBeInstanceOf(Date)
      expect(tw.nauticalDawn).toBeInstanceOf(Date)
      expect(tw.nauticalDusk).toBeInstanceOf(Date)
    })

    it('sunrise is before solar noon which is before sunset', () => {
      const tw = Sun.twilight({
        lat: 40.7128,
        lng: -74.006,
        date: new Date('2024-03-20T12:00:00Z'),
      })
      expect(tw.sunrise!.valueOf()).toBeLessThan(tw.solarNoon.valueOf())
      expect(tw.solarNoon.valueOf()).toBeLessThan(tw.sunset!.valueOf())
    })

    it('civil dawn is before sunrise', () => {
      const tw = Sun.twilight({
        lat: 40.7128,
        lng: -74.006,
        date: new Date('2024-03-20T12:00:00Z'),
      })
      expect(tw.civilDawn!.valueOf()).toBeLessThan(tw.sunrise!.valueOf())
    })
  })
})
