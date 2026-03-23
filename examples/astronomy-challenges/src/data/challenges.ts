export interface Datasource {
  name: string
  description: string
  url: string
}

export interface LearningStep {
  step: number
  title: string
  description: string
}

export interface Challenge {
  id: string
  title: string
  shortTitle: string
  icon: string
  description: string
  goal: string
  color: string
  colorDim: string
  difficulty: 1 | 2 | 3 | 4 | 5
  tags: string[]
  route: string
  datasources: Datasource[]
  gettingStarted: LearningStep[]
}

export const challenges: Challenge[] = [
  {
    id: 'cosmic-rays',
    title: 'The Cosmic Ray Origin Problem',
    shortTitle: 'Cosmic Rays',
    icon: '⚡',
    description:
      'We detect Ultra-High Energy Cosmic Rays hitting Earth, but we don\'t know exactly where they come from or how they reach such extreme speeds.',
    goal: 'Create models that can trace these particles back through galactic magnetic fields to their source.',
    color: 'var(--cosmic-ray)',
    colorDim: 'var(--cosmic-ray-dim)',
    difficulty: 4,
    tags: ['Particle Physics', 'Galactic Fields', 'Coordinate Transforms'],
    route: '/cosmic-rays',
    datasources: [
      { name: 'Pierre Auger Observatory', description: 'Largest UHECR detector — public event data', url: 'https://opendata.auger.org' },
      { name: 'CRDB', description: 'Community cosmic-ray database — aggregated spectra from Auger, TA, and more', url: 'https://lpsc.in2p3.fr/crdb/' },
      { name: 'CRPropa 3', description: 'Cosmic ray propagation framework', url: 'https://crpropa.desy.de/' },
    ],
    gettingStarted: [
      { step: 1, title: 'Understand galactic coordinates', description: 'Convert sky positions between equatorial (RA/Dec) and galactic (l/b) reference frames.' },
      { step: 2, title: 'Map UHECR arrival directions', description: 'Plot simulated detections on a galactic coordinate grid to see clustering patterns.' },
      { step: 3, title: 'Model magnetic deflection', description: 'Estimate how galactic magnetic fields bend particle trajectories by 10-30 degrees.' },
      { step: 4, title: 'Correlate with source candidates', description: 'Cross-match deflection-corrected directions with known AGN and gamma-ray burst catalogs.' },
    ],
  },
  {
    id: 'compression',
    title: 'The Neural Compression Bottleneck',
    shortTitle: 'Data Compression',
    icon: '🗜',
    description:
      'Modern telescopes generate so much data that we cannot physically transmit it all without losing detail. The Vera C. Rubin Observatory alone produces 20 TB per night.',
    goal: 'Develop AI-driven, lossless compression that preserves scientific integrity (e.g., the AstroCompress challenge).',
    color: 'var(--compression)',
    colorDim: 'var(--compression-dim)',
    difficulty: 3,
    tags: ['Machine Learning', 'Data Pipeline', 'Benchmarking'],
    route: '/compression',
    datasources: [
      { name: 'Multimodal Universe', description: 'The primary 100 TB dataset for astronomical AI benchmarking', url: 'https://github.com/MultimodalUniverse/MultimodalUniverse' },
      { name: 'AstroCompress', description: 'Neural compression benchmark for astronomical imaging data', url: 'https://huggingface.co/AstroCompress' },
      { name: 'MAST Archive', description: 'Mikulski Archive — Hubble, JWST, TESS data', url: 'https://archive.stsci.edu/' },
    ],
    gettingStarted: [
      { step: 1, title: 'Understand FITS format', description: 'Learn how astronomical data is stored: 16-bit pixel arrays, multi-extension headers, and WCS metadata.' },
      { step: 2, title: 'Profile data generation rates', description: 'Compare TB/night across observatories to understand the scale of the bottleneck.' },
      { step: 3, title: 'Compare compression approaches', description: 'Evaluate lossless (Rice, LZ4) vs lossy (fpack, neural) methods and their tradeoffs for scientific data.' },
      { step: 4, title: 'Validate science preservation', description: 'Ensure compression artifacts don\'t destroy faint signals — the key differentiator from general-purpose codecs.' },
    ],
  },
  {
    id: 'direct-imaging',
    title: 'The Direct Imaging Challenge',
    shortTitle: 'Direct Imaging',
    icon: '🔭',
    description:
      'Finding an Earth-like planet is easy; "seeing" it through the glare of its parent star is nearly impossible. Contrast ratios exceed 10 billion to 1.',
    goal: 'Improve post-processing algorithms to "scrub" starlight and reveal faint planetary biosignatures.',
    color: 'var(--imaging)',
    colorDim: 'var(--imaging-dim)',
    difficulty: 5,
    tags: ['Optics', 'Signal Processing', 'Exoplanets'],
    route: '/direct-imaging',
    datasources: [
      { name: 'NASA Exoplanet Archive', description: 'Confirmed exoplanets with orbital and detection data', url: 'https://exoplanetarchive.ipac.caltech.edu/' },
      { name: 'Zooniverse', description: 'Citizen science — help classify exoplanet candidates', url: 'https://www.zooniverse.org/projects?discipline=astronomy' },
      { name: 'Kaggle Astronomy', description: 'Competitions for exoplanet detection and classification', url: 'https://www.kaggle.com/datasets?search=exoplanet' },
    ],
    gettingStarted: [
      { step: 1, title: 'Understand contrast ratios', description: 'Learn how magnitude differences translate to brightness ratios using the astronomical magnitude system.' },
      { step: 2, title: 'Visualize the problem', description: 'See how coronagraphs block starlight and why residual speckle noise overwhelms planetary signals.' },
      { step: 3, title: 'Check sky conditions', description: 'Determine optimal observation windows based on Sun position, Moon phase, and atmospheric seeing.' },
      { step: 4, title: 'Study known detections', description: 'Analyze the handful of directly imaged systems to understand current detection limits.' },
    ],
  },
]

export const resources = [
  {
    name: 'Frontiers Roadmap',
    description: 'A curated series of "Grand Challenge" articles across all sub-fields.',
    url: 'https://www.frontiersin.org/journals/astronomy-and-space-sciences',
  },
  {
    name: 'Multimodal Universe',
    description: 'The primary 100 TB dataset for astronomical AI benchmarking.',
    url: 'https://github.com/MultimodalUniverse/MultimodalUniverse',
  },
  {
    name: 'Kaggle Astronomy',
    description: 'Ongoing competitions for gravitational waves and galaxy classification.',
    url: 'https://www.kaggle.com/datasets?search=astronomy',
  },
  {
    name: 'Zooniverse',
    description: 'The hub for human-labeled data and "Big Data" sorting challenges.',
    url: 'https://www.zooniverse.org/projects?discipline=astronomy',
  },
]
