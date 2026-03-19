import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { morph, staggerIn, staggerOut, fade, crossfade, heroExpand } from '../src/transitions'

// ── DOM helpers ───────────────────────────────────────────────────────────────

function makeEl(tag = 'div'): HTMLElement {
  return document.createElement(tag)
}

function makeContainer(childCount: number): HTMLElement {
  const container = makeEl()
  for (let i = 0; i < childCount; i++) {
    container.appendChild(makeEl())
  }
  document.body.appendChild(container)
  return container
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Transitions', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  // ── morph ──────────────────────────────────────────────────────────────────
  describe('morph', () => {
    it('calls the update function', async () => {
      const updateFn = vi.fn()
      const promise  = morph(updateFn, { duration: 100 })
      await vi.runAllTimersAsync()
      await promise
      expect(updateFn).toHaveBeenCalledOnce()
    })

    it('resolves even when View Transitions API is unavailable', async () => {
      // happy-dom may not implement startViewTransition — morph should still work
      const updateFn = vi.fn()
      await expect(morph(updateFn)).resolves.toBeUndefined()
      expect(updateFn).toHaveBeenCalledOnce()
    })

    it('awaits async update functions', async () => {
      const order: number[] = []
      const updateFn = async () => {
        order.push(1)
        await Promise.resolve()
        order.push(2)
      }
      const p = morph(updateFn)
      await vi.runAllTimersAsync()
      await p
      expect(order).toEqual([1, 2])
    })
  })

  // ── staggerIn ──────────────────────────────────────────────────────────────
  describe('staggerIn', () => {
    it('sets opacity to 1 on all children after animation', async () => {
      const container = makeContainer(3)
      const promise   = staggerIn(container, { duration: 100, stagger: 50 })
      await vi.runAllTimersAsync()
      await promise

      const children = [...container.children] as HTMLElement[]
      expect(children.every(c => c.style.opacity === '1')).toBe(true)
    })

    it('resolves immediately for an empty container', async () => {
      const container = makeContainer(0)
      await expect(staggerIn(container)).resolves.toBeUndefined()
    })

    it('sets initial opacity to 0 before animation starts', () => {
      const container = makeContainer(3)
      // Don't await — inspect the synchronous initial state
      staggerIn(container, { duration: 200 })

      const children = [...container.children] as HTMLElement[]
      expect(children.every(c => c.style.opacity === '0')).toBe(true)
    })

    it('applies transform based on `from` direction', () => {
      const container = makeContainer(2)
      staggerIn(container, { from: 'left', distance: '30px' })

      const first = container.firstElementChild as HTMLElement
      expect(first.style.transform).toContain('translateX(-30px)')
    })
  })

  // ── staggerOut ─────────────────────────────────────────────────────────────
  describe('staggerOut', () => {
    it('sets opacity to 0 on all children after animation', async () => {
      const container = makeContainer(3)
      // Start visible
      ;[...container.children].forEach(c => {
        (c as HTMLElement).style.opacity = '1'
      })
      const promise = staggerOut(container, { duration: 100, stagger: 30 })
      await vi.runAllTimersAsync()
      await promise

      const children = [...container.children] as HTMLElement[]
      expect(children.every(c => c.style.opacity === '0')).toBe(true)
    })

    it('resolves immediately for an empty container', async () => {
      const container = makeContainer(0)
      await expect(staggerOut(container)).resolves.toBeUndefined()
    })
  })

  // ── fade ───────────────────────────────────────────────────────────────────
  describe('fade', () => {
    it("sets opacity to '1' for direction 'in'", async () => {
      const el      = makeEl()
      el.style.opacity = '0'
      const promise = fade(el, 'in', 100)
      await vi.runAllTimersAsync()
      await promise
      expect(el.style.opacity).toBe('1')
    })

    it("sets opacity to '0' for direction 'out'", async () => {
      const el      = makeEl()
      el.style.opacity = '1'
      const promise = fade(el, 'out', 100)
      await vi.runAllTimersAsync()
      await promise
      expect(el.style.opacity).toBe('0')
    })

    it("sets pointerEvents to 'auto' when fading in", async () => {
      const el = makeEl()
      await fade(el, 'in', 0)
      await vi.runAllTimersAsync()
      expect(el.style.pointerEvents).toBe('auto')
    })

    it("sets pointerEvents to 'none' when fading out", async () => {
      const el = makeEl()
      await fade(el, 'out', 0)
      await vi.runAllTimersAsync()
      expect(el.style.pointerEvents).toBe('none')
    })

    it('resolves after the duration', async () => {
      const el       = makeEl()
      let resolved   = false
      const promise  = fade(el, 'out', 300).then(() => { resolved = true })

      expect(resolved).toBe(false)
      await vi.advanceTimersByTimeAsync(300)
      await promise
      expect(resolved).toBe(true)
    })
  })

  // ── crossfade ─────────────────────────────────────────────────────────────
  describe('crossfade', () => {
    it('hides `from` and shows `to` after completion', async () => {
      const from = makeEl()
      const to   = makeEl()
      from.style.opacity = '1'
      to.style.opacity   = '0'
      document.body.appendChild(from)
      document.body.appendChild(to)

      const promise = crossfade(from, to, 100)
      await vi.runAllTimersAsync()
      await promise

      expect(from.style.display).toBe('none')
      expect(to.style.opacity).toBe('1')
    })
  })

  // ── heroExpand ────────────────────────────────────────────────────────────
  describe('heroExpand', () => {
    it('calls onDone callback after animation', async () => {
      const el     = makeEl()
      document.body.appendChild(el)
      // getBoundingClientRect returns zeros in jsdom/happy-dom — that's fine,
      // we just want to verify onDone fires
      const onDone = vi.fn()
      heroExpand(el, { duration: 100, onDone })
      await vi.runAllTimersAsync()
      expect(onDone).toHaveBeenCalledOnce()
    })

    it('resets transform after animation', async () => {
      const el = makeEl()
      document.body.appendChild(el)
      heroExpand(el, { duration: 100 })
      await vi.runAllTimersAsync()
      expect(el.style.transform).toBe('')
    })
  })
})
