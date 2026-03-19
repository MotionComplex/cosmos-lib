import type { CSSProperties, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: () => void
  glow?: boolean
  variant?: 'default' | 'glass' | 'accent'
}

export function Card({ children, className = '', style, onClick, glow, variant = 'default' }: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${glow ? styles.glow : ''} ${onClick ? styles.clickable : ''} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? e => e.key === 'Enter' && onClick() : undefined}
    >
      {children}
    </div>
  )
}
