/**
 * AstroPhotoView — Astrophotography planning with equipment selection.
 *
 * cosmos-lib docs used in this file:
 * - Equipment.cameras, Equipment.telescopes, Equipment.rig → Equipment API
 * - AstroPhoto.sessionPlan, AstroPhoto.milkyWay, AstroPhoto.polarAlignment → AstroPhoto API
 */
import { useState, useMemo, useCallback, useEffect } from 'react'
import { Equipment, AstroPhoto } from 'cosmos-lib'
import type { Camera, Telescope, Lens } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import { DocsReference } from '../components/DocsReference'
import type { DocEntry } from '../components/DocsReference'
import styles from './Observatory.module.css'

const DOCS_ENTRIES: DocEntry[] = [
  { module: 'Equipment', functions: ['cameras', 'telescopes', 'rig'], description: 'Equipment database and rig builder — FOV, pixel scale, framing, exposure calculations.', docsPath: 'docs/api/astrophoto.md' },
  { module: 'AstroPhoto', functions: ['sessionPlan', 'milkyWay', 'polarAlignment', 'maxExposure'], description: 'Session planner, Milky Way tracker, polar alignment, and exposure calculators.', docsPath: 'docs/api/astrophoto.md' },
]

const DEFAULT_TARGETS = ['m31', 'm42', 'm45', 'm27', 'm57', 'm81', 'm101', 'm51']

// ── Saved Rigs (localStorage) ────────────────────────────────────────────────

interface SavedRig {
  id: string
  name: string
  cameraId: string
  opticsType: 'telescope' | 'lens'
  scopeId: string
  lensId: string
  trackerId: string
}

function loadSavedRigs(): SavedRig[] {
  try {
    const json = localStorage.getItem('cosmos-saved-rigs')
    return json ? JSON.parse(json) : []
  } catch { return [] }
}

function saveSavedRigs(rigs: SavedRig[]): void {
  localStorage.setItem('cosmos-saved-rigs', JSON.stringify(rigs))
}

export function AstroPhotoView() {
  const { observer } = useObserverCtx()
  const now = useNow(30000)

  const [selectedCamera, setSelectedCamera] = useState('sony-a7iii')
  const [opticsType, setOpticsType] = useState<'telescope' | 'lens'>('telescope')
  const [selectedScope, setSelectedScope] = useState('sw-esprit-100ed')
  const [selectedLens, setSelectedLens] = useState('canon-ef-135mm-f2')
  const [selectedTracker, setSelectedTracker] = useState('none')
  const [savedRigs, setSavedRigs] = useState<SavedRig[]>(loadSavedRigs)
  const [rigName, setRigName] = useState('')

  // Persist saved rigs
  useEffect(() => { saveSavedRigs(savedRigs) }, [savedRigs])

  const handleSaveRig = useCallback(() => {
    const opticsName = opticsType === 'lens'
      ? Equipment.lens(selectedLens)?.name ?? 'Lens'
      : Equipment.telescope(selectedScope)?.name ?? 'Scope'
    const name = rigName.trim() || `${Equipment.camera(selectedCamera)?.name ?? 'Camera'} + ${opticsName}`
    const id = `rig-${Date.now()}`
    setSavedRigs(prev => [...prev, { id, name, cameraId: selectedCamera, opticsType, scopeId: selectedScope, lensId: selectedLens, trackerId: selectedTracker }])
    setRigName('')
  }, [selectedCamera, opticsType, selectedScope, selectedLens, selectedTracker, rigName])

  const handleLoadRig = useCallback((rig: SavedRig) => {
    setSelectedCamera(rig.cameraId)
    setOpticsType(rig.opticsType ?? 'telescope')
    setSelectedScope(rig.scopeId)
    if (rig.lensId) setSelectedLens(rig.lensId)
    if (rig.trackerId) setSelectedTracker(rig.trackerId)
  }, [])

  const handleDeleteRig = useCallback((id: string) => {
    setSavedRigs(prev => prev.filter(r => r.id !== id))
  }, [])

  // Equipment search
  const [searchQuery, setSearchQuery] = useState('')

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return Equipment.search(searchQuery, 10)
  }, [searchQuery])

  const cameras = Equipment.cameras()
  const telescopes = Equipment.telescopes()
  const lenses = Equipment.lenses()
  const trackers = Equipment.trackers()

  const rig = useMemo(() => {
    try {
      const cam = cameras.find(c => c.id === selectedCamera)
      if (!cam) return null
      const tracker = selectedTracker !== 'none' ? trackers.find(t => t.id === selectedTracker) : undefined
      if (opticsType === 'lens') {
        const lens = lenses.find(l => l.id === selectedLens)
        if (!lens) return null
        return Equipment.rig({ camera: cam, lens, tracker })
      } else {
        const scope = telescopes.find(t => t.id === selectedScope)
        if (!scope) return null
        return Equipment.rig({ camera: cam, telescope: scope, tracker })
      }
    } catch { return null }
  }, [selectedCamera, opticsType, selectedScope, selectedLens, selectedTracker, cameras, telescopes, lenses, trackers])

  const data = useMemo(() => {
    const obs = { ...observer, date: now }
    const mw = AstroPhoto.milkyWay(obs)
    const pa = AstroPhoto.polarAlignment(obs)
    const gh = AstroPhoto.goldenHour(obs)
    const bh = AstroPhoto.blueHour(obs)
    const ff = AstroPhoto.flatFrameWindow(obs)
    const collStar = AstroPhoto.collimationStar(obs)
    const plan = AstroPhoto.sessionPlan(obs, DEFAULT_TARGETS)
    const mwSeason = AstroPhoto.milkyWaySeason(obs)
    return { mw, pa, gh, bh, ff, collStar, plan, mwSeason }
  }, [observer, now])

  const fov = rig?.fov()
  const ps = rig?.pixelScale()
  const sampling = rig?.samplingAdvice()
  const resolution = rig?.resolution()

  return (
    <div className={styles.page}>
      <div className={styles.stickyHeader}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Astrophotography</h1>
            <p className={styles.subtitle}>Equipment, session planning & Milky Way tracker</p>
          </div>
        </section>
      </div>

      <div className={styles.content}>
      {/* Equipment Picker */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>My Rig</h2>
        <div className={styles.dualGrid}>
          <div className={styles.bodyCard}>
            <h3 style={{ color: 'var(--c-text)', fontSize: '14px', marginBottom: '12px' }}>Camera</h3>
            <select
              value={selectedCamera}
              onChange={e => setSelectedCamera(e.target.value)}
              style={{ width: '100%', padding: '8px', background: 'var(--c-bg-card)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', fontSize: '13px' }}
            >
              {cameras.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {rig && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--c-text-secondary)' }}>
                <div>Sensor: {rig.camera.sensorWidth}×{rig.camera.sensorHeight} mm</div>
                <div>Pixel: {rig.camera.pixelSize} μm</div>
                <div>Resolution: {rig.camera.pixelsX}×{rig.camera.pixelsY}</div>
              </div>
            )}
          </div>
          <div className={styles.bodyCard}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
              <button
                onClick={() => setOpticsType('telescope')}
                style={{ flex: 1, padding: '6px', fontSize: '13px', background: opticsType === 'telescope' ? 'var(--c-accent)' : 'var(--c-bg)', color: opticsType === 'telescope' ? '#fff' : 'var(--c-text-secondary)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}
              >
                Telescope
              </button>
              <button
                onClick={() => setOpticsType('lens')}
                style={{ flex: 1, padding: '6px', fontSize: '13px', background: opticsType === 'lens' ? 'var(--c-accent)' : 'var(--c-bg)', color: opticsType === 'lens' ? '#fff' : 'var(--c-text-secondary)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}
              >
                Lens
              </button>
            </div>
            {opticsType === 'telescope' ? (
              <select
                value={selectedScope}
                onChange={e => setSelectedScope(e.target.value)}
                style={{ width: '100%', padding: '8px', background: 'var(--c-bg-card)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', fontSize: '13px' }}
              >
                {telescopes.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.aperture}mm f/{t.focalRatio})</option>
                ))}
              </select>
            ) : (
              <select
                value={selectedLens}
                onChange={e => setSelectedLens(e.target.value)}
                style={{ width: '100%', padding: '8px', background: 'var(--c-bg-card)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', fontSize: '13px' }}
              >
                {lenses.map(l => (
                  <option key={l.id} value={l.id}>{l.name} (f/{l.fNumber})</option>
                ))}
              </select>
            )}
            {rig && fov && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--c-text-secondary)' }}>
                <div>FOV: {fov.width.toFixed(2)}° × {fov.height.toFixed(2)}°</div>
                <div>Pixel scale: {ps?.toFixed(2)} arcsec/px</div>
                <div>Max exposure: {rig.maxExposure()}s {rig.isTracked ? '(tracked)' : '(untracked NPF)'}</div>
                {rig.tracker && (() => {
                  const pc = rig.payloadCheck()
                  return pc ? (
                    <div style={{ color: pc.withinLimits ? '#34d399' : '#f87171' }}>
                      Payload: ~{pc.estimatedPayloadKg}kg / {pc.maxPayloadKg}kg ({pc.headroomPercent}% headroom)
                    </div>
                  ) : null
                })()}
              </div>
            )}
          </div>

          <div className={styles.bodyCard}>
            <h3 style={{ color: 'var(--c-text)', fontSize: '14px', marginBottom: '12px' }}>Tracker / Mount</h3>
            <select
              value={selectedTracker}
              onChange={e => setSelectedTracker(e.target.value)}
              style={{ width: '100%', padding: '8px', background: 'var(--c-bg-card)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', fontSize: '13px' }}
            >
              <option value="none">None (untracked)</option>
              {trackers.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.maxPayloadKg}kg, {t.type})</option>
              ))}
            </select>
            {rig?.tracker && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--c-text-secondary)' }}>
                <div>Type: {rig.tracker.type}</div>
                <div>Max payload: {rig.tracker.maxPayloadKg} kg</div>
                {rig.tracker.periodicError && <div>PE: ±{rig.tracker.periodicError}"</div>}
                <div>Autoguide: {rig.tracker.autoguide ? 'Yes' : 'No'}</div>
                <div>GoTo: {rig.tracker.goto ? 'Yes' : 'No'}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Equipment Search */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Search Equipment</h2>
        <div className={styles.bodyCard}>
          <input
            type="text"
            placeholder="Search cameras, telescopes, lenses..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', background: 'var(--c-bg)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', fontSize: '13px', marginBottom: searchResults.length > 0 ? '8px' : 0, boxSizing: 'border-box' }}
          />
          {searchResults.length > 0 && (
            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {searchResults.map((r, i) => (
                <div key={`${r.category}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderTop: '1px solid var(--c-border)' }}>
                  <div>
                    <span style={{ color: 'var(--c-text)', fontSize: '13px' }}>{r.name}</span>
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--c-text-secondary)', textTransform: 'uppercase' }}>{r.category}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (r.category === 'camera') setSelectedCamera((r.item as Camera).id)
                      else if (r.category === 'telescope') { setOpticsType('telescope'); setSelectedScope((r.item as Telescope).id) }
                      else if (r.category === 'lens') { setOpticsType('lens'); setSelectedLens((r.item as Lens).id) }
                      else if (r.category === 'tracker') setSelectedTracker((r.item as any).id)
                      setSearchQuery('')
                    }}
                    style={{ padding: '4px 12px', background: 'var(--c-bg-card)', color: 'var(--c-accent)', border: '1px solid var(--c-accent)', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Save / Load Rigs */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Saved Rigs</h2>
        <div className={styles.bodyCard}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: savedRigs.length > 0 ? '12px' : 0 }}>
            <input
              type="text"
              placeholder="Rig name (optional)"
              value={rigName}
              onChange={e => setRigName(e.target.value)}
              style={{ flex: 1, padding: '6px 10px', background: 'var(--c-bg)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', fontSize: '13px' }}
            />
            <button
              onClick={handleSaveRig}
              style={{ padding: '6px 16px', background: 'var(--c-accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              Save current rig
            </button>
          </div>
          {savedRigs.map(rig => (
            <div key={rig.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderTop: '1px solid var(--c-border)' }}>
              <button
                onClick={() => handleLoadRig(rig)}
                style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', color: 'var(--c-text)', cursor: 'pointer', fontSize: '13px', padding: '4px 0' }}
              >
                {rig.name}
              </button>
              <button
                onClick={() => handleDeleteRig(rig.id)}
                style={{ background: 'none', border: 'none', color: 'var(--c-text-secondary)', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
                title="Delete rig"
              >
                &times;
              </button>
            </div>
          ))}
          {savedRigs.length === 0 && (
            <p style={{ fontSize: '12px', color: 'var(--c-text-secondary)', margin: 0 }}>No saved rigs yet. Select a camera & telescope above, then save.</p>
          )}
        </div>
      </section>

      {/* Sampling & Resolution */}
      {sampling && resolution && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Optical Analysis</h2>
          <div className={styles.bodyCard}>
            <div className={styles.bodyStats}>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Sampling</span>
                <span className={styles.bodyStatValue} style={{ color: sampling.status === 'optimal' ? '#34d399' : sampling.status === 'oversampled' ? '#fbbf24' : '#f87171' }}>
                  {sampling.status}
                </span>
              </div>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Dawes Limit</span>
                <span className={styles.bodyStatValue}>{resolution.dawesLimit.toFixed(2)}"</span>
              </div>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Rayleigh Limit</span>
                <span className={styles.bodyStatValue}>{resolution.raleighLimit.toFixed(2)}"</span>
              </div>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--c-text-secondary)', marginTop: '8px' }}>{sampling.advice}</p>
          </div>
        </section>
      )}

      {/* Session Plan */}
      {data.plan.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tonight's Session Plan</h2>
          <div className={styles.showerGrid}>
            {data.plan.map((t, i) => (
              <div key={t.objectId} className={styles.showerCard}>
                <div className={styles.showerHeader}>
                  <h3 className={styles.showerName}>
                    <span style={{ color: 'var(--c-text-secondary)', marginRight: '6px' }}>#{i + 1}</span>
                    {t.name}
                  </h3>
                  <span className={styles.showerZHR} style={{ color: t.score > 70 ? '#34d399' : t.score > 40 ? '#fbbf24' : '#f87171' }}>
                    {t.score}/100
                  </span>
                </div>
                <div className={styles.showerMeta}>
                  <span>{t.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {t.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>·</span>
                  <span>Peak {t.peakAltitude.toFixed(0)}°</span>
                  <span>·</span>
                  <span>AM {t.airmassRange[0]}–{t.airmassRange[1]}</span>
                  <span>·</span>
                  <span>Moon {t.moonSeparation}°</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Milky Way */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Milky Way Core</h2>
        <div className={styles.dualGrid}>
          <div className={styles.bodyCard}>
            <div className={styles.bodyHeader}>
              <div className={styles.bodyIcon} style={{ background: 'linear-gradient(135deg, #a78bfa, #6d28d9)' }}>🌌</div>
              <div>
                <h2 className={styles.bodyName}>Galactic Center</h2>
                <span className={styles.bodyType}>
                  {data.mw.aboveHorizon ? `Alt ${data.mw.altitude.toFixed(1)}° · Az ${data.mw.azimuth.toFixed(1)}°` : 'Below horizon'}
                </span>
              </div>
            </div>
            <div className={styles.bodyStats}>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Rise</span>
                <span className={styles.bodyStatValue}>{data.mw.rise?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '—'}</span>
              </div>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Transit</span>
                <span className={styles.bodyStatValue}>{data.mw.transit.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Set</span>
                <span className={styles.bodyStatValue}>{data.mw.set?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '—'}</span>
              </div>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Season</span>
                <span className={styles.bodyStatValue}>{data.mwSeason.map(m => ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m]).join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Polar Alignment */}
          <div className={styles.bodyCard}>
            <div className={styles.bodyHeader}>
              <div className={styles.bodyIcon} style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>⊕</div>
              <div>
                <h2 className={styles.bodyName}>Polar Alignment</h2>
                <span className={styles.bodyType}>{data.pa.hemisphere === 'north' ? 'Polaris' : 'Sigma Octantis'}</span>
              </div>
            </div>
            <div className={styles.bodyStats}>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Offset from Pole</span>
                <span className={styles.bodyStatValue}>{data.pa.polarisOffset.toFixed(3)}°</span>
              </div>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Position Angle</span>
                <span className={styles.bodyStatValue}>{data.pa.positionAngle.toFixed(1)}°</span>
              </div>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Altitude</span>
                <span className={styles.bodyStatValue}>{data.pa.polarisAltitude.toFixed(1)}°</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Utility Times */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Photo Windows</h2>
        <div className={`${styles.objectGrid} stagger-grid`}>
          {data.gh.evening && (
            <div className={styles.objectCard}>
              <div className={styles.objectTop}><span className={styles.objectType}>Golden Hour</span></div>
              <h3 className={styles.objectName}>Evening</h3>
              <p className={styles.objectPos}>
                {data.gh.evening.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {data.gh.evening.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
          {data.bh.evening && (
            <div className={styles.objectCard}>
              <div className={styles.objectTop}><span className={styles.objectType}>Blue Hour</span></div>
              <h3 className={styles.objectName}>Evening</h3>
              <p className={styles.objectPos}>
                {data.bh.evening.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {data.bh.evening.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
          {data.ff.evening && (
            <div className={styles.objectCard}>
              <div className={styles.objectTop}><span className={styles.objectType}>Flat Frames</span></div>
              <h3 className={styles.objectName}>Evening Window</h3>
              <p className={styles.objectPos}>
                {data.ff.evening.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {data.ff.evening.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )}
          {data.collStar && (
            <div className={styles.objectCard}>
              <div className={styles.objectTop}><span className={styles.objectType}>Collimation</span></div>
              <h3 className={styles.objectName}>{data.collStar.name}</h3>
              <p className={styles.objectPos}>Alt {data.collStar.altitude.toFixed(0)}° (near zenith)</p>
            </div>
          )}
        </div>
      </section>

      <DocsReference entries={DOCS_ENTRIES} />
      </div>
    </div>
  )
}
