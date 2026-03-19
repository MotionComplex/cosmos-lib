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
 * Register objects with low- and high-res texture URLs, then call
 * `update(camera)` each frame inside your render loop.
 */
export class LODTextureManager {
  private _THREE:   typeof import('three')
  private _loader:  THREE.TextureLoader
  private _entries: LODEntry[] = []
  private _opts:    LODOptions

  constructor(THREE: typeof import('three'), opts: LODOptions = {}) {
    this._THREE  = THREE
    this._loader = new THREE.TextureLoader()
    this._loader.setCrossOrigin?.('anonymous')
    this._opts = opts
  }

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
   * Call this every frame in your render loop.
   * Swaps textures based on current camera distance.
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

  /** Dispose all registered textures and clear the registry. */
  dispose(): void {
    for (const entry of this._entries) {
      entry.lowTex?.dispose()
      entry.highTex?.dispose()
    }
    this._entries = []
  }
}
