import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const navItems = [
  { to: '/', icon: '◎', label: 'Home', end: true },
  { to: '/cosmic-rays', icon: '⚡', label: 'Rays' },
  { to: '/compression', icon: '🗜', label: 'Data' },
  { to: '/direct-imaging', icon: '🔭', label: 'Image' },
]

export function Sidebar() {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>✧</div>
      <div className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className={styles.footer}>
        <div className={styles.footerDot} />
        <span>cosmos</span>
        <span>lib</span>
      </div>
    </nav>
  )
}
