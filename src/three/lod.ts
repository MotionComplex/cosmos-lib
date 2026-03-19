import type * as THREE from 'three'

interface LODEntry {
  mesh:        THREE.Mesh
  lodDistance: number
  lowUrl:      string
  highUrl:     string
  currentLOD:  'low' | 'high'
  loading:     boolean
  lowTex:      THREE.Texture
  highTex:     THREE.Texture | null
}

export interface LODOptions {
  /** Callback when a high-res texture fails to load. */
  onError?: (mesh: THREE.Mesh, error: unknown) => void
  /** Timeout in milliseconds for texture loads (0 = no timeout). */
  timeout?: number
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
export class LODTextureManager {
  private _THREE:   typeof import('three')
  private _loader:  THREE.TextureLoader
  private _entries: LODEntry[] = []
  private _opts:    LODOptions

  /**
   * @param THREE - The Three.js module, passed at runtime to avoid a hard
   *                dependency on `three` in the library bundle.
   * @param opts  - Optional error and timeout configuration.
   */
  constructor(THREE: typeof import('three'), opts: LODOptions = {}) {
    this._THREE  = THREE
    this._loader = new THREE.TextureLoader()
    this._loader.setCrossOrigin?.('anonymous')
    this._opts = opts
  }

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
  register(
    mesh:        THREE.Mesh,
    lowResUrl:   string,
    highResUrl:  string,
    lodDistance: number,
  ): void {
    const THREE = this._THREE
    const t = this._loader.load(lowResUrl)
    t.colorSpace = THREE.SRGBColorSpace
    const mat = mesh.material as THREE.MeshStandardMaterial
    mat.map = t
    mat.needsUpdate = true

    this._entries.push({
      mesh, lodDistance, lowUrl: lowResUrl, highUrl: highResUrl,
      currentLOD: 'low', loading: false, lowTex: t, highTex: null,
    })
  }

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
  unregister(mesh: THREE.Mesh): void {
    const idx = this._entries.findIndex(e => e.mesh === mesh)
    if (idx === -1) return
    const entry = this._entries[idx]!
    entry.lowTex?.dispose()
    entry.highTex?.dispose()
    this._entries.splice(idx, 1)
  }

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
  update(camera: THREE.Camera): void {
    const THREE = this._THREE
    const cameraPos = camera.position

    for (const entry of this._entries) {
      const worldPos = new THREE.Vector3()
      entry.mesh.getWorldPosition(worldPos)
      const dist = cameraPos.distanceTo(worldPos)

      // Switch to high-res when camera is close enough
      if (dist < entry.lodDistance && entry.currentLOD === 'low' && !entry.loading) {
        entry.loading = true

        // Set up optional timeout
        let timedOut = false
        let timeoutId: ReturnType<typeof setTimeout> | null = null
        if (this._opts.timeout && this._opts.timeout > 0) {
          timeoutId = setTimeout(() => {
            timedOut = true
            entry.loading = false
            this._opts.onError?.(entry.mesh, new Error(`Texture load timed out after ${this._opts.timeout}ms`))
          }, this._opts.timeout)
        }

        this._loader.load(
          entry.highUrl,
          texture => {
            if (timedOut) { texture.dispose(); return }
            if (timeoutId) clearTimeout(timeoutId)
            texture.colorSpace = THREE.SRGBColorSpace
            entry.highTex      = texture
            const mat = entry.mesh.material as THREE.MeshStandardMaterial
            mat.map = texture
            mat.needsUpdate = true
            entry.currentLOD = 'high'
            entry.loading    = false
          },
          undefined,
          (error) => {
            if (timedOut) return
            if (timeoutId) clearTimeout(timeoutId)
            entry.loading = false
            this._opts.onError?.(entry.mesh, error)
          },
        )
      }

      // Revert to low-res when camera moves away (with hysteresis to prevent thrashing)
      if (dist > entry.lodDistance * 1.6 && entry.currentLOD === 'high') {
        const mat = entry.mesh.material as THREE.MeshStandardMaterial
        mat.map = entry.lowTex
        mat.needsUpdate = true
        entry.highTex?.dispose()
        entry.highTex    = null
        entry.currentLOD = 'low'
      }
    }
  }

  /**
   * Dispose all registered textures (both low- and high-res) and clear the
   * internal registry.
   *
   * After calling this, no further {@link update} calls will have any effect
   * until new meshes are registered.
   */
  dispose(): void {
    for (const entry of this._entries) {
      entry.lowTex?.dispose()
      entry.highTex?.dispose()
    }
    this._entries = []
  }
}
