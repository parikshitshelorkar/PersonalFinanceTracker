import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login' ? { email: form.email, password: form.password } : form
      const { data } = await api.post(endpoint, payload)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success(`Welcome, ${data.user.name}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async () => {
    setForm({ name: '', email: 'demo@finance.com', password: 'demo1234' })
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email: 'demo@finance.com', password: 'demo1234' })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      toast.success('Welcome to the demo!')
      navigate('/')
    } catch (err) {
      toast.error('Demo login failed. Make sure the server is running and seed data is loaded.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.card} className="fade-up">
        <div style={s.logoRow}>
          <span style={{ fontSize: 40 }}>💰</span>
          <div>
            <div style={s.title}>FinTracker</div>
            <div style={s.subtitle}>Personal Finance Made Simple</div>
          </div>
        </div>

        <div style={s.tabs}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ ...s.tab, ...(mode === m ? s.tabActive : {}) }}>
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input className="input" name="name" placeholder="Arjun Sharma"
                value={form.name} onChange={handle} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" name="email" placeholder="you@email.com"
              value={form.email} onChange={handle} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" name="password" placeholder="••••••••"
              value={form.password} onChange={handle} required />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'login' && (
          <button onClick={demoLogin} style={s.demoBtn} disabled={loading}>
            🚀 Try Demo Account
          </button>
        )}

        <div style={s.hint}>
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span style={s.link} onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </span>
        </div>
      </div>
    </div>
  )
}

const s = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 16 },
  card: { background: 'var(--surface)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-md)' },
  logoRow: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700, color: 'var(--primary)' },
  subtitle: { fontSize: 13, color: 'var(--text3)' },
  tabs: { display: 'flex', background: 'var(--surface2)', borderRadius: 8, padding: 4, marginBottom: 20 },
  tab: { flex: 1, padding: '8px 0', borderRadius: 6, background: 'none', fontSize: 14, fontWeight: 500, color: 'var(--text3)', cursor: 'pointer', transition: 'all .15s' },
  tabActive: { background: 'var(--surface)', color: 'var(--primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  demoBtn: { width: '100%', marginTop: 12, padding: '10px', borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 500, fontSize: 14, border: '1px dashed var(--primary)', cursor: 'pointer' },
  hint: { textAlign: 'center', fontSize: 13, color: 'var(--text3)', marginTop: 16 },
  link: { color: 'var(--primary)', fontWeight: 500, cursor: 'pointer' },
}
