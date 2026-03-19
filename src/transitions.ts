import type { MorphOptions, StaggerOptions, HeroExpandOptions } from './types.js'

/**
 * Wrap a DOM mutation in the View Transitions API.
 *
 * When the browser supports `document.startViewTransition`, the provided
 * callback is executed inside a view transition so the browser can
 * automatically cross-fade old and new DOM states. On unsupported browsers
 * the callback is invoked directly as a no-op fallback.
 *
 * Custom CSS variables `--cosmos-vt-duration` and `--cosmos-vt-easing` are
 * set on the document element so companion stylesheets can pick them up.
 *
 * @param updateFn - A synchronous or asynchronous function that mutates the DOM
 *                   (e.g. swapping panel content, re-rendering a component).
 * @param opts     - Transition options. See {@link MorphOptions} for defaults.
 * @returns A promise that resolves when the view transition finishes (or
 *          immediately after `updateFn` on unsupported browsers).
 *
 * @example
 * ```ts
 * import { morph } from '@motioncomplex/cosmos-lib'
 *
 * // Morph a detail panel from one star to another
 * const controller = new AbortController()
 * await morph(() => {
 *   panel.innerHTML = renderStarDetail(nextStar)
 * }, { duration: 350, easing: 'ease-out', signal: controller.signal })
 * ```
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
 *
 * Each child fades in and slides from the specified direction with a
 * configurable inter-child delay, producing a cascading entrance effect.
 * Animation is driven by `requestAnimationFrame` for frame-accurate timing
 * and can be cancelled at any time via an `AbortSignal`.
 *
 * @param container - The parent element whose direct children will be animated.
 * @param opts      - Stagger options controlling delay, timing, direction, and
 *                    cancellation. See {@link StaggerOptions} for defaults.
 * @returns A promise that resolves when the last child finishes its entrance
 *          animation, or immediately if the container has no children or the
 *          signal is already aborted.
 *
 * @example
 * ```ts
 * import { staggerIn } from '@motioncomplex/cosmos-lib'
 *
 * // Stagger-reveal a grid of star cards from the bottom
 * const grid = document.querySelector<HTMLElement>('.star-card-grid')!
 * await staggerIn(grid, {
 *   delay: 100,
 *   stagger: 60,
 *   duration: 500,
 *   from: 'bottom',
 *   distance: '24px',
 * })
 * ```
 *
 * @example
 * ```ts
 * // Cancel mid-animation with an AbortController
 * const controller = new AbortController()
 * staggerIn(grid, { signal: controller.signal })
 * // later...
 * controller.abort()
 * ```
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
 *
 * The inverse of {@link staggerIn}: children fade out and slide in the
 * specified direction, animated in **reverse DOM order** (last child first)
 * to create a natural cascading exit. Driven by `requestAnimationFrame`
 * and cancellable via `AbortSignal`.
 *
 * @param container - The parent element whose direct children will be animated out.
 * @param opts      - Stagger options controlling timing, direction, and
 *                    cancellation. See {@link StaggerOptions} for defaults.
 *                    Note: `delay` is ignored for stagger-out; animation
 *                    begins immediately.
 * @returns A promise that resolves when the last child finishes its exit
 *          animation, or immediately if the container is empty or the signal
 *          is already aborted.
 *
 * @example
 * ```ts
 * import { staggerOut } from '@motioncomplex/cosmos-lib'
 *
 * // Stagger-hide a grid of star cards before removing them
 * const grid = document.querySelector<HTMLElement>('.star-card-grid')!
 * await staggerOut(grid, {
 *   stagger: 40,
 *   duration: 300,
 *   from: 'bottom',
 *   distance: '12px',
 * })
 * grid.innerHTML = ''
 * ```
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
 *
 * Applies a CSS opacity transition and toggles `pointer-events` accordingly
 * (`'auto'` when fading in, `'none'` when fading out). Resolves when the
 * `transitionend` event fires, with a safety timeout in case the event is
 * swallowed.
 *
 * @param el        - The DOM element to fade.
 * @param direction - `'in'` to fade the element to full opacity, `'out'` to
 *                    fade it to transparent.
 * @param duration  - Transition duration in milliseconds. Defaults to `300`.
 * @returns A promise that resolves when the fade completes.
 *
 * @example
 * ```ts
 * import { fade } from '@motioncomplex/cosmos-lib'
 *
 * const tooltip = document.getElementById('star-tooltip')!
 * // Show the tooltip
 * await fade(tooltip, 'in', 200)
 * // Later, hide it
 * await fade(tooltip, 'out', 200)
 * ```
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
 *
 * Both fade animations run in parallel via {@link fade}. After both complete,
 * the outgoing element is hidden with `display: none` so it no longer occupies
 * layout space.
 *
 * @param from     - The currently visible element to fade out.
 * @param to       - The incoming element to fade in. Its `display` style is
 *                   cleared before the fade begins.
 * @param duration - Transition duration in milliseconds for each fade.
 *                   Defaults to `400`.
 * @returns A promise that resolves when both fades are complete and `from` has
 *          been hidden.
 *
 * @example
 * ```ts
 * import { crossfade } from '@motioncomplex/cosmos-lib'
 *
 * const listView   = document.getElementById('star-list')!
 * const detailView = document.getElementById('star-detail')!
 *
 * // Swap from list view to detail view
 * await crossfade(listView, detailView, 350)
 * ```
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
 * Hero expand -- animates an element from its current bounding rect to fill
 * the viewport using the FLIP (First-Last-Invert-Play) technique.
 *
 * Reads the element's current position, computes the translate/scale needed
 * to cover the full viewport, and animates using a CSS `transform` transition.
 * No GSAP or other animation library is required. Styles are cleaned up
 * automatically when the transition ends (or after a safety timeout).
 *
 * Cancellable via `opts.signal`; if aborted the element stays in its
 * current state.
 *
 * @param element - The DOM element to expand (e.g. a star card thumbnail).
 * @param opts    - Animation options. See {@link HeroExpandOptions} for defaults.
 *
 * @example
 * ```ts
 * import { heroExpand } from '@motioncomplex/cosmos-lib'
 *
 * const card = document.querySelector<HTMLElement>('.star-card')!
 * heroExpand(card, {
 *   duration: 500,
 *   easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
 *   onDone: () => showFullScreenOverlay(card.dataset.starId!),
 * })
 * ```
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
 * Hero collapse -- animates an overlay element from full-viewport size down
 * into the bounding rect of a target element, producing the reverse of
 * {@link heroExpand}.
 *
 * If no `overlayEl` is supplied, a temporary full-screen `<div>` is created,
 * appended to `document.body`, and automatically removed after the animation
 * completes. When a pre-existing overlay is passed it is **not** removed --
 * only its transform and opacity are animated.
 *
 * Cancellable via `opts.signal`; if aborted, cleanup runs immediately.
 *
 * @param targetElement - The element to collapse into (e.g. the original
 *                        thumbnail card).
 * @param opts          - Animation options. See {@link HeroExpandOptions} for
 *                        defaults.
 * @param overlayEl     - Optional pre-existing overlay element. When omitted a
 *                        temporary overlay `<div>` is created and removed
 *                        automatically after animation.
 *
 * @example
 * ```ts
 * import { heroCollapse } from '@motioncomplex/cosmos-lib'
 *
 * const card    = document.querySelector<HTMLElement>('.star-card')!
 * const overlay = document.getElementById('fullscreen-overlay')!
 *
 * heroCollapse(card, {
 *   duration: 400,
 *   onDone: () => overlay.remove(),
 * }, overlay)
 * ```
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

/**
 * Legacy namespace re-exporting all transition functions.
 *
 * @deprecated Use the named exports `morph`, `staggerIn`, `staggerOut`,
 * `fade`, `crossfade`, `heroExpand`, and `heroCollapse` directly instead.
 * This object is retained solely for backwards compatibility and will be
 * removed in a future major release.
 *
 * @example
 * ```ts
 * // Before (deprecated)
 * import { Transitions } from '@motioncomplex/cosmos-lib'
 * Transitions.staggerIn(grid)
 *
 * // After (preferred)
 * import { staggerIn } from '@motioncomplex/cosmos-lib'
 * staggerIn(grid)
 * ```
 */
export const Transitions = {
  morph,
  staggerIn,
  staggerOut,
  fade,
  crossfade,
  heroExpand,
  heroCollapse,
}
