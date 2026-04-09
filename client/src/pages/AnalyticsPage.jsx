import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts'
import api from '../api/axios'
import { formatCurrency, getMonthName } from '../utils/formatCurrency'

const COLORS = ['#6c63ff','#ff6584','#43e0a4','#ffa94d','#38bdf8','#a78bfa','#fb923c','#f472b6']

export default function AnalyticsPage() {
  const [catData, setCatData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [insights, setInsights] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [cat, monthly, trend, ins] = await Promise.all([
          api.get('/analytics/category-split'),
          api.get(`/analytics/monthly?year=${year}`),
          api.get('/analytics/trend?days=30'),
          api.get('/analytics/insights')
        ])
        setCatData(cat.data.data)
        setMonthlyData(monthly.data.data.map(d => ({ ...d, name: getMonthName(d.month) })))
        setTrendData(trend.data.data.map(d => ({ ...d, date: d.date?.slice(5) })))
        setInsights(ins.data.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [year])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><div className="spinner" /></div>

  const pieData = catData.map(d => ({ name: d.name, value: parseFloat(d.total), icon: d.icon }))

  return (
    <div className="fade-up">
      <div style={s.header}>
        <h1 style={s.title}>Analytics</h1>
        <select className="select" value={year} onChange={e => setYear(e.target.value)} style={{ width: 120 }}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Pie Chart */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="section-label">Spending by Category</div>
          {pieData.length === 0 ? (
            <div className="empty"><div className="empty-icon">📊</div><p>No expense data</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                  paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                  labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Smart Insights */}
        <div className="card">
          <div className="section-label">Smart Insights</div>
          {insights.length === 0 ? (
            <div className="empty"><div className="empty-icon">💡</div><p>Add more data for insights</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              {insights.map((ins, i) => (
                <div key={i} style={s.insightCard}>
                  <span style={{ fontSize: 22 }}>{ins.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text2)' }}>{ins.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Bar Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-label">Monthly Income vs Expenses — {year}</div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text3)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend wrapperStyle={{ fontSize: 13 }} />
            <Bar dataKey="income" name="Income" fill="#43e0a4" radius={[4,4,0,0]} />
            <Bar dataKey="expense" name="Expense" fill="#ff6584" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Line Chart */}
      <div className="card">
        <div className="section-label">30-Day Spending Trend</div>
        {trendData.length === 0 ? (
          <div className="empty"><div className="empty-icon">📈</div><p>No trend data yet</p></div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text3)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text3)' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Line type="monotone" dataKey="expense" name="Expense" stroke="#ff6584" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="income" name="Income" stroke="#43e0a4" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700 },
  insightCard: { display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' },
}
