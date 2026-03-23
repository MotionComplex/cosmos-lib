import { useMemo } from 'react'
import {
  Data,
  BRIGHT_STARS,
  MESSIER_CATALOG,
  CONSTELLATIONS,
  METEOR_SHOWERS,
  SOLAR_SYSTEM,
} from '@motioncomplex/cosmos-lib'
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

/** Scale comparison: how cosmos-lib catalogs compare to real observatory data */
const scaleComparisons = [
  { label: 'cosmos-lib catalogs', bytes: 0, unit: '', isPlaceholder: true },
  { label: 'Single Hubble FITS image', bytes: 170 * 1024 * 1024, unit: '~170 MB', isPlaceholder: false },
  { label: 'Single JWST NIRCam mosaic', bytes: 1.2 * 1024 * 1024 * 1024, unit: '~1.2 GB', isPlaceholder: false },
  { label: 'Rubin single-night output', bytes: 20 * 1024 * 1024 * 1024 * 1024, unit: '20 TB', isPlaceholder: false },
  { label: 'SKA single-night output', bytes: 157 * 1024 * 1024 * 1024 * 1024, unit: '157 TB', isPlaceholder: false },
]

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
      totalSizeBytes: totalSize,
      fieldsPerObject: Object.keys(allObjects[0] || {}).length,
    }
  }, [])

  const searchDemo = useMemo(() => {
    const start = performance.now()
    const results = Data.search('nebula')
    const elapsed = performance.now() - start
    return { results: results.slice(0, 8), count: results.length, ms: elapsed.toFixed(2) }
  }, [])

  // Fill in the placeholder with actual catalog size
  const comparisons = scaleComparisons.map((c) =>
    c.isPlaceholder
      ? { ...c, bytes: catalogStats.totalSizeBytes, unit: `${catalogStats.totalSizeKB} KB` }
      : c,
  )

  return (
    <ChallengeDetail challenge={challenge}>
      {/* Data Generation Rates */}
      <div className={styles.sectionTitle}>Data Generation Rates — TB per Night</div>
      <p className={styles.desc}>
        The Vera C. Rubin Observatory will produce ~20 TB nightly. The Square
        Kilometre Array will dwarf everything at ~157 TB/night. Even a 1% improvement
        in lossless compression would save petabytes per year.
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

      {/* Scale comparison */}
      <div className={styles.sectionTitle}>Scale Comparison — Catalog vs. Real Data</div>
      <p className={styles.desc}>
        The cosmos-lib catalogs are structured metadata — coordinates, magnitudes,
        and names for ~{catalogStats.totalObjects} objects. Real observatory data
        is raw pixel arrays: a single Hubble FITS image is ~170 MB, and a single
        night of Rubin data is 240 million× larger than the entire cosmos-lib catalog.
      </p>
      <div className={styles.scaleChart}>
        {comparisons.map((c, i) => {
          // Use log scale for the bar widths
          const logMax = Math.log10(comparisons[comparisons.length - 1].bytes)
          const logVal = c.bytes > 0 ? Math.log10(c.bytes) : 0
          const pct = (logVal / logMax) * 100
          return (
            <div className={styles.scaleRow} key={i}>
              <div className={styles.scaleLabel}>{c.label}</div>
              <div className={styles.scaleTrack}>
                <div
                  className={styles.scaleFill}
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    background: i === 0 ? 'var(--accent)' : `rgba(255,255,255,${0.08 + i * 0.05})`,
                  }}
                />
                <span className={styles.scaleValue}>{c.unit}</span>
              </div>
            </div>
          )
        })}
      </div>
      <p className={styles.scaleCaption}>
        Logarithmic scale. Each step represents orders of magnitude more data.
      </p>

      {/* Catalog Breakdown */}
      <div className={styles.sectionTitle}>cosmos-lib Catalog Breakdown</div>
      <p className={styles.desc}>
        Despite being tiny compared to observatory data, these catalogs demonstrate
        the same structural challenges: mixed data types, nullable fields, variable
        precision, and the need for efficient querying.
      </p>
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
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {r.ra != null ? r.ra.toFixed(4) + '°' : '—'}
                </td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {r.dec != null ? r.dec.toFixed(4) + '°' : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* cosmos-lib callout */}
      <div className={styles.callout}>
        <strong>cosmos-lib integration:</strong> This page introspects the bundled
        catalogs (<code>BRIGHT_STARS</code>, <code>MESSIER_CATALOG</code>,{' '}
        <code>CONSTELLATIONS</code>, etc.) and uses <code>Data.search()</code> to
        demonstrate structured data querying. The scale comparison above illustrates
        why neural compression research — like the AstroCompress benchmark — is
        critical for next-generation observatories.
      </div>
    </ChallengeDetail>
  )
}
