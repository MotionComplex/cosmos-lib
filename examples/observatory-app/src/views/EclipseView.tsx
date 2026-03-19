import { useMemo } from 'react'
import { Eclipse } from 'cosmos-lib'
import styles from './EclipseView.module.css'

export function EclipseView() {
  const eclipses = useMemo(() => {
    const now = new Date()
    const end = new Date(now)
    end.setFullYear(end.getFullYear() + 3)
    return Eclipse.search(now, end)
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Eclipses</h1>
          <p className={styles.subtitle}>Upcoming solar & lunar eclipses</p>
        </div>
      </div>

      <div className={styles.timeline}>
        {eclipses.length === 0 ? (
          <p className={styles.empty}>No eclipses found in the next 3 years.</p>
        ) : (
          eclipses.map((ecl, i) => {
            const isSolar = ecl.type === 'solar'
            const daysUntil = Math.max(0, Math.ceil((ecl.date.getTime() - Date.now()) / 86400000))

            return (
              <div key={i} className={styles.eclipseCard}>
                <div className={styles.eclipseLine}>
                  <div
                    className={styles.eclipseDot}
                    style={{
                      background: isSolar ? 'var(--amber)' : 'var(--accent)',
                      boxShadow: `0 0 12px ${isSolar ? 'var(--amber)' : 'var(--accent)'}40`,
                    }}
                  />
                </div>

                <div className={styles.eclipseContent}>
                  <div className={styles.eclipseTop}>
                    <span className={styles.eclipseDate}>
                      {ecl.date.toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className={styles.eclipseCountdown}>
                      {daysUntil === 0 ? 'Today' : `${daysUntil} days`}
                    </span>
                  </div>

                  <h3 className={styles.eclipseName}>
                    {ecl.subtype.charAt(0).toUpperCase() + ecl.subtype.slice(1)}{' '}
                    {ecl.type.charAt(0).toUpperCase() + ecl.type.slice(1)} Eclipse
                  </h3>

                  <div className={styles.eclipseStats}>
                    <div className={styles.eclipseStat}>
                      <span className={styles.eclipseStatLabel}>Type</span>
                      <span className={styles.eclipseStatValue}>{ecl.type}</span>
                    </div>
                    <div className={styles.eclipseStat}>
                      <span className={styles.eclipseStatLabel}>Subtype</span>
                      <span className={styles.eclipseStatValue}>{ecl.subtype}</span>
                    </div>
                    <div className={styles.eclipseStat}>
                      <span className={styles.eclipseStatLabel}>Magnitude</span>
                      <span className={styles.eclipseStatValue}>{ecl.magnitude.toFixed(4)}</span>
                    </div>
                    <div className={styles.eclipseStat}>
                      <span className={styles.eclipseStatLabel}>Time</span>
                      <span className={styles.eclipseStatValue}>
                        {ecl.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Magnitude visualization */}
                  <div className={styles.magBar}>
                    <div
                      className={styles.magFill}
                      style={{
                        width: `${ecl.magnitude * 100}%`,
                        background: isSolar
                          ? 'linear-gradient(90deg, var(--amber), #f59e0b)'
                          : 'linear-gradient(90deg, var(--accent), var(--accent-bright))',
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
