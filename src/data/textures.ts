/**
 * Curated public-domain texture URL registry.
 *
 * Does **not** bundle binary assets -- provides URLs to known-good sources
 * (primarily Wikimedia Commons). Multiple fallback URLs per texture for
 * use with `Media.chainLoad`.
 *
 * @module
 */

/**
 * Metadata for a single texture asset, including resolution and licensing.
 *
 * Each texture has one or more URLs ordered by quality (highest first).
 * The multiple-URL design enables fallback loading via `Media.chainLoad`.
 */
export interface TextureInfo {
  /** Unique identifier (e.g. `'earth'`, `'saturn_ring'`). */
  id: string
  /** Human-readable name (e.g. `'Earth Blue Marble'`). */
  name: string
  /** URLs ordered by quality (highest first). Multiple entries for fallback. */
  urls: string[]
  /** Attribution/credit string. */
  credit: string
  /** License type. */
  license: 'public-domain' | 'CC0' | 'CC-BY'
  /** Texture width in pixels. */
  width: number
  /** Texture height in pixels. */
  height: number
}

/**
 * Planet and moon surface textures -- NASA/JPL public-domain imagery.
 *
 * Includes the Sun, all eight planets (with atmosphere/cloud/night variants
 * for Earth and Venus), Saturn's ring, and the Moon. Keyed by body ID.
 *
 * @example
 * ```ts
 * import { PLANET_TEXTURES } from '@motioncomplex/cosmos-lib'
 *
 * const earth = PLANET_TEXTURES['earth']
 * console.log(earth.name)   // 'Earth Blue Marble'
 * console.log(earth.width)  // 8192
 * console.log(earth.urls[0]) // Wikimedia Commons URL
 *
 * // Load with fallback chain
 * const marsUrl = await Media.chainLoad(PLANET_TEXTURES['mars'].urls)
 * ```
 */
export const PLANET_TEXTURES: Readonly<Record<string, TextureInfo>> = {
  sun: {
    id: 'sun', name: 'Sun Surface',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
    ],
    credit: 'NASA/SDO (AIA)', license: 'public-domain', width: 4096, height: 4096,
  },
  mercury: {
    id: 'mercury', name: 'Mercury Surface',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/9/92/Solarsystemscope_texture_2k_mercury.jpg',
    ],
    credit: 'NASA/Johns Hopkins APL/Carnegie Institution', license: 'public-domain', width: 2048, height: 1024,
  },
  venus: {
    id: 'venus', name: 'Venus Surface (Radar)',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/1/16/Solarsystemscope_texture_2k_venus_surface.jpg',
    ],
    credit: 'NASA/JPL-Caltech', license: 'public-domain', width: 2048, height: 1024,
  },
  venus_atmosphere: {
    id: 'venus_atmosphere', name: 'Venus Atmosphere',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/7/72/Solarsystemscope_texture_2k_venus_atmosphere.jpg',
    ],
    credit: 'NASA/JPL-Caltech', license: 'public-domain', width: 2048, height: 1024,
  },
  earth: {
    id: 'earth', name: 'Earth Blue Marble',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/0/04/Solarsystemscope_texture_8k_earth_daymap.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/2/23/Blue_Marble_2002.png',
    ],
    credit: 'NASA Visible Earth', license: 'public-domain', width: 8192, height: 4096,
  },
  earth_night: {
    id: 'earth_night', name: 'Earth Night Lights',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/b/ba/Solarsystemscope_texture_8k_earth_nightmap.jpg',
    ],
    credit: 'NASA Earth Observatory', license: 'public-domain', width: 8192, height: 4096,
  },
  earth_clouds: {
    id: 'earth_clouds', name: 'Earth Clouds',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/9/9d/Solarsystemscope_texture_8k_earth_clouds.jpg',
    ],
    credit: 'NASA Visible Earth', license: 'public-domain', width: 8192, height: 4096,
  },
  moon: {
    id: 'moon', name: 'Moon Surface',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/a/a8/Solarsystemscope_texture_8k_moon.jpg',
    ],
    credit: 'NASA/GSFC/Arizona State University (LROC)', license: 'public-domain', width: 8192, height: 4096,
  },
  mars: {
    id: 'mars', name: 'Mars Surface',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/f/fe/Solarsystemscope_texture_8k_mars.jpg',
    ],
    credit: 'NASA/JPL-Caltech (MOLA)', license: 'public-domain', width: 8192, height: 4096,
  },
  jupiter: {
    id: 'jupiter', name: 'Jupiter Surface',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/4/48/Solarsystemscope_texture_8k_jupiter.jpg',
    ],
    credit: 'NASA/JPL-Caltech (Cassini/Juno)', license: 'public-domain', width: 8192, height: 4096,
  },
  saturn: {
    id: 'saturn', name: 'Saturn Surface',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/e/ea/Solarsystemscope_texture_8k_saturn.jpg',
    ],
    credit: 'NASA/JPL-Caltech (Cassini)', license: 'public-domain', width: 8192, height: 4096,
  },
  saturn_ring: {
    id: 'saturn_ring', name: 'Saturn Ring',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_saturn_ring_alpha.png',
    ],
    credit: 'NASA/JPL-Caltech (Cassini)', license: 'public-domain', width: 2048, height: 64,
  },
  uranus: {
    id: 'uranus', name: 'Uranus Surface',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/9/95/Solarsystemscope_texture_2k_uranus.jpg',
    ],
    credit: 'NASA/JPL-Caltech (Voyager)', license: 'public-domain', width: 2048, height: 1024,
  },
  neptune: {
    id: 'neptune', name: 'Neptune Surface',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/1/1e/Solarsystemscope_texture_2k_neptune.jpg',
    ],
    credit: 'NASA/JPL-Caltech (Voyager)', license: 'public-domain', width: 2048, height: 1024,
  },
} as const

/**
 * Star field and Milky Way panorama textures for sky-sphere backgrounds.
 *
 * @example
 * ```ts
 * import { STAR_TEXTURES } from '@motioncomplex/cosmos-lib'
 *
 * const milkyWay = STAR_TEXTURES['milky_way']
 * console.log(milkyWay.credit)  // 'ESO/S. Brunier'
 * console.log(milkyWay.license) // 'CC-BY'
 *
 * const starField = STAR_TEXTURES['star_field']
 * console.log(starField.width)  // 8192
 * ```
 */
export const STAR_TEXTURES: Readonly<Record<string, TextureInfo>> = {
  milky_way: {
    id: 'milky_way', name: 'Milky Way Panorama',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/4/43/ESO_-_Milky_Way.jpg',
    ],
    credit: 'ESO/S. Brunier', license: 'CC-BY', width: 9000, height: 3600,
  },
  star_field: {
    id: 'star_field', name: 'Star Field Background',
    urls: [
      'https://upload.wikimedia.org/wikipedia/commons/8/80/Solarsystemscope_texture_8k_stars.jpg',
    ],
    credit: 'NASA/Goddard Space Flight Center', license: 'public-domain', width: 8192, height: 4096,
  },
} as const
