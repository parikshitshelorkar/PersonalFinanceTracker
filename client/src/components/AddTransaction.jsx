import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useFinance } from '../context/FinanceContext'
import { todayISO } from '../utils/formatCurrency'
import UpiPayment from './UpiPayment'

const PAYMENT_MODES = ['cash', 'upi', 'card', 'netbanking']

export default function AddTransaction({ onClose, editData = null }) {
  const { categories, fetchCategories, refreshAll } = useFinance()
  const [form, setForm] = useState({
    type: 'expense', category_id: '', amount: '', description: '',
    notes: '', tx_date: todayISO(), payment_mode: 'cash'
  })
  const [loading, setLoading] = useState(false)
  const [showUpi, setShowUpi] = useState(false)

  useEffect(() => {
    if (!categories.length) fetchCategories()
    if (editData) {
      setForm({
        type: editData.type,
        category_id: editData.category_id,
        amount: editData.amount,
        description: editData.description || '',
        notes: editData.notes || '',
        tx_date: editData.tx_date?.split('T')[0] || todayISO(),
        payment_mode: editData.payment_mode || 'cash'
      })
    }
  }, [])

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.category_id || !form.amount) return toast.error('Please fill all required fields')
    if (form.payment_mode === 'upi' && !editData) {
      setShowUpi(true)
      return
    }
    await saveTransaction()
  }

  const saveTransaction = async (upiRefId = null) => {
    setLoading(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount), upi_ref_id: upiRefId }
      if (editData) {
        await api.put(`/transactions/${editData.id}`, payload)
        toast.success('Transaction updated!')
      } else {
        await api.post('/transactions', payload)
        toast.success('Transaction added!')
      }
      refreshAll()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving transaction')
    } finally { setLoading(false) }
  }

  const filteredCats = categories.filter(c => {
    const incomeIds = [8, 9] // Salary, Freelance
    return form.type === 'income' ? incomeIds.includes(c.id) : !incomeIds.includes(c.id)
  })

  if (showUpi) {
    return (
      <UpiPayment
        amount={parseFloat(form.amount)}
        onSuccess={(refId) => { saveTransaction(refId) }}
        onCancel={() => setShowUpi(false)}
      />
    )
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{editData ? 'Edit Transaction' : 'Add Transaction'}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={submit}>
          {/* Type toggle */}
          <div style={s.typeToggle}>
            {['expense', 'income'].map(t => (
              <button type="button" key={t} onClick={() => setForm(f => ({ ...f, type: t, category_id: '' }))}
                style={{ ...s.typeBtn, ...(form.type === t ? (t === 'expense' ? s.expenseActive : s.incomeActive) : {}) }}>
                {t === 'expense' ? '📤 Expense' : '📥 Income'}
              </button>
            ))}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label>Amount (₹) *</label>
              <input className="input" type="number" name="amount" placeholder="0.00"
                value={form.amount} onChange={handle} min="0.01" step="0.01" required />
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input className="input" type="date" name="tx_date" value={form.tx_date} onChange={handle} required />
            </div>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select className="select" name="category_id" value={form.category_id} onChange={handle} required>
              <option value="">Select category</option>
              {filteredCats.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description</label>
            <input className="input" name="description" placeholder="e.g. Zomato Order"
              value={form.description} onChange={handle} />
          </div>

          <div className="form-group">
            <label>Payment Mode</label>
            <select className="select" name="payment_mode" value={form.payment_mode} onChange={handle}>
              {PAYMENT_MODES.map(m => (
                <option key={m} value={m}>{m === 'upi' ? '📱 UPI' : m === 'card' ? '💳 Card' : m === 'netbanking' ? '🏦 Net Banking' : '💵 Cash'}</option>
              ))}
            </select>
          </div>

          {form.payment_mode === 'upi' && !editData && (
            <div style={s.upiHint}>
              📱 UPI payment flow will launch after you submit
            </div>
          )}

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea className="input" name="notes" placeholder="Any additional notes..."
              value={form.notes} onChange={handle} rows={2} style={{ resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? 'Saving...' : editData ? 'Update' : (form.payment_mode === 'upi' ? '📱 Pay via UPI' : '✓ Save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const s = {
  typeToggle: { display: 'flex', background: 'var(--surface2)', borderRadius: 8, padding: 4, marginBottom: 16 },
  typeBtn: { flex: 1, padding: '9px 0', borderRadius: 6, background: 'none', fontSize: 14, fontWeight: 500, color: 'var(--text3)', cursor: 'pointer', transition: 'all .15s', border: 'none' },
  expenseActive: { background: 'var(--expense-bg)', color: 'var(--expense)', fontWeight: 600 },
  incomeActive: { background: 'var(--income-bg)', color: '#0d9068', fontWeight: 600 },
  upiHint: { background: 'rgba(56,189,248,0.1)', color: '#0369a1', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 14 }
}
