import { useEffect, useState } from 'react'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, formatShortDate } from '../utils/formatCurrency'
import AddTransaction from '../components/AddTransaction'
import api from '../api/axios'

export default function Home() {
  const { summary, transactions, alerts, refreshAll, loading } = useFinance()
  const [showAdd, setShowAdd] = useState(false)
  const [insights, setInsights] = useState([])

  useEffect(() => {
    refreshAll()
    api.get('/analytics/insights').then(r => setInsights(r.data.data)).catch(() => {})
  }, [])

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.greeting}>Dashboard</h1>
          <p style={s.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Transaction
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <SummaryCard label="Balance" value={formatCurrency(summary.balance)} color="var(--primary)" icon="💰"
          sub={parseFloat(summary.balance) >= 0 ? 'You are in savings!' : 'Overspent this month'} />
        <SummaryCard label="Income" value={formatCurrency(summary.total_income)} color="#0d9068" icon="📥"
          sub="Total credits this month" />
        <SummaryCard label="Expenses" value={formatCurrency(summary.total_expense)} color="var(--expense)" icon="📤"
          sub="Total debits this month" />
      </div>

      {/* Budget alerts */}
      {alerts.length > 0 && (
        <div style={s.alertsWrap}>
          <div className="section-label" style={{ color: 'var(--expense)' }}>⚠️ Budget Alerts</div>
          {alerts.map(a => (
            <div key={a.id} style={s.alertItem}>
              <span>{a.category_icon} {a.category_name}</span>
              <span style={{ color: a.pct_used >= 100 ? 'var(--expense)' : 'var(--warning)', fontWeight: 600 }}>
                {formatCurrency(a.spent)} / {formatCurrency(a.amount)} · {a.pct_used}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Main columns */}
      <div style={s.cols}>
        {/* Recent Transactions */}
        <div className="card" style={{ flex: 1.5, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-label">Recent Transactions</div>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><div className="spinner" /></div>
          ) : transactions.length === 0 ? (
            <div className="empty"><div className="empty-icon">📭</div><p>No transactions yet</p></div>
          ) : (
            transactions.slice(0, 8).map(tx => (
              <div key={tx.id} style={s.txItem}>
                <div style={{ ...s.txIcon, background: tx.category_color + '22' }}>{tx.category_icon}</div>
                <div style={s.txInfo}>
                  <div style={s.txName}>{tx.description || tx.category_name}</div>
                  <div style={s.txMeta}>{tx.category_name} · {formatShortDate(tx.tx_date)} · {tx.payment_mode.toUpperCase()}</div>
                </div>
                <div className={`amount-display amount-${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Smart Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <div className="card">
            <div className="section-label">Smart Insights</div>
            {insights.length === 0 ? (
              <div style={{ color: 'var(--text3)', fontSize: 13 }}>Add more transactions to see insights</div>
            ) : (
              insights.map((ins, i) => (
                <div key={i} style={s.insightItem}>
                  <span style={{ fontSize: 20 }}>{ins.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{ins.text}</span>
                </div>
              ))
            )}
          </div>

          {/* Quick Stats */}
          <div className="card">
            <div className="section-label">Quick Stats</div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Savings Rate</span>
              <span style={s.statVal}>
                {summary.total_income > 0
                  ? Math.max(0, (((summary.total_income - summary.total_expense) / summary.total_income) * 100)).toFixed(1) + '%'
                  : '—'}
              </span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Transactions</span>
              <span style={s.statVal}>{transactions.length}</span>
            </div>
            <div style={s.statRow}>
              <span style={s.statLabel}>Avg/Transaction</span>
              <span style={s.statVal}>
                {transactions.filter(t => t.type === 'expense').length > 0
                  ? formatCurrency(summary.total_expense / transactions.filter(t => t.type === 'expense').length)
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showAdd && <AddTransaction onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function SummaryCard({ label, value, color, icon, sub }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{sub}</div>
    </div>
  )
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  greeting: { fontSize: 24, fontWeight: 700 },
  date: { fontSize: 13, color: 'var(--text3)', marginTop: 2 },
  alertsWrap: { background: 'var(--expense-bg)', border: '1px solid var(--expense)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: 20 },
  alertItem: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8, flexWrap: 'wrap', gap: 4 },
  cols: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  txItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' },
  txIcon: { width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  txInfo: { flex: 1, minWidth: 0 },
  txName: { fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  txMeta: { fontSize: 11, color: 'var(--text3)', marginTop: 1 },
  insightItem: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  statRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' },
  statLabel: { color: 'var(--text3)' },
  statVal: { fontWeight: 600, fontFamily: 'var(--mono)' },
}
