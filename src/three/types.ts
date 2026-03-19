import type * as THREE from 'three'

export interface PlanetOptions {
  radius: number
  textureUrl?: string
  bumpUrl?: string
  color?: number
  emissive?: number
  emissiveIntensity?: number
  atmosphere?: { color: number; intensity?: number }
  rings?: {
    inner: number
    outer: number
    color: number
    opacity: number
    tilt?: number
  }
  isBlackHole?: boolean
}

export interface PlanetResult {
  group: THREE.Group
  mesh: THREE.Mesh
  dispose: () => void
}

export interface NebulaOptions {
  radius: number
  aspect?: number
  textureUrls: string[]
  opacity?: number
}

export interface NebulaResult {
  group: THREE.Group
  sprite: THREE.Sprite
  hitMesh: THREE.Mesh
  dispose: () => void
}

export interface StarFieldOptions {
  count?: number
  minRadius?: number
  maxRadius?: number
  sizeMin?: number
  sizeMax?: number
  opacity?: number
}

export interface OrbitOptions {
  color?: number
  opacity?: number
  segments?: number
}

export interface FlightOptions {
  duration?: number
  easing?: 'in' | 'out' | 'inOut'
  onDone?: () => void
}

export interface OrbitAroundOptions {
  radius?: number
  speed?: number
  elevation?: number
}
