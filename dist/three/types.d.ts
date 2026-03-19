import type * as THREE from 'three';
/**
 * Configuration for {@link createPlanet}.
 *
 * @example
 * ```ts
 * const opts: PlanetOptions = {
 *   radius: 6.5,
 *   textureUrl: 'earth-bluemarble-4k.jpg',
 *   atmosphere: { color: 0x4488ff, intensity: 1.3 },
 * }
 * ```
 */
export interface PlanetOptions {
    /** Sphere radius in scene units. */
    radius: number;
    /** Single texture URL for the planet surface. */
    textureUrl?: string;
    /** Fallback chain of texture URLs — takes priority over `textureUrl` if provided. */
    textureUrls?: string[];
    /** URL for a bump/displacement map to add surface relief. */
    bumpUrl?: string;
    /** Base colour as a hex number (e.g. `0x3366aa`). Used when no texture is loaded. */
    color?: number;
    /** Emissive colour (self-illumination), e.g. for a star. */
    emissive?: number;
    /** Emissive intensity multiplier. @defaultValue `1` */
    emissiveIntensity?: number;
    /** Optional atmospheric glow shell rendered around the planet. */
    atmosphere?: {
        /** Atmosphere colour as a hex number. */
        color: number;
        /** Glow intensity. @defaultValue `1` */
        intensity?: number;
    };
    /** Optional planetary ring system (e.g. Saturn). */
    rings?: {
        /** Inner ring radius in scene units. */
        inner: number;
        /** Outer ring radius in scene units. */
        outer: number;
        /** Ring colour as a hex number. */
        color: number;
        /** Ring opacity (0–1). */
        opacity: number;
        /** Axial tilt of the ring plane in degrees. @defaultValue `0` */
        tilt?: number;
    };
    /** When `true`, renders a black-hole accretion-disk effect instead of a standard sphere. */
    isBlackHole?: boolean;
}
/**
 * Return value of {@link createPlanet}.
 */
export interface PlanetResult {
    /** Top-level group containing the planet mesh, atmosphere, and rings. */
    group: THREE.Group;
    /** The planet's surface mesh. */
    mesh: THREE.Mesh;
    /** Dispose all GPU resources (geometries, materials, textures). */
    dispose: () => void;
}
/**
 * Configuration for {@link createNebula}.
 *
 * @example
 * ```ts
 * const opts: NebulaOptions = {
 *   radius: 3000,
 *   textureUrls: ['orion-nebula-hubble.jpg'],
 *   opacity: 0.9,
 * }
 * ```
 */
export interface NebulaOptions {
    /** Visual radius of the nebula sprite in scene units. */
    radius: number;
    /** Aspect ratio (width / height) of the sprite. @defaultValue `1` */
    aspect?: number;
    /** Fallback chain of texture URLs for the nebula image. */
    textureUrls: string[];
    /** Sprite opacity (0–1). @defaultValue `1` */
    opacity?: number;
}
/**
 * Return value of {@link createNebula}.
 */
export interface NebulaResult {
    /** Top-level group containing the sprite and hit mesh. */
    group: THREE.Group;
    /** The billboard sprite displaying the nebula texture. */
    sprite: THREE.Sprite;
    /** Invisible mesh used for raycasting / click detection. */
    hitMesh: THREE.Mesh;
    /** Dispose all GPU resources (geometries, materials, textures). */
    dispose: () => void;
}
/**
 * Configuration for {@link createStarField}.
 *
 * @example
 * ```ts
 * const stars = createStarField({ count: 5000, maxRadius: 10000 }, THREE)
 * scene.add(stars)
 * ```
 */
export interface StarFieldOptions {
    /** Number of stars to generate. @defaultValue `2000` */
    count?: number;
    /** Minimum distance from the origin. @defaultValue `500` */
    minRadius?: number;
    /** Maximum distance from the origin. @defaultValue `5000` */
    maxRadius?: number;
    /** Minimum star point size. @defaultValue `0.5` */
    sizeMin?: number;
    /** Maximum star point size. @defaultValue `2` */
    sizeMax?: number;
    /** Point opacity (0–1). @defaultValue `1` */
    opacity?: number;
}
/**
 * Configuration for {@link createOrbit}.
 *
 * @example
 * ```ts
 * const ring = createOrbit({ color: 0x888888, opacity: 0.4 }, THREE)
 * scene.add(ring)
 * ```
 */
export interface OrbitOptions {
    /** Line colour as a hex number. @defaultValue `0xffffff` */
    color?: number;
    /** Line opacity (0–1). @defaultValue `0.3` */
    opacity?: number;
    /** Number of line segments forming the circle. @defaultValue `128` */
    segments?: number;
}
/**
 * Options for {@link CameraFlight.flyTo}.
 *
 * @example
 * ```ts
 * flight.flyTo(target, lookAt, { duration: 2000, easing: 'inOut' })
 * ```
 */
export interface FlightOptions {
    /** Animation duration in milliseconds. @defaultValue `1500` */
    duration?: number;
    /** Easing curve. @defaultValue `'inOut'` */
    easing?: 'in' | 'out' | 'inOut';
    /** Callback invoked when the flight completes. */
    onDone?: () => void;
}
/**
 * Options for {@link CameraFlight.orbitAround}.
 *
 * @example
 * ```ts
 * flight.orbitAround(planet.group.position, { radius: 20, speed: 0.5 })
 * ```
 */
export interface OrbitAroundOptions {
    /** Orbit radius in scene units. @defaultValue `10` */
    radius?: number;
    /** Angular speed in radians per second. @defaultValue `0.3` */
    speed?: number;
    /** Camera elevation above the orbit plane in scene units. @defaultValue `0` */
    elevation?: number;
}
