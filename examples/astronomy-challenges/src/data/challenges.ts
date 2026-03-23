export interface Challenge {
  id: string
  title: string
  shortTitle: string
  description: string
  goal: string
  color: string
  badgeClass: string
  route: string
}

export const challenges: Challenge[] = [
  {
    id: 'cosmic-rays',
    title: 'The Cosmic Ray Origin Problem',
    shortTitle: 'Cosmic Rays',
    description:
      'We detect Ultra-High Energy Cosmic Rays hitting Earth, but we don\'t know exactly where they come from or how they reach such extreme speeds.',
    goal: 'Create models that can trace these particles back through galactic magnetic fields to their source.',
    color: '#f59e0b',
    badgeClass: 'badge--cosmic',
    route: '/cosmic-rays',
  },
  {
    id: 'compression',
    title: 'The Neural Compression Bottleneck',
    shortTitle: 'Data Compression',
    description:
      'Modern telescopes (like the Vera C. Rubin Observatory) generate so much data that we cannot physically transmit it all without losing detail.',
    goal: 'Develop AI-driven, lossless compression that preserves scientific integrity (e.g., the AstroCompress challenge).',
    color: '#10b981',
    badgeClass: 'badge--compress',
    route: '/compression',
  },
  {
    id: 'direct-imaging',
    title: 'The Direct Imaging Challenge',
    shortTitle: 'Direct Imaging',
    description:
      'Finding an Earth-like planet is easy; "seeing" it through the glare of its parent star is nearly impossible.',
    goal: 'Improve post-processing algorithms to "scrub" starlight and reveal faint planetary biosignatures.',
    color: '#8b5cf6',
    badgeClass: 'badge--imaging',
    route: '/direct-imaging',
  },
]

export const resources = [
  {
    name: 'Frontiers Roadmap',
    description: 'A curated series of "Grand Challenge" articles across all sub-fields.',
    url: 'https://www.frontiersin.org/journals/astronomy-and-space-sciences/sections',
  },
  {
    name: 'Multimodal Universe',
    description: 'The primary 100 TB dataset for astronomical AI benchmarking.',
    url: 'https://multimodal-universe.github.io/',
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
