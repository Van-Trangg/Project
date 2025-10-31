import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🌿 GreenJourney</Link>
      <div style={styles.tabs}>
        <NavLink to="/" style={styles.link}>Home</NavLink>
        <NavLink to="/journal" style={styles.link}>Journal</NavLink>
        <NavLink to="/map" style={styles.link}>Map</NavLink>
        <NavLink to="/leaderboard" style={styles.link}>Top</NavLink>
        <NavLink to="/reward" style={styles.link}>Rewards</NavLink>
      </div>
    </nav>
  )
}

const styles = {
  nav: { position: 'sticky', top: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#fff', zIndex: 10 },
  brand: { fontWeight: 700, textDecoration: 'none', color: '#111827' },
  tabs: { display: 'flex', gap: 12 },
  link: ({ isActive }) => ({ textDecoration: 'none', fontSize: 14, color: isActive ? '#065f46' : '#374151' }),
}