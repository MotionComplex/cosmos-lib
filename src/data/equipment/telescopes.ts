/**
 * Telescope database — popular OTAs for astrophotography and visual.
 *
 * Covers refractors, reflectors (Newtonian), SCTs, Maksutovs, and
 * Ritchey-Chrétien designs from major manufacturers.
 *
 * @module
 */

/** A telescope optical tube assembly. */
export interface Telescope {
  /** Unique identifier (slugified name). */
  id: string
  /** Display name. */
  name: string
  /** Manufacturer. */
  brand: string
  /** Optical design. */
  type: 'refractor' | 'reflector' | 'sct' | 'maksutov' | 'rc'
  /** Aperture in mm. */
  aperture: number
  /** Native focal length in mm. */
  focalLength: number
  /** Focal ratio (f/number). */
  focalRatio: number
}

export const TELESCOPES: readonly Telescope[] = [
  // Sky-Watcher
  { id: 'sw-evostar-72ed', name: 'Sky-Watcher Evostar 72ED', brand: 'Sky-Watcher', type: 'refractor', aperture: 72, focalLength: 420, focalRatio: 5.8 },
  { id: 'sw-evostar-80ed', name: 'Sky-Watcher Evostar 80ED', brand: 'Sky-Watcher', type: 'refractor', aperture: 80, focalLength: 600, focalRatio: 7.5 },
  { id: 'sw-esprit-100ed', name: 'Sky-Watcher Esprit 100ED', brand: 'Sky-Watcher', type: 'refractor', aperture: 100, focalLength: 550, focalRatio: 5.5 },
  { id: 'sw-esprit-150ed', name: 'Sky-Watcher Esprit 150ED', brand: 'Sky-Watcher', type: 'refractor', aperture: 150, focalLength: 1050, focalRatio: 7.0 },
  { id: 'sw-130pds', name: 'Sky-Watcher 130PDS', brand: 'Sky-Watcher', type: 'reflector', aperture: 130, focalLength: 650, focalRatio: 5.0 },
  { id: 'sw-150pds', name: 'Sky-Watcher 150PDS', brand: 'Sky-Watcher', type: 'reflector', aperture: 150, focalLength: 750, focalRatio: 5.0 },
  { id: 'sw-200pds', name: 'Sky-Watcher 200PDS', brand: 'Sky-Watcher', type: 'reflector', aperture: 200, focalLength: 1000, focalRatio: 5.0 },
  { id: 'sw-quattro-200p', name: 'Sky-Watcher Quattro 200P', brand: 'Sky-Watcher', type: 'reflector', aperture: 200, focalLength: 800, focalRatio: 4.0 },
  // Celestron
  { id: 'celestron-c6', name: 'Celestron C6', brand: 'Celestron', type: 'sct', aperture: 150, focalLength: 1500, focalRatio: 10.0 },
  { id: 'celestron-c8', name: 'Celestron C8', brand: 'Celestron', type: 'sct', aperture: 203, focalLength: 2032, focalRatio: 10.0 },
  { id: 'celestron-c9.25', name: 'Celestron C9.25', brand: 'Celestron', type: 'sct', aperture: 235, focalLength: 2350, focalRatio: 10.0 },
  { id: 'celestron-c11', name: 'Celestron C11', brand: 'Celestron', type: 'sct', aperture: 279, focalLength: 2800, focalRatio: 10.0 },
  { id: 'celestron-c14', name: 'Celestron C14', brand: 'Celestron', type: 'sct', aperture: 356, focalLength: 3910, focalRatio: 11.0 },
  { id: 'celestron-rasa-8', name: 'Celestron RASA 8', brand: 'Celestron', type: 'sct', aperture: 203, focalLength: 400, focalRatio: 2.0 },
  { id: 'celestron-edgehd-8', name: 'Celestron EdgeHD 8', brand: 'Celestron', type: 'sct', aperture: 203, focalLength: 2032, focalRatio: 10.0 },
  // Meade
  { id: 'meade-lx85-8', name: 'Meade LX85 8" ACF', brand: 'Meade', type: 'sct', aperture: 203, focalLength: 2000, focalRatio: 10.0 },
  // Takahashi
  { id: 'takahashi-fsq-106ed', name: 'Takahashi FSQ-106ED', brand: 'Takahashi', type: 'refractor', aperture: 106, focalLength: 530, focalRatio: 5.0 },
  { id: 'takahashi-toa-130nfb', name: 'Takahashi TOA-130NFB', brand: 'Takahashi', type: 'refractor', aperture: 130, focalLength: 1000, focalRatio: 7.7 },
  { id: 'takahashi-epsilon-130d', name: 'Takahashi Epsilon-130D', brand: 'Takahashi', type: 'reflector', aperture: 130, focalLength: 430, focalRatio: 3.3 },
  // William Optics
  { id: 'wo-redcat-51', name: 'William Optics RedCat 51', brand: 'William Optics', type: 'refractor', aperture: 51, focalLength: 250, focalRatio: 4.9 },
  { id: 'wo-zenithstar-73', name: 'William Optics ZenithStar 73', brand: 'William Optics', type: 'refractor', aperture: 73, focalLength: 430, focalRatio: 5.9 },
  { id: 'wo-fluorostar-132', name: 'William Optics FluoroStar 132', brand: 'William Optics', type: 'refractor', aperture: 132, focalLength: 925, focalRatio: 7.0 },
  // Explore Scientific
  { id: 'es-ed102-fcd100', name: 'Explore Scientific ED102 FCD100', brand: 'Explore Scientific', type: 'refractor', aperture: 102, focalLength: 714, focalRatio: 7.0 },
  // Sharpstar
  { id: 'sharpstar-61edphii', name: 'Sharpstar 61EDPH II', brand: 'Sharpstar', type: 'refractor', aperture: 61, focalLength: 360, focalRatio: 5.5 },
  // Orion (Synta)
  { id: 'orion-8-astrograph', name: 'Orion 8" f/3.9 Astrograph', brand: 'Orion', type: 'reflector', aperture: 200, focalLength: 780, focalRatio: 3.9 },
  // GSO/Astro-Tech
  { id: 'at-rc6', name: 'Astro-Tech AT6RC', brand: 'Astro-Tech', type: 'rc', aperture: 152, focalLength: 1370, focalRatio: 9.0 },
  { id: 'at-rc8', name: 'Astro-Tech AT8RC', brand: 'Astro-Tech', type: 'rc', aperture: 203, focalLength: 1625, focalRatio: 8.0 },
  // Additional Sky-Watcher
  { id: 'sw-evostar-100ed', name: 'Sky-Watcher Evostar 100ED', brand: 'Sky-Watcher', type: 'refractor', aperture: 100, focalLength: 900, focalRatio: 9.0 },
  { id: 'sw-starquest-130p', name: 'Sky-Watcher StarQuest 130P', brand: 'Sky-Watcher', type: 'reflector', aperture: 130, focalLength: 650, focalRatio: 5.0 },
  { id: 'sw-quattro-250p', name: 'Sky-Watcher Quattro 250P', brand: 'Sky-Watcher', type: 'reflector', aperture: 254, focalLength: 1000, focalRatio: 4.0 },
  { id: 'sw-mak127', name: 'Sky-Watcher Skymax 127', brand: 'Sky-Watcher', type: 'maksutov', aperture: 127, focalLength: 1500, focalRatio: 11.8 },
  { id: 'sw-mak180', name: 'Sky-Watcher Skymax 180 Pro', brand: 'Sky-Watcher', type: 'maksutov', aperture: 180, focalLength: 2700, focalRatio: 15.0 },
  // Additional Celestron
  { id: 'celestron-nexstar-6se', name: 'Celestron NexStar 6SE', brand: 'Celestron', type: 'sct', aperture: 150, focalLength: 1500, focalRatio: 10.0 },
  { id: 'celestron-rasa-11', name: 'Celestron RASA 11', brand: 'Celestron', type: 'sct', aperture: 279, focalLength: 620, focalRatio: 2.2 },
  { id: 'celestron-starsense-8', name: 'Celestron StarSense Explorer 8" SCT', brand: 'Celestron', type: 'sct', aperture: 203, focalLength: 2032, focalRatio: 10.0 },
  // TS-Optics
  { id: 'ts-photon-8-f4', name: 'TS-Optics Photon 8" f/4 Newtonian', brand: 'TS-Optics', type: 'reflector', aperture: 200, focalLength: 800, focalRatio: 4.0 },
  { id: 'ts-cf-apo-80', name: 'TS-Optics CF-APO 80/480', brand: 'TS-Optics', type: 'refractor', aperture: 80, focalLength: 480, focalRatio: 6.0 },
  // Askar
  { id: 'askar-fra400', name: 'Askar FRA400', brand: 'Askar', type: 'refractor', aperture: 72, focalLength: 400, focalRatio: 5.6 },
  { id: 'askar-fra600', name: 'Askar FRA600', brand: 'Askar', type: 'refractor', aperture: 108, focalLength: 600, focalRatio: 5.6 },
  { id: 'askar-185edph', name: 'Askar 185APO', brand: 'Askar', type: 'refractor', aperture: 185, focalLength: 1295, focalRatio: 7.0 },
  // Vaonis
  { id: 'vaonis-vespera-ii', name: 'Vaonis Vespera II', brand: 'Vaonis', type: 'refractor', aperture: 50, focalLength: 250, focalRatio: 5.0 },
  // SVBony
  { id: 'svbony-sv503-70ed', name: 'SVBony SV503 70ED', brand: 'SVBony', type: 'refractor', aperture: 70, focalLength: 420, focalRatio: 6.0 },
  // Bresser
  { id: 'bresser-ar-102', name: 'Bresser Messier AR-102/1000', brand: 'Bresser', type: 'refractor', aperture: 102, focalLength: 1000, focalRatio: 9.8 },
  { id: 'bresser-nt-150', name: 'Bresser Messier NT-150/750', brand: 'Bresser', type: 'reflector', aperture: 150, focalLength: 750, focalRatio: 5.0 },
] as const
