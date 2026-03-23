import { useMemo } from 'react'
import {
  Data,
  BRIGHT_STARS,
  MESSIER_CATALOG,
  CONSTELLATIONS,
  METEOR_SHOWERS,
  SOLAR_SYSTEM,
} from 'cosmos-lib'
import { challenges } from '../data/challenges'
import { ChallengeDetail } from '../components/ChallengeDetail'
import styles from './DataCompression.module.css'

const challenge = challenges.find((c) => c.id === 'compression')!

const telescopeData = [
  { name: 'Vera C. Rubin', tbPerNight: 20, color: '#34d399' },
  { name: 'SKA Observatory', tbPerNight: 157, color: '#22d3ee' },
  { name: 'JWST', tbPerNight: 0.057, color: '#fbbf24' },
  { name: 'Hubble', tbPerNight: 0.018, color: '#a78bfa' },
  { name: 'ALMA', tbPerNight: 2.0, color: '#fb7185' },
]

const maxTB = Math.max(...telescopeData.map((t) => t.tbPerNight))

function estimateSize(obj: unknown): number {
  return new TextEncoder().encode(JSON.stringify(obj)).length
}

export function DataCompression() {
  const catalogStats = useMemo(() => {
    const allObjects = Data.all()
    const totalSize =
      estimateSize(BRIGHT_STARS) +
      estimateSize(MESSIER_CATALOG) +
      estimateSize(CONSTELLATIONS) +
      estimateSize(METEOR_SHOWERS) +
      estimateSize(SOLAR_SYSTEM)

    return {
      totalObjects: allObjects.length,
      stars: BRIGHT_STARS.length,
      messier: MESSIER_CATALOG.length,
      constellations: CONSTELLATIONS.length,
      showers: METEOR_SHOWERS.length,
      planets: SOLAR_SYSTEM.length,
      totalSizeKB: (totalSize / 1024).toFixed(1),
      fieldsPerObject: Object.keys(allObjects[0] || {}).length,
    }
  }, [])

  const searchDemo = useMemo(() => {
    const start = performance.now()
    const results = Data.search('nebula')
    const elapsed = performance.now() - start
    return { results: results.slice(0, 8), count: results.length, ms: elapsed.toFixed(2) }
  }, [])

  return (
    <ChallengeDetail challenge={challenge}>
      {/* Data Generation Rates */}
      <div className={styles.sectionTitle}>Data Generation Rates — TB per Night</div>
      <p className={styles.desc}>
        The Vera C. Rubin Observatory will produce ~20 TB nightly. The Square
        Kilometre Array will dwarf everything at ~157 TB/night.
      </p>
      <div className={styles.barChart}>
        {telescopeData.map((t) => (
          <div className={styles.barRow} key={t.name}>
            <div className={styles.barLabel}>{t.name}</div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: `${(t.tbPerNight / maxTB) * 100}%`,
                  backgroundColor: t.color,
                  minWidth: t.tbPerNight < 1 ? '40px' : undefined,
                }}
              >
                {t.tbPerNight} TB
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Catalog Breakdown */}
      <div className={styles.sectionTitle}>cosmos-lib Catalog Breakdown</div>
      <div className={`${styles.statRow} stagger-grid`}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Total Objects</div>
          <div className={styles.statValue}>{catalogStats.totalObjects.toLocaleString()}</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Catalog Size</div>
          <div className={styles.statValue}>{catalogStats.totalSizeKB} KB</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Fields / Object</div>
          <div className={styles.statValue}>{catalogStats.fieldsPerObject}</div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>Catalog</th>
              <th>Objects</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Bright Stars</td>
              <td>{catalogStats.stars}</td>
              <td>Named stars with magnitudes, spectral types, coordinates</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Messier Catalog</td>
              <td>{catalogStats.messier}</td>
              <td>Nebulae, clusters, galaxies (M1–M110)</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Constellations</td>
              <td>{catalogStats.constellations}</td>
              <td>IAU boundaries, asterism lines, star references</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Meteor Showers</td>
              <td>{catalogStats.showers}</td>
              <td>Annual showers with radiant, peak date, ZHR</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Solar System</td>
              <td>{catalogStats.planets}</td>
              <td>Planets + Moon + Sun with orbital elements</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Search Demo */}
      <div className={styles.sectionTitle}>Search Performance Demo</div>
      <p className={styles.desc}>
        Searching for <code>"nebula"</code> across the catalog using <code>Data.search()</code>:
      </p>
      <div className={styles.statRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Results Found</div>
          <div className={styles.statValue} style={{ color: 'var(--compression)' }}>
            {searchDemo.count}
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Search Time</div>
          <div className={styles.statValue}>{searchDemo.ms} ms</div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>RA</th>
              <th>Dec</th>
            </tr>
          </thead>
          <tbody>
            {searchDemo.results.map((r, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-primary)' }}>{r.name}</td>
                <td>{r.type}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{r.ra.toFixed(4)}°</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{r.dec.toFixed(4)}°</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* cosmos-lib callout */}
      <div className={styles.callout}>
        <strong>cosmos-lib integration:</strong> This page introspects the bundled
        catalogs (<code>BRIGHT_STARS</code>, <code>MESSIER_CATALOG</code>,{' '}
        <code>CONSTELLATIONS</code>, etc.) to demonstrate the scale of structured
        astronomical data. It uses <code>Data.search()</code> to show how
        even small datasets benefit from efficient indexing.
      </div>
    </ChallengeDetail>
  )
}
