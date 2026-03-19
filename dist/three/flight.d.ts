import type * as THREE from 'three';
import type { FlightOptions, OrbitAroundOptions } from './types.js';
type OrbitControls = {
    target: THREE.Vector3;
    update: () => void;
    enablePan: boolean;
    enableZoom: boolean;
    enableRotate: boolean;
};
type StopHandle = {
    stop: () => void;
};
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
export declare class CameraFlight {
    private _camera;
    private _controls;
    private _THREE;
    private _active;
    private _orbitHandles;
    /**
     * @param camera   - The Three.js camera to animate.
     * @param controls - An `OrbitControls`-compatible object whose `target` is
     *                   updated in sync with the camera position.
     * @param THREE    - The Three.js module, passed at runtime to avoid a hard
     *                   dependency on `three` in the library bundle.
     */
    constructor(camera: THREE.Camera, controls: OrbitControls, THREE: typeof import('three'));
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
    flyTo(toPosition: {
        x: number;
        y: number;
        z: number;
    }, toTarget: {
        x: number;
        y: number;
        z: number;
    }, opts?: FlightOptions): void;
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
    orbitAround(center: {
        x: number;
        y: number;
        z: number;
    }, opts?: OrbitAroundOptions): StopHandle;
    /**
     * Cancel any in-progress {@link flyTo} animation.
     *
     * Active {@link orbitAround} loops are **not** affected -- use
     * {@link dispose} to stop everything.
     */
    cancel(): void;
    /**
     * Stop all active orbits and cancel any in-progress flight.
     *
     * Call this when tearing down the scene or when the `CameraFlight`
     * instance is no longer needed to ensure no lingering `requestAnimationFrame`
     * callbacks remain.
     */
    dispose(): void;
    private _makeEase;
}
export {};
