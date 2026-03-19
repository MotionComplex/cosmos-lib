import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Data, AstroMath, Units } from 'cosmos-lib'
import type { ObjectType, CelestialObject } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import styles from './Catalog.module.css'

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

    if (query.trim()) {
      objects = Data.search(query)
    } else if (typeFilter !== 'all') {
      objects = Data.getByType(typeFilter)
    } else {
      objects = Data.all()
    }

    // Add altitude info
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

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  return (
    <div className={styles.page}>
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

      {/* Results */}
      <div className={`${styles.grid} stagger-grid`}>
        {results.slice(0, 60).map(({ obj, alt }) => (
          <div
            key={obj.id}
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
    </div>
  )
}
