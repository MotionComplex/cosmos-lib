/**
 * EventsView — Upcoming astronomical events timeline.
 *
 * cosmos-lib docs used in this file:
 * - Events.nextEvents → {@link https://github.com/motioncomplex/cosmos-lib/blob/main/docs/api/events.md Events API docs}
 * - Events.toICal → iCal export for calendar integration
 */
import { useMemo, useCallback } from 'react'
import { Events } from 'cosmos-lib'
import type { AstroEvent } from 'cosmos-lib'
import { useObserverCtx } from '../App'
import { DocsReference } from '../components/DocsReference'
import type { DocEntry } from '../components/DocsReference'
import styles from './EclipseView.module.css'

const DOCS_ENTRIES: DocEntry[] = [
  { module: 'Events', functions: ['nextEvents', 'nextEvent', 'toICal'], description: 'Aggregates upcoming astronomical events (moon phases, eclipses, meteor showers, oppositions, equinoxes) into a unified timeline with iCal export.', docsPath: 'docs/api/events.md' },
]

const CATEGORY_ICONS: Record<string, string> = {
  'moon-phase': '🌙',
  'eclipse': '◐',
  'meteor-shower': '☄',
  'opposition': '☍',
  'conjunction': '☌',
  'elongation': '↔',
  'equinox': '🌗',
  'solstice': '☀',
}

const CATEGORY_COLORS: Record<string, string> = {
  'moon-phase': '#94a3b8',
  'eclipse': '#f59e0b',
  'meteor-shower': '#34d399',
  'opposition': '#f87171',
  'conjunction': '#60a5fa',
  'elongation': '#a78bfa',
  'equinox': '#fbbf24',
  'solstice': '#fb923c',
}

export function EventsView() {
  const { observer } = useObserverCtx()

  const events = useMemo(() => {
    return Events.nextEvents(
      { ...observer, date: new Date() },
      { days: 365, limit: 60 }
    )
  }, [observer])

  const handleExportICal = useCallback(() => {
    const ical = Events.toICal(events, 'Astronomical Events — cosmos-lib')
    const blob = new Blob([ical], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'astro-events.ics'
    a.click()
    URL.revokeObjectURL(url)
  }, [events])

  return (
    <div className={styles.page}>
      <div className={styles.stickyHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className={styles.title}>Upcoming Events</h1>
            <p className={styles.subtitle}>{events.length} events in the next year</p>
          </div>
          <button
            onClick={handleExportICal}
            style={{
              background: 'var(--c-bg-card)',
              border: '1px solid var(--c-border)',
              color: 'var(--c-text-secondary)',
              padding: '8px 16px',
              borderRadius: 'var(--r-md)',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Export .ics
          </button>
        </div>
      </div>

      <div className={styles.content}>
      <div className={styles.timeline}>
        {events.map((event, i) => (
          <EventCard key={`${event.category}-${event.date.valueOf()}-${i}`} event={event} />
        ))}
      </div>
      <DocsReference entries={DOCS_ENTRIES} />
      </div>
    </div>
  )
}

function EventCard({ event }: { event: AstroEvent }) {
  const icon = CATEGORY_ICONS[event.category] ?? '⭐'
  const color = CATEGORY_COLORS[event.category] ?? '#a78bfa'

  return (
    <div className={styles.eclipseCard}>
      <div className={styles.eclipseIcon} style={{ color }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
          <h3 className={styles.eclipseTitle}>{event.title}</h3>
          <span style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color,
            flexShrink: 0,
          }}>
            {event.category}
          </span>
        </div>
        <p className={styles.eclipseDate}>
          {event.date.toLocaleDateString(undefined, {
            weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
          })}
          {event.detail && (
            <span style={{ opacity: 0.6 }}> · {event.detail}</span>
          )}
        </p>
      </div>
    </div>
  )
}
