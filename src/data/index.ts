import { CATALOG } from './catalog.js'
import { BRIGHT_STARS } from './stars.js'
import { CONSTELLATIONS } from './constellations.js'
import { MESSIER_CATALOG } from './messier.js'
import { METEOR_SHOWERS } from './showers.js'
import { AstroMath } from '../math.js'
import type { CelestialObject, ObjectType, ProximityResult, EquatorialCoord } from '../types.js'
import type { BrightStar } from './stars.js'
import type { Constellation } from './constellations.js'
import type { MessierObject } from './messier.js'
import type { MeteorShower } from './showers.js'

// Re-export data types for convenience
export type { BrightStar } from './stars.js'
export type { Constellation } from './constellations.js'
export type { MessierObject } from './messier.js'
export type { MeteorShower } from './showers.js'

// Re-export raw catalogs for tree-shaking (direct import)
export { BRIGHT_STARS } from './stars.js'
export { CONSTELLATIONS } from './constellations.js'
export { MESSIER_CATALOG } from './messier.js'
export { METEOR_SHOWERS } from './showers.js'

// Build lookup maps once at module load
const byId   = new Map<string, CelestialObject>(CATALOG.map(o => [o.id, o]))
const byName = new Map<string, CelestialObject>(
  CATALOG.flatMap(o =>
    [o.name, ...o.aliases].map(a => [a.toLowerCase(), o])
  )
)

// Star lookup maps
const starByName = new Map<string, BrightStar>(
  BRIGHT_STARS.map(s => [s.name.toLowerCase(), s])
)

// Constellation lookup map
const conByAbbr = new Map<string, Constellation>(
  CONSTELLATIONS.map(c => [c.abbr.toLowerCase(), c])
)

// Messier lookup map
const messierByNumber = new Map<number, MessierObject>(
  MESSIER_CATALOG.map(m => [m.messier, m])
)

export const Data = {
  // ── Original catalog queries ──────────────────────────────────────────

  /** Get object by exact id. Returns null if not found. */
  get(id: string): CelestialObject | null {
    return byId.get(id) ?? null
  },

  /** Get object by name or alias (case-insensitive). Returns null if not found. */
  getByName(name: string): CelestialObject | null {
    return byName.get(name.toLowerCase()) ?? null
  },

  /** Return a copy of the full catalog. */
  all(): CelestialObject[] {
    return [...CATALOG]
  },

  /** Filter by object type. */
  getByType(type: ObjectType): CelestialObject[] {
    return CATALOG.filter(o => o.type === type)
  },

  /** Filter by tag string (e.g. 'messier', 'stellar-nursery'). */
  getByTag(tag: string): CelestialObject[] {
    return CATALOG.filter(o => o.tags.includes(tag))
  },

  /**
   * Fuzzy search across name, aliases, description, and tags.
   * Results are sorted by relevance score (highest first).
   */
  search(query: string): CelestialObject[] {
    const q = query.toLowerCase().trim()
    if (!q) return []

    return CATALOG
      .map(o => {
        let score = 0
        if (o.id === q)                            score += 100
        if (o.name.toLowerCase() === q)            score += 90
        if (o.name.toLowerCase().startsWith(q))    score += 50
        if (o.aliases.some(a => a.toLowerCase() === q))      score += 80
        if (o.aliases.some(a => a.toLowerCase().includes(q))) score += 20
        if (o.name.toLowerCase().includes(q))      score += 15
        if (o.description.toLowerCase().includes(q)) score += 5
        if (o.tags.some(t => t.includes(q)))       score += 8
        if (o.subtype?.toLowerCase().includes(q))  score += 10
        return { object: o, score }
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(r => r.object)
  },

  /**
   * Find all objects within a given angular radius of a sky position.
   * Only considers objects with known RA/Dec (not solar-system bodies).
   * Results sorted by separation (nearest first).
   *
   * @param center     equatorial coordinates in degrees
   * @param radiusDeg  search radius in degrees
   */
  nearby(center: EquatorialCoord, radiusDeg: number): ProximityResult[] {
    return CATALOG
      .filter((o): o is CelestialObject & { ra: number; dec: number } =>
        o.ra !== null && o.dec !== null
      )
      .map(o => ({
        object: o,
        separation: AstroMath.angularSeparation(center, { ra: o.ra, dec: o.dec }),
      }))
      .filter(r => r.separation <= radiusDeg)
      .sort((a, b) => a.separation - b.separation)
  },

  // ── Bright star queries ────────────────────────────────────────────────

  /** Get all bright stars (~300 IAU named stars). */
  stars(): readonly BrightStar[] {
    return BRIGHT_STARS
  },

  /** Get a bright star by IAU proper name (case-insensitive). */
  getStarByName(name: string): BrightStar | null {
    return starByName.get(name.toLowerCase()) ?? null
  },

  /** Get all bright stars in a given constellation (3-letter IAU abbreviation). */
  getStarsByConstellation(con: string): BrightStar[] {
    const upper = con.toUpperCase()
    return BRIGHT_STARS.filter(s => s.con.toUpperCase() === upper)
  },

  /**
   * Find bright stars within a given angular radius.
   * Results sorted by separation (nearest first).
   */
  nearbyStars(center: EquatorialCoord, radiusDeg: number): Array<{ star: BrightStar; separation: number }> {
    return BRIGHT_STARS
      .map(s => ({
        star: s,
        separation: AstroMath.angularSeparation(center, { ra: s.ra, dec: s.dec }),
      }))
      .filter(r => r.separation <= radiusDeg)
      .sort((a, b) => a.separation - b.separation)
  },

  // ── Constellation queries ────────────────────────────────────────────────

  /** Get all 88 IAU constellations. */
  constellations(): readonly Constellation[] {
    return CONSTELLATIONS
  },

  /** Get a constellation by 3-letter IAU abbreviation (case-insensitive). */
  getConstellation(abbr: string): Constellation | null {
    return conByAbbr.get(abbr.toLowerCase()) ?? null
  },

  // ── Messier catalog queries ────────────────────────────────────────────

  /** Get all 110 Messier objects. */
  messier(): readonly MessierObject[] {
    return MESSIER_CATALOG
  },

  /** Get a Messier object by number (1-110). */
  getMessier(number: number): MessierObject | null {
    return messierByNumber.get(number) ?? null
  },

  // ── Meteor shower queries ──────────────────────────────────────────────

  /** Get all meteor showers. */
  showers(): readonly MeteorShower[] {
    return METEOR_SHOWERS
  },

  /**
   * Get meteor showers that are active on a given date.
   * Compares the Sun's ecliptic longitude against each shower's activity window.
   */
  getActiveShowers(date: Date): MeteorShower[] {
    // Approximate solar longitude from Earth's ecliptic position
    const earth = AstroMath.planetEcliptic('earth', date)
    const sunLon = ((earth.lon + 180) % 360 + 360) % 360

    // Parse approximate month-day to solar longitude
    // This is a simplified check using the shower's start/end dates
    // For a proper check, compare solar longitude ranges
    return METEOR_SHOWERS.filter(s => {
      // Use solar longitude window: peak ± ~15° as a rough activity window
      // A more accurate approach would parse the date strings, but solar longitude
      // is the standard way to define shower activity periods
      const diff = Math.abs(((sunLon - s.solarLon + 180) % 360 + 360) % 360 - 180)
      return diff < 20 // within ~20° of peak solar longitude
    })
  },
}
