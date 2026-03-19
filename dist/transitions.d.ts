import type { MorphOptions, StaggerOptions, HeroExpandOptions } from './types.js';
/**
 * Wrap a DOM mutation in the View Transitions API.
 * Falls back to a direct call on browsers that don't support it.
 */
export declare function morph(updateFn: () => void | Promise<void>, opts?: MorphOptions): Promise<void>;
/**
 * Stagger-reveal all direct children of a container element.
 * Uses requestAnimationFrame for robust timing.
 * Returns a Promise that resolves when the last element finishes animating.
 */
export declare function staggerIn(container: HTMLElement, opts?: StaggerOptions): Promise<void>;
/**
 * Stagger-hide all direct children of a container element.
 * Uses requestAnimationFrame for robust timing.
 * Returns a Promise that resolves when the last element finishes animating.
 */
export declare function staggerOut(container: HTMLElement, opts?: StaggerOptions): Promise<void>;
/**
 * Fade an element in or out.
 * Returns a Promise that resolves when the animation finishes.
 */
export declare function fade(el: HTMLElement, direction: 'in' | 'out', duration?: number): Promise<void>;
/**
 * Crossfade two elements: fades `from` out while fading `to` in simultaneously.
 * Hides `from` via display:none after completion.
 */
export declare function crossfade(from: HTMLElement, to: HTMLElement, duration?: number): Promise<void>;
/**
 * Hero expand — animates an element from its current bounding rect to fill
 * the viewport using the FLIP technique (no GSAP dependency).
 */
export declare function heroExpand(element: HTMLElement, opts?: HeroExpandOptions): void;
/**
 * Hero collapse — animates an overlay element into the bounds of a target element.
 * The overlay is removed from the DOM after the animation completes.
 *
 * @param targetElement  the element to collapse into
 * @param overlayEl      the full-screen overlay element (default: a new div)
 */
export declare function heroCollapse(targetElement: HTMLElement, opts?: HeroExpandOptions, overlayEl?: HTMLElement): void;
/** @deprecated Use named exports. Kept for backwards compatibility. */
export declare const Transitions: {
    morph: typeof morph;
    staggerIn: typeof staggerIn;
    staggerOut: typeof staggerOut;
    fade: typeof fade;
    crossfade: typeof crossfade;
    heroExpand: typeof heroExpand;
    heroCollapse: typeof heroCollapse;
};
