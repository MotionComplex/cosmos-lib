import { useEffect, useRef, useState } from 'react'
import { Data, Units } from '@motioncomplex/cosmos-lib'
import type { GalacticCoord, EquatorialCoord } from '@motioncomplex/cosmos-lib'
import { challenges } from '../data/challenges'
import { ChallengeDetail } from '../components/ChallengeDetail'
import styles from './CosmicRays.module.css'

const challenge = challenges.find((c) => c.id === 'cosmic-rays')!

/** Convert equatorial (ra, dec in degrees) to galactic (l, b in degrees) */
function equatorialToGalactic(eq: EquatorialCoord): GalacticCoord {
  const deg2rad = Math.PI / 180
  const rad2deg = 180 / Math.PI
  // North Galactic Pole (J2000)
  const raGP = 192.85948 * deg2rad
  const decGP = 27.12825 * deg2rad
  const lNCP = 122.93192 * deg2rad

  const ra = eq.ra * deg2rad
  const dec = eq.dec * deg2rad

  const sinB = Math.sin(decGP) * Math.sin(dec) +
    Math.cos(decGP) * Math.cos(dec) * Math.cos(ra - raGP)
  const b = Math.asin(sinB)

  const cosB = Math.cos(b)
  const sinLoff = Math.cos(dec) * Math.sin(ra - raGP) / cosB
  const cosLoff = (Math.cos(decGP) * Math.sin(dec) -
    Math.sin(decGP) * Math.cos(dec) * Math.cos(ra - raGP)) / cosB

  let l = lNCP - Math.atan2(sinLoff, cosLoff)
  l = ((l * rad2deg) % 360 + 360) % 360

  return { l, b: b * rad2deg }
}

interface CosmicRayEvent {
  id: string
  energy: string
  energyEV: number
  arrival: EquatorialCoord
  galactic: GalacticCoord
}

function generateSimulatedEvents(): CosmicRayEvent[] {
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
  return seeds.map((s, i) => {
    const eq: EquatorialCoord = { ra: s.ra, dec: s.dec }
    const gal = equatorialToGalactic(eq)
    const exp = Math.floor(Math.log10(s.e))
    const mantissa = (s.e / Math.pow(10, exp)).toFixed(1)
    return {
      id: `UHECR-${String(i + 1).padStart(3, '0')}`,
      energy: `${mantissa} × 10^${exp} eV`,
      energyEV: s.e,
      arrival: eq,
      galactic: gal,
    }
  })
}

function drawGalacticMap(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  events: CosmicRayEvent[],
  nearbyObjects: { name: string; l: number; b: number }[],
) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = '#040810'
  ctx.fillRect(0, 0, w, h)

  const toX = (l: number) => ((360 - l) / 360) * (w - 80) + 40
  const toY = (b: number) => ((90 - b) / 180) * (h - 60) + 30

  // Grid
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.08)'
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

  // Galactic plane
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.25)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(toX(360), toY(0))
  ctx.lineTo(toX(0), toY(0))
  ctx.stroke()

  ctx.fillStyle = 'rgba(45, 212, 191, 0.4)'
  ctx.font = '11px Inter'
  ctx.fillText('Galactic Plane (b = 0°)', toX(180) - 60, toY(0) - 8)

  // Galactic center
  const gcX = toX(0)
  const gcY = toY(0)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.beginPath()
  ctx.arc(gcX, gcY, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.font = '10px Inter'
  ctx.fillText('GC', gcX + 8, gcY + 4)

  // Catalog objects
  for (const obj of nearbyObjects) {
    ctx.fillStyle = 'rgba(126, 142, 164, 0.3)'
    ctx.beginPath()
    ctx.arc(toX(obj.l), toY(obj.b), 1.5, 0, Math.PI * 2)
    ctx.fill()
  }

  // UHECR events
  for (const evt of events) {
    const ex = toX(evt.galactic.l)
    const ey = toY(evt.galactic.b)
    const size = 4 + (Math.log10(evt.energyEV) - 19) * 3

    const gradient = ctx.createRadialGradient(ex, ey, 0, ex, ey, size * 3)
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.6)')
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(ex, ey, size * 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#f59e0b'
    ctx.beginPath()
    ctx.arc(ex, ey, size, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = 'rgba(245, 158, 11, 0.8)'
    ctx.font = '9px JetBrains Mono, monospace'
    ctx.fillText(evt.id, ex + size + 4, ey + 3)
  }

  // Axis labels
  ctx.fillStyle = 'rgba(126, 142, 164, 0.4)'
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

  const nearbyObjects = Data.all()
    .slice(0, 200)
    .filter((obj) => obj.ra != null && obj.dec != null)
    .map((obj) => {
      const gal = equatorialToGalactic({ ra: obj.ra!, dec: obj.dec! })
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

  const aboveGZK = events.filter((e) => e.energyEV >= 5e19).length
  const above1e20 = events.filter((e) => e.energyEV >= 1e20).length

  return (
    <ChallengeDetail challenge={challenge}>
      {/* Galactic Map */}
      <div className={styles.sectionTitle}>
        Galactic Coordinate Map — Simulated UHECR Arrival Directions
      </div>
      <div className={styles.vizCard}>
        <canvas ref={canvasRef} style={{ width: '100%', height: 400 }} />
      </div>
      <p className={styles.coordCaption}>
        Equirectangular projection — l ∈ [0°, 360°], b ∈ [-90°, +90°] | Orange = UHECRs, gray = catalog objects
      </p>
      <p className={styles.source}>
        Catalog objects from cosmos-lib · coordinates converted to galactic frame
      </p>

      {/* Rarity context */}
      <div className={styles.rarityNote}>
        <strong>Note on rarity:</strong> This dataset of {events.length} events
        ({aboveGZK} above the GZK threshold of 50 EeV, {above1e20} above 10²⁰ eV) is
        intentionally dense for visualization purposes. In reality, the Pierre Auger
        Observatory published ~100 events above 57 EeV collected over 17 years
        (2004–2021). Only two cosmic rays above 10²⁰ eV have ever been recorded: the{' '}
        <em>Oh-My-God particle</em> (1991, ~3×10²⁰ eV) and the{' '}
        <em>Amaterasu particle</em> (2021, ~2.4×10²⁰ eV).
      </div>

      {/* Detection Events */}
      <div className={styles.sectionTitle}>Simulated Detection Events</div>
      <div className={styles.tableCard}>
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
              <tr key={evt.id} onClick={() => setSelectedEvent(evt)}>
                <td style={{ color: 'var(--cosmic-ray)', fontWeight: 600 }}>{evt.id}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{evt.energy}</td>
                <td>
                  {Units.formatRA(evt.arrival.ra)} / {Units.formatAngle(evt.arrival.dec)}
                </td>
                <td>
                  {evt.galactic.l.toFixed(2)}° / {evt.galactic.b.toFixed(2)}°
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event Detail */}
      {selectedEvent && (
        <>
          <div className={styles.sectionTitle}>Event Detail — {selectedEvent.id}</div>
          <div className={`${styles.statRow} stagger-grid`}>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Energy</div>
              <div className={styles.statValue} style={{ fontSize: 14 }}>
                {selectedEvent.energy}
              </div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Galactic Longitude</div>
              <div className={styles.statValue}>{selectedEvent.galactic.l.toFixed(4)}°</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Galactic Latitude</div>
              <div className={styles.statValue}>{selectedEvent.galactic.b.toFixed(4)}°</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Near Galactic Plane</div>
              <div className={styles.statValue}>
                {Math.abs(selectedEvent.galactic.b) < 15 ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
          <div className={styles.callout}>
            The key challenge: galactic and extragalactic magnetic fields deflect
            charged particles by 10–30° between source and Earth. Events near
            the galactic plane (|b| &lt; 15°) traverse stronger fields, making source
            identification harder. At these extreme energies, the GZK effect
            limits the horizon to ~100 Mpc — protons above ~50 EeV lose energy
            via interactions with the cosmic microwave background.
          </div>
        </>
      )}

    </ChallengeDetail>
  )
}
