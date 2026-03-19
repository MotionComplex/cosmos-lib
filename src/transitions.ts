import type { MorphOptions, StaggerOptions, HeroExpandOptions } from './types.js'

/**
 * Wrap a DOM mutation in the View Transitions API.
 * Falls back to a direct call on browsers that don't support it.
 */
export async function morph(
  updateFn: () => void | Promise<void>,
  opts: MorphOptions = {},
): Promise<void> {
  const { duration = 400, easing = 'ease-in-out', signal } = opts

  if (signal?.aborted) return

  if (!('startViewTransition' in document)) {
    await updateFn()
    return
  }

  document.documentElement.style.setProperty('--cosmos-vt-duration', `${duration}ms`)
  document.documentElement.style.setProperty('--cosmos-vt-easing',   easing)

  const vt = (document as Document & {
    startViewTransition: (fn: () => void | Promise<void>) => { finished: Promise<void> }
  }).startViewTransition(updateFn)

  await vt.finished
}

/**
 * Stagger-reveal all direct children of a container element.
 * Uses requestAnimationFrame for robust timing.
 * Returns a Promise that resolves when the last element finishes animating.
 */
export function staggerIn(
  container: HTMLElement,
  opts: StaggerOptions = {},
): Promise<void> {
  const {
    delay    = 0,
    stagger  = 60,
    duration = 500,
    from     = 'bottom',
    distance = '20px',
    signal,
  } = opts

  if (signal?.aborted) return Promise.resolve()

  const AXIS: Record<NonNullable<StaggerOptions['from']>, string> = {
    top:    `translateY(-${distance})`,
    bottom: `translateY(${distance})`,
    left:   `translateX(-${distance})`,
    right:  `translateX(${distance})`,
  }
  const initial = AXIS[from]

  const children = [...container.children] as HTMLElement[]
  children.forEach(el => {
    el.style.opacity    = '0'
    el.style.transform  = initial
    el.style.transition = 'none'
  })

  if (children.length === 0) return Promise.resolve()

  return new Promise(resolve => {
    const start = performance.now() + delay

    const onAbort = (): void => {
      // Reset styles on abort
      children.forEach(el => {
        el.style.opacity    = '1'
        el.style.transform  = 'none'
        el.style.transition = ''
      })
      resolve()
    }
    signal?.addEventListener('abort', onAbort, { once: true })

    const tick = (now: number): void => {
      if (signal?.aborted) return

      let allDone = true
      for (let i = 0; i < children.length; i++) {
        const childStart = start + i * stagger
        if (now >= childStart) {
          const el = children[i]!
          if (el.style.opacity === '0') {
            el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms cubic-bezier(0.2,0,0,1)`
            el.style.opacity    = '1'
            el.style.transform  = 'none'
          }
          // Check if animation would still be running
          if (now < childStart + duration) allDone = false
        } else {
          allDone = false
        }
      }

      if (allDone) {
        signal?.removeEventListener('abort', onAbort)
        resolve()
      } else {
        requestAnimationFrame(tick)
      }
    }

    // Trigger reflow, then start RAF loop
    requestAnimationFrame(() => requestAnimationFrame(tick))
  })
}

/**
 * Stagger-hide all direct children of a container element.
 * Uses requestAnimationFrame for robust timing.
 * Returns a Promise that resolves when the last element finishes animating.
 */
export function staggerOut(
  container: HTMLElement,
  opts: StaggerOptions = {},
): Promise<void> {
  const {
    stagger  = 40,
    duration = 300,
    from     = 'bottom',
    distance = '12px',
    signal,
  } = opts

  if (signal?.aborted) return Promise.resolve()

  const AXIS: Record<NonNullable<StaggerOptions['from']>, string> = {
    top:    `translateY(-${distance})`,
    bottom: `translateY(${distance})`,
    left:   `translateX(-${distance})`,
    right:  `translateX(${distance})`,
  }
  const target = AXIS[from]

  const children = ([...container.children] as HTMLElement[]).reverse()

  if (children.length === 0) return Promise.resolve()

  return new Promise(resolve => {
    const start = performance.now()

    const onAbort = (): void => {
      children.forEach(el => {
        el.style.opacity    = '0'
        el.style.transform  = target
        el.style.transition = ''
      })
      resolve()
    }
    signal?.addEventListener('abort', onAbort, { once: true })

    const tick = (now: number): void => {
      if (signal?.aborted) return

      let allDone = true
      for (let i = 0; i < children.length; i++) {
        const childStart = start + i * stagger
        if (now >= childStart) {
          const el = children[i]!
          if (el.style.opacity !== '0') {
            el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`
            el.style.opacity    = '0'
            el.style.transform  = target
          }
          if (now < childStart + duration) allDone = false
        } else {
          allDone = false
        }
      }

      if (allDone) {
        signal?.removeEventListener('abort', onAbort)
        resolve()
      } else {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  })
}

/**
 * Fade an element in or out.
 * Returns a Promise that resolves when the animation finishes.
 */
export function fade(
  el: HTMLElement,
  direction: 'in' | 'out',
  duration = 300,
): Promise<void> {
  return new Promise(resolve => {
    el.style.transition    = `opacity ${duration}ms ease`
    el.style.opacity       = direction === 'in' ? '1' : '0'
    el.style.pointerEvents = direction === 'in' ? 'auto' : 'none'

    const done = (): void => {
      el.removeEventListener('transitionend', done)
      resolve()
    }
    el.addEventListener('transitionend', done, { once: true })
    // Safety fallback in case transitionend doesn't fire
    setTimeout(resolve, duration + 50)
  })
}

/**
 * Crossfade two elements: fades `from` out while fading `to` in simultaneously.
 * Hides `from` via display:none after completion.
 */
export async function crossfade(
  from: HTMLElement,
  to: HTMLElement,
  duration = 400,
): Promise<void> {
  to.style.opacity       = '0'
  to.style.pointerEvents = 'none'
  to.style.display       = ''

  await Promise.all([
    fade(from, 'out', duration),
    fade(to,   'in',  duration),
  ])

  from.style.display = 'none'
}

/**
 * Hero expand — animates an element from its current bounding rect to fill
 * the viewport using the FLIP technique (no GSAP dependency).
 */
export function heroExpand(element: HTMLElement, opts: HeroExpandOptions = {}): void {
  const { duration = 500, easing = 'cubic-bezier(0.4,0,0.2,1)', onDone, signal } = opts

  if (signal?.aborted) return

  const first  = element.getBoundingClientRect()
  const scaleX = window.innerWidth  / first.width
  const scaleY = window.innerHeight / first.height
  const tx     = window.innerWidth  / 2 - (first.left + first.width  / 2)
  const ty     = window.innerHeight / 2 - (first.top  + first.height / 2)

  element.style.transformOrigin = 'center center'
  element.style.transition      = 'none'
  element.style.transform       = 'translate(0,0) scale(1,1)'

  requestAnimationFrame(() => {
    if (signal?.aborted) return
    requestAnimationFrame(() => {
      if (signal?.aborted) return
      element.style.transition = `transform ${duration}ms ${easing}`
      element.style.transform  = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`

      const cleanup = (): void => {
        element.removeEventListener('transitionend', cleanup)
        element.style.transform  = ''
        element.style.transition = ''
        onDone?.()
      }
      element.addEventListener('transitionend', cleanup, { once: true })
      // Safety fallback
      setTimeout(cleanup, duration + 100)
    })
  })
}

/**
 * Hero collapse — animates an overlay element into the bounds of a target element.
 * The overlay is removed from the DOM after the animation completes.
 *
 * @param targetElement  the element to collapse into
 * @param overlayEl      the full-screen overlay element (default: a new div)
 */
export function heroCollapse(
  targetElement: HTMLElement,
  opts: HeroExpandOptions = {},
  overlayEl?: HTMLElement,
): void {
  const { duration = 400, easing = 'cubic-bezier(0.4,0,0.2,1)', onDone, signal } = opts

  if (signal?.aborted) return

  const final  = targetElement.getBoundingClientRect()
  const scaleX = final.width  / window.innerWidth
  const scaleY = final.height / window.innerHeight
  const tx     = final.left + final.width  / 2 - window.innerWidth  / 2
  const ty     = final.top  + final.height / 2 - window.innerHeight / 2

  const isOwned = !overlayEl
  const overlay = overlayEl ?? document.createElement('div')
  if (isOwned) {
    Object.assign(overlay.style, {
      position:        'fixed',
      inset:           '0',
      pointerEvents:   'none',
      zIndex:          '9999',
      transformOrigin: 'center center',
    })
    document.body.appendChild(overlay)
  }

  overlay.style.transition = `transform ${duration}ms ${easing}, opacity ${duration * 0.6}ms ease ${duration * 0.4}ms`

  const cleanup = (): void => {
    overlay.removeEventListener('transitionend', cleanup)
    if (isOwned) overlay.remove()
    onDone?.()
  }

  requestAnimationFrame(() => {
    if (signal?.aborted) { cleanup(); return }
    overlay.style.transform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`
    overlay.style.opacity   = '0'
    overlay.addEventListener('transitionend', cleanup, { once: true })
    // Safety fallback: ensure cleanup always runs
    setTimeout(cleanup, duration + 100)
  })
}

/** @deprecated Use named exports. Kept for backwards compatibility. */
export const Transitions = {
  morph,
  staggerIn,
  staggerOut,
  fade,
  crossfade,
  heroExpand,
  heroCollapse,
}
