/**
 * SolarSystem — Real-time orrery with planetary positions and details.
 *
 * cosmos-lib docs used in this file:
 * - AstroMath.planetEcliptic               → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/math.md#astromathplanetecliptic Planetary Ephemeris docs}
 * - AstroMath.eclipticToEquatorial          → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/math.md#coordinate-transforms Coordinate Transform docs}
 * - AstroMath.equatorialToHorizontal        → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/math.md#astromathequatorialtohorizontal}
 * - Data.getByName                          → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/data.md#datagetbyname Data API docs}
 * - CONSTANTS.AU_TO_KM                      → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/constants-and-units.md#constants Constants docs}
 * - Units.formatDistance                    → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/constants-and-units.md#formatting Units docs}
 * - PlanetName type                         → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/types.md#ephemeris Type Reference}
 *
 * Conceptual guide for the ecliptic → equatorial → horizontal pipeline:
 * → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/guides/coordinate-systems.md Coordinate Systems Guide}
 */
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AstroMath, Data, CONSTANTS, Units } from 'cosmos-lib'
import type { PlanetName } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import { DocsReference } from '../components/DocsReference'
import type { DocEntry } from '../components/DocsReference'
import styles from './SolarSystem.module.css'

const DOCS_ENTRIES: DocEntry[] = [
  { module: 'AstroMath', functions: ['planetEcliptic', 'eclipticToEquatorial', 'equatorialToHorizontal'], description: 'Computes each planet\'s ecliptic position, converts through equatorial to horizontal coordinates to determine visibility and orrery placement.', docsPath: 'docs/api/math.md' },
  { module: 'Data', functions: ['getByName'], description: 'Looks up catalog metadata (magnitude, description) for each planet by name.', docsPath: 'docs/api/data.md' },
  { module: 'CONSTANTS', functions: ['AU_TO_KM'], description: 'Converts heliocentric distance from AU to kilometres for the distance display.', docsPath: 'docs/api/constants-and-units.md#constants' },
  { module: 'Units', functions: ['formatDistance'], description: 'Auto-formats distances into human-readable strings with appropriate units (km, AU, ly).', docsPath: 'docs/api/constants-and-units.md#formatting' },
]

const DOCS_GUIDES = [
  { label: 'Coordinate Systems', path: 'docs/guides/coordinate-systems.md' },
]

const PLANETS: PlanetName[] = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']

const PLANET_COLORS: Record<string, string> = {
  mercury: '#a0908a',
  venus: '#e8c87a',
  earth: '#4a90d9',
  mars: '#d4734a',
  jupiter: '#d4a574',
  saturn: '#e8d5a0',
  uranus: '#7ec8d4',
  neptune: '#5b7fd4',
}

const PLANET_SIZES: Record<string, number> = {
  mercury: 4879,
  venus: 12104,
  earth: 12742,
  mars: 6779,
  jupiter: 139820,
  saturn: 116460,
  uranus: 50724,
  neptune: 49244,
}

export function SolarSystem() {
  const navigate = useNavigate()
  const { observer } = useObserverCtx()
  const now = useNow(10000)

  const planets = useMemo(() => {
    return PLANETS.map(name => {
      // Compute ecliptic position — docs: docs/api/math.md#astromathplanetecliptic
      const pos = AstroMath.planetEcliptic(name, now)

      // Convert ecliptic → equatorial → horizontal (full pipeline)
      // docs: docs/guides/coordinate-systems.md#converting-between-systems
      const eq = AstroMath.eclipticToEquatorial({
        lon: pos.lon,
        lat: pos.lat,
      })
      const hz = AstroMath.equatorialToHorizontal(eq, { ...observer, date: now })

      // Look up catalog data for the planet — docs: docs/api/data.md#datagetbyname
      const obj = Data.getByName(name)
      const distFromSun = pos.r

      return {
        name,
        pos,
        eq,
        hz,
        obj,
        distFromSun,
        distKm: distFromSun * CONSTANTS.AU_TO_KM,
        color: PLANET_COLORS[name],
        diameter: PLANET_SIZES[name],
      }
    })
  }, [now, observer])

  // Build orrery visual
  const maxDist = 32 // Neptune ~30 AU
  const centerX = 50
  const centerY = 50

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Solar System</h1>
          <p className={styles.subtitle}>Real-time planetary positions</p>
        </div>
      </div>

      {/* Top-down orrery */}
      <div className={styles.orreryCard}>
        <svg viewBox="0 0 100 100" className={styles.orrery}>
          {/* Orbit rings */}
          {planets.map(p => {
            const r = (p.distFromSun / maxDist) * 42
            return (
              <circle
                key={`orbit-${p.name}`}
                cx={centerX}
                cy={centerY}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={0.15}
              />
            )
          })}

          {/* Sun */}
          <circle cx={centerX} cy={centerY} r={1.2} fill="#fbbf24" opacity={0.9} />
          <circle cx={centerX} cy={centerY} r={2} fill="#fbbf24" opacity={0.1} />

          {/* Planets */}
          {planets.map(p => {
            const r = (p.distFromSun / maxDist) * 42
            const angle = (p.pos.lon * Math.PI) / 180
            const px = centerX + r * Math.cos(angle)
            const py = centerY - r * Math.sin(angle)
            const planetR = p.name === 'jupiter' || p.name === 'saturn' ? 1 :
                           p.name === 'uranus' || p.name === 'neptune' ? 0.65 : 0.5
            return (
              <g key={p.name} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => navigate(`/object/${p.name}`)} onKeyDown={e => e.key === 'Enter' && navigate(`/object/${p.name}`)}>
                <circle cx={px} cy={py} r={planetR + 1.5} fill="transparent" />
                <circle cx={px} cy={py} r={planetR} fill={p.color} />
                <circle cx={px} cy={py} r={planetR + 0.8} fill={p.color} opacity={0.12} />
                <text
                  x={px}
                  y={py - planetR - 1.5}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize={2.2}
                  fontFamily="var(--font-display)"
                  style={{ textTransform: 'capitalize' }}
                >
                  {p.name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Planet cards */}
      <div className={`${styles.planetGrid} stagger-grid`}>
        {planets.map(p => (
          <div
            key={p.name}
            className={styles.planetCard}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/object/${p.name}`)}
            onKeyDown={e => e.key === 'Enter' && navigate(`/object/${p.name}`)}
          >
            <div className={styles.planetHeader}>
              <div
                className={styles.planetDot}
                style={{ background: p.color, boxShadow: `0 0 12px ${p.color}40` }}
              />
              <div>
                <h3 className={styles.planetName}>{p.name}</h3>
                <span className={styles.planetDist}>{p.distFromSun.toFixed(2)} AU</span>
              </div>
            </div>

            <div className={styles.planetStats}>
              <div className={styles.pStat}>
                <span className={styles.pStatLabel}>Ecl. Lon</span>
                <span className={styles.pStatValue}>{p.pos.lon.toFixed(2)}°</span>
              </div>
              <div className={styles.pStat}>
                <span className={styles.pStatLabel}>Altitude</span>
                <span className={styles.pStatValue} style={{
                  color: p.hz.alt > 0 ? 'var(--green)' : 'var(--text-muted)'
                }}>
                  {p.hz.alt.toFixed(1)}°
                </span>
              </div>
              <div className={styles.pStat}>
                <span className={styles.pStatLabel}>Diameter</span>
                <span className={styles.pStatValue}>{Units.formatDistance(p.diameter)}</span>
              </div>
              <div className={styles.pStat}>
                <span className={styles.pStatLabel}>Distance</span>
                <span className={styles.pStatValue}>{Units.formatDistance(p.distKm)}</span>
              </div>
            </div>

            {p.hz.alt > 0 && (
              <div className={styles.visibleBadge}>Visible</div>
            )}
          </div>
        ))}
      </div>
      <DocsReference entries={DOCS_ENTRIES} guides={DOCS_GUIDES} />
    </div>
  )
}
