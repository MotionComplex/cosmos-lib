import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useSkyPosition,
  useMoonPhase,
  useAstroClock,
  useWhatsUp,
  useTwilight,
} from '../src/react/index'

describe('React hooks', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  const london = { lat: 51.5, lng: -0.1 }
  const winterNight = { lat: 51.5, lng: -0.1, date: new Date('2024-01-15T22:00:00Z') }

  describe('useSkyPosition', () => {
    it('returns alt/az for a known star', () => {
      const { result } = renderHook(() => useSkyPosition('sirius', winterNight))
      expect(result.current).not.toBeNull()
      if (result.current) {
        expect(result.current.alt).toBeTypeOf('number')
        expect(result.current.az).toBeGreaterThanOrEqual(0)
        expect(result.current.az).toBeLessThan(360)
      }
    })

    it('returns null for unknown object', () => {
      const { result } = renderHook(() => useSkyPosition('nonexistent', london))
      expect(result.current).toBeNull()
    })

    it('returns position for a planet', () => {
      const { result } = renderHook(() => useSkyPosition('mars', winterNight))
      expect(result.current).not.toBeNull()
    })
  })

  describe('useMoonPhase', () => {
    it('returns phase data with all fields', () => {
      const { result } = renderHook(() => useMoonPhase())
      expect(result.current.phase).toBeGreaterThanOrEqual(0)
      expect(result.current.phase).toBeLessThanOrEqual(1)
      expect(result.current.illumination).toBeGreaterThanOrEqual(0)
      expect(result.current.illumination).toBeLessThanOrEqual(1)
      expect(result.current.name).toBeTypeOf('string')
      expect(result.current.age).toBeGreaterThanOrEqual(0)
    })

    it('accepts a fixed date', () => {
      const fullMoonDate = new Date('2024-03-25T07:00:00Z') // near full moon
      const { result } = renderHook(() => useMoonPhase(fullMoonDate))
      // Should be near full moon
      expect(result.current.illumination).toBeGreaterThan(0.9)
    })
  })

  describe('useAstroClock', () => {
    it('returns initial state', () => {
      const { result } = renderHook(() => useAstroClock({ speed: 60 }))
      expect(result.current.speed).toBe(60)
      expect(result.current.playing).toBe(false)
      expect(result.current.date).toBeInstanceOf(Date)
      result.current.clock.dispose()
    })

    it('play/pause toggle works', () => {
      const { result } = renderHook(() => useAstroClock())
      expect(result.current.playing).toBe(false)

      act(() => { result.current.play() })
      expect(result.current.playing).toBe(true)

      act(() => { result.current.pause() })
      expect(result.current.playing).toBe(false)

      result.current.clock.dispose()
    })

    it('setDate updates the date', () => {
      const { result } = renderHook(() => useAstroClock())
      const target = new Date('2025-06-21T00:00:00Z')

      act(() => { result.current.setDate(target) })
      expect(result.current.date.valueOf()).toBe(target.valueOf())

      result.current.clock.dispose()
    })

    it('setSpeed updates the speed', () => {
      const { result } = renderHook(() => useAstroClock({ speed: 1 }))

      act(() => { result.current.setSpeed(3600) })
      expect(result.current.speed).toBe(3600)

      result.current.clock.dispose()
    })

    it('autoPlay starts playing immediately', () => {
      const { result } = renderHook(() => useAstroClock({ autoPlay: true }))
      expect(result.current.playing).toBe(true)
      result.current.clock.dispose()
    })
  })

  describe('useWhatsUp', () => {
    it('returns visible objects', () => {
      const { result } = renderHook(() => useWhatsUp(winterNight, { magnitudeLimit: 2, limit: 5 }))
      expect(Array.isArray(result.current)).toBe(true)
      for (const v of result.current) {
        expect(v.object).toBeDefined()
        expect(v.alt).toBeGreaterThanOrEqual(0)
        expect(v.moonInterference).toBeGreaterThanOrEqual(0)
        expect(v.moonInterference).toBeLessThanOrEqual(1)
      }
    })

    it('respects limit', () => {
      const { result } = renderHook(() => useWhatsUp(winterNight, { limit: 3 }))
      expect(result.current.length).toBeLessThanOrEqual(3)
    })
  })

  describe('useTwilight', () => {
    it('returns twilight times', () => {
      const { result } = renderHook(() => useTwilight(london, new Date('2024-03-20')))
      expect(result.current.sunrise).toBeInstanceOf(Date)
      expect(result.current.sunset).toBeInstanceOf(Date)
      expect(result.current.solarNoon).toBeInstanceOf(Date)
    })

    it('sunrise is before sunset', () => {
      const { result } = renderHook(() => useTwilight(london, new Date('2024-06-21')))
      if (result.current.sunrise && result.current.sunset) {
        expect(result.current.sunrise.valueOf()).toBeLessThan(result.current.sunset.valueOf())
      }
    })
  })
})
