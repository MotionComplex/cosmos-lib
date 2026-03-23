import { useMemo } from 'react'
import { Data } from '@motioncomplex/cosmos-lib'
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

const compressionApproaches = [
  {
    name: 'Rice / HCompress',
    type: 'Lossless',
    ratio: '2–3×',
    status: 'Standard in FITS',
    desc: 'Integer-optimized coding used in FITS tile compression. Fast, predictable, universally supported.',
  },
  {
    name: 'fpack (CFITSIO)',
    type: 'Lossy option',
    ratio: '6–10×',
    status: 'Widely used',
    desc: 'Quantization + Rice. Configurable loss via q-parameter. Default for many survey pipelines.',
  },
  {
    name: 'SZIP / LZ4',
    type: 'Lossless',
    ratio: '1.5–2.5×',
    status: 'Used in HDF5',
    desc: 'General-purpose fast codecs. LZ4 is favored for real-time pipelines due to decompression speed.',
  },
  {
    name: 'Neural compression',
    type: 'Lossy (learned)',
    ratio: '10–100×',
    status: 'Research',
    desc: 'Autoencoders trained on astronomical images. Promising ratios but validation of science-readiness is ongoing.',
  },
]

const scaleNumbers = [
  { label: 'Single CCD readout', size: '~33 MB', detail: '4096×4096 px × 16-bit', color: '#a78bfa' },
  { label: 'Single Hubble FITS', size: '~170 MB', detail: 'Multi-extension, calibrated', color: '#fbbf24' },
  { label: 'JWST NIRCam mosaic', size: '~1.2 GB', detail: 'Multiple detectors, dithered', color: '#22d3ee' },
  { label: 'Rubin per night', size: '20 TB', detail: '~800 exposures × 3.2 Gpx', color: '#34d399' },
  { label: 'Rubin 10-year survey', size: '~60 PB', detail: 'Full LSST dataset', color: '#34d399' },
  { label: 'SKA per night', size: '157 TB', detail: 'Visibility data, pre-imaging', color: '#22d3ee' },
]

export function DataCompression() {
  const searchDemo = useMemo(() => {
    const start = performance.now()
    const results = Data.search('nebula')
    const elapsed = performance.now() - start
    return { results: results.slice(0, 6), count: results.length, ms: elapsed.toFixed(2) }
  }, [])

  return (
    <ChallengeDetail challenge={challenge}>
      {/* Data Generation Rates */}
      <div className={styles.sectionTitle}>Data Generation Rates — TB per Night</div>
      <p className={styles.desc}>
        Next-generation observatories will produce data faster than it can be stored
        or transmitted. The Vera C. Rubin Observatory alone will generate ~20 TB per
        night — and its 10-year survey will total ~60 PB. Efficient compression
        isn't optional; it's an existential requirement.
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

      {/* Scale of the data */}
      <div className={styles.sectionTitle}>Scale of Astronomical Data</div>
      <p className={styles.desc}>
        Astronomical data is stored in FITS (Flexible Image Transport System), the
        standard format since 1981. A single CCD frame is 16-bit pixel data —
        small individually, but multiplied across thousands of exposures per night.
      </p>
      <div className={styles.scaleGrid}>
        {scaleNumbers.map((item) => (
          <div className={styles.scaleCard} key={item.label}>
            <div className={styles.scaleCardSize} style={{ color: item.color }}>
              {item.size}
            </div>
            <div className={styles.scaleCardLabel}>{item.label}</div>
            <div className={styles.scaleCardDetail}>{item.detail}</div>
          </div>
        ))}
      </div>

      {/* Compression approaches */}
      <div className={styles.sectionTitle}>Compression Approaches</div>
      <p className={styles.desc}>
        The core tradeoff: lossless compression preserves every bit but only
        achieves 2–3× ratios. Lossy methods reach 10–100× but must be validated
        to ensure no science is destroyed — a miscompressed faint galaxy looks
        the same as noise to a careless algorithm.
      </p>
      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Type</th>
              <th>Ratio</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {compressionApproaches.map((a) => (
              <tr key={a.name}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{a.name}</td>
                <td>
                  <span className={`${styles.typeBadge} ${a.type === 'Lossless' ? styles.typeLossless : styles.typeLossy}`}>
                    {a.type}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.ratio}</td>
                <td>{a.status}</td>
                <td className={styles.noteCell}>{a.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The cost problem */}
      <div className={styles.sectionTitle}>Why 1% Matters</div>
      <div className={`${styles.statRow} stagger-grid`}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Rubin yearly output</div>
          <div className={styles.statValue}>~7 PB</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>1% better compression</div>
          <div className={styles.statValue}>70 TB saved</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Cloud storage cost</div>
          <div className={styles.statValue}>~$1.4M/yr</div>
        </div>
      </div>
      <p className={styles.desc} style={{ marginTop: 14 }}>
        At ~$20/TB/month for archival storage, saving 70 TB annually translates to
        ~$1.4M per year — for a single observatory. Multiply across all major
        facilities and the savings become enormous. This is why the AstroCompress
        benchmark exists: to systematically evaluate whether neural codecs can
        outperform Rice/HCompress without destroying science.
      </p>

      {/* Search Demo — kept small */}
      <div className={styles.sectionTitle}>Live Demo — Catalog Search</div>
      <p className={styles.desc}>
        Searching <code>Data.search("nebula")</code> across the bundled catalog:
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

    </ChallengeDetail>
  )
}
