import type { MorphOptions, StaggerOptions, HeroExpandOptions } from './types.js'

/**
 * Wrap a DOM mutation in the View Transitions API.
 * Falls back to a direct call on browsers that don't support it.
 */
export async function morph(
  updateFn: () => void | Promise<void>,
  opts: MorphOptions = {},
): Promise<void> {
  const { duration = 400, easing = 'ease-in-out' } = opts

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
  } = opts

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

  return new Promise(resolve => {
    children.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms cubic-bezier(0.2,0,0,1)`
        el.style.opacity    = '1'
        el.style.transform  = 'none'
        if (i === children.length - 1) {
          setTimeout(resolve, duration)
        }
      }, delay + i * stagger)
    })
    if (children.length === 0) resolve()
  })
}

/**
 * Stagger-hide all direct children of a container element.
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
  } = opts

  const AXIS: Record<NonNullable<StaggerOptions['from']>, string> = {
    top:    `translateY(-${distance})`,
    bottom: `translateY(${distance})`,
    left:   `translateX(-${distance})`,
    right:  `translateX(${distance})`,
  }
  const target = AXIS[from]

  const children = [...container.children].reverse() as HTMLElement[]

  return new Promise(resolve => {
    children.forEach((el, i) => {
      setTimeout(() => {
        el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`
        el.style.opacity    = '0'
        el.style.transform  = target
        if (i === children.length - 1) {
          setTimeout(resolve, duration)
        }
      }, i * stagger)
    })
    if (children.length === 0) resolve()
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
    setTimeout(resolve, duration)
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
  const { duration = 500, easing = 'cubic-bezier(0.4,0,0.2,1)', onDone } = opts

  const first  = element.getBoundingClientRect()
  const scaleX = window.innerWidth  / first.width
  const scaleY = window.innerHeight / first.height
  const tx     = window.innerWidth  / 2 - (first.left + first.width  / 2)
  const ty     = window.innerHeight / 2 - (first.top  + first.height / 2)

  element.style.transformOrigin = 'center center'
  element.style.transition      = 'none'
  element.style.transform       = 'translate(0,0) scale(1,1)'

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.style.transition = `transform ${duration}ms ${easing}`
      element.style.transform  = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`
      setTimeout(() => {
        element.style.transform  = ''
        element.style.transition = ''
        onDone?.()
      }, duration)
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
  const { duration = 400, easing = 'cubic-bezier(0.4,0,0.2,1)', onDone } = opts

  const final  = targetElement.getBoundingClientRect()
  const scaleX = final.width  / window.innerWidth
  const scaleY = final.height / window.innerHeight
  const tx     = final.left + final.width  / 2 - window.innerWidth  / 2
  const ty     = final.top  + final.height / 2 - window.innerHeight / 2

  const overlay = overlayEl ?? document.createElement('div')
  if (!overlayEl) {
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

  requestAnimationFrame(() => {
    overlay.style.transform = `translate(${tx}px, ${ty}px) scale(${scaleX}, ${scaleY})`
    overlay.style.opacity   = '0'
    setTimeout(() => {
      if (!overlayEl) overlay.remove()
      onDone?.()
    }, duration + 50)
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
