import { Link } from 'react-router-dom'
import type { Challenge } from '../data/challenges'
import styles from './ChallengeDetail.module.css'

interface Props {
  challenge: Challenge
  children: React.ReactNode
}

export function ChallengeDetail({ challenge, children }: Props) {
  return (
    <div className={styles.page}>
      {/* Sticky Header */}
      <div className={styles.stickyHeader}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.backBtn}>←</Link>
          <span
            className={styles.headerBadge}
            style={{ background: challenge.colorDim, color: challenge.color }}
          >
            {challenge.icon} {challenge.shortTitle}
          </span>
          <span className={styles.headerTitle}>{challenge.title}</span>
        </div>
      </div>

      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroGreeting} style={{ color: challenge.color }}>
          Challenge {challenge.id === 'cosmic-rays' ? 'A' : challenge.id === 'compression' ? 'B' : 'C'}
        </div>
        <h1 className={styles.heroTitle}>{challenge.title}</h1>
        <p className={styles.heroDescription}>{challenge.description}</p>

        <div className={styles.difficulty} style={{ color: challenge.color }}>
          <span className={styles.difficultyLabel}>Difficulty</span>
          <div className={styles.difficultyDots}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`${styles.dot} ${i < challenge.difficulty ? styles.dotFilled : ''}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.tags}>
          {challenge.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Goal Card */}
        <div className={styles.goalCard} style={{ borderLeftColor: challenge.color, borderLeftWidth: 3 }}>
          <div className={styles.goalIcon}>🎯</div>
          <div className={styles.goalTitle}>The Goal</div>
          <div className={styles.goalText}>{challenge.goal}</div>
        </div>

        {/* Getting Started */}
        <div className={styles.stepsSection}>
          <h2 className={styles.stepsTitle}>Getting Started</h2>
          <div className={`${styles.stepsGrid} stagger-grid`}>
            {challenge.gettingStarted.map((step) => (
              <div key={step.step} className={styles.stepCard}>
                <div
                  className={styles.stepNumber}
                  style={{ background: challenge.colorDim, color: challenge.color }}
                >
                  {step.step}
                </div>
                <div className={styles.stepTitle}>{step.title}</div>
                <div className={styles.stepDesc}>{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Datasources */}
        <div className={styles.datasourcesSection}>
          <h2 className={styles.datasourcesTitle}>Datasets & Resources</h2>
          <div className={styles.datasourcesList}>
            {challenge.datasources.map((ds) => (
              <a
                key={ds.name}
                href={ds.url}
                target="_blank"
                rel="noreferrer"
                className={styles.datasourceCard}
              >
                <span className={styles.dsIcon}>↗</span>
                <div>
                  <div className={styles.dsName}>{ds.name}</div>
                  <div className={styles.dsDesc}>{ds.description}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Exploration section divider */}
        <div className={styles.sectionLabel}>Exploration & Visualizations</div>

        {/* Challenge-specific content */}
        <div className={styles.vizSection}>
          {children}
        </div>
      </div>
    </div>
  )
}
