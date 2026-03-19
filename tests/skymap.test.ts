import { describe, it, expect } from 'vitest'
import { stereographic, mollweide, gnomonic, renderSkyMap } from '../src/skymap'
import type { EquatorialCoord } from '../src/types'

const CENTER: EquatorialCoord = { ra: 83.822, dec: -5.391 }  // Orion Nebula

describe('Projections', () => {
  describe('stereographic', () => {
    it('projects the center point to (0, 0)', () => {
      const pt = stereographic(CENTER, CENTER, 500)
      expect(pt.x).toBeCloseTo(0, 5)
      expect(pt.y).toBeCloseTo(0, 5)
      expect(pt.visible).toBe(true)
    })

    it('marks antipodal point as not visible', () => {
      const antipode: EquatorialCoord = {
        ra:  (CENTER.ra + 180) % 360,
        dec: -CENTER.dec,
      }
      const pt = stereographic(antipode, CENTER, 500)
      expect(pt.visible).toBe(false)
    })

    it('returns finite numbers for typical coordinates', () => {
      const pt = stereographic({ ra: 120, dec: 30 }, CENTER, 300)
      expect(isFinite(pt.x)).toBe(true)
      expect(isFinite(pt.y)).toBe(true)
    })

    it('scale parameter affects output magnitude', () => {
      const pt1 = stereographic({ ra: 90, dec: 0 }, CENTER, 100)
      const pt2 = stereographic({ ra: 90, dec: 0 }, CENTER, 200)
      expect(Math.abs(pt2.x)).toBeCloseTo(Math.abs(pt1.x) * 2, 5)
    })
  })

  describe('mollweide', () => {
    it('projects RA=180, Dec=0 to canvas center', () => {
      const canvas = { width: 800, height: 400 }
      const pt     = mollweide({ ra: 180, dec: 0 }, canvas)
      expect(pt.x).toBeCloseTo(400, 1)
      expect(pt.y).toBeCloseTo(200, 1)
    })

    it('always returns visible=true', () => {
      const canvas = { width: 800, height: 400 }
      expect(mollweide({ ra: 0,   dec: 0  }, canvas).visible).toBe(true)
      expect(mollweide({ ra: 90,  dec: 45 }, canvas).visible).toBe(true)
      expect(mollweide({ ra: 270, dec: -60 }, canvas).visible).toBe(true)
    })

    it('north pole is above canvas center', () => {
      const canvas = { width: 800, height: 400 }
      const north  = mollweide({ ra: 180, dec: 90 }, canvas)
      expect(north.y).toBeLessThan(200)
    })

    it('south pole is below canvas center', () => {
      const canvas = { width: 800, height: 400 }
      const south  = mollweide({ ra: 180, dec: -90 }, canvas)
      expect(south.y).toBeGreaterThan(200)
    })
  })

  describe('gnomonic', () => {
    it('projects the center point to (0, 0)', () => {
      const pt = gnomonic(CENTER, CENTER, 400)
      expect(pt.x).toBeCloseTo(0, 5)
      expect(pt.y).toBeCloseTo(0, 5)
      expect(pt.visible).toBe(true)
    })

    it('marks points behind the tangent plane as not visible', () => {
      const opposite: EquatorialCoord = {
        ra:  (CENTER.ra + 180) % 360,
        dec: -CENTER.dec,
      }
      const pt = gnomonic(opposite, CENTER, 400)
      expect(pt.visible).toBe(false)
    })
  })
})

describe('renderSkyMap', () => {
  // Create a minimal canvas stub
  function makeCanvas(w = 800, h = 400) {
    const ctx = {
      fillStyle:   '',
      strokeStyle: '',
      lineWidth:   0,
      font:        '',
      fillRect:    () => {},
      beginPath:   () => {},
      moveTo:      () => {},
      lineTo:      () => {},
      stroke:      () => {},
      fill:        () => {},
      save:        () => {},
      restore:     () => {},
      arc:         () => {},
      ellipse:     () => {},
      rect:        () => {},
      fillText:    () => {},
      createRadialGradient: () => ({
        addColorStop: () => {},
      }),
    }
    return {
      width:      w,
      height:     h,
      getContext: (_: string) => ctx,
    } as unknown as HTMLCanvasElement
  }

  it('runs without throwing on an empty objects array', () => {
    const canvas = makeCanvas()
    expect(() => renderSkyMap(canvas, [], {})).not.toThrow()
  })

  it('runs without throwing with real catalog data', async () => {
    const { Data } = await import('../src/data/index')
    const canvas   = makeCanvas()
    expect(() =>
      renderSkyMap(canvas, Data.all(), { projection: 'stereographic', center: CENTER })
    ).not.toThrow()
  })

  it('runs with mollweide projection', async () => {
    const { Data } = await import('../src/data/index')
    const canvas   = makeCanvas(1000, 500)
    expect(() =>
      renderSkyMap(canvas, Data.all(), { projection: 'mollweide' })
    ).not.toThrow()
  })

  it('runs with gnomonic projection', async () => {
    const { Data } = await import('../src/data/index')
    const canvas   = makeCanvas()
    expect(() =>
      renderSkyMap(canvas, Data.all(), { projection: 'gnomonic', center: CENTER })
    ).not.toThrow()
  })

  it('throws when canvas has no 2D context', () => {
    const canvas = {
      width: 800, height: 400,
      getContext: () => null,
    } as unknown as HTMLCanvasElement
    expect(() => renderSkyMap(canvas, [])).toThrow('Canvas 2D context')
  })
})
