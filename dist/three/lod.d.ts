import type * as THREE from 'three';
export interface LODOptions {
    /** Callback when a high-res texture fails to load. */
    onError?: (mesh: THREE.Mesh, error: unknown) => void;
    /** Timeout in milliseconds for texture loads (0 = no timeout). */
    timeout?: number;
}
/**
 * Manages texture resolution for a set of meshes based on camera distance.
 *
 * Register objects with low- and high-resolution texture URLs via
 * {@link register}. Low-res textures are loaded eagerly; high-res textures
 * are loaded lazily the first time the camera enters the threshold distance.
 * A 1.6x hysteresis factor prevents texture thrashing when the camera
 * hovers near the boundary.
 *
 * Call {@link update} once per frame in your render loop.
 *
 * @example
 * ```ts
 * import * as THREE from 'three'
 * import { LODTextureManager } from '@motioncomplex/cosmos-lib/three'
 *
 * const lod = new LODTextureManager(THREE, {
 *   timeout: 8000,
 *   onError: (mesh, err) => console.warn('LOD load failed', mesh.name, err),
 * })
 *
 * lod.register(earthMesh, '/tex/earth-1k.jpg', '/tex/earth-8k.jpg', 500)
 * lod.register(marsMesh,  '/tex/mars-1k.jpg',  '/tex/mars-8k.jpg',  400)
 *
 * // In render loop:
 * function animate() {
 *   lod.update(camera)
 *   renderer.render(scene, camera)
 *   requestAnimationFrame(animate)
 * }
 *
 * // On teardown:
 * lod.dispose()
 * ```
 */
export declare class LODTextureManager {
    private _THREE;
    private _loader;
    private _entries;
    private _opts;
    /**
     * @param THREE - The Three.js module, passed at runtime to avoid a hard
     *                dependency on `three` in the library bundle.
     * @param opts  - Optional error and timeout configuration.
     */
    constructor(THREE: typeof import('three'), opts?: LODOptions);
    /**
     * Register a mesh for LOD texture management.
     *
     * The low-res texture is loaded immediately and applied to the mesh's
     * material. The high-res texture is loaded lazily the first time the camera
     * comes within `lodDistance` of the mesh.
     *
     * @param mesh        - Target mesh whose material will be swapped. Must use a
     *                      `MeshStandardMaterial` (or compatible) with a `map` slot.
     * @param lowResUrl   - URL for the low-resolution texture, loaded eagerly.
     * @param highResUrl  - URL for the high-resolution texture, loaded on demand.
     * @param lodDistance - Camera distance threshold (in scene units) at which the
     *                      high-res texture is loaded and applied.
     */
    register(mesh: THREE.Mesh, lowResUrl: string, highResUrl: string, lodDistance: number): void;
    /**
     * Unregister a mesh from LOD management and dispose its textures.
     *
     * After calling this, the mesh's material `map` will still reference the
     * last-applied texture, but the texture GPU memory is freed. Assign a new
     * texture or remove the mesh from the scene as needed.
     *
     * @param mesh - The mesh previously passed to {@link register}. If the mesh
     *               was never registered, this is a no-op.
     */
    unregister(mesh: THREE.Mesh): void;
    /**
     * Evaluate all registered meshes and swap textures as needed.
     *
     * Call this once per frame inside your render loop. For each mesh the
     * manager checks the camera-to-mesh distance and:
     * - loads the high-res texture when the camera enters `lodDistance`, and
     * - reverts to the low-res texture when the camera moves beyond
     *   `lodDistance * 1.6` (hysteresis to prevent thrashing).
     *
     * @param camera - The active Three.js camera used for distance checks.
     */
    update(camera: THREE.Camera): void;
    /**
     * Dispose all registered textures (both low- and high-res) and clear the
     * internal registry.
     *
     * After calling this, no further {@link update} calls will have any effect
     * until new meshes are registered.
     */
    dispose(): void;
}
