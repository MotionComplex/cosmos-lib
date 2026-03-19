import { useMemo } from 'react'
import { Moon, AstroMath, Units } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { useNow } from '../hooks/useNow'
import { MoonPhaseIcon } from '../components/MoonPhaseIcon'
import styles from './MoonView.module.css'

function formatTime(d: Date | null | undefined) {
  if (!d) return '--:--'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function MoonView() {
  const { observer } = useObserverCtx()
  const now = useNow(5000)

  const data = useMemo(() => {
    const pos = Moon.position(now)
    const phase = Moon.phase(now)
    const hz = AstroMath.equatorialToHorizontal(
      { ra: pos.ra, dec: pos.dec },
      { ...observer, date: now }
    )
    const rts = Moon.riseTransitSet({ ...observer, date: now })
    const lib = Moon.libration(now)

    // Calculate next phases
    const nextNew = Moon.nextPhase(now, 'new')
    const nextFirst = Moon.nextPhase(now, 'first-quarter')
    const nextFull = Moon.nextPhase(now, 'full')
    const nextLast = Moon.nextPhase(now, 'last-quarter')

    // Generate phase calendar for next 30 days
    const calendar: { date: Date; phase: number; illumination: number }[] = []
    for (let i = 0; i < 30; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() + i)
      const p = Moon.phase(d)
      calendar.push({ date: d, phase: p.phase, illumination: p.illumination })
    }

    return { pos, phase, hz, rts, lib, nextNew, nextFirst, nextFull, nextLast, calendar }
  }, [observer, now])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Moon</h1>
          <p className={styles.subtitle}>Lunar ephemeris & phase tracker</p>
        </div>
      </div>

      {/* Hero phase display */}
      <div className={styles.phaseHero}>
        <div className={styles.phaseVisual}>
          <MoonPhaseIcon phase={data.phase.phase} size={160} />
        </div>
        <div className={styles.phaseInfo}>
          <span className={styles.phaseName}>{data.phase.name.replace(/-/g, ' ')}</span>
          <div className={styles.phaseNumbers}>
            <div className={styles.phaseNum}>
              <span className={styles.phaseNumValue}>{(data.phase.illumination * 100).toFixed(1)}%</span>
              <span className={styles.phaseNumLabel}>Illumination</span>
            </div>
            <div className={styles.phaseNum}>
              <span className={styles.phaseNumValue}>{data.phase.age.toFixed(1)}</span>
              <span className={styles.phaseNumLabel}>Age (days)</span>
            </div>
            <div className={styles.phaseNum}>
              <span className={styles.phaseNumValue}>{(data.phase.phase * 360).toFixed(1)}°</span>
              <span className={styles.phaseNumLabel}>Phase Angle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data grid */}
      <div className={styles.dataGrid}>
        <div className={styles.dataCard}>
          <h3 className={styles.dataTitle}>Position</h3>
          <div className={styles.dataRows}>
            <div className={styles.dataRow}>
              <span>Right Ascension</span>
              <span className={styles.dataValue}>{Units.formatRA(data.pos.ra)}</span>
            </div>
            <div className={styles.dataRow}>
              <span>Declination</span>
              <span className={styles.dataValue}>{data.pos.dec > 0 ? '+' : ''}{data.pos.dec.toFixed(4)}°</span>
            </div>
            <div className={styles.dataRow}>
              <span>Altitude</span>
              <span className={styles.dataValue} style={{ color: data.hz.alt > 0 ? 'var(--green)' : 'var(--text-muted)' }}>
                {data.hz.alt.toFixed(2)}°
              </span>
            </div>
            <div className={styles.dataRow}>
              <span>Azimuth</span>
              <span className={styles.dataValue}>{data.hz.az.toFixed(2)}°</span>
            </div>
            <div className={styles.dataRow}>
              <span>Distance</span>
              <span className={styles.dataValue}>{data.pos.distance_km.toLocaleString()} km</span>
            </div>
            <div className={styles.dataRow}>
              <span>Parallax</span>
              <span className={styles.dataValue}>{data.pos.parallax.toFixed(4)}°</span>
            </div>
          </div>
        </div>

        <div className={styles.dataCard}>
          <h3 className={styles.dataTitle}>Rise & Set</h3>
          <div className={styles.dataRows}>
            <div className={styles.dataRow}>
              <span>Moonrise</span>
              <span className={styles.dataValue}>{formatTime(data.rts.rise)}</span>
            </div>
            <div className={styles.dataRow}>
              <span>Transit</span>
              <span className={styles.dataValue}>{formatTime(data.rts.transit)}</span>
            </div>
            <div className={styles.dataRow}>
              <span>Moonset</span>
              <span className={styles.dataValue}>{formatTime(data.rts.set)}</span>
            </div>
          </div>

          <h3 className={styles.dataTitle} style={{ marginTop: 20 }}>Libration</h3>
          <div className={styles.dataRows}>
            <div className={styles.dataRow}>
              <span>Longitude (l)</span>
              <span className={styles.dataValue}>{data.lib.l.toFixed(2)}°</span>
            </div>
            <div className={styles.dataRow}>
              <span>Latitude (b)</span>
              <span className={styles.dataValue}>{data.lib.b.toFixed(2)}°</span>
            </div>
          </div>
        </div>

        <div className={styles.dataCard}>
          <h3 className={styles.dataTitle}>Upcoming Phases</h3>
          <div className={styles.phaseList}>
            <div className={styles.phaseItem}>
              <MoonPhaseIcon phase={0} size={28} />
              <div>
                <span className={styles.phaseItemName}>New Moon</span>
                <span className={styles.phaseItemDate}>{data.nextNew.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
            <div className={styles.phaseItem}>
              <MoonPhaseIcon phase={0.25} size={28} />
              <div>
                <span className={styles.phaseItemName}>First Quarter</span>
                <span className={styles.phaseItemDate}>{data.nextFirst.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
            <div className={styles.phaseItem}>
              <MoonPhaseIcon phase={0.5} size={28} />
              <div>
                <span className={styles.phaseItemName}>Full Moon</span>
                <span className={styles.phaseItemDate}>{data.nextFull.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
            <div className={styles.phaseItem}>
              <MoonPhaseIcon phase={0.75} size={28} />
              <div>
                <span className={styles.phaseItemName}>Last Quarter</span>
                <span className={styles.phaseItemDate}>{data.nextLast.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 30-day phase calendar */}
      <div className={styles.calendarSection}>
        <h3 className={styles.dataTitle}>30-Day Lunar Calendar</h3>
        <div className={styles.calendar}>
          {data.calendar.map((day, i) => (
            <div key={i} className={styles.calDay} title={`${formatDate(day.date)}: ${(day.illumination * 100).toFixed(0)}% illuminated`}>
              <MoonPhaseIcon phase={day.phase} size={28} />
              <span className={styles.calDate}>{day.date.getDate()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
