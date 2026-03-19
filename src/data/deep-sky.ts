import type { CelestialObject } from '../types.js'

/** Notable deep-sky objects not covered by the Messier catalog. */
export const DEEP_SKY_EXTRAS: readonly CelestialObject[] = [
  {
    id: 'ngc7293', name: 'Helix Nebula', aliases: ['NGC 7293', 'Eye of God'],
    type: 'nebula', subtype: 'planetary',
    ra: 337.411, dec: -20.839, magnitude: 7.6,
    distance: { value: 215, unit: 'pc' },
    description: "Largest planetary nebula on sky by angular diameter; often called the 'Eye of God'.",
    tags: ['nebula', 'planetary'],
  },
  {
    id: 'milky-way', name: 'Milky Way', aliases: ['Galaxy', 'Via Lactea'],
    type: 'galaxy', subtype: 'barred-spiral',
    ra: null, dec: null, magnitude: null,
    distance: { value: 0, unit: 'kpc' },
    description: 'Our home galaxy; 100,000+ ly across, 200–400 billion stars.',
    tags: ['galaxy', 'spiral', 'local-group', 'home'],
  },
  {
    id: 'omega-cen', name: 'Omega Centauri', aliases: ['NGC 5139', 'ω Cen'],
    type: 'cluster', subtype: 'globular',
    ra: 201.697, dec: -47.480, magnitude: 3.9,
    distance: { value: 5.2, unit: 'kpc' },
    description: "Largest globular cluster in the Milky Way; may be a stripped galaxy core.",
    tags: ['cluster', 'globular'],
  },
  {
    id: 'sgr-a-star', name: 'Sagittarius A*', aliases: ['Sgr A*', 'SgrA*'],
    type: 'black-hole', subtype: 'supermassive',
    ra: 266.417, dec: -29.008, magnitude: null,
    distance: { value: 8.178, unit: 'kpc' },
    description: 'Supermassive black hole at Milky Way center; first imaged by EHT in 2022.',
    tags: ['black-hole', 'supermassive', 'galactic-center'],
  },
  {
    id: 'm87-bh', name: 'M87 Black Hole', aliases: ['Pōwehi'],
    type: 'black-hole', subtype: 'supermassive',
    ra: 187.706, dec: 12.391, magnitude: null,
    distance: { value: 16.4, unit: 'Mpc' },
    description: 'First ever directly imaged black hole (EHT 2019); 6.5 billion solar masses.',
    tags: ['black-hole', 'supermassive'],
  },
]
