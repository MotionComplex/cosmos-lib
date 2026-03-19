import { CATALOG } from './catalog.js'
import { AstroMath } from '../math.js'
import type { CelestialObject, ObjectType, ProximityResult, EquatorialCoord } from '../types.js'

// Build lookup maps once at module load
const byId   = new Map<string, CelestialObject>(CATALOG.map(o => [o.id, o]))
const byName = new Map<string, CelestialObject>(
  CATALOG.flatMap(o =>
    [o.name, ...o.aliases].map(a => [a.toLowerCase(), o])
  )
)

export const Data = {
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
}
