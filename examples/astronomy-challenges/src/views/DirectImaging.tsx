import { useEffect, useRef, useMemo } from 'react'
import { Sun, Moon, Data, AstroMath, Units } from 'cosmos-lib'

/** Known exoplanet systems with approximate contrast ratios */
const exoplanetSystems = [
  {
    name: 'Beta Pictoris b',
    starMag: 3.86,
    planetMag: 15.0,
    separationArcsec: 0.45,
    distance: 63.4,
    method: 'Direct Imaging',
    discovered: 2008,
  },
  {
    name: 'HR 8799 e',
    starMag: 5.96,
    planetMag: 18.0,
    separationArcsec: 0.37,
    distance: 129,
    method: 'Direct Imaging',
    discovered: 2010,
  },
  {
    name: '51 Eridani b',
    starMag: 5.22,
    planetMag: 19.5,
    separationArcsec: 0.45,
    distance: 96.4,
    method: 'Direct Imaging',
    discovered: 2015,
  },
  {
    name: 'Proxima Centauri b',
    starMag: 11.13,
    planetMag: 37.0,
    separationArcsec: 0.037,
    distance: 4.24,
    method: 'Radial Velocity',
    discovered: 2016,
  },
  {
    name: 'Earth (from 10 pc)',
    starMag: -26.74 + 5 * Math.log10(10 / (1 / 206265)),
    planetMag: 30.0,
    separationArcsec: 0.1,
    distance: 10.0,
    method: 'Hypothetical',
    discovered: 0,
  },
]

/** Draw a contrast ratio visualization */
function drawContrastDemo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2

  // Star PSF (point spread function) - the overwhelming glare
  for (let r = 200; r > 0; r -= 2) {
    const alpha = Math.pow(r / 200, -2) * 0.01
    ctx.fillStyle = `rgba(255, 248, 220, ${Math.min(alpha, 1)})`
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Star core
  const starGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30)
  starGrad.addColorStop(0, 'rgba(255, 255, 255, 1)')
  starGrad.addColorStop(0.3, 'rgba(255, 250, 230, 0.8)')
  starGrad.addColorStop(1, 'rgba(255, 248, 200, 0)')
  ctx.fillStyle = starGrad
  ctx.beginPath()
  ctx.arc(cx, cy, 30, 0, Math.PI * 2)
  ctx.fill()

  // Diffraction spikes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
  ctx.lineWidth = 1
  for (let angle = 0; angle < Math.PI; angle += Math.PI / 4) {
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(angle) * 20, cy + Math.sin(angle) * 20)
    ctx.lineTo(cx + Math.cos(angle) * 180, cy + Math.sin(angle) * 180)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx - Math.cos(angle) * 20, cy - Math.sin(angle) * 20)
    ctx.lineTo(cx - Math.cos(angle) * 180, cy - Math.sin(angle) * 180)
    ctx.stroke()
  }

  // Coronagraph mask (dark disk)
  ctx.fillStyle = '#0d1117'
  ctx.beginPath()
  ctx.arc(cx, cy, 15, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(cx, cy, 15, 0, Math.PI * 2)
  ctx.stroke()

  // The planet — barely visible!
  const planetX = cx + 80
  const planetY = cy - 30
  const planetGrad = ctx.createRadialGradient(
    planetX, planetY, 0,
    planetX, planetY, 5,
  )
  planetGrad.addColorStop(0, 'rgba(139, 92, 246, 0.8)')
  planetGrad.addColorStop(1, 'rgba(139, 92, 246, 0)')
  ctx.fillStyle = planetGrad
  ctx.beginPath()
  ctx.arc(planetX, planetY, 5, 0, Math.PI * 2)
  ctx.fill()

  // Planet core
  ctx.fillStyle = 'rgba(139, 92, 246, 0.9)'
  ctx.beginPath()
  ctx.arc(planetX, planetY, 2, 0, Math.PI * 2)
  ctx.fill()

  // Arrow to planet
  ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.beginPath()
  ctx.moveTo(planetX + 10, planetY - 10)
  ctx.lineTo(planetX + 40, planetY - 30)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = 'rgba(139, 92, 246, 0.9)'
  ctx.font = '11px Inter'
  ctx.fillText('Planet (10 billion × fainter)', planetX + 44, planetY - 26)

  // Labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '11px Inter'
  ctx.fillText('Star (with coronagraph mask)', cx + 20, cy + 40)

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

  // Use cosmos-lib to get current Sun brightness context
  const now = new Date()
  const observer = { latitude: 0, longitude: 0, elevation: 0 }
  const sunPos = Sun.position(now, observer)
  const moonPhase = Moon.phase(now)

  // Find the brightest stars as contrast reference
  const brightestStars = useMemo(() => {
    return Data.all()
      .filter((obj) => obj.type === 'star' && obj.magnitude !== undefined)
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

    drawContrastDemo(ctx, rect.width, rect.height)
  }, [])

  return (
    <div>
      <div className="page-header">
        <span className="badge badge--imaging">Challenge C</span>
        <h2 style={{ marginTop: 8 }}>The Direct Imaging Challenge</h2>
        <p>
          Detecting an exoplanet next to its parent star is like spotting a firefly
          next to a lighthouse from thousands of miles away. The contrast ratio
          between star and planet can exceed 10 billion to 1.
        </p>
      </div>

      <div className="info-callout">
        <strong>cosmos-lib integration:</strong> This page uses{' '}
        <code>Sun.position()</code>, <code>Moon.phase()</code>, and{' '}
        <code>Data.all()</code> to provide real astronomical context — current sky
        conditions and reference star magnitudes that frame the direct imaging
        challenge.
      </div>

      <div className="section">
        <h3>Simulated Coronagraph View</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
          A coronagraph blocks the star's core light, but residual glare (speckle
          noise) still overwhelms the faint planetary signal. Post-processing
          algorithms like ADI, SDI, and PCA must subtract this noise.
        </p>
        <div className="viz-container">
          <canvas ref={canvasRef} style={{ width: '100%', height: 400 }} />
        </div>
      </div>

      <div className="section">
        <h3>Current Sky Context</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
          Real-time data from <code>cosmos-lib</code> — imaging conditions affect
          direct imaging feasibility.
        </p>
        <div className="stat-row">
          <div className="stat-box">
            <div className="label">Sun Altitude</div>
            <div className="value">{sunPos.altitude.toFixed(1)}°</div>
          </div>
          <div className="stat-box">
            <div className="label">Moon Phase</div>
            <div className="value">{(moonPhase.illumination * 100).toFixed(0)}%</div>
          </div>
          <div className="stat-box">
            <div className="label">Moon Phase Name</div>
            <div className="value" style={{ fontSize: '1rem' }}>
              {moonPhase.phaseName}
            </div>
          </div>
          <div className="stat-box">
            <div className="label">Sky Condition</div>
            <div className="value" style={{ fontSize: '1rem' }}>
              {sunPos.altitude < -18
                ? 'Astronomical Dark'
                : sunPos.altitude < -12
                  ? 'Nautical Twilight'
                  : sunPos.altitude < -6
                    ? 'Civil Twilight'
                    : sunPos.altitude < 0
                      ? 'Twilight'
                      : 'Daylight'}
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <h3>Known Directly Imaged Systems</h3>
        <table>
          <thead>
            <tr>
              <th>System</th>
              <th>Star Mag</th>
              <th>Planet Mag</th>
              <th>Contrast</th>
              <th>Separation</th>
              <th>Distance (ly)</th>
              <th>Method</th>
            </tr>
          </thead>
          <tbody>
            {exoplanetSystems.map((sys) => {
              const contrastRatio = Math.pow(
                10,
                (sys.planetMag - sys.starMag) / 2.5,
              )
              return (
                <tr key={sys.name}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {sys.name}
                  </td>
                  <td>{sys.starMag.toFixed(2)}</td>
                  <td>{sys.planetMag.toFixed(1)}</td>
                  <td style={{ color: '#8b5cf6' }}>
                    1 : {contrastRatio.toExponential(1)}
                  </td>
                  <td>{sys.separationArcsec}″</td>
                  <td>{sys.distance}</td>
                  <td>
                    <span
                      className={`badge ${sys.method === 'Direct Imaging' ? 'badge--imaging' : 'badge--cosmic'}`}
                    >
                      {sys.method}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h3>Reference: Brightest Stars in Catalog</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>
          The brightest stars from <code>Data.all()</code> — these are the types of
          host stars around which direct imaging is attempted. Brighter hosts create
          more glare, making planet detection harder.
        </p>
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
                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {star.name}
                </td>
                <td>{star.magnitude?.toFixed(2)}</td>
                <td>
                  {Units.degToHMS(star.ra)} / {Units.degToDMS(star.dec)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h3>The Challenge</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          To image an Earth-like planet around a Sun-like star at 10 parsecs, we
          need to achieve a contrast of ~10^{-10} at angular separations of ~0.1
          arcseconds. Current best instruments achieve ~10^{-6}. The gap must be
          closed through a combination of better coronagraphs, adaptive optics, and
          post-processing algorithms that can model and subtract residual starlight.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
          <strong>How cosmos-lib could be extended:</strong> A future{' '}
          <code>Coronagraph</code> module could simulate PSF subtraction
          algorithms, model contrast curves as a function of angular separation, and
          integrate with the existing <code>Equipment</code> module to calculate
          achievable contrast for specific telescope/camera combinations. The{' '}
          <code>Planner</code> could be extended to identify optimal imaging windows
          when target stars are at high altitude and the Moon is below the horizon.
        </p>
      </div>
    </div>
  )
}
