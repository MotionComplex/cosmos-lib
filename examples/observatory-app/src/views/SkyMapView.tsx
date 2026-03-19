/**
 * SkyMapView — Interactive 2D sky chart with selectable projections.
 *
 * cosmos-lib docs used in this file:
 * - renderSkyMap, SkyMapRenderOptions                → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/skymap.md Sky Map API docs}
 * - stereographic, mollweide, gnomonic projections   → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/skymap.md#projections Projection docs}
 * - AstroMath.lst (centering the map on local sky)   → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/math.md#sidereal-time Sidereal Time docs}
 * - Data.all, Data.constellations                    → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/data.md Data API docs}
 * - ProjectionName, SkyMapRenderOptions types        → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/types.md Type Reference}
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { renderSkyMap, Data, AstroMath } from 'cosmos-lib'
import type { ProjectionName, SkyMapRenderOptions } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import { DocsReference } from '../components/DocsReference'
import type { DocEntry } from '../components/DocsReference'
import styles from './SkyMapView.module.css'

const DOCS_ENTRIES: DocEntry[] = [
  { module: 'SkyMap', functions: ['renderSkyMap'], description: 'Renders the interactive star chart onto the canvas with configurable projection, grid, labels, and constellation overlays.', docsPath: 'docs/api/skymap.md' },
  { module: 'AstroMath', functions: ['lst'], description: 'Calculates Local Sidereal Time to centre the map on the sky currently above the observer.', docsPath: 'docs/api/math.md#sidereal-time' },
  { module: 'Data', functions: ['all', 'constellations'], description: 'Loads the full celestial object catalog and constellation stick-figure data for rendering.', docsPath: 'docs/api/data.md' },
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

export function SkyMapView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { observer } = useObserverCtx()
  const now = useNow(10000)
  const [projection, setProjection] = useState<ProjectionName>('stereographic')
  const [magLimit, setMagLimit] = useState(5.5)
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [showConstellations, setShowConstellations] = useState(true)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Centre the map on the local meridian using Local Sidereal Time
    // docs: docs/api/math.md#astromathist
    const lst = AstroMath.lst(now, observer.lng)

    // Fetch all catalogued objects for rendering — docs: docs/api/data.md#dataall
    const objects = Data.all().filter(o => o.ra != null && o.dec != null)

    // Configure the sky map renderer — docs: docs/api/skymap.md#renderskymap
    const opts: SkyMapRenderOptions = {
      projection,
      center: { ra: lst, dec: observer.lat },
      scale: 1,
      showGrid,
      showLabels,
      showMagnitudeLimit: magLimit,
      // Constellation stick figures — docs: docs/api/data.md#dataconstellations
      constellations: showConstellations ? Data.constellations() : [],
      background: '#030308',
      gridColor: 'rgba(255, 255, 255, 0.04)',
      labelColor: 'rgba(255, 255, 255, 0.15)',
      showConstellationLines: showConstellations,
      showConstellationLabels: showConstellations,
      constellationLineColor: 'rgba(167, 139, 250, 0.12)',
      constellationLabelColor: 'rgba(167, 139, 250, 0.4)',
    }

    renderSkyMap(canvas, objects, opts)
  }, [observer, now, projection, magLimit, showGrid, showLabels, showConstellations])

  useEffect(() => {
    render()
    const handleResize = () => render()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [render])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Sky Map</h1>
          <p className={styles.subtitle}>Real-time celestial chart</p>
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

      <div className={styles.mapContainer}>
        <canvas ref={canvasRef} className={styles.canvas} aria-label="Interactive sky map showing celestial objects and constellations" />

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
          <div className={styles.magSlider}>
            <span className={styles.magLabel} id="mag-label">Mag ≤ {magLimit.toFixed(1)}</span>
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
        </div>
      </div>
      <DocsReference entries={DOCS_ENTRIES} guides={DOCS_GUIDES} />
    </div>
  )
}
