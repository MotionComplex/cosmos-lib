import type * as THREE from 'three'
import { Media } from '../media.js'
import { SHADERS } from './shaders.js'
import type {
  PlanetOptions, PlanetResult,
  NebulaOptions, NebulaResult,
  StarFieldOptions, OrbitOptions,
} from './types.js'

/**
 * Create a planet/star mesh.
 * Supports textures, bump maps, atmospheric glow, and ring systems.
 */
export function createPlanet(opts: PlanetOptions, THREE: typeof import('three')): PlanetResult {
  const group      = new THREE.Group()
  const loader     = new THREE.TextureLoader()
  const toDispose: Array<{ dispose: () => void }> = []

  loader.setCrossOrigin?.('anonymous')

  let mat: THREE.Material
  if (opts.isBlackHole) {
    mat = new THREE.MeshBasicMaterial({ color: 0x000000 })
  } else {
    const stdMat = new THREE.MeshStandardMaterial({
      color:     opts.color ?? 0xffffff,
      roughness: 0.8,
      metalness: 0.1,
    })
    if (opts.textureUrls?.length) {
      Media.chainLoad(opts.textureUrls).then(url => {
        const t = loader.load(url)
        t.colorSpace = THREE.SRGBColorSpace
        stdMat.map = t
        stdMat.needsUpdate = true
        toDispose.push(t)
      }).catch(() => { /* all URLs failed — stays untextured */ })
    } else if (opts.textureUrl) {
      const t = loader.load(opts.textureUrl)
      t.colorSpace = THREE.SRGBColorSpace
      stdMat.map = t
      toDispose.push(t)
    }
    if (opts.bumpUrl) {
      const b = loader.load(opts.bumpUrl)
      stdMat.bumpMap   = b
      stdMat.bumpScale = 0.025
      toDispose.push(b)
    }
    if (opts.emissive !== undefined) {
      stdMat.emissive          = new THREE.Color(opts.emissive)
      stdMat.emissiveIntensity = opts.emissiveIntensity ?? 1.0
    }
    mat = stdMat
  }
  toDispose.push(mat)

  const geo  = new THREE.SphereGeometry(opts.radius, 64, 64)
  const mesh = new THREE.Mesh(geo, mat)
  group.add(mesh)
  toDispose.push(geo)

  if (opts.atmosphere && !opts.isBlackHole) {
    const atmMesh = createAtmosphere(
      opts.radius,
      opts.atmosphere.color,
      THREE,
      opts.atmosphere.intensity ?? 1.2,
    )
    group.add(atmMesh)
    ;(atmMesh.userData._toDispose as Array<{ dispose: () => void }> ?? [])
      .forEach(d => toDispose.push(d))
  }

  if (opts.rings) {
    const { inner, outer, color, opacity, tilt = 0 } = opts.rings
    const rGeo = new THREE.RingGeometry(opts.radius * inner, opts.radius * outer, 128)

    // Remap UVs so textures map correctly along the radial axis
    const pos = rGeo.attributes['position'] as THREE.BufferAttribute
    const uv  = rGeo.attributes['uv']       as THREE.BufferAttribute
    const v3  = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i)
      const r = v3.length()
      const u = (r - opts.radius * inner) / (opts.radius * (outer - inner))
      uv.setXY(i, u, 0.5)
    }
    uv.needsUpdate = true
    rGeo.rotateX(-Math.PI / 2)

    const rMat  = new THREE.MeshStandardMaterial({
      color, transparent: true, opacity, side: THREE.DoubleSide,
    })
    const rMesh = new THREE.Mesh(rGeo, rMat)
    rMesh.rotation.x = tilt
    group.add(rMesh)
    toDispose.push(rGeo, rMat)
  }

  return {
    group,
    mesh,
    dispose: () => toDispose.forEach(o => o.dispose()),
  }
}

/**
 * Create a nebula / galaxy sprite using additive blending.
 * Attempts each URL in `textureUrls` in order, using the first that loads.
 */
export function createNebula(opts: NebulaOptions, THREE: typeof import('three')): NebulaResult {
  const group  = new THREE.Group()
  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin?.('anonymous')

  const mat = new THREE.SpriteMaterial({
    transparent: true,
    blending:    THREE.AdditiveBlending,
    opacity:     opts.opacity ?? 0.85,
    depthWrite:  false,
    color:       0xffffff,
  })

  Media.chainLoad(opts.textureUrls).then(url => {
    loader.load(url, (texture: THREE.Texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      mat.map = texture
      mat.needsUpdate = true
    })
  }).catch(() => { /* all URLs failed — sprite stays untextured */ })

  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(opts.radius * (opts.aspect ?? 1), opts.radius, 1)
  sprite.renderOrder = 100
  group.add(sprite)

  const hitGeo  = new THREE.SphereGeometry(opts.radius * 0.5, 16, 16)
  const hitMat  = new THREE.MeshBasicMaterial({ visible: false })
  const hitMesh = new THREE.Mesh(hitGeo, hitMat)
  group.add(hitMesh)

  return {
    group,
    sprite,
    hitMesh,
    dispose: () => {
      mat.map?.dispose()
      mat.dispose()
      hitGeo.dispose()
      hitMat.dispose()
    },
  }
}

/**
 * Create an atmospheric glow rim around a sphere.
 * Uses a custom shader with additive blending on the back face.
 */
export function createAtmosphere(
  radius: number,
  colorHex: number,
  THREE: typeof import('three'),
  intensity = 1.2,
): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius * 1.06, 64, 64)
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uAtmColor:  { value: new THREE.Color(colorHex) },
      uIntensity: { value: intensity },
    },
    vertexShader:   SHADERS.atmosphereVert,
    fragmentShader: SHADERS.atmosphereFrag,
    side:           THREE.BackSide,
    blending:       THREE.AdditiveBlending,
    transparent:    true,
    depthWrite:     false,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.userData['_toDispose'] = [geo, mat]
  return mesh
}

/**
 * Create a randomised star-field point cloud.
 */
export function createStarField(
  opts: StarFieldOptions = {},
  THREE: typeof import('three'),
): THREE.Points {
  const {
    count     = 40_000,
    minRadius = 30_000,
    maxRadius = 150_000,
    sizeMin   = 1.5,
    sizeMax   = 4.0,
    opacity   = 0.7,
  } = opts

  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const r  = minRadius + Math.random() * (maxRadius - minRadius)
    const th = 2 * Math.PI * Math.random()
    const ph = Math.acos(2 * Math.random() - 1)
    pos[i * 3]     = r * Math.sin(ph) * Math.cos(th)
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
    pos[i * 3 + 2] = r * Math.cos(ph)

    const raw = Math.random()
    const c   = new THREE.Color(raw > 0.7 ? 0xaaccff : raw > 0.5 ? 0xffddaa : 0xffffff)
    const b   = 0.5 + Math.random() * 0.5
    col[i * 3]     = c.r * b
    col[i * 3 + 1] = c.g * b
    col[i * 3 + 2] = c.b * b
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3))

  const mat = new THREE.PointsMaterial({
    size:            (sizeMin + sizeMax) / 2,
    vertexColors:    true,
    transparent:     true,
    opacity,
    sizeAttenuation: true,
  })

  const points = new THREE.Points(geo, mat)
  points.userData['dispose'] = () => { geo.dispose(); mat.dispose() }
  return points
}

/**
 * Create a circular orbit line.
 */
export function createOrbit(
  distance: number,
  opts: OrbitOptions = {},
  THREE: typeof import('three'),
): THREE.Line {
  const { color = 0xffffff, opacity = 0.1, segments = 128 } = opts

  const pts: number[] = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push(Math.cos(a) * distance, 0, Math.sin(a) * distance)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))

  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  const line = new THREE.Line(geo, mat)
  line.userData['dispose'] = () => { geo.dispose(); mat.dispose() }
  return line
}
