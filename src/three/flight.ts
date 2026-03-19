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
 * Animates both camera position and OrbitControls target simultaneously
 * using a pure cubic Bézier easing — no GSAP dependency.
 */
export class CameraFlight {
  private _camera:   THREE.Camera
  private _controls: OrbitControls
  private _THREE:    typeof import('three')
  private _active  = false

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
   * Fly the camera to a world position while pointing at a target.
   *
   * @param toPosition  destination camera position
   * @param toTarget    destination look-at point (OrbitControls target)
   * @param opts        animation options
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
   * Continuously orbit the camera around a world point.
   * Returns a `{ stop }` handle to halt the orbit.
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

    const tick = (): void => {
      if (!running) return
      angle += speed
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

    return { stop: () => { running = false } }
  }

  /** Cancel any in-progress flight. */
  cancel(): void {
    this._active = false
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
