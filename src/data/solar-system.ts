import type { CelestialObject } from '../types.js'

export interface SolarSystemBody extends CelestialObject {
  diameter_km: number
  mass_kg?: number
  moons?: number
  surface_temp_K?: number
}

export const SOLAR_SYSTEM: readonly SolarSystemBody[] = [
  {
    id: 'sun', name: 'Sun', aliases: ['Sol', '☉'], type: 'star', subtype: 'G-dwarf',
    ra: null, dec: null, magnitude: -26.74,
    distance: { value: 1, unit: 'AU' },
    diameter_km: 1_392_700, mass_kg: 1.989e30, surface_temp_K: 5778,
    spectral: 'G2V',
    description: 'The G-type main-sequence star at the centre of our solar system. Its core reaches 15 million °C, fusing hydrogen into helium.',
    tags: ['solar-system', 'star'],
  },
  {
    id: 'mercury', name: 'Mercury', aliases: ['☿'], type: 'planet', subtype: 'terrestrial',
    ra: null, dec: null, magnitude: -0.4,
    distance: { value: 0.387, unit: 'AU' },
    diameter_km: 4_880, mass_kg: 3.30e23, moons: 0,
    description: 'Smallest planet; surface temperatures swing from −180 °C to 430 °C.',
    tags: ['solar-system', 'planet', 'terrestrial'],
  },
  {
    id: 'venus', name: 'Venus', aliases: ['Morning Star', 'Evening Star'], type: 'planet', subtype: 'terrestrial',
    ra: null, dec: null, magnitude: -4.4,
    distance: { value: 0.723, unit: 'AU' },
    diameter_km: 12_104, mass_kg: 4.87e24, moons: 0,
    description: 'Hottest planet; dense CO₂ atmosphere causes a runaway greenhouse effect at 465 °C.',
    tags: ['solar-system', 'planet', 'terrestrial'],
  },
  {
    id: 'earth', name: 'Earth', aliases: ['Terra', 'Gaia'], type: 'planet', subtype: 'terrestrial',
    ra: null, dec: null, magnitude: -3.86,
    distance: { value: 1, unit: 'AU' },
    diameter_km: 12_742, mass_kg: 5.972e24, moons: 1,
    description: 'Only confirmed habitable world; 71% ocean coverage.',
    tags: ['solar-system', 'planet', 'terrestrial'],
  },
  {
    id: 'moon', name: 'Moon', aliases: ['Luna'], type: 'moon',
    ra: null, dec: null, magnitude: -12.6,
    distance: { value: 384_400, unit: 'km' },
    diameter_km: 3_474,
    description: "Earth's only natural satellite; first extraterrestrial body visited by humans.",
    tags: ['solar-system', 'moon'],
  },
  {
    id: 'mars', name: 'Mars', aliases: ['Red Planet'], type: 'planet', subtype: 'terrestrial',
    ra: null, dec: null, magnitude: -2.94,
    distance: { value: 1.524, unit: 'AU' },
    diameter_km: 6_779, mass_kg: 6.39e23, moons: 2,
    description: 'Home to Olympus Mons and Valles Marineris; evidence of ancient liquid water.',
    tags: ['solar-system', 'planet', 'terrestrial'],
  },
  {
    id: 'jupiter', name: 'Jupiter', aliases: ['♃'], type: 'planet', subtype: 'gas-giant',
    ra: null, dec: null, magnitude: -2.94,
    distance: { value: 5.204, unit: 'AU' },
    diameter_km: 139_820, mass_kg: 1.898e27, moons: 95,
    description: 'Largest planet; Great Red Spot storm has persisted for 350+ years.',
    tags: ['solar-system', 'planet', 'gas-giant'],
  },
  {
    id: 'saturn', name: 'Saturn', aliases: ['♄'], type: 'planet', subtype: 'gas-giant',
    ra: null, dec: null, magnitude: 0.46,
    distance: { value: 9.537, unit: 'AU' },
    diameter_km: 116_460, mass_kg: 5.68e26, moons: 146,
    description: 'Famous ring system stretches 282,000 km; lower density than water.',
    tags: ['solar-system', 'planet', 'gas-giant'],
  },
  {
    id: 'uranus', name: 'Uranus', aliases: ['♅'], type: 'planet', subtype: 'ice-giant',
    ra: null, dec: null, magnitude: 5.68,
    distance: { value: 19.19, unit: 'AU' },
    diameter_km: 50_724, mass_kg: 8.68e25, moons: 28,
    description: 'Ice giant rotating at 98° tilt; faint ring system discovered in 1977.',
    tags: ['solar-system', 'planet', 'ice-giant'],
  },
  {
    id: 'neptune', name: 'Neptune', aliases: ['♆'], type: 'planet', subtype: 'ice-giant',
    ra: null, dec: null, magnitude: 7.83,
    distance: { value: 30.07, unit: 'AU' },
    diameter_km: 49_244, mass_kg: 1.02e26, moons: 16,
    description: 'Windiest planet at 2,100 km/h; found by mathematical prediction before observation.',
    tags: ['solar-system', 'planet', 'ice-giant'],
  },
]
