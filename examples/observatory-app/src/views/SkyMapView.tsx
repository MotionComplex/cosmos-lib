/**
 * SkyMapView — Interactive 2D sky chart powered by InteractiveSkyMap.
 *
 * Demonstrates the full interactive sky map API:
 * - Pan & zoom (drag, scroll wheel, touch pinch)
 * - Click-to-identify — tap a star/object to see its details
 * - Hover detection — highlights objects and shows name + magnitude
 * - FOV indicator overlay — configurable telescope/binocular field of view
 * - HUD — cardinal directions, horizon line, zenith marker
 * - Real-time sidereal tracking
 *
 * cosmos-lib docs used in this file:
 * - InteractiveSkyMap, createInteractiveSkyMap → Sky Map Interactive API
 * - AstroMath.lst (centering the map on local sky)
 * - Data.all, Data.constellations
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { InteractiveSkyMap, Data, AstroMath, AstroClock } from 'cosmos-lib'
import type { ProjectionName, CelestialObject, InteractiveSkyMapOptions, AstroEventType } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import { DocsReference } from '../components/DocsReference'
import type { DocEntry } from '../components/DocsReference'
import styles from './SkyMapView.module.css'

const DOCS_ENTRIES: DocEntry[] = [
  { module: 'SkyMap', functions: ['InteractiveSkyMap', 'createInteractiveSkyMap'], description: 'Interactive sky map with pan, zoom, click-to-identify, hover, FOV overlay, HUD, and real-time tracking.', docsPath: 'docs/api/skymap.md' },
  { module: 'AstroMath', functions: ['lst'], description: 'Calculates Local Sidereal Time to centre the map on the sky currently above the observer.', docsPath: 'docs/api/math.md#sidereal-time' },
  { module: 'Data', functions: ['all', 'constellations'], description: 'Loads the full celestial object catalog and constellation stick-figure data for rendering.', docsPath: 'docs/api/data.md' },
  { module: 'AstroClock', functions: ['play', 'pause', 'setSpeed', 'snapTo'], description: 'Simulation clock that drives the sky map time. Supports speed control, forward/reverse, and snap-to-event.', docsPath: 'docs/api/clock.md' },
]

const DOCS_GUIDES = [
  { label: 'Sky Map Projections', path: 'docs/api/skymap.md#projections' },
  { label: 'Coordinate Systems', path: 'docs/guides/coordinate-systems.md' },
]

const PROJECTIONS: { key: ProjectionName; label: string }[] = [
  { key: 'stereographic', label: 'Stereo' },
  { key: 'mollweide', label: 'Mollweide' },
  { key: 'gnomonic', label: 'Gnomonic' },
]

const FOV_PRESETS = [
  { label: 'None', value: 0 },
  { label: '10×50 Binos', value: 6.5 },
  { label: '8" SCT', value: 1.0 },
  { label: 'Wide EP', value: 2.5 },
]

export function SkyMapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const skymapRef = useRef<InteractiveSkyMap | null>(null)
  const navigate = useNavigate()
  const { observer } = useObserverCtx()
  const now = useNow(10000)

  const [projection, setProjection] = useState<ProjectionName>('stereographic')
  const [magLimit, setMagLimit] = useState(5.5)
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showConstellations, setShowConstellations] = useState(true)
  const [showHUD, setShowHUD] = useState(true)
  const [fovPreset, setFovPreset] = useState(0)
  const [selectedObject, setSelectedObject] = useState<CelestialObject | null>(null)
  const [starTierLoading, setStarTierLoading] = useState(false)
  const [starTierLabel, setStarTierLabel] = useState('Load 9K+ stars')

  // ── AstroClock — drives the sky map time ───────────────────────────────
  const clockRef = useRef<AstroClock | null>(null)
  const [clockPlaying, setClockPlaying] = useState(false)
  const [clockSpeed, setClockSpeed] = useState(1)
  const [simDate, setSimDate] = useState(now)

  useEffect(() => {
    const clock = new AstroClock({ startDate: now, speed: clockSpeed })
    clockRef.current = clock

    clock.on('tick', ({ date }) => setSimDate(date))
    clock.on('play', () => setClockPlaying(true))
    clock.on('pause', () => setClockPlaying(false))
    clock.on('datechange', ({ date }) => setSimDate(date))

    return () => { clock.dispose(); clockRef.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayPause = useCallback(() => {
    const clock = clockRef.current
    if (!clock) return
    if (clock.playing) clock.pause()
    else clock.play()
  }, [])

  const handleSpeedChange = useCallback((speed: number) => {
    clockRef.current?.setSpeed(speed)
    setClockSpeed(speed)
  }, [])

  const handleSnapTo = useCallback((eventType: AstroEventType) => {
    clockRef.current?.snapTo(eventType, { lat: observer.lat, lng: observer.lng })
  }, [observer.lat, observer.lng])

  const handleResetTime = useCallback(() => {
    clockRef.current?.setDate(new Date())
    clockRef.current?.pause()
  }, [])

  const handleLoadStars = useCallback(async () => {
    if (starTierLoading) return
    setStarTierLoading(true)
    const tiers = Data.loadedStarTiers()
    if (!tiers.has(1)) {
      const n = await Data.loadStarTier(1)
      setStarTierLabel(`${n.toLocaleString()} loaded — load 120K?`)
      skymapRef.current?.setObjects(Data.all().filter(o => o.ra != null && o.dec != null))
    } else if (!tiers.has(2)) {
      const n = await Data.loadStarTier(2)
      setStarTierLabel(`${(n + 9110).toLocaleString()} total`)
      skymapRef.current?.setObjects(Data.all().filter(o => o.ra != null && o.dec != null))
    }
    setStarTierLoading(false)
  }, [starTierLoading])

  // Use simDate instead of now when clock is playing; otherwise use wall clock
  const effectiveDate = clockPlaying ? simDate : now

  // Initialise the InteractiveSkyMap once the canvas mounts
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    // Size canvas to container
    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const lst = AstroMath.lst(effectiveDate, observer.lng)
    const objects = Data.all().filter(o => o.ra != null && o.dec != null)
    const constellations = showConstellations ? Data.constellations() as unknown as InteractiveSkyMapOptions['constellations'] : []

    const opts: InteractiveSkyMapOptions = {
      projection,
      center: { ra: lst, dec: observer.lat },
      scale: projection === 'mollweide' ? 1 : 300,
      showGrid,
      showLabels,
      showMagnitudeLimit: magLimit,
      constellations,
      showConstellationLines: showConstellations,
      showConstellationLabels: showConstellations,
      background: '#030308',
      gridColor: 'rgba(255, 255, 255, 0.04)',
      labelColor: 'rgba(255, 255, 255, 0.15)',
      constellationLineColor: 'rgba(167, 139, 250, 0.12)',
      constellationLabelColor: 'rgba(167, 139, 250, 0.4)',
      // Interactive options
      panEnabled: true,
      zoomEnabled: true,
      selectEnabled: true,
      hoverEnabled: true,
      hitRadius: 18,
      minScale: 30,
      maxScale: 3000,
      observer: { lat: observer.lat, lng: observer.lng, date: effectiveDate },
      hud: showHUD ? {
        cardinalDirections: true,
        horizonLine: true,
        zenithMarker: true,
        observer: { lat: observer.lat, lng: observer.lng, date: effectiveDate },
        color: 'rgba(255, 255, 255, 0.35)',
      } : undefined,
      fov: fovPreset > 0 ? { radiusDeg: fovPreset, color: 'rgba(255, 255, 100, 0.5)', label: FOV_PRESETS.find(p => p.value === fovPreset)?.label } : undefined,
      hoverHighlight: {
        color: 'rgba(167, 139, 250, 0.7)',
        radius: 20,
        showLabel: true,
      },
      selectHighlight: {
        color: 'rgba(100, 200, 255, 0.85)',
        radius: 24,
      },
    }

    const skymap = new InteractiveSkyMap(canvas, objects, opts)
    skymapRef.current = skymap

    // Wire events
    skymap.on('select', ({ object }) => {
      setSelectedObject(object)
    })

    // Resize handler
    const handleResize = () => {
      const r = container.getBoundingClientRect()
      canvas.width = r.width * dpr
      canvas.height = r.height * dpr
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      skymap.render()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      skymap.dispose()
      skymapRef.current = null
    }
  // Re-create when these core settings change
  }, [observer.lat, observer.lng, effectiveDate, projection, magLimit, showGrid, showLabels, showConstellations, showHUD, fovPreset])

  const handleViewObject = useCallback(() => {
    if (selectedObject) {
      navigate(`/object/${selectedObject.id}`)
    }
  }, [selectedObject, navigate])

  return (
    <div className={styles.page}>
      <div className={styles.stickyHeader}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Sky Map</h1>
            <p className={styles.subtitle}>Pan, zoom, and click to explore the sky</p>
          </div>
          <div className={styles.controls}>
            <div className={styles.projectionToggle}>
              {PROJECTIONS.map(p => (
                <button
                  key={p.key}
                  className={`${styles.projBtn} ${projection === p.key ? styles.projActive : ''}`}
                  onClick={() => setProjection(p.key)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time transport — powered by AstroClock */}
      <div className={styles.controls} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 0', flexWrap: 'wrap' }}>
        <button className={styles.projBtn} onClick={handlePlayPause} title={clockPlaying ? 'Pause' : 'Play'}>
          {clockPlaying ? '⏸' : '▶'}
        </button>
        {[1, 60, 600, 3600].map(s => (
          <button
            key={s}
            className={`${styles.projBtn} ${clockSpeed === s ? styles.projActive : ''}`}
            onClick={() => handleSpeedChange(s)}
            title={`${s}× speed`}
          >
            {s === 1 ? '1×' : s === 60 ? '1m/s' : s === 600 ? '10m/s' : '1h/s'}
          </button>
        ))}
        <button className={styles.projBtn} onClick={() => handleSpeedChange(-60)} title="Reverse 1min/sec" style={clockSpeed < 0 ? { borderColor: 'var(--c-accent)' } : undefined}>
          ⏪
        </button>
        <button className={styles.projBtn} onClick={() => handleSnapTo('sunset')} title="Snap to sunset">🌅</button>
        <button className={styles.projBtn} onClick={() => handleSnapTo('sunrise')} title="Snap to sunrise">🌄</button>
        <button className={styles.projBtn} onClick={handleResetTime} title="Reset to now">⟲ Now</button>
        <span style={{ color: 'var(--c-text-secondary)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
          {simDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          {' '}
          {simDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className={styles.mapContainer}>
        <canvas ref={canvasRef} className={styles.canvas} aria-label="Interactive sky map — drag to pan, scroll to zoom, click objects to identify" />

        {/* Selected object info panel */}
        {selectedObject && (
          <div className={styles.infoPanel}>
            <div className={styles.infoPanelHeader}>
              <span className={styles.infoPanelName}>{selectedObject.name}</span>
              <button className={styles.infoPanelClose} onClick={() => setSelectedObject(null)} aria-label="Close">&times;</button>
            </div>
            <div className={styles.infoPanelBody}>
              <span className={styles.infoPanelType}>{selectedObject.type}</span>
              {selectedObject.magnitude !== null && (
                <span className={styles.infoPanelMag}>mag {selectedObject.magnitude.toFixed(1)}</span>
              )}
              {selectedObject.spectral && (
                <span className={styles.infoPanelSpec}>{selectedObject.spectral}</span>
              )}
            </div>
            <button className={styles.infoPanelAction} onClick={handleViewObject}>
              View details &rarr;
            </button>
          </div>
        )}

        <div className={styles.overlayControls}>
          <label className={styles.toggle}>
            <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />
            <span>Grid</span>
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} />
            <span>Labels</span>
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={showConstellations} onChange={e => setShowConstellations(e.target.checked)} />
            <span>Constellations</span>
          </label>
          <label className={styles.toggle}>
            <input type="checkbox" checked={showHUD} onChange={e => setShowHUD(e.target.checked)} />
            <span>HUD</span>
          </label>
          <div className={styles.magSlider}>
            <span className={styles.magLabel} id="mag-label">Mag &le; {magLimit.toFixed(1)}</span>
            <input
              type="range"
              aria-labelledby="mag-label"
              min={1}
              max={8}
              step={0.5}
              value={magLimit}
              onChange={e => setMagLimit(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <div className={styles.fovSelect}>
            <select
              value={fovPreset}
              onChange={e => setFovPreset(Number(e.target.value))}
              className={styles.fovDropdown}
              aria-label="Field of view preset"
            >
              {FOV_PRESETS.map(p => (
                <option key={p.value} value={p.value}>
                  FOV: {p.label}
                </option>
              ))}
            </select>
          </div>
          <button
            className={styles.projBtn}
            onClick={handleLoadStars}
            disabled={starTierLoading || Data.loadedStarTiers().has(2)}
            title="Load expanded star catalog from HYG database"
          >
            {starTierLoading ? 'Loading...' : starTierLabel}
          </button>
        </div>
      </div>
      <div style={{ paddingTop: '16px' }}>
        <DocsReference entries={DOCS_ENTRIES} guides={DOCS_GUIDES} />
      </div>
    </div>
  )
}
