import { useState } from 'react'
import styles from './DocsReference.module.css'

const DOCS_BASE = 'https://github.com/motioncomplex/cosmos-lib/blob/main/'

export interface DocEntry {
  module: string
  functions: string[]
  description: string
  docsPath: string
}

interface DocsReferenceProps {
  entries: DocEntry[]
  guides?: { label: string; path: string }[]
}

export function DocsReference({ entries, guides }: DocsReferenceProps) {
  const [open, setOpen] = useState(false)

  return (
    <section className={styles.wrapper}>
      <button
        className={styles.toggle}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className={styles.toggleIcon}>&lt;/&gt;</span>
        <span className={styles.toggleText}>cosmos-lib API Reference</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>&#9662;</span>
      </button>

      {open && (
        <div className={styles.content}>
          <div className={styles.entries}>
            {entries.map(entry => (
              <div key={entry.module} className={styles.entry}>
                <a
                  href={`${DOCS_BASE}${entry.docsPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.moduleLink}
                >
                  <span className={styles.moduleName}>{entry.module}</span>
                  <span className={styles.arrow}>{'\u2197'}</span>
                </a>
                <p className={styles.description}>{entry.description}</p>
                <div className={styles.functions}>
                  {entry.functions.map(fn => (
                    <code key={fn} className={styles.fn}>{fn}()</code>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {guides && guides.length > 0 && (
            <>
              <div className={styles.divider} />
              <div className={styles.guidesHeader}>Guides</div>
              <div className={styles.guides}>
                {guides.map(g => (
                  <a
                    key={g.path}
                    href={`${DOCS_BASE}${g.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.guideLink}
                  >
                    {g.label}
                    <span className={styles.arrow}>{'\u2197'}</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
