import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { AstroClock } from '../src/clock'

describe('AstroClock', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('defaults to current date and speed 1', () => {
      const before = Date.now()
      const clock = new AstroClock()
      const after = Date.now()
      expect(clock.date.valueOf()).toBeGreaterThanOrEqual(before)
      expect(clock.date.valueOf()).toBeLessThanOrEqual(after)
      expect(clock.speed).toBe(1)
      expect(clock.playing).toBe(false)
      clock.dispose()
    })

    it('accepts startDate and speed options', () => {
      const start = new Date('2024-06-21T12:00:00Z')
      const clock = new AstroClock({ startDate: start, speed: 60 })
      expect(clock.date.valueOf()).toBe(start.valueOf())
      expect(clock.speed).toBe(60)
      clock.dispose()
    })

    it('auto-plays when autoPlay is true', () => {
      const clock = new AstroClock({ autoPlay: true })
      expect(clock.playing).toBe(true)
      clock.dispose()
    })
  })

  describe('play / pause', () => {
    it('starts and stops playback', () => {
      const clock = new AstroClock()
      expect(clock.playing).toBe(false)

      clock.play()
      expect(clock.playing).toBe(true)

      clock.pause()
      expect(clock.playing).toBe(false)
      clock.dispose()
    })

    it('play is a no-op when already playing', () => {
      const handler = vi.fn()
      const clock = new AstroClock()
      clock.on('play', handler)
      clock.play()
      clock.play() // should not fire again
      expect(handler).toHaveBeenCalledTimes(1)
      clock.dispose()
    })

    it('emits play and pause events', () => {
      const playHandler = vi.fn()
      const pauseHandler = vi.fn()
      const clock = new AstroClock({ speed: 10 })
      clock.on('play', playHandler)
      clock.on('pause', pauseHandler)

      clock.play()
      expect(playHandler).toHaveBeenCalledWith(
        expect.objectContaining({ speed: 10 }),
      )

      clock.pause()
      expect(pauseHandler).toHaveBeenCalledWith(
        expect.objectContaining({ date: expect.any(Date) }),
      )
      clock.dispose()
    })
  })

  describe('tick', () => {
    it('emits tick events at the configured interval', () => {
      const handler = vi.fn()
      const clock = new AstroClock({ tickInterval: 500 })
      clock.on('tick', handler)

      clock.play()
      expect(handler).toHaveBeenCalledTimes(0)

      vi.advanceTimersByTime(500)
      expect(handler).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(500)
      expect(handler).toHaveBeenCalledTimes(2)

      clock.dispose()
    })

    it('advances date by elapsed * speed', () => {
      const start = new Date('2024-01-15T00:00:00Z')
      const clock = new AstroClock({ startDate: start, speed: 60, tickInterval: 1000 })

      clock.play()
      vi.advanceTimersByTime(1000) // 1 second wall time × 60 speed = 60 seconds sim time

      const elapsed = clock.date.valueOf() - start.valueOf()
      // Should be approximately 60 seconds (60000 ms) of simulation time
      expect(elapsed).toBeGreaterThanOrEqual(59000)
      expect(elapsed).toBeLessThanOrEqual(62000)

      clock.dispose()
    })

    it('stops ticking after pause', () => {
      const handler = vi.fn()
      const clock = new AstroClock({ tickInterval: 100 })
      clock.on('tick', handler)

      clock.play()
      vi.advanceTimersByTime(300)
      const countAfterPlay = handler.mock.calls.length

      clock.pause()
      vi.advanceTimersByTime(500)
      expect(handler.mock.calls.length).toBe(countAfterPlay)

      clock.dispose()
    })
  })

  describe('setDate', () => {
    it('sets the simulation date and emits datechange', () => {
      const handler = vi.fn()
      const clock = new AstroClock()
      clock.on('datechange', handler)

      const target = new Date('2025-12-25T00:00:00Z')
      clock.setDate(target)

      expect(clock.date.valueOf()).toBe(target.valueOf())
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'set' }),
      )
      clock.dispose()
    })

    it('emits a tick if playing', () => {
      const tickHandler = vi.fn()
      const clock = new AstroClock()
      clock.on('tick', tickHandler)

      clock.play()
      clock.setDate(new Date('2025-06-01'))
      expect(tickHandler).toHaveBeenCalled()

      clock.dispose()
    })
  })

  describe('setSpeed', () => {
    it('changes the speed and emits speedchange', () => {
      const handler = vi.fn()
      const clock = new AstroClock({ speed: 1 })
      clock.on('speedchange', handler)

      clock.setSpeed(3600)
      expect(clock.speed).toBe(3600)
      expect(handler).toHaveBeenCalledWith({ speed: 3600 })

      clock.dispose()
    })

    it('supports negative speed (reverse)', () => {
      const start = new Date('2024-06-21T12:00:00Z')
      const clock = new AstroClock({ startDate: start, speed: -60, tickInterval: 1000 })

      clock.play()
      vi.advanceTimersByTime(1000)

      // Date should have gone backward
      expect(clock.date.valueOf()).toBeLessThan(start.valueOf())

      clock.dispose()
    })

    it('supports zero speed (frozen)', () => {
      const start = new Date('2024-06-21T12:00:00Z')
      const clock = new AstroClock({ startDate: start, speed: 0, tickInterval: 100 })

      clock.play()
      vi.advanceTimersByTime(1000)

      expect(clock.date.valueOf()).toBe(start.valueOf())
      clock.dispose()
    })
  })

  describe('snapTo', () => {
    it('snaps to sunset and emits datechange with reason snap', () => {
      const handler = vi.fn()
      // Start in the morning
      const clock = new AstroClock({
        startDate: new Date('2024-06-21T06:00:00Z'),
      })
      clock.on('datechange', handler)

      const result = clock.snapTo('sunset', { lat: 47.05, lng: 8.31 })

      expect(result).not.toBeNull()
      if (result) {
        // Sunset on June 21 in Central Europe should be afternoon/evening UTC
        expect(result.getUTCHours()).toBeGreaterThanOrEqual(17)
        expect(result.getUTCHours()).toBeLessThanOrEqual(22)
      }
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'snap' }),
      )
      expect(clock.date.valueOf()).toBe(result!.valueOf())

      clock.dispose()
    })

    it('snaps to sunrise', () => {
      const clock = new AstroClock({
        startDate: new Date('2024-06-21T00:00:00Z'),
      })

      const result = clock.snapTo('sunrise', { lat: 47.05, lng: 8.31 })
      expect(result).not.toBeNull()
      if (result) {
        // Sunrise in Switzerland on Jun 21 should be around 3-5 UTC
        expect(result.getUTCHours()).toBeGreaterThanOrEqual(3)
        expect(result.getUTCHours()).toBeLessThanOrEqual(6)
      }

      clock.dispose()
    })

    it('snaps to moonrise', () => {
      const clock = new AstroClock({
        startDate: new Date('2024-01-15T00:00:00Z'),
      })

      const result = clock.snapTo('moonrise', { lat: 51.5, lng: -0.1 })
      // Moonrise may or may not occur, but should return a Date or null
      if (result) {
        expect(result).toBeInstanceOf(Date)
        expect(result.valueOf()).toBeGreaterThan(clock.date.valueOf() - 86_400_000)
      }

      clock.dispose()
    })

    it('snaps to solar-noon', () => {
      const clock = new AstroClock({
        startDate: new Date('2024-03-20T00:00:00Z'),
      })

      const result = clock.snapTo('solar-noon', { lat: 47.05, lng: 8.31 })
      expect(result).not.toBeNull()
      if (result) {
        // Solar noon near equinox, central Europe → ~11:30 UTC
        expect(result.getUTCHours()).toBeGreaterThanOrEqual(10)
        expect(result.getUTCHours()).toBeLessThanOrEqual(13)
      }

      clock.dispose()
    })
  })

  describe('on / off', () => {
    it('unsubscribes a handler', () => {
      const handler = vi.fn()
      const clock = new AstroClock({ tickInterval: 100 })
      clock.on('tick', handler)

      clock.play()
      vi.advanceTimersByTime(100)
      expect(handler).toHaveBeenCalledTimes(1)

      clock.off('tick', handler)
      vi.advanceTimersByTime(200)
      expect(handler).toHaveBeenCalledTimes(1) // no more calls

      clock.dispose()
    })
  })

  describe('dispose', () => {
    it('stops playback and clears listeners', () => {
      const handler = vi.fn()
      const clock = new AstroClock({ tickInterval: 100 })
      clock.on('tick', handler)
      clock.play()

      clock.dispose()
      expect(clock.playing).toBe(false)

      vi.advanceTimersByTime(500)
      expect(handler).toHaveBeenCalledTimes(0) // nothing after dispose
    })

    it('play is a no-op after dispose', () => {
      const clock = new AstroClock()
      clock.dispose()
      clock.play()
      expect(clock.playing).toBe(false)
    })
  })

  describe('date getter returns a copy', () => {
    it('modifying the returned date does not affect the clock', () => {
      const start = new Date('2024-01-01T00:00:00Z')
      const clock = new AstroClock({ startDate: start })

      const d = clock.date
      d.setFullYear(2099)

      expect(clock.date.getFullYear()).toBe(2024)
      clock.dispose()
    })
  })
})
