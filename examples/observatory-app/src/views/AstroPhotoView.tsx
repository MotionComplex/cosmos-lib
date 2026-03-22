/**
 * AstroPhotoView — Astrophotography planning with equipment inventory,
 * multi-rig configuration, and smart target recommendations.
 *
 * cosmos-lib docs used in this file:
 * - Equipment.cameras, Equipment.telescopes, Equipment.rig → Equipment API
 * - AstroPhoto.rigPlan, AstroPhoto.milkyWay, AstroPhoto.polarAlignment → AstroPhoto API
 */
import { useState, useMemo, useCallback, useEffect } from 'react'
import { Equipment, AstroPhoto } from 'cosmos-lib'
import type { Camera, Telescope, Lens, Tracker, RigPlanResult, RigPlanTarget, SkySite } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import { DocsReference } from '../components/DocsReference'
import type { DocEntry } from '../components/DocsReference'
import styles from './Observatory.module.css'

const DOCS_ENTRIES: DocEntry[] = [
  { module: 'Equipment', functions: ['cameras', 'telescopes', 'lenses', 'trackers', 'rig', 'search'], description: 'Equipment database with ~160 items across cameras, telescopes, lenses, and trackers. Builds Rig instances that compute FOV, pixel scale, framing, exposure limits, and payload checks.', docsPath: 'docs/api/astrophoto.md#equipment-database' },
  { module: 'AstroPhoto.rigPlan', functions: ['rigPlan'], description: 'Rig-aware session planner — auto-discovers targets that frame well in the rig\'s FOV, scores by observing conditions and framing quality, and generates per-target capture settings (ISO/gain, sub-exposure, calibration). Supports multi-rig comparison by running plans for each rig independently.', docsPath: 'docs/api/astrophoto.md#rig-aware-planner' },
  { module: 'AstroPhoto', functions: ['milkyWay', 'milkyWaySeason', 'polarAlignment', 'goldenHour', 'blueHour', 'flatFrameWindow', 'collimationStar'], description: 'Milky Way galactic center tracking and seasonal visibility, polar alignment offsets (Polaris / Sigma Octantis), and photo windows for golden hour, blue hour, flat frames, and collimation stars.', docsPath: 'docs/api/astrophoto.md#milky-way-tracker' },
]

const TIME_FMT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }

// ── Equipment category config ────────────────────────────────────────────────

type EquipmentCategory = 'camera' | 'telescope' | 'lens' | 'tracker'

const CATEGORIES: { key: EquipmentCategory; label: string; plural: keyof Inventory; color: string }[] = [
  { key: 'camera',    label: 'Cameras',    plural: 'cameras',    color: '#60a5fa' },
  { key: 'telescope', label: 'Telescopes', plural: 'telescopes', color: '#a78bfa' },
  { key: 'lens',      label: 'Lenses',     plural: 'lenses',     color: '#fbbf24' },
  { key: 'tracker',   label: 'Trackers',   plural: 'trackers',   color: '#34d399' },
]

function catColor(cat: EquipmentCategory): string {
  return CATEGORIES.find(c => c.key === cat)!.color
}

function catPlural(cat: EquipmentCategory): keyof Inventory {
  return CATEGORIES.find(c => c.key === cat)!.plural
}

// ── Inventory persistence ────────────────────────────────────────────────────

interface Inventory {
  cameras: string[]
  telescopes: string[]
  lenses: string[]
  trackers: string[]
}

const EMPTY_INV: Inventory = { cameras: [], telescopes: [], lenses: [], trackers: [] }

function loadInventory(): Inventory {
  try {
    const json = localStorage.getItem('cosmos-inventory')
    return json ? { ...EMPTY_INV, ...JSON.parse(json) } : EMPTY_INV
  } catch { return EMPTY_INV }
}

function persistInventory(inv: Inventory): void {
  localStorage.setItem('cosmos-inventory', JSON.stringify(inv))
}

// ── Saved Rigs persistence ───────────────────────────────────────────────────

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

// ── Equipment metadata helpers ───────────────────────────────────────────────

function cameraMeta(c: Camera): string {
  const sensor = c.sensorWidth >= 33 ? 'FF' : c.sensorWidth >= 20 ? 'APS-C' : 'M4/3'
  return `${sensor} · ${c.pixelSize}μm · ${c.type}`
}

function scopeMeta(t: Telescope): string {
  return `${t.aperture}mm f/${t.focalRatio} · ${t.focalLength}mm`
}

function lensMeta(l: Lens): string {
  return `${l.focalLength}mm f/${l.fNumber} · ${l.mount}`
}

function trackerMeta(t: Tracker): string {
  return `${t.maxPayloadKg}kg · ${t.type.replace(/-/g, ' ')}`
}

function itemMeta(cat: EquipmentCategory, item: { id: string }): string {
  switch (cat) {
    case 'camera': return cameraMeta(item as Camera)
    case 'telescope': return scopeMeta(item as Telescope)
    case 'lens': return lensMeta(item as Lens)
    case 'tracker': return trackerMeta(item as Tracker)
  }
}

// ── Multi-rig comparison types ───────────────────────────────────────────────

interface ComparedTarget {
  objectId: string
  name: string
  bestRigId: string
  bestScore: number
  rigs: Array<{
    rigId: string
    rigName: string
    score: number
    fillPercent: number
    fits: boolean
    panels: number
  }>
}

// ══════════════════════════════════════════════════════════════════════════════
// Component
// ══════════════════════════════════════════════════════════════════════════════

export function AstroPhotoView() {
  const { observer } = useObserverCtx()
  const now = useNow(30000)

  // ── Equipment database ──
  const cameras = Equipment.cameras()
  const telescopes = Equipment.telescopes()
  const lenses = Equipment.lenses()
  const trackers = Equipment.trackers()

  // ── Inventory state ──
  const [inventory, setInventory] = useState<Inventory>(loadInventory)
  const [inventoryTab, setInventoryTab] = useState<EquipmentCategory>('camera')
  const [inventorySearch, setInventorySearch] = useState('')
  const [showInventory, setShowInventory] = useState(false)

  // ── Rig builder state ──
  const [selectedCamera, setSelectedCamera] = useState('sony-a7iii')
  const [opticsType, setOpticsType] = useState<'telescope' | 'lens'>('telescope')
  const [selectedScope, setSelectedScope] = useState('sw-esprit-100ed')
  const [selectedLens, setSelectedLens] = useState('canon-ef-135mm-f2')
  const [selectedTracker, setSelectedTracker] = useState('none')
  const [rigName, setRigName] = useState('')
  const [showRigBuilder, setShowRigBuilder] = useState(false)

  // ── Rig & planning state ──
  const [savedRigs, setSavedRigs] = useState<SavedRig[]>(loadSavedRigs)
  const [activeRigId, setActiveRigId] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [skySite, setSkySite] = useState<SkySite>('suburban')
  const [planDate, setPlanDate] = useState('')

  // ── Persist to localStorage ──
  useEffect(() => { persistInventory(inventory) }, [inventory])
  useEffect(() => { saveSavedRigs(savedRigs) }, [savedRigs])

  // ── Inventory toggle ──
  const toggleItem = useCallback((category: EquipmentCategory, id: string) => {
    setInventory(prev => {
      const key = catPlural(category)
      const list = prev[key]
      const next = list.includes(id) ? list.filter(x => x !== id) : [...list, id]
      return { ...prev, [key]: next }
    })
  }, [])

  const totalOwned = inventory.cameras.length + inventory.telescopes.length + inventory.lenses.length + inventory.trackers.length

  // ── Equipment list for current inventory tab (owned first, then rest) ──
  const equipmentForTab = useMemo(() => {
    type Item = { id: string; name: string; brand: string }
    let items: readonly Item[]
    switch (inventoryTab) {
      case 'camera': items = cameras; break
      case 'telescope': items = telescopes; break
      case 'lens': items = lenses; break
      case 'tracker': items = trackers; break
    }
    const ownedSet = new Set(inventory[catPlural(inventoryTab)])
    const q = inventorySearch.toLowerCase()
    let filtered = [...items]
    if (q) {
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(q) || e.brand.toLowerCase().includes(q)
      )
    }
    // Sort: owned first, then alphabetical
    filtered.sort((a, b) => {
      const aOwned = ownedSet.has(a.id) ? 0 : 1
      const bOwned = ownedSet.has(b.id) ? 0 : 1
      if (aOwned !== bOwned) return aOwned - bOwned
      return a.name.localeCompare(b.name)
    })
    return filtered
  }, [inventoryTab, inventorySearch, cameras, telescopes, lenses, trackers, inventory])

  // ── Sorted equipment for rig builder dropdowns (owned first) ──
  const sortedCameras = useMemo(() => {
    const owned = new Set(inventory.cameras)
    return [...cameras].sort((a, b) => (owned.has(a.id) ? 0 : 1) - (owned.has(b.id) ? 0 : 1) || a.name.localeCompare(b.name))
  }, [cameras, inventory.cameras])

  const sortedScopes = useMemo(() => {
    const owned = new Set(inventory.telescopes)
    return [...telescopes].sort((a, b) => (owned.has(a.id) ? 0 : 1) - (owned.has(b.id) ? 0 : 1) || a.name.localeCompare(b.name))
  }, [telescopes, inventory.telescopes])

  const sortedLenses = useMemo(() => {
    const owned = new Set(inventory.lenses)
    return [...lenses].sort((a, b) => (owned.has(a.id) ? 0 : 1) - (owned.has(b.id) ? 0 : 1) || a.name.localeCompare(b.name))
  }, [lenses, inventory.lenses])

  const sortedTrackers = useMemo(() => {
    const owned = new Set(inventory.trackers)
    return [...trackers].sort((a, b) => (owned.has(a.id) ? 0 : 1) - (owned.has(b.id) ? 0 : 1) || a.name.localeCompare(b.name))
  }, [trackers, inventory.trackers])

  // ── Save rig handler ──
  const handleSaveRig = useCallback(() => {
    const cam = cameras.find(c => c.id === selectedCamera)
    const opticsName = opticsType === 'lens'
      ? lenses.find(l => l.id === selectedLens)?.name ?? 'Lens'
      : telescopes.find(t => t.id === selectedScope)?.name ?? 'Scope'
    const name = rigName.trim() || `${cam?.name ?? 'Camera'} + ${opticsName}`
    const id = `rig-${Date.now()}`
    setSavedRigs(prev => [...prev, {
      id, name, cameraId: selectedCamera, opticsType,
      scopeId: selectedScope, lensId: selectedLens, trackerId: selectedTracker,
    }])
    setRigName('')
    setShowRigBuilder(false)
    setActiveRigId(id)
  }, [selectedCamera, opticsType, selectedScope, selectedLens, selectedTracker, rigName, cameras, telescopes, lenses])

  const handleLoadRig = useCallback((rig: SavedRig) => {
    setActiveRigId(rig.id)
    setCompareMode(false)
    // Also update builder fields so editing is easy
    setSelectedCamera(rig.cameraId)
    setOpticsType(rig.opticsType ?? 'telescope')
    setSelectedScope(rig.scopeId)
    if (rig.lensId) setSelectedLens(rig.lensId)
    if (rig.trackerId) setSelectedTracker(rig.trackerId)
  }, [])

  const handleDeleteRig = useCallback((id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSavedRigs(prev => prev.filter(r => r.id !== id))
    if (activeRigId === id) setActiveRigId(null)
  }, [activeRigId])

  // ── Build Rig instances from saved configs ──
  const builtRigs = useMemo(() => {
    return savedRigs.map(sr => {
      try {
        const cam = cameras.find(c => c.id === sr.cameraId)
        if (!cam) return { saved: sr, rig: null }
        const tracker = sr.trackerId && sr.trackerId !== 'none'
          ? trackers.find(t => t.id === sr.trackerId) : undefined
        if (sr.opticsType === 'lens') {
          const lens = lenses.find(l => l.id === sr.lensId)
          if (!lens) return { saved: sr, rig: null }
          return { saved: sr, rig: Equipment.rig({ camera: cam, lens, tracker }) }
        } else {
          const scope = telescopes.find(t => t.id === sr.scopeId)
          if (!scope) return { saved: sr, rig: null }
          return { saved: sr, rig: Equipment.rig({ camera: cam, telescope: scope, tracker }) }
        }
      } catch { return { saved: sr, rig: null } }
    })
  }, [savedRigs, cameras, telescopes, lenses, trackers])

  // ── Active rig (selected card, or first, or ad-hoc from builder) ──
  const activeBuilt = useMemo(() => {
    if (activeRigId) {
      const found = builtRigs.find(r => r.saved.id === activeRigId)
      if (found) return found
    }
    return builtRigs[0] ?? null
  }, [activeRigId, builtRigs])

  // Fallback: ad-hoc rig from builder fields (when no saved rigs)
  const adHocRig = useMemo(() => {
    if (builtRigs.length > 0) return null
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
  }, [builtRigs.length, selectedCamera, opticsType, selectedScope, selectedLens, selectedTracker, cameras, telescopes, lenses, trackers])

  const activeRig = activeBuilt?.rig ?? adHocRig

  // ── Planning ──
  const effectiveDate = useMemo(() => planDate ? new Date(planDate + 'T20:00:00') : now, [planDate, now])
  const obs = useMemo(() => ({ ...observer, date: effectiveDate }), [observer, effectiveDate])

  // Plans for all saved rigs
  const allPlans = useMemo(() => {
    return builtRigs.map(br => {
      if (!br.rig) return { ...br, plan: null as RigPlanResult | null }
      return { ...br, plan: AstroPhoto.rigPlan(br.rig, obs, { skySite }) }
    })
  }, [builtRigs, obs, skySite])

  // Active plan (single rig)
  const activePlan: RigPlanResult | null = useMemo(() => {
    if (activeBuilt) {
      const found = allPlans.find(p => p.saved.id === activeBuilt.saved.id)
      return found?.plan ?? null
    }
    // Ad-hoc rig plan
    if (adHocRig) return AstroPhoto.rigPlan(adHocRig, obs, { skySite })
    return null
  }, [activeBuilt, allPlans, adHocRig, obs, skySite])

  // Multi-rig comparison
  const comparedTargets = useMemo((): ComparedTarget[] | null => {
    const plansWithData = allPlans.filter(p => p.plan && p.plan.targets.length > 0)
    if (plansWithData.length <= 1) return null

    const map = new Map<string, ComparedTarget>()
    for (const p of plansWithData) {
      if (!p.plan) continue
      for (const t of p.plan.targets) {
        const entry = {
          rigId: p.saved.id, rigName: p.saved.name,
          score: t.score, fillPercent: t.framing.fillPercent,
          fits: t.framing.fits, panels: t.framing.panels,
        }
        const existing = map.get(t.objectId)
        if (!existing) {
          map.set(t.objectId, {
            objectId: t.objectId, name: t.name,
            bestRigId: p.saved.id, bestScore: t.score,
            rigs: [entry],
          })
        } else {
          existing.rigs.push(entry)
          if (t.score > existing.bestScore) {
            existing.bestScore = t.score
            existing.bestRigId = p.saved.id
          }
        }
      }
    }
    return [...map.values()].sort((a, b) => b.bestScore - a.bestScore)
  }, [allPlans])

  // Reference data
  const data = useMemo(() => {
    const mw = AstroPhoto.milkyWay(obs)
    const pa = AstroPhoto.polarAlignment(obs)
    const gh = AstroPhoto.goldenHour(obs)
    const bh = AstroPhoto.blueHour(obs)
    const ff = AstroPhoto.flatFrameWindow(obs)
    const collStar = AstroPhoto.collimationStar(obs)
    const mwSeason = AstroPhoto.milkyWaySeason(obs)
    return { mw, pa, gh, bh, ff, collStar, mwSeason }
  }, [obs])

  const fov = activeRig?.fov()

  // ── Styles ──
  const selectStyle: React.CSSProperties = { width: '100%', padding: '8px', background: 'var(--c-bg-card)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', fontSize: '13px' }
  const labelStyle: React.CSSProperties = { color: 'var(--c-text)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className={styles.page}>
      <div className={styles.stickyHeader}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Astrophotography</h1>
            <p className={styles.subtitle}>
              {activeRig && fov
                ? `${activeRig.camera.name} + ${fov.width.toFixed(1)}° FOV · ${activeRig.pixelScale().toFixed(2)}"/px · ${activeRig.maxExposure()}s max${activeRig.isTracked ? ' (tracked)' : ''}`
                : totalOwned > 0
                ? `${totalOwned} items in inventory · ${savedRigs.length} rig${savedRigs.length !== 1 ? 's' : ''} configured`
                : 'Set up your equipment inventory to plan sessions'}
            </p>
          </div>
        </section>
      </div>

      <div className={styles.content}>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 1. MY EQUIPMENT (Inventory)                                       */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showInventory ? '16px' : 0 }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            My Equipment
            {totalOwned > 0 && (
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--c-text-secondary)', marginLeft: '12px' }}>
                {CATEGORIES.map(cat => {
                  const count = inventory[cat.plural].length
                  return count > 0 ? (
                    <span key={cat.key} style={{ marginRight: '10px' }}>
                      <span style={{ color: cat.color, fontWeight: 600 }}>{count}</span>
                      {' '}{cat.label.toLowerCase()}
                    </span>
                  ) : null
                })}
              </span>
            )}
          </h2>
          <button
            onClick={() => setShowInventory(!showInventory)}
            style={{
              padding: '6px 14px', fontSize: '12px', fontWeight: 500,
              background: showInventory ? 'var(--c-accent)' : 'var(--c-bg-card)',
              color: showInventory ? '#fff' : 'var(--c-text-secondary)',
              border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer',
            }}
          >
            {showInventory ? 'Done' : 'Edit'}
          </button>
        </div>

        {showInventory && (
          <>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
              {CATEGORIES.map(cat => {
                const count = inventory[cat.plural].length
                const isActive = inventoryTab === cat.key
                return (
                  <button
                    key={cat.key}
                    onClick={() => setInventoryTab(cat.key)}
                    style={{
                      flex: 1, padding: '8px 12px', fontSize: '12px', fontWeight: 600,
                      background: isActive ? `${cat.color}18` : 'var(--c-bg-card)',
                      color: isActive ? cat.color : 'var(--c-text-secondary)',
                      border: `1px solid ${isActive ? `${cat.color}40` : 'var(--c-border)'}`,
                      borderRadius: 'var(--r-sm)', cursor: 'pointer',
                    }}
                  >
                    {cat.label}{count > 0 ? ` (${count})` : ''}
                  </button>
                )
              })}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder={`Search ${CATEGORIES.find(c => c.key === inventoryTab)!.label.toLowerCase()}...`}
              value={inventorySearch}
              onChange={e => setInventorySearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', marginBottom: '10px',
                background: 'var(--c-bg-card)', color: 'var(--c-text)',
                border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)',
                fontSize: '13px', boxSizing: 'border-box',
              }}
            />

            {/* Equipment grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '400px', overflowY: 'auto', padding: '2px' }}>
              {equipmentForTab.map(item => {
                const isOwned = inventory[catPlural(inventoryTab)].includes(item.id)
                const color = catColor(inventoryTab)
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(inventoryTab, item.id)}
                    style={{
                      padding: '10px 12px',
                      background: isOwned ? `${color}0a` : 'var(--c-bg-card)',
                      borderLeft: `3px solid ${isOwned ? color : 'transparent'}`,
                      border: `1px solid ${isOwned ? `${color}30` : 'var(--c-border)'}`,
                      borderLeftWidth: '3px',
                      borderLeftColor: isOwned ? color : 'var(--c-border)',
                      borderRadius: 'var(--r-md)',
                      cursor: 'pointer',
                      opacity: isOwned ? 1 : 0.5,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: isOwned ? 600 : 400, color: 'var(--c-text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{item.name}</span>
                      {isOwned && <span style={{ color, fontSize: '14px' }}>&#10003;</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '3px' }}>
                      {itemMeta(inventoryTab, item)}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Collapsed: show owned items as compact badges */}
        {!showInventory && totalOwned > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
            {CATEGORIES.flatMap(cat =>
              inventory[cat.plural].map(id => {
                let name = id
                switch (cat.key) {
                  case 'camera': name = cameras.find(c => c.id === id)?.name ?? id; break
                  case 'telescope': name = telescopes.find(t => t.id === id)?.name ?? id; break
                  case 'lens': name = lenses.find(l => l.id === id)?.name ?? id; break
                  case 'tracker': name = trackers.find(t => t.id === id)?.name ?? id; break
                }
                return (
                  <span
                    key={`${cat.key}-${id}`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '4px 10px', fontSize: '11px', fontWeight: 500,
                      background: `${cat.color}10`, color: cat.color,
                      border: `1px solid ${cat.color}25`,
                      borderRadius: '20px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cat.color, display: 'inline-block' }} />
                    {name}
                  </span>
                )
              })
            )}
          </div>
        )}

        {!showInventory && totalOwned === 0 && (
          <div className={styles.bodyCard} style={{ marginTop: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--c-text-secondary)', margin: 0 }}>
              Click <strong>Edit</strong> to mark the cameras, telescopes, lenses, and trackers you own.
            </p>
          </div>
        )}
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 2. MY RIGS                                                        */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>My Rigs</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {savedRigs.length > 1 && (
              <button
                onClick={() => setCompareMode(!compareMode)}
                style={{
                  padding: '6px 14px', fontSize: '12px', fontWeight: 500,
                  background: compareMode ? 'var(--c-accent)' : 'var(--c-bg-card)',
                  color: compareMode ? '#fff' : 'var(--c-text-secondary)',
                  border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                }}
              >
                {compareMode ? 'Single View' : 'Compare'}
              </button>
            )}
            <button
              onClick={() => setShowRigBuilder(!showRigBuilder)}
              style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: 500,
                background: showRigBuilder ? 'var(--c-accent)' : 'var(--c-bg-card)',
                color: showRigBuilder ? '#fff' : 'var(--c-text-secondary)',
                border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer',
              }}
            >
              {showRigBuilder ? 'Cancel' : '+ New Rig'}
            </button>
          </div>
        </div>

        {/* Rig builder form */}
        {showRigBuilder && (
          <div className={styles.bodyCard} style={{ marginBottom: '12px', padding: '16px' }}>
            <div className={styles.dualGrid}>
              {/* Camera */}
              <div>
                <div style={labelStyle}>Camera</div>
                <select value={selectedCamera} onChange={e => setSelectedCamera(e.target.value)} style={selectStyle}>
                  {sortedCameras.map(c => (
                    <option key={c.id} value={c.id}>
                      {inventory.cameras.includes(c.id) ? '\u25CF ' : '  '}{c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optics */}
              <div>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                  <button
                    onClick={() => setOpticsType('telescope')}
                    style={{ flex: 1, padding: '5px', fontSize: '12px', background: opticsType === 'telescope' ? 'var(--c-accent)' : 'var(--c-bg)', color: opticsType === 'telescope' ? '#fff' : 'var(--c-text-secondary)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}
                  >Telescope</button>
                  <button
                    onClick={() => setOpticsType('lens')}
                    style={{ flex: 1, padding: '5px', fontSize: '12px', background: opticsType === 'lens' ? 'var(--c-accent)' : 'var(--c-bg)', color: opticsType === 'lens' ? '#fff' : 'var(--c-text-secondary)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-sm)', cursor: 'pointer' }}
                  >Lens</button>
                </div>
                {opticsType === 'telescope' ? (
                  <select value={selectedScope} onChange={e => setSelectedScope(e.target.value)} style={selectStyle}>
                    {sortedScopes.map(t => (
                      <option key={t.id} value={t.id}>
                        {inventory.telescopes.includes(t.id) ? '\u25CF ' : '  '}{t.name} ({t.aperture}mm f/{t.focalRatio})
                      </option>
                    ))}
                  </select>
                ) : (
                  <select value={selectedLens} onChange={e => setSelectedLens(e.target.value)} style={selectStyle}>
                    {sortedLenses.map(l => (
                      <option key={l.id} value={l.id}>
                        {inventory.lenses.includes(l.id) ? '\u25CF ' : '  '}{l.name} (f/{l.fNumber})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tracker */}
              <div>
                <div style={labelStyle}>Tracker / Mount</div>
                <select value={selectedTracker} onChange={e => setSelectedTracker(e.target.value)} style={selectStyle}>
                  <option value="none">None (untracked)</option>
                  {sortedTrackers.map(t => (
                    <option key={t.id} value={t.id}>
                      {inventory.trackers.includes(t.id) ? '\u25CF ' : '  '}{t.name} ({t.maxPayloadKg}kg)
                    </option>
                  ))}
                </select>
              </div>

              {/* Name + Save */}
              <div>
                <div style={labelStyle}>Rig Name</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Auto-generated"
                    value={rigName}
                    onChange={e => setRigName(e.target.value)}
                    style={{ flex: 1, padding: '8px', background: 'var(--c-bg-card)', color: 'var(--c-text)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', fontSize: '13px' }}
                  />
                  <button
                    onClick={handleSaveRig}
                    style={{ padding: '8px 16px', fontSize: '13px', fontWeight: 600, background: 'var(--c-accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer' }}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rig cards */}
        {savedRigs.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {builtRigs.map(({ saved, rig }) => {
              const isActive = (activeRigId === saved.id) || (!activeRigId && builtRigs[0]?.saved.id === saved.id)
              const rigFov = rig?.fov()
              return (
                <div
                  key={saved.id}
                  onClick={() => handleLoadRig(saved)}
                  style={{
                    padding: '14px 16px',
                    background: isActive ? 'rgba(167,139,250,0.08)' : 'var(--c-bg-card)',
                    border: `1px solid ${isActive ? 'rgba(167,139,250,0.35)' : 'var(--c-border)'}`,
                    borderRadius: 'var(--r-md)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>
                      {saved.name}
                    </h3>
                    <button
                      onClick={e => handleDeleteRig(saved.id, e)}
                      style={{ padding: '0 4px', fontSize: '16px', lineHeight: 1, background: 'none', color: 'var(--c-text-secondary)', border: 'none', cursor: 'pointer', opacity: 0.4 }}
                      title="Delete rig"
                    >&times;</button>
                  </div>

                  {/* Equipment labels with category-colored dots */}
                  <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: catColor('camera'), display: 'inline-block', flexShrink: 0 }} />
                      {cameras.find(c => c.id === saved.cameraId)?.name ?? saved.cameraId}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: catColor(saved.opticsType), display: 'inline-block', flexShrink: 0 }} />
                      {saved.opticsType === 'telescope'
                        ? (telescopes.find(t => t.id === saved.scopeId)?.name ?? saved.scopeId)
                        : (lenses.find(l => l.id === saved.lensId)?.name ?? saved.lensId)}
                    </span>
                    {saved.trackerId && saved.trackerId !== 'none' && (
                      <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: catColor('tracker'), display: 'inline-block', flexShrink: 0 }} />
                        {trackers.find(t => t.id === saved.trackerId)?.name ?? saved.trackerId}
                      </span>
                    )}
                  </div>

                  {/* Rig specs */}
                  {rig && rigFov && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--c-border)', fontSize: '11px', color: 'var(--c-text-secondary)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '2px 7px', borderRadius: '4px', background: 'rgba(96,165,250,0.10)', color: '#60a5fa' }}>
                        {rigFov.width.toFixed(1)}° FOV
                      </span>
                      <span style={{ padding: '2px 7px', borderRadius: '4px', background: 'rgba(167,139,250,0.10)', color: '#a78bfa' }}>
                        {rig.pixelScale().toFixed(2)}"/px
                      </span>
                      <span style={{ padding: '2px 7px', borderRadius: '4px', background: 'rgba(52,211,153,0.10)', color: '#34d399' }}>
                        {rig.maxExposure()}s max
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : !showRigBuilder ? (
          <div className={styles.bodyCard}>
            <p style={{ fontSize: '13px', color: 'var(--c-text-secondary)', margin: 0 }}>
              No rigs configured. Click <strong>+ New Rig</strong> to create your first equipment combination.
            </p>
          </div>
        ) : null}

        {/* Sky conditions + date */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={labelStyle}>Sky Conditions</div>
            <select value={skySite} onChange={e => setSkySite(e.target.value as SkySite)} style={selectStyle}>
              <option value="pristine">Pristine dark sky (Bortle 1)</option>
              <option value="remote">Remote wilderness (Bortle 2)</option>
              <option value="dark-site">Dark sky park (Bortle 3)</option>
              <option value="rural">Rural countryside (Bortle 4)</option>
              <option value="rural-suburban">Rural/suburban transition (Bortle 5)</option>
              <option value="suburban">Suburban neighborhood (Bortle 6)</option>
              <option value="bright-suburban">Bright suburban (Bortle 8)</option>
              <option value="city-center">City center (Bortle 9)</option>
            </select>
          </div>
          <div style={{ minWidth: '200px' }}>
            <div style={labelStyle}>Date</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="date"
                value={planDate}
                onChange={e => setPlanDate(e.target.value)}
                style={{ ...selectStyle, flex: 1 }}
              />
              {planDate && (
                <button
                  onClick={() => setPlanDate('')}
                  style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--c-accent)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Live
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 3. CAPTURE PLAN — single rig or multi-rig comparison              */}
      {/* ────────────────────────────────────────────────────────────────── */}

      {/* Multi-rig comparison */}
      {compareMode && comparedTargets && comparedTargets.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {planDate ? `Rig Comparison — ${new Date(planDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : 'Rig Comparison — Tonight'}
          </h2>
          <div className={styles.bodyCard} style={{ padding: '12px 16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--c-text-secondary)' }}>
              {comparedTargets.length} targets across {allPlans.filter(p => p.plan && p.plan.targets.length > 0).length} rigs
            </div>
          </div>
          <div className={styles.showerGrid}>
            {comparedTargets.map((target, i) => (
              <div key={target.objectId} className={styles.showerCard}>
                <div className={styles.showerHeader}>
                  <h3 className={styles.showerName}>
                    <span style={{ color: 'var(--c-text-secondary)', marginRight: '6px' }}>#{i + 1}</span>
                    {target.name}
                  </h3>
                  <span className={styles.showerZHR} style={{ color: target.bestScore > 70 ? '#34d399' : target.bestScore > 40 ? '#fbbf24' : '#f87171' }}>
                    {target.bestScore}/100
                  </span>
                </div>
                {/* Per-rig breakdown */}
                <div style={{ marginTop: '10px' }}>
                  {target.rigs
                    .sort((a, b) => b.score - a.score)
                    .map(r => {
                      const isBest = r.rigId === target.bestRigId
                      return (
                        <div
                          key={r.rigId}
                          style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '6px 8px', marginTop: '4px',
                            background: isBest ? 'rgba(52,211,153,0.08)' : 'transparent',
                            borderRadius: 'var(--r-sm)',
                            borderLeft: `2px solid ${isBest ? '#34d399' : 'var(--c-border)'}`,
                          }}
                        >
                          <span style={{ fontSize: '12px', color: isBest ? '#34d399' : 'var(--c-text-secondary)', fontWeight: isBest ? 600 : 400 }}>
                            {isBest ? 'Best: ' : ''}{r.rigName}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
                            <span style={{
                              padding: '1px 6px', borderRadius: '4px',
                              background: r.fits ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                              color: r.fits ? '#34d399' : '#fbbf24',
                            }}>
                              {r.fits ? `${r.fillPercent}%` : `${r.panels}p`}
                            </span>
                            <span style={{ color: 'var(--c-text-secondary)' }}>{r.score}/100</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {compareMode && (!comparedTargets || comparedTargets.length === 0) && savedRigs.length > 1 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Rig Comparison</h2>
          <div className={styles.bodyCard}>
            <p style={{ fontSize: '13px', color: 'var(--c-text-secondary)', margin: 0 }}>
              No overlapping targets found across your rigs {planDate ? 'on this date' : 'tonight'}. Try a different date or adjust your rigs.
            </p>
          </div>
        </section>
      )}

      {/* Single rig capture plan */}
      {!compareMode && activePlan && activePlan.targets.length > 0 && (
        <section className={styles.section}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
              {planDate ? `What You Can Capture on ${new Date(planDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : 'What You Can Capture Tonight'}
              {activeBuilt && savedRigs.length > 1 && (
                <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--c-text-secondary)', marginLeft: '10px' }}>
                  with {activeBuilt.saved.name}
                </span>
              )}
            </h2>
          </div>
          <div className={styles.bodyCard} style={{ padding: '12px 16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--c-text-secondary)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <span>
                Darkness {activePlan.darkness.start.toLocaleTimeString([], TIME_FMT)} – {activePlan.darkness.end.toLocaleTimeString([], TIME_FMT)}
                <span style={{ margin: '0 6px', opacity: 0.3 }}>|</span>
                {activePlan.darknessHours}h usable
              </span>
              <span>
                {activePlan.targets.length} targets fit your {activePlan.rig.fov.width.toFixed(1)}° FOV
              </span>
            </div>
          </div>
          <div className={styles.showerGrid}>
            {activePlan.targets.map((t: RigPlanTarget, i: number) => (
              <div key={t.objectId} className={styles.showerCard}>
                <div className={styles.showerHeader}>
                  <h3 className={styles.showerName}>
                    <span style={{ color: 'var(--c-text-secondary)', marginRight: '6px' }}>#{i + 1}</span>
                    {t.name}
                    {t.source === 'explicit' && (
                      <span style={{ marginLeft: '8px', fontSize: '10px', padding: '1px 6px', background: 'var(--c-accent-dim, rgba(167,139,250,0.15))', color: 'var(--c-accent, #a78bfa)', borderRadius: '4px', verticalAlign: 'middle' }}>
                        PINNED
                      </span>
                    )}
                  </h3>
                  <span className={styles.showerZHR} style={{ color: t.score > 70 ? '#34d399' : t.score > 40 ? '#fbbf24' : '#f87171' }}>
                    {t.score}/100
                  </span>
                </div>
                {/* When & where */}
                <div className={styles.showerMeta}>
                  <span>{t.start.toLocaleTimeString([], TIME_FMT)} – {t.end.toLocaleTimeString([], TIME_FMT)}</span>
                  <span>·</span>
                  <span>Peak {t.peakAltitude.toFixed(0)}°</span>
                  <span>·</span>
                  <span>AM {t.airmassRange[0]}–{t.airmassRange[1]}</span>
                  <span>·</span>
                  <span>Moon {t.moonSeparation}°{t.moonInterference > 0.3 ? ' !' : ''}</span>
                </div>
                {/* Framing */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                    background: t.framing.fits ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                    color: t.framing.fits ? '#34d399' : '#fbbf24',
                  }}>
                    {t.framing.fits ? `Fills ${t.framing.fillPercent}%` : `Mosaic ${t.framing.panels} panels`}
                  </span>
                  {t.framing.objectSize > 0 && (
                    <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)' }}>
                      {t.framing.objectSize.toFixed(0)}' in {t.framing.fovWidth.toFixed(0)}' FOV
                    </span>
                  )}
                  {/* Show best rig badge if multiple rigs exist */}
                  {comparedTargets && (() => {
                    const ct = comparedTargets.find(c => c.objectId === t.objectId)
                    if (!ct || ct.rigs.length <= 1) return null
                    const best = ct.bestRigId === activeBuilt?.saved.id
                    return (
                      <span style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                        background: best ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                        color: best ? '#34d399' : '#fbbf24',
                      }}>
                        {best ? 'Best rig' : `Better with ${ct.rigs.find(r => r.rigId === ct.bestRigId)?.rigName ?? 'other'}`}
                      </span>
                    )
                  })()}
                </div>
                {/* Capture recipe */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', fontSize: '11px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
                    f/{t.capture.focalRatio}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
                    {t.capture.iso ? `ISO ${t.capture.iso}` : `Gain ${t.capture.gain}`}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(96,165,250,0.12)', color: '#60a5fa' }}>
                    {t.capture.subExposure}s subs
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)', alignSelf: 'center' }}>
                    {t.capture.subs} x {t.capture.subExposure}s = <strong style={{ color: 'var(--c-text)' }}>{t.capture.totalIntegration}h</strong>
                  </span>
                </div>
                {/* Calibration */}
                <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--c-text-secondary)', opacity: 0.7 }}>
                  {t.capture.calibration.darks} darks · {t.capture.calibration.flats} flats · {t.capture.calibration.bias} bias — {t.capture.calibration.darkNote}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!compareMode && activePlan && activePlan.targets.length === 0 && activeRig && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What You Can Capture</h2>
          <div className={styles.bodyCard}>
            <p style={{ fontSize: '13px', color: 'var(--c-text-secondary)', margin: 0 }}>
              No targets fit your {fov ? `${fov.width.toFixed(1)}°` : ''} FOV {planDate ? 'on this date' : 'tonight'}.
              {fov && fov.width < 1 ? ' Try a shorter focal length for a wider field.' : ''}
              {' '}Try picking a different date.
            </p>
          </div>
        </section>
      )}

      {!compareMode && !activeRig && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>What You Can Capture Tonight</h2>
          <div className={styles.bodyCard}>
            <p style={{ fontSize: '13px', color: 'var(--c-text-secondary)', margin: 0 }}>
              Create a rig above to see targets matched to your equipment.
            </p>
          </div>
        </section>
      )}

      {/* ────────────────────────────────────────────────────────────────── */}
      {/* 4. REFERENCE — Milky Way, Polar Alignment                         */}
      {/* ────────────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tonight's Reference</h2>
        <div className={styles.dualGrid}>
          {/* Milky Way */}
          <div className={styles.bodyCard}>
            <div className={styles.bodyHeader}>
              <div className={styles.bodyIcon} style={{ background: 'linear-gradient(135deg, #a78bfa, #6d28d9)' }}>&#127748;</div>
              <div>
                <h2 className={styles.bodyName}>Milky Way Core</h2>
                <span className={styles.bodyType}>
                  {data.mw.aboveHorizon ? `Alt ${data.mw.altitude.toFixed(1)}° · Az ${data.mw.azimuth.toFixed(1)}°` : 'Below horizon'}
                </span>
              </div>
            </div>
            <div className={styles.bodyStats}>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Rise</span>
                <span className={styles.bodyStatValue}>{data.mw.rise?.toLocaleTimeString([], TIME_FMT) ?? '—'}</span>
              </div>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Transit</span>
                <span className={styles.bodyStatValue}>{data.mw.transit.toLocaleTimeString([], TIME_FMT)}</span>
              </div>
              <div className={styles.bodyStat}>
                <span className={styles.bodyStatLabel}>Set</span>
                <span className={styles.bodyStatValue}>{data.mw.set?.toLocaleTimeString([], TIME_FMT) ?? '—'}</span>
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
              <div className={styles.bodyIcon} style={{ background: 'linear-gradient(135deg, #60a5fa, #2563eb)' }}>&#8853;</div>
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

      {/* Photo Windows */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Photo Windows</h2>
        <div className={`${styles.objectGrid} stagger-grid`}>
          {data.gh.evening && (
            <div className={styles.objectCard}>
              <div className={styles.objectTop}><span className={styles.objectType}>Golden Hour</span></div>
              <h3 className={styles.objectName}>Evening</h3>
              <p className={styles.objectPos}>
                {data.gh.evening.start.toLocaleTimeString([], TIME_FMT)} – {data.gh.evening.end.toLocaleTimeString([], TIME_FMT)}
              </p>
            </div>
          )}
          {data.bh.evening && (
            <div className={styles.objectCard}>
              <div className={styles.objectTop}><span className={styles.objectType}>Blue Hour</span></div>
              <h3 className={styles.objectName}>Evening</h3>
              <p className={styles.objectPos}>
                {data.bh.evening.start.toLocaleTimeString([], TIME_FMT)} – {data.bh.evening.end.toLocaleTimeString([], TIME_FMT)}
              </p>
            </div>
          )}
          {data.ff.evening && (
            <div className={styles.objectCard}>
              <div className={styles.objectTop}><span className={styles.objectType}>Flat Frames</span></div>
              <h3 className={styles.objectName}>Evening Window</h3>
              <p className={styles.objectPos}>
                {data.ff.evening.start.toLocaleTimeString([], TIME_FMT)} – {data.ff.evening.end.toLocaleTimeString([], TIME_FMT)}
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
