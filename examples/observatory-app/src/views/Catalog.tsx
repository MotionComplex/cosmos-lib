/**
 * Catalog — Searchable, filterable list of all celestial objects.
 *
 * cosmos-lib docs used in this file:
 * - Data.search (fuzzy text search)           → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/data.md#datasearch Data API docs}
 * - Data.getByType (filter by object class)   → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/data.md#datagetbytype Data API docs}
 * - Data.all (full catalog)                   → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/data.md#dataall Data API docs}
 * - AstroMath.equatorialToHorizontal          → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/math.md#astromathequatorialtohorizontal Math API docs}
 * - Units.formatRA                            → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/constants-and-units.md#formatting Units docs}
 * - ObjectType, CelestialObject types         → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/types.md Type Reference}
 *
 * For more on how catalog data is structured:
 * → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/guides/catalog-data.md Catalog Data Guide}
 */
import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Data, AstroMath, Units } from 'cosmos-lib'
import type { ObjectType, CelestialObject } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import { DocsReference } from '../components/DocsReference'
import type { DocEntry } from '../components/DocsReference'
import styles from './Catalog.module.css'

const DOCS_ENTRIES: DocEntry[] = [
  { module: 'Data', functions: ['search', 'getByType', 'all'], description: 'Powers the search bar (fuzzy text matching), type filter buttons, and the full catalog listing.', docsPath: 'docs/api/data.md' },
  { module: 'AstroMath', functions: ['equatorialToHorizontal'], description: 'Converts each object\'s RA/Dec to altitude so cards can show current visibility and sort by altitude.', docsPath: 'docs/api/math.md#astromathequatorialtohorizontal' },
  { module: 'Units', functions: ['formatRA'], description: 'Formats Right Ascension from decimal degrees into hours/minutes/seconds notation on each card.', docsPath: 'docs/api/constants-and-units.md#formatting' },
]

const DOCS_GUIDES = [
  { label: 'Catalog Data', path: 'docs/guides/catalog-data.md' },
]

const TYPES: { key: ObjectType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'star', label: 'Stars' },
  { key: 'planet', label: 'Planets' },
  { key: 'nebula', label: 'Nebulae' },
  { key: 'galaxy', label: 'Galaxies' },
  { key: 'cluster', label: 'Clusters' },
  { key: 'black-hole', label: 'Black Holes' },
]

export function Catalog() {
  const navigate = useNavigate()
  const { observer } = useObserverCtx()
  const now = useNow(30000)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ObjectType | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'magnitude' | 'altitude'>('name')

  const results = useMemo(() => {
    let objects: CelestialObject[]

    // Three query modes — docs: docs/api/data.md
    if (query.trim()) {
      // Fuzzy search across names, aliases, and descriptions
      objects = Data.search(query)
    } else if (typeFilter !== 'all') {
      // Filter by ObjectType ('star' | 'planet' | 'nebula' | ...)
      objects = Data.getByType(typeFilter)
    } else {
      objects = Data.all()
    }

    // Enrich each object with current altitude above the observer's horizon
    // docs: docs/api/math.md#astromathequatorialtohorizontal
    const obs = { ...observer, date: now }
    const enriched = objects.map(obj => {
      let alt: number | null = null
      if (obj.ra != null && obj.dec != null) {
        const hz = AstroMath.equatorialToHorizontal({ ra: obj.ra, dec: obj.dec }, obs)
        alt = hz.alt
      }
      return { obj, alt }
    })

    // Sort
    if (sortBy === 'magnitude') {
      enriched.sort((a, b) => (a.obj.magnitude ?? 99) - (b.obj.magnitude ?? 99))
    } else if (sortBy === 'altitude') {
      enriched.sort((a, b) => (b.alt ?? -90) - (a.alt ?? -90))
    } else {
      enriched.sort((a, b) => a.obj.name.localeCompare(b.obj.name))
    }

    return enriched
  }, [query, typeFilter, sortBy, observer, now])

  // Prefetch images for visible objects so Data.getImage() resolves instantly
  // when the user navigates into a detail view.
  const visibleIds = useMemo(() => results.slice(0, 60).map(r => r.obj.id), [results])
  useEffect(() => {
    if (visibleIds.length > 0) Data.prefetchImages(visibleIds)
  }, [visibleIds])

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.stickyHeader}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Catalog</h1>
            <p className={styles.subtitle}>{results.length} celestial objects</p>
          </div>
        </div>

        {/* Search and filters */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              type="text"
              placeholder="Search stars, galaxies, nebulae..."
              value={query}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <div className={styles.typeFilter}>
              {TYPES.map(t => (
                <button
                  key={t.key}
                  className={`${styles.typeBtn} ${typeFilter === t.key ? styles.typeActive : ''}`}
                  onClick={() => setTypeFilter(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className={styles.sortSelect}
            >
              <option value="name">Sort: Name</option>
              <option value="magnitude">Sort: Brightness</option>
              <option value="altitude">Sort: Altitude</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Results */}
        <div className={`${styles.grid} stagger-grid`}>
          {results.slice(0, 60).map(({ obj, alt }, i) => (
            <div
              key={`${obj.id}-${i}`}
              className={styles.card}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/object/${obj.id}`)}
              onKeyDown={e => e.key === 'Enter' && navigate(`/object/${obj.id}`)}
            >
              <div className={styles.cardTop}>
                <span className={styles.cardType}>{obj.type}</span>
                {alt != null && alt > 0 && (
                  <span className={styles.cardVisible}>↑ {alt.toFixed(0)}°</span>
                )}
              </div>

              <h3 className={styles.cardName}>{obj.name}</h3>

              {obj.aliases && obj.aliases.length > 0 && (
                <p className={styles.cardAliases}>{obj.aliases.slice(0, 3).join(' · ')}</p>
              )}

              <div className={styles.cardMeta}>
                {obj.magnitude != null && (
                  <span>mag {obj.magnitude.toFixed(1)}</span>
                )}
                {obj.distance && (
                  <span>{obj.distance.value} {obj.distance.unit}</span>
                )}
                {obj.ra != null && obj.dec != null && (
                  <span className={styles.cardCoords}>
                    {Units.formatRA(obj.ra)} {obj.dec > 0 ? '+' : ''}{obj.dec.toFixed(1)}°
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {results.length > 60 && (
          <p className={styles.moreHint}>Showing 60 of {results.length} results. Refine your search to see more.</p>
        )}

        <DocsReference entries={DOCS_ENTRIES} guides={DOCS_GUIDES} />
      </div>
    </div>
  )
}
