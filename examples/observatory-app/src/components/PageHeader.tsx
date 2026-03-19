import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  subtitle?: string
  right?: React.ReactNode
}

export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {right && <div className={styles.right}>{right}</div>}
    </header>
  )
}
