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
 * Animates both camera position and OrbitControls target simultaneously
 * using a pure cubic Bézier easing — no GSAP dependency.
 */
export declare class CameraFlight {
    private _camera;
    private _controls;
    private _THREE;
    private _active;
    private _orbitHandles;
    constructor(camera: THREE.Camera, controls: OrbitControls, THREE: typeof import('three'));
    /**
     * Fly the camera to a world position while pointing at a target.
     *
     * @param toPosition  destination camera position
     * @param toTarget    destination look-at point (OrbitControls target)
     * @param opts        animation options
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
     * Continuously orbit the camera around a world point.
     * Uses delta-time for frame-rate independent rotation.
     * Returns a `{ stop }` handle to halt the orbit.
     */
    orbitAround(center: {
        x: number;
        y: number;
        z: number;
    }, opts?: OrbitAroundOptions): StopHandle;
    /** Cancel any in-progress flight. */
    cancel(): void;
    /** Stop all active orbits and cancel any in-progress flight. */
    dispose(): void;
    private _makeEase;
}
export {};
