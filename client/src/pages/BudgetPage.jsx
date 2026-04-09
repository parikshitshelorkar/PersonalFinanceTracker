import { useEffect, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency } from '../utils/formatCurrency'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function BudgetPage() {
  const { budgets, categories, fetchBudgets, fetchCategories } = useFinance()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category_id: '', amount: '', alert_pct: 80 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBudgets()
    fetchCategories()
  }, [])

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.category_id || !form.amount) return toast.error('Fill all fields')
    setLoading(true)
    try {
      const m = new Date().getMonth() + 1
      const y = new Date().getFullYear()
      await api.post('/budgets', { ...form, month: m, year: y, amount: parseFloat(form.amount) })
      toast.success('Budget saved!')
      setShowForm(false)
      setForm({ category_id: '', amount: '', alert_pct: 80 })
      fetchBudgets()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving budget')
    } finally { setLoading(false) }
  }

  const deleteBudget = async (id) => {
    if (!confirm('Delete this budget?')) return
    await api.delete(`/budgets/${id}`)
    toast.success('Budget deleted')
    fetchBudgets()
  }

  const expenseCats = categories.filter(c => ![8, 9].includes(c.id))

  return (
    <div className="fade-up">
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Budgets</h1>
          <p style={s.sub}>
            {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Set Budget'}
        </button>
      </div>

      {/* Add budget form */}
      {showForm && (
        <div className="card fade-up" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Set Monthly Budget</div>
          <form onSubmit={submit}>
            <div className="grid-3">
              <div className="form-group">
                <label>Category *</label>
                <select className="select" name="category_id" value={form.category_id} onChange={handle} required>
                  <option value="">Select</option>
                  {expenseCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Budget Amount (₹) *</label>
                <input className="input" type="number" name="amount" placeholder="10000"
                  value={form.amount} onChange={handle} min="1" required />
              </div>
              <div className="form-group">
                <label>Alert at (%)</label>
                <input className="input" type="number" name="alert_pct" placeholder="80"
                  value={form.alert_pct} onChange={handle} min="1" max="100" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </form>
        </div>
      )}

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <div className="card">
          <div className="empty"><div className="empty-icon">🎯</div><p>No budgets set for this month</p></div>
        </div>
      ) : (
        <div className="grid-2">
          {budgets.map(b => {
            const pct = Math.min(100, (parseFloat(b.spent) / parseFloat(b.amount)) * 100)
            const color = pct >= 100 ? 'var(--expense)' : pct >= b.alert_pct ? 'var(--warning)' : 'var(--income)'
            const remaining = parseFloat(b.amount) - parseFloat(b.spent)
            return (
              <div key={b.id} className="card" style={{ position: 'relative' }}>
                <button onClick={() => deleteBudget(b.id)} style={s.delBtn}>✕</button>
                <div style={s.catRow}>
                  <span style={{ fontSize: 24 }}>{b.category_icon}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.category_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>Alert at {b.alert_pct}%</div>
                  </div>
                </div>
                <div style={s.amtRow}>
                  <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color }}>
                    {formatCurrency(b.spent)}
                  </span>
                  <span style={{ color: 'var(--text3)', fontSize: 13 }}>/ {formatCurrency(b.amount)}</span>
                </div>
                <div className="progress-bar" style={{ margin: '10px 0' }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)' }}>
                  <span>{pct.toFixed(1)}% used</span>
                  <span style={{ color: remaining >= 0 ? 'var(--income)' : 'var(--expense)', fontWeight: 500 }}>
                    {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 24, fontWeight: 700 },
  sub: { fontSize: 13, color: 'var(--text3)', marginTop: 2 },
  catRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  amtRow: { display: 'flex', alignItems: 'baseline', gap: 6 },
  delBtn: { position: 'absolute', top: 12, right: 12, background: 'none', color: 'var(--text3)', fontSize: 14, cursor: 'pointer', borderRadius: 4, padding: '2px 6px' },
}
