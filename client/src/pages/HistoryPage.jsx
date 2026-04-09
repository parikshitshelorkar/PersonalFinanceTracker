import { useEffect, useState, useCallback } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, formatDate } from '../utils/formatCurrency'
import AddTransaction from '../components/AddTransaction'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function HistoryPage() {
  const { categories, fetchCategories } = useFinance()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTx, setEditTx] = useState(null)
  const [filters, setFilters] = useState({
    type: '', category_id: '', start_date: '', end_date: '', search: ''
  })
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => { fetchCategories() }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 400)
    return () => clearTimeout(t)
  }, [filters.search])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.type) params.type = filters.type
      if (filters.category_id) params.category_id = filters.category_id
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      if (debouncedSearch) params.search = debouncedSearch
      params.limit = 100
      const { data } = await api.get('/transactions', { params })
      setTransactions(data.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [filters.type, filters.category_id, filters.start_date, filters.end_date, debouncedSearch])

  useEffect(() => { load() }, [load])

  const handleFilter = (e) => setFilters(f => ({ ...f, [e.target.name]: e.target.value }))

  const clearFilters = () => setFilters({ type: '', category_id: '', start_date: '', end_date: '', search: '' })

  const deleteTx = async (id) => {
    if (!confirm('Delete this transaction?')) return
    try {
      await api.delete(`/transactions/${id}`)
      toast.success('Deleted')
      load()
    } catch (e) { toast.error('Error deleting') }
  }

  const totalShown = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + parseFloat(t.amount) : acc - parseFloat(t.amount)
  }, 0)

  return (
    <div className="fade-up">
      <div style={s.header}>
        <h1 style={s.title}>Transaction History</h1>
        <div style={{ fontSize: 13, color: 'var(--text3)' }}>{transactions.length} records</div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={s.filtersRow}>
          <input className="input" name="search" placeholder="🔍 Search description, notes..."
            value={filters.search} onChange={handleFilter} style={{ flex: 2 }} />
          <select className="select" name="type" value={filters.type} onChange={handleFilter} style={{ flex: 1 }}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select className="select" name="category_id" value={filters.category_id} onChange={handleFilter} style={{ flex: 1 }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <input className="input" type="date" name="start_date" value={filters.start_date} onChange={handleFilter} style={{ flex: 1 }} />
          <input className="input" type="date" name="end_date" value={filters.end_date} onChange={handleFilter} style={{ flex: 1 }} />
          <button className="btn btn-outline" onClick={clearFilters} style={{ whiteSpace: 'nowrap' }}>Clear</button>
        </div>
      </div>

      {/* Summary bar */}
      <div style={s.summaryBar}>
        <span style={{ fontSize: 13, color: 'var(--text3)' }}>Net (filtered):</span>
        <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: totalShown >= 0 ? '#0d9068' : 'var(--expense)' }}>
          {totalShown >= 0 ? '+' : ''}{formatCurrency(totalShown)}
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><div className="spinner" /></div>
        ) : transactions.length === 0 ? (
          <div className="empty"><div className="empty-icon">📭</div><p>No transactions found</p></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr style={s.thead}>
                  <th style={s.th}>Date</th>
                  <th style={s.th}>Description</th>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Mode</th>
                  <th style={{ ...s.th, textAlign: 'right' }}>Amount</th>
                  <th style={s.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={s.tr}>
                    <td style={s.td}>
                      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{formatDate(tx.tx_date)}</span>
                    </td>
                    <td style={s.td}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{tx.description || '—'}</div>
                      {tx.notes && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{tx.notes}</div>}
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.catBadge, background: (tx.category_color || '#888') + '22', color: tx.category_color || '#888' }}>
                        {tx.category_icon} {tx.category_name}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ fontSize: 11, background: 'var(--surface2)', padding: '2px 8px', borderRadius: 4 }}>
                        {tx.payment_mode}
                        {tx.upi_ref_id && <span title={tx.upi_ref_id}> ✓</span>}
                      </span>
                    </td>
                    <td style={{ ...s.td, textAlign: 'right' }}>
                      <span className={`amount-display amount-${tx.type}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setEditTx(tx)} style={s.actionBtn} title="Edit">✏️</button>
                        <button onClick={() => deleteTx(tx.id)} style={{ ...s.actionBtn, color: 'var(--expense)' }} title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editTx && <AddTransaction editData={editTx} onClose={() => { setEditTx(null); load() }} />}
    </div>
  )
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 700 },
  filtersRow: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' },
  summaryBar: { display: 'flex', justifyContent: 'flex-end', gap: 8, alignItems: 'center', marginBottom: 12, padding: '0 4px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  thead: { background: 'var(--surface2)' },
  th: { padding: '12px 16px', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text3)', textAlign: 'left', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '12px 16px', verticalAlign: 'middle' },
  catBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, fontSize: 12, fontWeight: 500 },
  actionBtn: { background: 'none', fontSize: 14, cursor: 'pointer', padding: '4px 6px', borderRadius: 4, border: 'none' },
}
