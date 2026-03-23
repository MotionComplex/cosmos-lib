import { useEffect, useRef, useMemo, useState } from 'react'
import { Sun, Moon, Data, Units } from '@motioncomplex/cosmos-lib'
import { challenges } from '../data/challenges'
import { ChallengeDetail } from '../components/ChallengeDetail'
import styles from './DirectImaging.module.css'

const challenge = challenges.find((c) => c.id === 'direct-imaging')!

const exoplanetSystems = [
  { name: 'Beta Pictoris b', starMag: 3.86, planetMag: 15.0, separationArcsec: 0.45, distance: 63.4, method: 'Direct Imaging', discovered: 2008 },
  { name: 'HR 8799 e', starMag: 5.96, planetMag: 18.0, separationArcsec: 0.37, distance: 129, method: 'Direct Imaging', discovered: 2010 },
  { name: '51 Eridani b', starMag: 5.22, planetMag: 19.5, separationArcsec: 0.45, distance: 96.4, method: 'Direct Imaging', discovered: 2015 },
  { name: 'Proxima Centauri b', starMag: 11.13, planetMag: 37.0, separationArcsec: 0.037, distance: 4.24, method: 'Radial Velocity', discovered: 2016 },
  { name: 'Earth (from 10 pc)', starMag: -26.74 + 5 * Math.log10(10 / (1 / 206265)), planetMag: 30.0, separationArcsec: 0.1, distance: 10.0, method: 'Hypothetical', discovered: 0 },
]

function drawStarView(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  showCoronagraph: boolean,
) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#040810'
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2

  // Star PSF — the overwhelming glare
  const psfRadius = showCoronagraph ? 200 : 220
  for (let r = psfRadius; r > 0; r -= 2) {
    const baseAlpha = Math.pow(r / psfRadius, -2) * 0.01
    // Without coronagraph, the glare is much brighter
    const alpha = showCoronagraph ? baseAlpha : baseAlpha * 3
    ctx.fillStyle = `rgba(255, 248, 220, ${Math.min(alpha, 1)})`
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Star core
  const coreSize = showCoronagraph ? 30 : 50
  const starGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize)
  starGrad.addColorStop(0, 'rgba(255, 255, 255, 1)')
  starGrad.addColorStop(0.3, 'rgba(255, 250, 230, 0.8)')
  starGrad.addColorStop(1, 'rgba(255, 248, 200, 0)')
  ctx.fillStyle = starGrad
  ctx.beginPath()
  ctx.arc(cx, cy, coreSize, 0, Math.PI * 2)
  ctx.fill()

  // Diffraction spikes
  const spikeAlpha = showCoronagraph ? 0.15 : 0.3
  ctx.strokeStyle = `rgba(255, 255, 255, ${spikeAlpha})`
  ctx.lineWidth = showCoronagraph ? 1 : 1.5
  const spikeLen = showCoronagraph ? 180 : 220
  for (let angle = 0; angle < Math.PI; angle += Math.PI / 4) {
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * 20, cy + Math.sin(angle) * 20)
    ctx.lineTo(cx + Math.cos(angle) * spikeLen, cy + Math.sin(angle) * spikeLen)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - Math.cos(angle) * 20, cy - Math.sin(angle) * 20)
    ctx.lineTo(cx - Math.cos(angle) * spikeLen, cy - Math.sin(angle) * spikeLen)
    ctx.stroke()
  }

  // Planet position
  const planetX = cx + 80
  const planetY = cy - 30

  if (showCoronagraph) {
    // Coronagraph mask blocks the star core
    ctx.fillStyle = '#040810'
    ctx.beginPath()
    ctx.arc(cx, cy, 15, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, 15, 0, Math.PI * 2)
    ctx.stroke()

    // Planet becomes visible with coronagraph
    const planetGrad = ctx.createRadialGradient(planetX, planetY, 0, planetX, planetY, 8)
    planetGrad.addColorStop(0, 'rgba(167, 139, 250, 0.9)')
    planetGrad.addColorStop(0.5, 'rgba(167, 139, 250, 0.4)')
    planetGrad.addColorStop(1, 'rgba(167, 139, 250, 0)')
    ctx.fillStyle = planetGrad
    ctx.beginPath()
    ctx.arc(planetX, planetY, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(167, 139, 250, 0.95)'
    ctx.beginPath()
    ctx.arc(planetX, planetY, 2.5, 0, Math.PI * 2)
    ctx.fill()

    // Arrow + label
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.6)'
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(planetX + 12, planetY - 12)
    ctx.lineTo(planetX + 40, planetY - 30)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(167, 139, 250, 0.9)'
    ctx.font = '11px Inter'
    ctx.fillText('Planet (10 billion × fainter)', planetX + 44, planetY - 26)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText('Coronagraph mask', cx + 20, cy + 40)
  } else {
    // Without coronagraph — planet is completely invisible in the glare
    // Draw a circle where the planet SHOULD be, but it's lost
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.15)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.arc(planetX, planetY, 10, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(167, 139, 250, 0.4)'
    ctx.font = '11px Inter'
    ctx.fillText('Planet location (invisible)', planetX + 14, planetY + 4)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.fillText('Raw starlight — no coronagraph', cx - 80, cy + 50)
  }

  // Scale bar
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(w - 120, h - 30)
  ctx.lineTo(w - 40, h - 30)
  ctx.stroke()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.font = '10px Inter'
  ctx.fillText('~ 0.1 arcsec', w - 120, h - 15)
}

export function DirectImaging() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showCoronagraph, setShowCoronagraph] = useState(false)

  const now = new Date()
  const sunPos = Sun.position(now)
  const moonPhase = Moon.phase(now)
  const sunDec = sunPos.dec

  const brightestStars = useMemo(() => {
    return Data.all()
      .filter((obj) => obj.type === 'star' && obj.magnitude != null)
      .sort((a, b) => (a.magnitude ?? 99) - (b.magnitude ?? 99))
      .slice(0, 5)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    drawStarView(ctx, rect.width, rect.height, showCoronagraph)
  }, [showCoronagraph])

  return (
    <ChallengeDetail challenge={challenge}>
      {/* Coronagraph */}
      <div className={styles.sectionTitle}>
        {showCoronagraph ? 'With Coronagraph' : 'Raw Starlight'} — Simulated View
      </div>
      <p className={styles.desc}>
        {showCoronagraph
          ? 'The coronagraph blocks the star\'s core, reducing glare enough to reveal the planet. But residual speckle noise still requires post-processing (ADI, SDI, PCA) to confirm detections.'
          : 'Without a coronagraph, the star\'s light completely overwhelms the planet. The planet is 10 billion times fainter — like spotting a firefly next to a searchlight from miles away.'}
      </p>
      <div className={styles.vizCard}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 400 }} />
      </div>
      <div className={styles.toggleRow}>
        <button
          className={`${styles.toggleBtn} ${!showCoronagraph ? styles.toggleActive : ''}`}
          onClick={() => setShowCoronagraph(false)}
        >
          Raw starlight
        </button>
        <button
          className={`${styles.toggleBtn} ${showCoronagraph ? styles.toggleActive : ''}`}
          onClick={() => setShowCoronagraph(true)}
        >
          With coronagraph
        </button>
      </div>

      {/* Sky Context */}
      <div className={styles.sectionTitle}>Current Sky Context</div>
      <p className={styles.desc}>
        Direct imaging requires dark skies and minimal moonlight. Low moon
        illumination and the Sun below the horizon are ideal conditions.
      </p>
      <div className={`${styles.statRow} stagger-grid`}>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Sun RA</div>
          <div className={styles.statValue} style={{ fontSize: 14 }}>
            {Units.formatRA(sunPos.ra)}
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Sun Dec</div>
          <div className={styles.statValue} style={{ fontSize: 14 }}>
            {Units.formatAngle(sunDec)}
          </div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Moon Illumination</div>
          <div className={styles.statValue}>{(moonPhase.illumination * 100).toFixed(0)}%</div>
        </div>
        <div className={styles.statBox}>
          <div className={styles.statLabel}>Moon Phase</div>
          <div className={styles.statValue} style={{ fontSize: 14 }}>{moonPhase.name}</div>
        </div>
      </div>
      <p className={styles.source}>
        Live sun position and moon phase from cosmos-lib
      </p>

      {/* Exoplanet Systems */}
      <div className={styles.sectionTitle}>Known Directly Imaged Systems</div>
      <p className={styles.desc}>
        Only a handful of exoplanets have ever been directly imaged — all are
        young, massive gas giants far from their host stars. Imaging an
        Earth-like planet remains out of reach with current technology.
      </p>
      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>System</th>
              <th>Star Mag</th>
              <th>Planet Mag</th>
              <th>Contrast</th>
              <th>Sep.</th>
              <th>Dist (ly)</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {exoplanetSystems.map((sys) => {
              const contrastRatio = Math.pow(10, (sys.planetMag - sys.starMag) / 2.5)
              return (
                <tr key={sys.name}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{sys.name}</td>
                  <td>{sys.starMag.toFixed(2)}</td>
                  <td>{sys.planetMag.toFixed(1)}</td>
                  <td className={styles.contrastBadge}>1 : {contrastRatio.toExponential(1)}</td>
                  <td>{sys.separationArcsec}″</td>
                  <td>{sys.distance}</td>
                  <td>
                    <span className={`${styles.methodBadge} ${sys.method === 'Direct Imaging' ? styles.methodDirect : styles.methodOther}`}>
                      {sys.method}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Brightest Stars */}
      <div className={styles.sectionTitle}>Brightest Stars — Typical Imaging Targets</div>
      <p className={styles.desc}>
        Direct imaging targets nearby, bright stars where a massive young
        planet might be detectable at wide separation. These are the brightest
        stars in the sky — the type of hosts that current instruments can probe.
      </p>
      <div className={styles.tableCard}>
        <table>
          <thead>
            <tr>
              <th>Star</th>
              <th>Magnitude</th>
              <th>RA / Dec</th>
            </tr>
          </thead>
          <tbody>
            {brightestStars.map((star) => (
              <tr key={star.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{star.name}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{star.magnitude?.toFixed(2)}</td>
                <td>
                  {star.ra != null ? Units.formatRA(star.ra) : '—'} /{' '}
                  {star.dec != null ? Units.formatAngle(star.dec) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.source}>
        Star catalog and magnitudes from cosmos-lib
      </p>

    </ChallengeDetail>
  )
}
