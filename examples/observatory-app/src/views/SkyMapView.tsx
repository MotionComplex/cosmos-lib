import { useRef, useEffect, useState, useCallback } from 'react'
import { renderSkyMap, Data, AstroMath } from 'cosmos-lib'
import type { ProjectionName, SkyMapRenderOptions } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import styles from './SkyMapView.module.css'

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

    const lst = AstroMath.lst(now, observer.lng)
    const objects = Data.all().filter(o => o.ra != null && o.dec != null)

    const opts: SkyMapRenderOptions = {
      projection,
      center: { ra: lst, dec: observer.lat },
      scale: 1,
      showGrid,
      showLabels,
      showMagnitudeLimit: magLimit,
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
        <canvas ref={canvasRef} className={styles.canvas} />

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
            <span className={styles.magLabel}>Mag ≤ {magLimit.toFixed(1)}</span>
            <input
              type="range"
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
    </div>
  )
}
