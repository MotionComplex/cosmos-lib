import { NavLink, useLocation } from 'react-router-dom'
import { useObserverCtx } from '../App'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { path: '/', icon: '◎', label: 'Observatory' },
  { path: '/skymap', icon: '✦', label: 'Sky Map' },
  { path: '/solar-system', icon: '◉', label: 'Solar System' },
  { path: '/catalog', icon: '☰', label: 'Catalog' },
  { path: '/moon', icon: '☽', label: 'Moon' },
  { path: '/eclipses', icon: '◐', label: 'Eclipses' },
  { path: '/events', icon: '📅', label: 'Events' },
]

export function Sidebar() {
  const location = useLocation()
  const { observer } = useObserverCtx()

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>✧</span>
      </div>

      <div className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            title={item.label}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.coords} title={`${observer.lat.toFixed(2)}N, ${observer.lng.toFixed(2)}E`}>
          <span className={styles.icon}>⊕</span>
        </div>
      </div>
    </nav>
  )
}
