import { Link } from 'react-router-dom'
import { Data, Events } from 'cosmos-lib'
import { challenges, resources } from '../data/challenges'
import styles from './Home.module.css'

export function Home() {
  const catalogCount = Data.all().length
  const constellationCount = 88
  const upcomingEvents = Events.nextEvents(new Date(), {
    observer: { latitude: 0, longitude: 0, elevation: 0 },
    days: 30,
    limit: 5,
  })

  return (
    <div className={styles.page}>
      {/* Sticky Header */}
      <div className={styles.stickyHeader}>
        <div className={styles.headerInner}>
          <span className={styles.headerIcon}>◎</span>
          <span className={styles.headerTitle}>Grand Challenges</span>
        </div>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroGreeting}>Astronomy's Unsolved Mysteries</div>
        <h1 className={styles.heroTitle}>Grand Challenges</h1>
        <p className={styles.heroSub}>
          Foundational problems that, if solved, would represent major leaps forward
          for the entire field. Explore each challenge interactively using{' '}
          <code>cosmos-lib</code>.
        </p>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Stats */}
        <div className={`${styles.statsRow} stagger-grid`}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Catalog Objects</div>
            <div className={styles.statValue}>{catalogCount.toLocaleString()}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Constellations</div>
            <div className={styles.statValue}>{constellationCount}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Challenges</div>
            <div className={styles.statValue} style={{ color: 'var(--accent)' }}>
              {challenges.length}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Events (30d)</div>
            <div className={styles.statValue}>{upcomingEvents.length}</div>
          </div>
        </div>

        {/* Challenge Cards */}
        <div>
          <div className={styles.sectionLabel}>Active Challenges</div>
        </div>
        <div className={`${styles.challengeGrid} stagger-grid`}>
          {challenges.map((c) => (
            <Link to={c.route} key={c.id} className={styles.challengeCard}>
              <div className={styles.cardTop}>
                <span className={styles.cardIcon}>{c.icon}</span>
                <span
                  className={styles.cardBadge}
                  style={{ background: c.colorDim, color: c.color }}
                >
                  {c.shortTitle}
                </span>
              </div>
              <div className={styles.cardTitle}>{c.title}</div>
              <div className={styles.cardDesc}>{c.description}</div>
              <div className={styles.cardTags}>
                {c.tags.map((tag) => (
                  <span key={tag} className={styles.cardTag}>{tag}</span>
                ))}
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.cardDifficulty}>
                  <span className={styles.difficultyLabel}>Difficulty</span>
                  <div className={styles.difficultyDots}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={i < c.difficulty ? styles.dotFilled : styles.dot}
                        style={i < c.difficulty ? { background: c.color } : undefined}
                      />
                    ))}
                  </div>
                </div>
                <span className={styles.cardCta} style={{ color: c.color }}>
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* What are Grand Challenges */}
        <div className={styles.infoCard}>
          <h3 style={{ marginBottom: 10, fontSize: 16 }}>What are "Grand Challenges"?</h3>
          <p>
            In astronomy, a <strong>Grand Challenge</strong> is a foundational problem
            that, if solved, would represent a major leap forward for the entire field.
            Similar to the "Protein Folding Problem" in biology, these challenges are
            often too large for a single institution. The community creates{' '}
            <strong>Roadmaps</strong> that define specific physics or data bottlenecks,
            standardize requirements for a "solution," and coordinate global resources
            to gather the necessary evidence.
          </p>
        </div>

        {/* Resources */}
        <div>
          <div className={styles.sectionLabel}>Datasets & Platforms</div>
        </div>
        <div className={styles.resourceGrid}>
          {resources.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className={styles.resourceCard}
            >
              <span className={styles.rcIcon}>↗</span>
              <div>
                <div className={styles.rcName}>{r.name}</div>
                <div className={styles.rcDesc}>{r.description}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Upcoming Events */}
        <div>
          <div className={styles.sectionLabel}>Upcoming Astronomical Events</div>
        </div>
        <div className={styles.eventsTable}>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {upcomingEvents.map((evt, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {evt.title}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(evt.date).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={styles.eventBadge}>{evt.category}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
