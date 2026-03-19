# Transitions API

DOM animation utilities for cosmos-lib, including View Transitions API integration, staggered entrance/exit animations, fades, crossfades, and FLIP-based hero expand/collapse.

```ts
import {
  morph,
  staggerIn,
  staggerOut,
  fade,
  crossfade,
  heroExpand,
  heroCollapse,
} from '@motioncomplex/cosmos-lib'
```

All transition functions work with standard DOM elements, use `requestAnimationFrame` for frame-accurate timing, and support cancellation via `AbortSignal` where noted.

---

## `morph`

Wrap a DOM mutation in the View Transitions API. When the browser supports `document.startViewTransition`, the callback runs inside a view transition for an automatic cross-fade between old and new DOM states. On unsupported browsers the callback is invoked directly as a no-op fallback.

```ts
async function morph(
  updateFn: () => void | Promise<void>,
  opts?: MorphOptions,
): Promise<void>
```

### `MorphOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `duration` | `number` | `400` | Animation duration in milliseconds |
| `easing` | `string` | `'ease-in-out'` | CSS easing function |
| `signal` | `AbortSignal` | -- | Abort signal to cancel the transition |

**View Transitions API fallback:** When the browser does not support `document.startViewTransition`, `updateFn` is called synchronously and the promise resolves immediately. No animation occurs, but the DOM update still applies. This makes `morph` safe to use unconditionally.

**CSS variables:** Sets `--cosmos-vt-duration` and `--cosmos-vt-easing` on `document.documentElement` so companion stylesheets can reference them.

```ts
const controller = new AbortController()

await morph(() => {
  panel.innerHTML = renderStarDetail(nextStar)
}, { duration: 350, easing: 'ease-out', signal: controller.signal })
```

---

## `staggerIn`

Stagger-reveal all direct children of a container element. Each child fades in and slides from the specified direction with a configurable inter-child delay, producing a cascading entrance effect.

```ts
function staggerIn(
  container: HTMLElement,
  opts?: StaggerOptions,
): Promise<void>
```

### `StaggerOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `delay` | `number` | `0` | Initial delay before the first child animates (ms) |
| `stagger` | `number` | `60` | Delay between successive children (ms) |
| `duration` | `number` | `500` | Animation duration per child (ms) |
| `from` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Direction children slide in from |
| `distance` | `string` | `'20px'` | CSS distance to slide (e.g. `'20px'`, `'2rem'`) |
| `signal` | `AbortSignal` | -- | Abort signal to cancel mid-animation |

When cancelled via the abort signal, all children are immediately reset to their final visible state (`opacity: 1`, `transform: none`).

```ts
// Stagger-reveal a grid of star cards from the bottom
const grid = document.querySelector<HTMLElement>('.star-card-grid')!
await staggerIn(grid, {
  delay: 100,
  stagger: 60,
  duration: 500,
  from: 'bottom',
  distance: '24px',
})
```

```ts
// Cancel mid-animation
const controller = new AbortController()
staggerIn(grid, { signal: controller.signal })
// later...
controller.abort()
```

---

## `staggerOut`

Stagger-hide all direct children of a container. The inverse of `staggerIn`: children fade out and slide in the specified direction, animated in reverse DOM order (last child first) for a natural cascading exit.

```ts
function staggerOut(
  container: HTMLElement,
  opts?: StaggerOptions,
): Promise<void>
```

Uses the same `StaggerOptions` as `staggerIn`, with different defaults:

| Property | Default (staggerOut) |
|----------|---------------------|
| `stagger` | `40` |
| `duration` | `300` |
| `distance` | `'12px'` |

Note: the `delay` property is ignored for `staggerOut`; animation begins immediately.

```ts
const grid = document.querySelector<HTMLElement>('.star-card-grid')!
await staggerOut(grid, {
  stagger: 40,
  duration: 300,
  from: 'bottom',
  distance: '12px',
})
grid.innerHTML = ''
```

---

## `fade`

Fade an element in or out. Applies a CSS opacity transition and toggles `pointer-events` accordingly (`'auto'` when fading in, `'none'` when fading out).

```ts
function fade(
  el: HTMLElement,
  direction: 'in' | 'out',
  duration?: number, // default: 300
): Promise<void>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `el` | `HTMLElement` | -- | The DOM element to fade |
| `direction` | `'in' \| 'out'` | -- | Fade direction |
| `duration` | `number` | `300` | Transition duration in milliseconds |

Resolves when the `transitionend` event fires, with a safety timeout fallback in case the event is swallowed.

```ts
const tooltip = document.getElementById('star-tooltip')!

// Show the tooltip
await fade(tooltip, 'in', 200)

// Later, hide it
await fade(tooltip, 'out', 200)
```

---

## `crossfade`

Crossfade two elements: fades `from` out while fading `to` in simultaneously. After both complete, the outgoing element is hidden with `display: none`.

```ts
async function crossfade(
  from: HTMLElement,
  to: HTMLElement,
  duration?: number, // default: 400
): Promise<void>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `from` | `HTMLElement` | -- | Currently visible element to fade out |
| `to` | `HTMLElement` | -- | Incoming element to fade in |
| `duration` | `number` | `400` | Transition duration for each fade (ms) |

The incoming element's `display` style is cleared before the fade begins. After both fades complete, `from.style.display` is set to `'none'`.

```ts
const listView   = document.getElementById('star-list')!
const detailView = document.getElementById('star-detail')!

// Swap from list view to detail view
await crossfade(listView, detailView, 350)
```

---

## `heroExpand`

Animate an element from its current bounding rect to fill the viewport using the FLIP (First-Last-Invert-Play) technique. No GSAP or other animation library required.

```ts
function heroExpand(
  element: HTMLElement,
  opts?: HeroExpandOptions,
): void
```

### `HeroExpandOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `duration` | `number` | `500` | Animation duration in milliseconds |
| `easing` | `string` | `'cubic-bezier(0.4,0,0.2,1)'` | CSS easing function |
| `onDone` | `() => void` | -- | Callback invoked when the animation completes |
| `signal` | `AbortSignal` | -- | Abort signal to cancel the animation |

Styles are cleaned up automatically after the transition ends (or after a safety timeout).

```ts
const card = document.querySelector<HTMLElement>('.star-card')!
heroExpand(card, {
  duration: 500,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  onDone: () => showFullScreenOverlay(card.dataset.starId!),
})
```

---

## `heroCollapse`

Animate an overlay element from full-viewport size down into the bounding rect of a target element. This is the reverse of `heroExpand`.

```ts
function heroCollapse(
  targetElement: HTMLElement,
  opts?: HeroExpandOptions,
  overlayEl?: HTMLElement,
): void
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `targetElement` | `HTMLElement` | Yes | Element to collapse into (e.g. original thumbnail) |
| `opts` | `HeroExpandOptions` | No | Animation options (default duration: `400`) |
| `overlayEl` | `HTMLElement` | No | Pre-existing overlay element |

If no `overlayEl` is supplied, a temporary full-screen `<div>` is created, appended to `document.body`, and automatically removed after the animation completes. When a pre-existing overlay is passed, it is not removed -- only its transform and opacity are animated.

```ts
const card    = document.querySelector<HTMLElement>('.star-card')!
const overlay = document.getElementById('fullscreen-overlay')!

heroCollapse(card, {
  duration: 400,
  onDone: () => overlay.remove(),
}, overlay)
```

---

## View Transitions API Usage and Fallback Behaviour

The `morph` function is the primary integration point with the View Transitions API. Here is how it works:

1. **Supported browsers:** When `document.startViewTransition` exists, `morph` wraps the DOM mutation callback inside a view transition. The browser captures a screenshot of the old state, applies the callback, then cross-fades to the new state automatically.

2. **Unsupported browsers:** When `startViewTransition` is not available, the callback is called directly. The DOM update happens synchronously with no animation. This means `morph` is always safe to call -- it degrades gracefully.

3. **CSS companion:** The CSS custom properties `--cosmos-vt-duration` and `--cosmos-vt-easing` are set on the root element so you can reference them in `::view-transition-*` pseudo-element styles:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: var(--cosmos-vt-duration, 400ms);
  animation-timing-function: var(--cosmos-vt-easing, ease-in-out);
}
```

The other transition functions (`staggerIn`, `staggerOut`, `fade`, `crossfade`, `heroExpand`, `heroCollapse`) do not use the View Transitions API. They use standard CSS transitions driven by `requestAnimationFrame` and work in all modern browsers.

---

## Legacy Namespace

The `Transitions` object re-exports all functions for backwards compatibility. Prefer the named exports.

```ts
// Deprecated
import { Transitions } from '@motioncomplex/cosmos-lib'
Transitions.staggerIn(grid)

// Preferred
import { staggerIn } from '@motioncomplex/cosmos-lib'
staggerIn(grid)
```
