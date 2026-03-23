import { useMemo } from 'react'
import {
  Data,
  BRIGHT_STARS,
  MESSIER_CATALOG,
  CONSTELLATIONS,
  METEOR_SHOWERS,
  SOLAR_SYSTEM,
} from 'cosmos-lib'

/** Approximate data sizes for major surveys/telescopes (TB per night) */
const telescopeData = [
  { name: 'Vera C. Rubin', tbPerNight: 20, color: '#10b981' },
  { name: 'SKA Observatory', tbPerNight: 157, color: '#06b6d4' },
  { name: 'JWST', tbPerNight: 0.057, color: '#f59e0b' },
  { name: 'Hubble', tbPerNight: 0.018, color: '#8b5cf6' },
  { name: 'ALMA', tbPerNight: 2.0, color: '#ef4444' },
]

const maxTB = Math.max(...telescopeData.map((t) => t.tbPerNight))

/** Estimate JSON byte size of an object (rough) */
function estimateSize(obj: unknown): number {
  return new TextEncoder().encode(JSON.stringify(obj)).length
}

export function DataCompression() {
  const catalogStats = useMemo(() => {
    const allObjects = Data.all()
    const stars = BRIGHT_STARS
    const messier = MESSIER_CATALOG
    const constellations = CONSTELLATIONS
    const showers = METEOR_SHOWERS
    const solarSystem = SOLAR_SYSTEM

    const totalSize =
      estimateSize(stars) +
      estimateSize(messier) +
      estimateSize(constellations) +
      estimateSize(showers) +
      estimateSize(solarSystem)

    return {
      totalObjects: allObjects.length,
      stars: stars.length,
      messier: messier.length,
      constellations: constellations.length,
      showers: showers.length,
      planets: solarSystem.length,
      totalSizeKB: (totalSize / 1024).toFixed(1),
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
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
    <div>
      <div className="page-header">
        <span className="badge badge--compress">Challenge B</span>
        <h2 style={{ marginTop: 8 }}>The Neural Compression Bottleneck</h2>
        <p>
          Next-generation observatories generate data faster than we can transmit
          or store it. AI-driven compression must preserve scientific integrity
          while achieving extreme compression ratios.
        </p>
      </div>

      <div className="info-callout">
        <strong>cosmos-lib integration:</strong> This page introspects the bundled
        catalogs (<code>BRIGHT_STARS</code>, <code>MESSIER_CATALOG</code>,{' '}
        <code>CONSTELLATIONS</code>, etc.) to demonstrate the scale of structured
        astronomical data. It uses <code>Data.search()</code> to show how
        even small datasets benefit from efficient indexing.
      </div>

      <div className="section">
        <h3>Data Generation Rates — TB per Night</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
          The Vera C. Rubin Observatory will produce ~20 TB nightly. The Square
          Kilometre Array will dwarf everything at ~157 TB/night. Current
          compression and transmission infrastructure cannot keep pace.
        </p>
        <div className="bar-chart">
          {telescopeData.map((t) => (
            <div className="bar-row" key={t.name}>
              <div className="bar-label">{t.name}</div>
              <div className="bar-track">
                <div
                  className="bar-fill"
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
      </div>

      <div className="section">
        <h3>cosmos-lib Catalog Breakdown</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
          Even the compact catalogs bundled with cosmos-lib illustrate the
          structured nature of astronomical data. Each object carries coordinates,
          magnitudes, classifications, and cross-references — all fields that
          compression algorithms must faithfully preserve.
        </p>
        <div className="stat-row">
          <div className="stat-box">
            <div className="label">Total Objects</div>
            <div className="value">{catalogStats.totalObjects.toLocaleString()}</div>
          </div>
          <div className="stat-box">
            <div className="label">Catalog Size</div>
            <div className="value">{catalogStats.totalSizeKB} KB</div>
          </div>
          <div className="stat-box">
            <div className="label">Fields / Object</div>
            <div className="value">{catalogStats.fieldsPerObject}</div>
          </div>
        </div>

        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Catalog</th>
              <th>Objects</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                Bright Stars
              </td>
              <td>{catalogStats.stars}</td>
              <td>Named stars with magnitudes, spectral types, coordinates</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                Messier Catalog
              </td>
              <td>{catalogStats.messier}</td>
              <td>Nebulae, clusters, galaxies (M1–M110)</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                Constellations
              </td>
              <td>{catalogStats.constellations}</td>
              <td>IAU boundaries, asterism lines, star references</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                Meteor Showers
              </td>
              <td>{catalogStats.showers}</td>
              <td>Annual showers with radiant, peak date, ZHR</td>
            </tr>
            <tr>
              <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                Solar System
              </td>
              <td>{catalogStats.planets}</td>
              <td>Planets + Moon + Sun with orbital elements</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="section">
        <h3>Search Performance Demo</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
          Searching for <code>"nebula"</code> across the catalog using{' '}
          <code>Data.search()</code>:
        </p>
        <div className="stat-row">
          <div className="stat-box">
            <div className="label">Results Found</div>
            <div className="value" style={{ color: '#10b981' }}>
              {searchDemo.count}
            </div>
          </div>
          <div className="stat-box">
            <div className="label">Search Time</div>
            <div className="value">{searchDemo.ms} ms</div>
          </div>
        </div>
        <table style={{ marginTop: 12 }}>
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
                <td>{r.ra.toFixed(4)}°</td>
                <td>{r.dec.toFixed(4)}°</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h3>The Challenge</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Standard compression (gzip, zstd) can reduce catalog data 3-5×, but
          survey image data requires 10-100× compression to fit within bandwidth
          limits. The <strong>AstroCompress</strong> challenge seeks AI-driven,
          lossless or near-lossless compression that understands the semantic
          structure of astronomical data — preserving photometric accuracy, astrometric
          precision, and spectral fidelity while drastically reducing storage needs.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
          <strong>How cosmos-lib could be extended:</strong> The structured catalog
          format (typed fields, known value ranges, spatial indexing) is an ideal
          testbed for domain-specific compression. A future <code>Compression</code>{' '}
          module could benchmark different strategies against the bundled catalogs,
          measuring fidelity loss in coordinate precision and magnitude accuracy.
        </p>
      </div>
    </div>
  )
}
