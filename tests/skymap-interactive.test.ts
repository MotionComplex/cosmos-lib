import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { InteractiveSkyMap, createInteractiveSkyMap } from '../src/skymap-interactive'
import type { CelestialObject, InteractiveSkyMapOptions } from '../src/types'

// ── Canvas stub (matches pattern from skymap.test.ts) ───────────────────────

function makeCanvas(w = 800, h = 400) {
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    font: '',
    textAlign: 'left',
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
    fillText: vi.fn(),
    setLineDash: vi.fn(),
    createRadialGradient: () => ({
      addColorStop: vi.fn(),
    }),
  }

  const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>()

  const canvas = {
    width: w,
    height: h,
    clientWidth: w,
    clientHeight: h,
    style: { touchAction: '' },
    getContext: (_: string) => ctx,
    getBoundingClientRect: () => ({
      left: 0,
      top: 0,
      width: w,
      height: h,
      right: w,
      bottom: h,
      x: 0,
      y: 0,
      toJSON: () => {},
    }),
    addEventListener: vi.fn((type: string, handler: EventListenerOrEventListenerObject, opts?: any) => {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type)!.add(handler)
      // Support AbortController cleanup
      if (opts?.signal) {
        opts.signal.addEventListener('abort', () => {
          listeners.get(type)?.delete(handler)
        })
      }
    }),
    removeEventListener: vi.fn((type: string, handler: EventListenerOrEventListenerObject) => {
      listeners.get(type)?.delete(handler)
    }),
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    dispatchEvent: (e: Event) => {
      const handlers = listeners.get(e.type)
      if (handlers) {
        for (const h of handlers) {
          if (typeof h === 'function') h(e)
          else h.handleEvent(e)
        }
      }
      return true
    },
  }

  return canvas as unknown as HTMLCanvasElement
}

// ── Test objects ─────────────────────────────────────────────────────────────

const SIRIUS: CelestialObject = {
  id: 'sirius',
  name: 'Sirius',
  aliases: ['Alpha Canis Majoris'],
  type: 'star',
  ra: 101.287,
  dec: -16.716,
  magnitude: -1.46,
  description: 'Brightest star in the night sky',
  tags: ['bright'],
  spectral: 'A1V',
} as CelestialObject

const BETELGEUSE: CelestialObject = {
  id: 'betelgeuse',
  name: 'Betelgeuse',
  aliases: ['Alpha Orionis'],
  type: 'star',
  ra: 88.793,
  dec: 7.407,
  magnitude: 0.42,
  description: 'Red supergiant in Orion',
  tags: ['bright'],
  spectral: 'M1',
} as CelestialObject

const TEST_OBJECTS = [SIRIUS, BETELGEUSE]

// ── Tests ───────────────────────────────────────────────────────────────────

describe('InteractiveSkyMap', () => {
  let canvas: HTMLCanvasElement

  beforeEach(() => {
    canvas = makeCanvas()
  })

  describe('construction and disposal', () => {
    it('constructs without throwing', () => {
      expect(() => new InteractiveSkyMap(canvas, TEST_OBJECTS)).not.toThrow()
    })

    it('constructs via factory function', () => {
      const skymap = createInteractiveSkyMap(canvas, TEST_OBJECTS)
      expect(skymap).toBeInstanceOf(InteractiveSkyMap)
      skymap.dispose()
    })

    it('throws if canvas has no 2D context', () => {
      const badCanvas = {
        width: 800,
        height: 400,
        getContext: () => null,
      } as unknown as HTMLCanvasElement
      expect(() => new InteractiveSkyMap(badCanvas, [])).toThrow('Canvas 2D context')
    })

    it('registers pointer and wheel event listeners', () => {
      const skymap = new InteractiveSkyMap(canvas, [])
      const addCalls = (canvas as any).addEventListener.mock.calls
      const registeredTypes = addCalls.map((c: any[]) => c[0])
      expect(registeredTypes).toContain('pointerdown')
      expect(registeredTypes).toContain('pointermove')
      expect(registeredTypes).toContain('pointerup')
      expect(registeredTypes).toContain('pointercancel')
      expect(registeredTypes).toContain('wheel')
      skymap.dispose()
    })

    it('dispose cancels event listeners via AbortController', () => {
      const skymap = new InteractiveSkyMap(canvas, [])
      skymap.dispose()
      // After dispose, dispatching events should not crash
      const evt = new Event('pointermove') as PointerEvent
      expect(() => (canvas as any).dispatchEvent(evt)).not.toThrow()
    })
  })

  describe('view state', () => {
    it('getView returns the initial view state', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS, {
        center: { ra: 100, dec: 20 },
        scale: 500,
        projection: 'gnomonic',
      })
      const view = skymap.getView()
      expect(view.center.ra).toBe(100)
      expect(view.center.dec).toBe(20)
      expect(view.scale).toBe(500)
      expect(view.projection).toBe('gnomonic')
      skymap.dispose()
    })

    it('setView updates centre and scale', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      skymap.setView({ center: { ra: 50, dec: -10 }, scale: 200 })
      const view = skymap.getView()
      expect(view.center.ra).toBe(50)
      expect(view.center.dec).toBe(-10)
      expect(view.scale).toBe(200)
      skymap.dispose()
    })

    it('setView clamps scale to min/max bounds', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS, {
        minScale: 100,
        maxScale: 1000,
      })
      skymap.setView({ scale: 50 })
      expect(skymap.getView().scale).toBe(100)

      skymap.setView({ scale: 2000 })
      expect(skymap.getView().scale).toBe(1000)
      skymap.dispose()
    })

    it('setView emits viewchange event', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      const handler = vi.fn()
      skymap.on('viewchange', handler)

      skymap.setView({ center: { ra: 10, dec: 20 } })
      expect(handler).toHaveBeenCalledOnce()
      expect(handler.mock.calls[0][0].center.ra).toBe(10)
      skymap.dispose()
    })
  })

  describe('event system', () => {
    it('on/off registers and unregisters handlers', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      const handler = vi.fn()

      skymap.on('viewchange', handler)
      skymap.setView({ scale: 400 })
      expect(handler).toHaveBeenCalledOnce()

      skymap.off('viewchange', handler)
      skymap.setView({ scale: 500 })
      expect(handler).toHaveBeenCalledOnce() // still 1 — unregistered
      skymap.dispose()
    })

    it('supports multiple handlers for the same event', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      const h1 = vi.fn()
      const h2 = vi.fn()

      skymap.on('viewchange', h1)
      skymap.on('viewchange', h2)
      skymap.setView({ scale: 400 })

      expect(h1).toHaveBeenCalledOnce()
      expect(h2).toHaveBeenCalledOnce()
      skymap.dispose()
    })

    it('no events fire after dispose', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      const handler = vi.fn()
      skymap.on('viewchange', handler)
      skymap.dispose()

      // Attempting to setView after dispose should not emit
      // (render is a no-op after dispose)
      skymap.setView({ scale: 999 })
      // The setView still calls _emit, but listeners were cleared
      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('selection', () => {
    it('select(id) updates selectedObject', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      expect(skymap.selectedObject).toBeNull()

      skymap.select('sirius')
      expect(skymap.selectedObject).not.toBeNull()
      expect(skymap.selectedObject!.id).toBe('sirius')
      skymap.dispose()
    })

    it('select(null) clears selection', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      skymap.select('sirius')
      expect(skymap.selectedObject).not.toBeNull()

      skymap.select(null)
      expect(skymap.selectedObject).toBeNull()
      skymap.dispose()
    })

    it('select(unknownId) sets selectedObject to null', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      skymap.select('nonexistent')
      expect(skymap.selectedObject).toBeNull()
      skymap.dispose()
    })
  })

  describe('data updates', () => {
    it('setObjects replaces the objects array', () => {
      const skymap = new InteractiveSkyMap(canvas, [])
      skymap.select('sirius')
      expect(skymap.selectedObject).toBeNull() // not in empty array

      skymap.setObjects(TEST_OBJECTS)
      skymap.select('sirius')
      expect(skymap.selectedObject?.id).toBe('sirius')
      skymap.dispose()
    })

    it('setOptions merges new options', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS, { scale: 300 })
      skymap.setOptions({ scale: 600, projection: 'gnomonic' })
      const view = skymap.getView()
      expect(view.scale).toBe(600)
      expect(view.projection).toBe('gnomonic')
      skymap.dispose()
    })
  })

  describe('FOV', () => {
    it('setFOV sets and clears without error', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      expect(() => skymap.setFOV({ radiusDeg: 5, label: 'Test' })).not.toThrow()
      expect(() => skymap.setFOV(null)).not.toThrow()
      skymap.dispose()
    })

    it('renders with FOV overlay configured', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS, {
        fov: { radiusDeg: 3, color: 'red' },
      })
      expect(() => skymap.render()).not.toThrow()
      skymap.dispose()
    })

    it('renders with multiple FOV overlays', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS, {
        fov: [
          { radiusDeg: 5, label: 'Wide' },
          { radiusDeg: 1, label: 'Narrow' },
        ],
      })
      expect(() => skymap.render()).not.toThrow()
      skymap.dispose()
    })
  })

  describe('HUD', () => {
    it('renders with cardinal directions', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS, {
        hud: { cardinalDirections: true },
      })
      expect(() => skymap.render()).not.toThrow()
      skymap.dispose()
    })

    it('renders with horizon line and zenith marker', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS, {
        hud: {
          horizonLine: true,
          zenithMarker: true,
          observer: { lat: 51.5, lng: -0.1, date: new Date('2024-06-15T22:00:00Z') },
        },
      })
      expect(() => skymap.render()).not.toThrow()
      skymap.dispose()
    })
  })

  describe('real-time mode', () => {
    it('startRealTime throws without observer params', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      expect(() => skymap.startRealTime()).toThrow('Observer parameters required')
      skymap.dispose()
    })

    it('startRealTime and stopRealTime work without error', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      expect(() =>
        skymap.startRealTime({ lat: 40, lng: -74 })
      ).not.toThrow()
      expect(() => skymap.stopRealTime()).not.toThrow()
      skymap.dispose()
    })

    it('auto-starts real-time mode when configured', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS, {
        realTime: true,
        observer: { lat: 40, lng: -74 },
      })
      // Should not throw — just verify it constructed and started
      skymap.stopRealTime()
      skymap.dispose()
    })
  })

  describe('render', () => {
    it('render() runs without throwing on empty objects', () => {
      const skymap = new InteractiveSkyMap(canvas, [])
      expect(() => skymap.render()).not.toThrow()
      skymap.dispose()
    })

    it('render() runs with all three projections', () => {
      for (const projection of ['stereographic', 'mollweide', 'gnomonic'] as const) {
        const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS, { projection })
        expect(() => skymap.render()).not.toThrow()
        skymap.dispose()
      }
    })

    it('render() does nothing after dispose', () => {
      const skymap = new InteractiveSkyMap(canvas, TEST_OBJECTS)
      skymap.dispose()
      expect(() => skymap.render()).not.toThrow()
    })
  })
})
