import type * as THREE from 'three';
export interface LODOptions {
    /** Callback when a high-res texture fails to load. */
    onError?: (mesh: THREE.Mesh, error: unknown) => void;
    /** Timeout in milliseconds for texture loads (0 = no timeout). */
    timeout?: number;
}
/**
 * Manages texture resolution for a set of meshes based on camera distance.
 * Register objects with low- and high-res texture URLs, then call
 * `update(camera)` each frame inside your render loop.
 */
export declare class LODTextureManager {
    private _THREE;
    private _loader;
    private _entries;
    private _opts;
    constructor(THREE: typeof import('three'), opts?: LODOptions);
    /**
     * Register a mesh for LOD management.
     * The low-res texture is loaded immediately.
     * The high-res texture is loaded lazily when the camera enters `lodDistance`.
     *
     * @param mesh          target mesh (must have a MeshStandardMaterial or similar)
     * @param lowResUrl     low-resolution texture URL — loaded immediately
     * @param highResUrl    high-resolution texture URL — loaded on demand
     * @param lodDistance   camera distance threshold in scene units
     */
    register(mesh: THREE.Mesh, lowResUrl: string, highResUrl: string, lodDistance: number): void;
    /**
     * Unregister a mesh from LOD management and dispose its textures.
     */
    unregister(mesh: THREE.Mesh): void;
    /**
     * Call this every frame in your render loop.
     * Swaps textures based on current camera distance.
     */
    update(camera: THREE.Camera): void;
    /** Dispose all registered textures and clear the registry. */
    dispose(): void;
}
