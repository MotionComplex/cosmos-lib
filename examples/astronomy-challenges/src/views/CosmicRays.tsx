import { useEffect, useRef, useState } from 'react'
import { AstroMath, Data, Units, CONSTANTS } from 'cosmos-lib'
import type { GalacticCoord, EquatorialCoord } from 'cosmos-lib'

/** Simulated UHECR detection event */
interface CosmicRayEvent {
  id: string
  energy: string // e.g. "3.2 × 10^20 eV"
  energyEV: number
  arrival: EquatorialCoord // where it was detected
  galactic: GalacticCoord // same in galactic coords
}

/** Generate simulated UHECR events spread across the sky */
function generateSimulatedEvents(): CosmicRayEvent[] {
  const events: CosmicRayEvent[] = []
  const seeds = [
    { ra: 186.3, dec: 12.7, e: 3.2e20 },
    { ra: 53.1, dec: -27.8, e: 1.8e20 },
    { ra: 201.5, dec: -43.2, e: 5.1e19 },
    { ra: 312.7, dec: 41.3, e: 7.6e19 },
    { ra: 83.6, dec: 22.0, e: 2.4e20 },
    { ra: 167.0, dec: -8.5, e: 1.1e20 },
    { ra: 270.2, dec: -29.0, e: 4.5e19 },
    { ra: 15.4, dec: 60.1, e: 6.8e19 },
  ]
  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i]
    const eq: EquatorialCoord = { ra: s.ra, dec: s.dec }
    const gal = AstroMath.equatorialToGalactic(eq)
    const exp = Math.floor(Math.log10(s.e))
    const mantissa = (s.e / Math.pow(10, exp)).toFixed(1)
    events.push({
      id: `UHECR-${String(i + 1).padStart(3, '0')}`,
      energy: `${mantissa} × 10^${exp} eV`,
      energyEV: s.e,
      arrival: eq,
      galactic: gal,
    })
  }
  return events
}

/** Draw galactic coordinate grid with UHECR events on a canvas */
function drawGalacticMap(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  events: CosmicRayEvent[],
  nearbyObjects: { name: string; l: number; b: number }[],
) {
  ctx.clearRect(0, 0, w, h)

  // Background
  ctx.fillStyle = '#0d1117'
  ctx.fillRect(0, 0, w, h)

  // Coordinate mapping: galactic l (0..360) -> x, b (-90..90) -> y
  const toX = (l: number) => ((360 - l) / 360) * (w - 80) + 40
  const toY = (b: number) => ((90 - b) / 180) * (h - 60) + 30

  // Grid lines
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)'
  ctx.lineWidth = 0.5
  for (let l = 0; l <= 360; l += 30) {
    ctx.beginPath()
    ctx.moveTo(toX(l), toY(90))
    ctx.lineTo(toX(l), toY(-90))
    ctx.stroke()
  }
  for (let b = -90; b <= 90; b += 30) {
    ctx.beginPath()
    ctx.moveTo(toX(360), toY(b))
    ctx.lineTo(toX(0), toY(b))
    ctx.stroke()
  }

  // Galactic plane highlight
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(toX(360), toY(0))
  ctx.lineTo(toX(0), toY(0))
  ctx.stroke()

  // Galactic plane label
  ctx.fillStyle = 'rgba(99, 102, 241, 0.5)'
  ctx.font = '11px Inter'
  ctx.fillText('Galactic Plane (b = 0°)', toX(180) - 60, toY(0) - 8)

  // Galactic center marker
  const gcX = toX(0)
  const gcY = toY(0)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.beginPath()
  ctx.arc(gcX, gcY, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '10px Inter'
  ctx.fillText('GC', gcX + 8, gcY + 4)

  // Nearby catalog objects
  for (const obj of nearbyObjects) {
    const ox = toX(obj.l)
    const oy = toY(obj.b)
    ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
    ctx.beginPath()
    ctx.arc(ox, oy, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Cosmic ray events
  for (const evt of events) {
    const ex = toX(evt.galactic.l)
    const ey = toY(evt.galactic.b)

    // Energy-based size
    const size = 4 + (Math.log10(evt.energyEV) - 19) * 3

    // Glow
    const gradient = ctx.createRadialGradient(ex, ey, 0, ex, ey, size * 3)
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.6)')
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(ex, ey, size * 3, 0, Math.PI * 2)
    ctx.fill()

    // Core dot
    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.arc(ex, ey, size, 0, Math.PI * 2)
    ctx.fill()

    // Label
    ctx.fillStyle = 'rgba(245, 158, 11, 0.8)'
    ctx.font = '9px JetBrains Mono, monospace'
    ctx.fillText(evt.id, ex + size + 4, ey + 3)
  }

  // Axis labels
  ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'
  ctx.font = '10px Inter'
  ctx.fillText('l = 360°', toX(360) - 5, h - 5)
  ctx.fillText('l = 0°', toX(0) - 10, h - 5)
  ctx.fillText('l = 180°', toX(180) - 15, h - 5)
  ctx.fillText('b = +90°', 2, toY(90) + 12)
  ctx.fillText('b = -90°', 2, toY(-90) - 4)
}

export function CosmicRays() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [events] = useState(() => generateSimulatedEvents())
  const [selectedEvent, setSelectedEvent] = useState<CosmicRayEvent | null>(null)

  // Get some catalog objects converted to galactic coords for context
  const nearbyObjects = Data.all()
    .slice(0, 200)
    .map((obj) => {
      const gal = AstroMath.equatorialToGalactic({ ra: obj.ra, dec: obj.dec })
      return { name: obj.name, l: gal.l, b: gal.b }
    })

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

    drawGalacticMap(ctx, rect.width, rect.height, events, nearbyObjects)
  }, [events, nearbyObjects])

  return (
    <div>
      <div className="page-header">
        <span className="badge badge--cosmic">Challenge A</span>
        <h2 style={{ marginTop: 8 }}>The Cosmic Ray Origin Problem</h2>
        <p>
          Ultra-High Energy Cosmic Rays (UHECRs) reach energies above 10^20 eV —
          far beyond what any known accelerator can produce. Tracing them back to
          their source requires understanding galactic magnetic field deflection.
        </p>
      </div>

      <div className="info-callout">
        <strong>cosmos-lib integration:</strong> This visualization uses{' '}
        <code>AstroMath.equatorialToGalactic()</code> to convert simulated UHECR
        arrival directions into galactic coordinates, then overlays them on a
        galactic coordinate grid alongside {nearbyObjects.length} catalog objects
        from <code>Data.all()</code>.
      </div>

      <div className="section">
        <h3>Galactic Coordinate Map — Simulated UHECR Arrival Directions</h3>
        <div className="viz-container">
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: 400 }}
          />
        </div>
        <p className="coord-display">
          Projection: Galactic Aitoff — l ∈ [0°, 360°], b ∈ [-90°, +90°] | Orange
          dots = simulated UHECRs, gray = catalog objects
        </p>
      </div>

      <div className="section">
        <h3>Simulated Detection Events</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Energy</th>
              <th>RA / Dec (Equatorial)</th>
              <th>l / b (Galactic)</th>
            </tr>
          </thead>
          <tbody>
            {events.map((evt) => (
              <tr
                key={evt.id}
                onClick={() => setSelectedEvent(evt)}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ color: '#f59e0b', fontWeight: 600 }}>{evt.id}</td>
                <td>{evt.energy}</td>
                <td>
                  {Units.degToHMS(evt.arrival.ra)} / {Units.degToDMS(evt.arrival.dec)}
                </td>
                <td>
                  {evt.galactic.l.toFixed(2)}° / {evt.galactic.b.toFixed(2)}°
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvent && (
        <div className="section">
          <h3>Event Detail — {selectedEvent.id}</h3>
          <div className="stat-row">
            <div className="stat-box">
              <div className="label">Energy</div>
              <div className="value" style={{ fontSize: '1.1rem' }}>
                {selectedEvent.energy}
              </div>
            </div>
            <div className="stat-box">
              <div className="label">Galactic Longitude</div>
              <div className="value">{selectedEvent.galactic.l.toFixed(4)}°</div>
            </div>
            <div className="stat-box">
              <div className="label">Galactic Latitude</div>
              <div className="value">{selectedEvent.galactic.b.toFixed(4)}°</div>
            </div>
            <div className="stat-box">
              <div className="label">Near Galactic Plane</div>
              <div className="value">
                {Math.abs(selectedEvent.galactic.b) < 15 ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
          <div className="info-callout">
            The key challenge: magnetic field deflection between the source and
            Earth can shift the apparent arrival direction by 10-30°. An event
            near the galactic plane (|b| &lt; 15°) passes through stronger fields,
            making source identification harder. The light travel distance at this
            energy corresponds to ~{(CONSTANTS.C / 1000).toFixed(0)} km/s
            propagation, subject to GZK cutoff losses over &gt;100 Mpc.
          </div>
        </div>
      )}

      <div className="section">
        <h3>The Challenge</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          The goal is to build models that can reverse the magnetic deflection and
          trace each UHECR back to its source — potentially an Active Galactic
          Nucleus (AGN), a gamma-ray burst, or an entirely new class of
          accelerator. This requires combining arrival direction data (shown above)
          with models of the Galactic and extragalactic magnetic fields.
        </p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12 }}>
          <strong>How cosmos-lib helps:</strong> The coordinate transformation
          pipeline (<code>equatorialToGalactic</code>,{' '}
          <code>galacticToEquatorial</code>) provides the mathematical foundation
          for mapping between detector coordinates and galactic reference frames.
          The bundled star catalog provides reference points for calibrating
          deflection models.
        </p>
      </div>
    </div>
  )
}
