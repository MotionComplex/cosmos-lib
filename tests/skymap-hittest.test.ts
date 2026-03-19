import { describe, it, expect } from 'vitest'
import {
  stereographicInverse,
  gnomonicInverse,
  mollweideInverse,
  canvasToEquatorial,
  hitTest,
} from '../src/skymap-hittest'
import { stereographic, mollweide, gnomonic } from '../src/skymap'
import type { EquatorialCoord, ProjectedObject } from '../src/types'

const CENTER: EquatorialCoord = { ra: 83.822, dec: -5.391 } // Orion Nebula

// ── Inverse projection round-trips ──────────────────────────────────────────

describe('stereographicInverse', () => {
  it('round-trips the centre point', () => {
    const fwd = stereographic(CENTER, CENTER, 500)
    const inv = stereographicInverse(fwd.x, fwd.y, CENTER, 500)
    expect(inv).not.toBeNull()
    expect(inv!.ra).toBeCloseTo(CENTER.ra, 4)
    expect(inv!.dec).toBeCloseTo(CENTER.dec, 4)
  })

  it('round-trips an offset point', () => {
    const coord: EquatorialCoord = { ra: 90, dec: 10 }
    const fwd = stereographic(coord, CENTER, 400)
    const inv = stereographicInverse(fwd.x, fwd.y, CENTER, 400)
    expect(inv).not.toBeNull()
    expect(inv!.ra).toBeCloseTo(coord.ra, 3)
    expect(inv!.dec).toBeCloseTo(coord.dec, 3)
  })

  it('round-trips a point near the celestial pole', () => {
    const coord: EquatorialCoord = { ra: 37.95, dec: 89.26 } // Polaris
    const poleCentre: EquatorialCoord = { ra: 0, dec: 80 }
    const fwd = stereographic(coord, poleCentre, 600)
    if (fwd.visible) {
      const inv = stereographicInverse(fwd.x, fwd.y, poleCentre, 600)
      expect(inv).not.toBeNull()
      expect(inv!.ra).toBeCloseTo(coord.ra, 2)
      expect(inv!.dec).toBeCloseTo(coord.dec, 2)
    }
  })

  it('returns the centre when offsets are (0, 0)', () => {
    const inv = stereographicInverse(0, 0, CENTER, 300)
    expect(inv).not.toBeNull()
    expect(inv!.ra).toBeCloseTo(CENTER.ra, 6)
    expect(inv!.dec).toBeCloseTo(CENTER.dec, 6)
  })
})

describe('gnomonicInverse', () => {
  it('round-trips the centre point', () => {
    const fwd = gnomonic(CENTER, CENTER, 400)
    const inv = gnomonicInverse(fwd.x, fwd.y, CENTER, 400)
    expect(inv).not.toBeNull()
    expect(inv!.ra).toBeCloseTo(CENTER.ra, 4)
    expect(inv!.dec).toBeCloseTo(CENTER.dec, 4)
  })

  it('round-trips an offset point', () => {
    const coord: EquatorialCoord = { ra: 80, dec: -2 }
    const fwd = gnomonic(coord, CENTER, 400)
    if (fwd.visible) {
      const inv = gnomonicInverse(fwd.x, fwd.y, CENTER, 400)
      expect(inv).not.toBeNull()
      expect(inv!.ra).toBeCloseTo(coord.ra, 3)
      expect(inv!.dec).toBeCloseTo(coord.dec, 3)
    }
  })

  it('returns the centre when offsets are (0, 0)', () => {
    const inv = gnomonicInverse(0, 0, CENTER, 400)
    expect(inv).not.toBeNull()
    expect(inv!.ra).toBeCloseTo(CENTER.ra, 6)
    expect(inv!.dec).toBeCloseTo(CENTER.dec, 6)
  })
})

describe('mollweideInverse', () => {
  const W = 800
  const H = 400

  it('round-trips the canvas centre (RA=180, Dec=0)', () => {
    const coord: EquatorialCoord = { ra: 180, dec: 0 }
    const fwd = mollweide(coord, { width: W, height: H })
    const inv = mollweideInverse(fwd.x, fwd.y, W, H)
    expect(inv).not.toBeNull()
    expect(inv!.ra).toBeCloseTo(coord.ra, 2)
    expect(inv!.dec).toBeCloseTo(coord.dec, 2)
  })

  it('round-trips the north pole', () => {
    const coord: EquatorialCoord = { ra: 180, dec: 90 }
    const fwd = mollweide(coord, { width: W, height: H })
    const inv = mollweideInverse(fwd.x, fwd.y, W, H)
    expect(inv).not.toBeNull()
    expect(inv!.dec).toBeCloseTo(90, 1)
  })

  it('round-trips the south pole', () => {
    const coord: EquatorialCoord = { ra: 180, dec: -90 }
    const fwd = mollweide(coord, { width: W, height: H })
    const inv = mollweideInverse(fwd.x, fwd.y, W, H)
    expect(inv).not.toBeNull()
    expect(inv!.dec).toBeCloseTo(-90, 1)
  })

  it('round-trips an arbitrary coordinate', () => {
    const coord: EquatorialCoord = { ra: 60, dec: 30 }
    const fwd = mollweide(coord, { width: W, height: H })
    const inv = mollweideInverse(fwd.x, fwd.y, W, H)
    expect(inv).not.toBeNull()
    expect(inv!.ra).toBeCloseTo(coord.ra, 1)
    expect(inv!.dec).toBeCloseTo(coord.dec, 1)
  })

  it('returns null for points outside the ellipse', () => {
    // Far outside the projection boundary
    expect(mollweideInverse(-100, H / 2, W, H)).toBeNull()
    expect(mollweideInverse(W + 100, H / 2, W, H)).toBeNull()
    expect(mollweideInverse(W / 2, -100, W, H)).toBeNull()
  })
})

// ── canvasToEquatorial dispatcher ───────────────────────────────────────────

describe('canvasToEquatorial', () => {
  const W = 800
  const H = 400

  it('dispatches to stereographic and round-trips correctly', () => {
    const coord: EquatorialCoord = { ra: 90, dec: 10 }
    const fwd = stereographic(coord, CENTER, 300)
    const canvasX = W / 2 + fwd.x
    const canvasY = H / 2 - fwd.y

    const inv = canvasToEquatorial(canvasX, canvasY, W, H, 'stereographic', CENTER, 300)
    expect(inv).not.toBeNull()
    expect(inv!.ra).toBeCloseTo(coord.ra, 3)
    expect(inv!.dec).toBeCloseTo(coord.dec, 3)
  })

  it('dispatches to gnomonic and round-trips correctly', () => {
    const coord: EquatorialCoord = { ra: 80, dec: -2 }
    const fwd = gnomonic(coord, CENTER, 400)
    if (fwd.visible) {
      const canvasX = W / 2 + fwd.x
      const canvasY = H / 2 - fwd.y

      const inv = canvasToEquatorial(canvasX, canvasY, W, H, 'gnomonic', CENTER, 400)
      expect(inv).not.toBeNull()
      expect(inv!.ra).toBeCloseTo(coord.ra, 3)
      expect(inv!.dec).toBeCloseTo(coord.dec, 3)
    }
  })

  it('dispatches to mollweide and round-trips correctly', () => {
    const coord: EquatorialCoord = { ra: 120, dec: -20 }
    const fwd = mollweide(coord, { width: W, height: H })

    const inv = canvasToEquatorial(fwd.x, fwd.y, W, H, 'mollweide', CENTER, 300)
    expect(inv).not.toBeNull()
    expect(inv!.ra).toBeCloseTo(coord.ra, 1)
    expect(inv!.dec).toBeCloseTo(coord.dec, 1)
  })
})

// ── hitTest ─────────────────────────────────────────────────────────────────

describe('hitTest', () => {
  const makeObj = (id: string, x: number, y: number, radius = 5): ProjectedObject => ({
    object: { id, name: id, ra: 0, dec: 0, magnitude: 1, type: 'star', aliases: [], description: '', tags: [] } as any,
    x,
    y,
    radius,
  })

  it('returns the nearest object within range', () => {
    const cache = [
      makeObj('a', 100, 100),
      makeObj('b', 110, 100),
      makeObj('c', 200, 200),
    ]
    const result = hitTest(cache, 105, 100, 15)
    expect(result).not.toBeNull()
    expect(result!.object.id).toBe('a')
  })

  it('returns null when nothing is within range', () => {
    const cache = [makeObj('a', 100, 100)]
    const result = hitTest(cache, 500, 500, 15)
    expect(result).toBeNull()
  })

  it('returns null for an empty cache', () => {
    expect(hitTest([], 100, 100, 15)).toBeNull()
  })

  it('prefers the closer object when multiple are in range', () => {
    const cache = [
      makeObj('far', 100, 100),
      makeObj('close', 108, 100),
    ]
    const result = hitTest(cache, 110, 100, 15)
    expect(result).not.toBeNull()
    expect(result!.object.id).toBe('close')
  })

  it('uses the object visual radius as minimum threshold', () => {
    const cache = [makeObj('big', 100, 100, 30)]
    // 25px away, within the object's 30px radius but outside the 15px hitRadius
    const result = hitTest(cache, 125, 100, 15)
    expect(result).not.toBeNull()
    expect(result!.object.id).toBe('big')
  })
})
