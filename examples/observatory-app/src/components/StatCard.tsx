import { Card } from './Card'
import styles from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon?: string
  color?: string
}

export function StatCard({ label, value, sub, icon, color = 'var(--accent-purple)' }: StatCardProps) {
  return (
    <Card className={styles.stat}>
      <div className={styles.iconWrap} style={{ background: `${color}15`, color }}>
        {icon && <span>{icon}</span>}
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {sub && <span className={styles.sub}>{sub}</span>}
      </div>
    </Card>
  )
}
