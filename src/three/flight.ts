import type * as THREE from 'three'
import type { FlightOptions, OrbitAroundOptions } from './types.js'

type OrbitControls = {
  target:  THREE.Vector3
  update:  () => void
  enablePan:    boolean
  enableZoom:   boolean
  enableRotate: boolean
}

type StopHandle = { stop: () => void }

/**
 * Smooth camera flight controller.
 *
 * Animates both camera position and `OrbitControls` target simultaneously
 * using a pure cubic Bezier easing curve -- no GSAP or tween library required.
 * Supports one-shot flights ({@link flyTo}) and continuous orbits
 * ({@link orbitAround}).
 *
 * @example
 * ```ts
 * import * as THREE from 'three'
 * import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
 * import { CameraFlight } from '@motioncomplex/cosmos-lib/three'
 *
 * const camera   = new THREE.PerspectiveCamera(60, w / h, 0.1, 100_000)
 * const controls = new OrbitControls(camera, renderer.domElement)
 * const flight   = new CameraFlight(camera, controls, THREE)
 *
 * // Fly to Mars
 * flight.flyTo(
 *   { x: 200, y: 50, z: 200 },
 *   { x: 180, y: 0,  z: 0 },
 *   { duration: 3000, easing: 'inOut', onDone: () => console.log('arrived') },
 * )
 *
 * // Orbit around a planet
 * const handle = flight.orbitAround(
 *   { x: 180, y: 0, z: 0 },
 *   { radius: 40, speed: 0.0008 },
 * )
 * // Stop orbiting later
 * handle.stop()
 * ```
 */
export class CameraFlight {
  private _camera:   THREE.Camera
  private _controls: OrbitControls
  private _THREE:    typeof import('three')
  private _active  = false
  private _orbitHandles = new Set<StopHandle>()

  /**
   * @param camera   - The Three.js camera to animate.
   * @param controls - An `OrbitControls`-compatible object whose `target` is
   *                   updated in sync with the camera position.
   * @param THREE    - The Three.js module, passed at runtime to avoid a hard
   *                   dependency on `three` in the library bundle.
   */
  constructor(
    camera:   THREE.Camera,
    controls: OrbitControls,
    THREE:    typeof import('three'),
  ) {
    this._camera   = camera
    this._controls = controls
    this._THREE    = THREE
  }

  /**
   * Fly the camera to a world-space position while smoothly re-targeting the
   * look-at point. The animation uses `requestAnimationFrame` internally and
   * is frame-rate independent.
   *
   * Only one flight can be active at a time; starting a new flight implicitly
   * cancels any in-progress one.
   *
   * @param toPosition - Destination camera position in world coordinates.
   * @param toTarget   - Destination look-at point (`OrbitControls.target`).
   * @param opts       - Animation options (duration, easing curve, completion callback).
   * @returns `void` -- listen for completion via `opts.onDone`.
   */
  flyTo(
    toPosition: { x: number; y: number; z: number },
    toTarget:   { x: number; y: number; z: number },
    opts: FlightOptions = {},
  ): void {
    const { duration = 2000, easing = 'inOut', onDone } = opts
    const THREE = this._THREE

    const fromPos    = (this._camera as THREE.PerspectiveCamera).position.clone()
    const fromTarget = this._controls.target.clone()
    const endPos     = new THREE.Vector3(toPosition.x, toPosition.y, toPosition.z)
    const endTarget  = new THREE.Vector3(toTarget.x,   toTarget.y,   toTarget.z)

    const ease = this._makeEase(easing)
    const start = performance.now()
    this._active = true

    const tick = (now: number): void => {
      if (!this._active) return
      const t  = Math.min((now - start) / duration, 1)
      const et = ease(t)

      ;(this._camera as THREE.PerspectiveCamera).position.lerpVectors(fromPos, endPos, et)
      this._controls.target.lerpVectors(fromTarget, endTarget, et)
      this._controls.update()

      if (t < 1) {
        requestAnimationFrame(tick)
      } else {
        this._active = false
        onDone?.()
      }
    }
    requestAnimationFrame(tick)
  }

  /**
   * Continuously orbit the camera around a world-space point.
   *
   * Uses delta-time for frame-rate independent rotation. Multiple orbits
   * can be active simultaneously; each returns an independent stop handle.
   * All active orbits are terminated when {@link dispose} is called.
   *
   * @param center - The world-space point to orbit around.
   * @param opts   - Orbit configuration (radius, angular speed, elevation).
   * @returns A `{ stop }` handle. Call `handle.stop()` to halt the orbit.
   */
  orbitAround(
    center: { x: number; y: number; z: number },
    opts: OrbitAroundOptions = {},
  ): StopHandle {
    const { radius = 200, speed = 0.0005, elevation = 0.2 } = opts
    const THREE    = this._THREE
    const c        = new THREE.Vector3(center.x, center.y, center.z)
    let angle      = 0
    let running    = true
    let lastTime   = performance.now()

    const handle: StopHandle = {
      stop: () => {
        running = false
        this._orbitHandles.delete(handle)
      },
    }
    this._orbitHandles.add(handle)

    const tick = (now: number): void => {
      if (!running) return
      const dt = (now - lastTime) / 1000 // seconds
      lastTime = now
      angle += speed * dt * 60 // normalized to 60fps equivalent
      ;(this._camera as THREE.PerspectiveCamera).position.set(
        c.x + Math.cos(angle) * radius,
        c.y + elevation * radius,
        c.z + Math.sin(angle) * radius,
      )
      ;(this._camera as THREE.PerspectiveCamera).lookAt(c)
      this._controls.target.copy(c)
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    return handle
  }

  /**
   * Cancel any in-progress {@link flyTo} animation.
   *
   * Active {@link orbitAround} loops are **not** affected -- use
   * {@link dispose} to stop everything.
   */
  cancel(): void {
    this._active = false
  }

  /**
   * Stop all active orbits and cancel any in-progress flight.
   *
   * Call this when tearing down the scene or when the `CameraFlight`
   * instance is no longer needed to ensure no lingering `requestAnimationFrame`
   * callbacks remain.
   */
  dispose(): void {
    this.cancel()
    for (const h of this._orbitHandles) h.stop()
    this._orbitHandles.clear()
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private _makeEase(type: FlightOptions['easing']): (t: number) => number {
    switch (type) {
      case 'in':  return (t) => t * t * t
      case 'out': return (t) => 1 - (1 - t) ** 3
      default:    return (t) => t < 0.5
        ? 4 * t ** 3
        : 1 - (-2 * t + 2) ** 3 / 2
    }
  }
}
