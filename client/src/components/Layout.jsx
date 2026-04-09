import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/', label: 'Dashboard', icon: '🏠', exact: true },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
  { to: '/budgets', label: 'Budgets', icon: '🎯' },
  { to: '/history', label: 'History', icon: '📋' },
]

export default function Layout() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, transform: menuOpen ? 'translateX(0)' : undefined }}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>💰</span>
          <div>
            <div style={styles.logoTitle}>FinTracker</div>
            <div style={styles.logoSub}>Personal Finance</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.exact}
              style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) })}
              onClick={() => setMenuOpen(false)}
            >
              <span style={styles.navIcon}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.userCard}>
          <div style={styles.userAvatar}>{(user.name || 'U')[0].toUpperCase()}</div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user.name || 'User'}</div>
            <div style={styles.userEmail}>{user.email || ''}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {menuOpen && <div style={styles.overlay} onClick={() => setMenuOpen(false)} />}

      {/* Main content */}
      <main style={styles.main}>
        {/* Mobile topbar */}
        <div style={styles.mobileBar}>
          <button style={styles.menuBtn} onClick={() => setMenuOpen(o => !o)}>☰</button>
          <span style={styles.logoTitle}>💰 FinTracker</span>
          <div style={{ width: 32 }} />
        </div>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

const styles = {
  root: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    width: 240, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '24px 16px',
    position: 'sticky', top: 0, height: '100vh', zIndex: 100
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, padding: '0 8px' },
  logoIcon: { fontSize: 28 },
  logoTitle: { fontSize: 16, fontWeight: 700, color: 'var(--primary)' },
  logoSub: { fontSize: 11, color: 'var(--text3)' },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
    borderRadius: 'var(--radius-sm)', color: 'var(--text2)', fontSize: 14, fontWeight: 500,
    transition: 'all 0.15s'
  },
  navLinkActive: { background: 'var(--primary-light)', color: 'var(--primary)' },
  navIcon: { fontSize: 18, width: 22, textAlign: 'center' },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 10px',
    background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'
  },
  userAvatar: {
    width: 34, height: 34, borderRadius: '50%', background: 'var(--primary-light)',
    color: 'var(--primary)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userEmail: { fontSize: 10, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  logoutBtn: { background: 'none', color: 'var(--text3)', fontSize: 16, padding: 4, cursor: 'pointer', borderRadius: 4 },
  main: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' },
  mobileBar: {
    display: 'none', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', background: 'var(--surface)', borderBottom: '1px solid var(--border)'
  },
  menuBtn: { background: 'none', fontSize: 20, color: 'var(--text2)', padding: 4, cursor: 'pointer', borderRadius: 4 },
  content: { flex: 1, padding: '24px', maxWidth: 1100, width: '100%', margin: '0 auto' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 },
}

// Inject mobile CSS
const style = document.createElement('style')
style.textContent = `@media(max-width:768px){aside{position:fixed!important;top:0;left:0;bottom:0;transform:translateX(-100%);transition:transform .25s}[data-menuopen="true"] aside{transform:translateX(0)!important}main>div:first-child{display:flex!important}}`
document.head.appendChild(style)
