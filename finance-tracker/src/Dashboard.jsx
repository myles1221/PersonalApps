import { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'
import { getAllExpenses, getExpensesLastN } from './db'
import { getCategoryColor } from './categorize'
import './Dashboard.css'

const CAT_COLORS = [
  '#34d399', '#38bdf8', '#a78bfa', '#fbbf24', '#f472b6', '#2dd4bf', '#4ade80', '#94a3b8',
]

export default function Dashboard({ refreshKey }) {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const data = await getAllExpenses()
      if (!cancelled) {
        setExpenses(data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [refreshKey])

  const totals = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0)
    const byCategory = {}
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount
    })
    const byMonth = {}
    expenses.forEach((e) => {
      const m = (e.date || '').slice(0, 7)
      if (m) byMonth[m] = (byMonth[m] || 0) + e.amount
    })
    return { total, byCategory, byMonth }
  }, [expenses])

  const barData = useMemo(() => {
    return Object.entries(totals.byCategory)
      .map(([name, value]) => ({ name: name.length > 12 ? name.slice(0, 10) + '…' : name, value, fullName: name }))
      .sort((a, b) => b.value - a.value)
  }, [totals.byCategory])

  const pieData = useMemo(() => {
    return Object.entries(totals.byCategory).map(([name, value]) => ({
      name: name.length > 14 ? name.slice(0, 12) + '…' : name,
      value,
      fullName: name,
    }))
  }, [totals.byCategory])

  const lineData = useMemo(() => {
    const months = Object.entries(totals.byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, value }))
    return months
  }, [totals.byMonth])

  if (loading) {
    return (
      <div className="dashboard loading">
        <p>Loading…</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <section className="totals">
        <h2>Total expenses</h2>
        <p className="total-amount">${totals.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className="total-meta">{expenses.length} transactions</p>
      </section>

      {barData.length > 0 && (
        <section className="chart-section">
          <h3>By category (bar)</h3>
          <div className="chart-wrap bar">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                  labelFormatter={(_, payload) => payload[0]?.payload?.fullName}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {pieData.length > 0 && (
        <section className="chart-section">
          <h3>By category (pie)</h3>
          <div className="chart-wrap pie">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} stroke="#1e293b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']}
                />
                <Legend formatter={(v, e) => <span style={{ color: '#f1f5f9' }}>{e.payload?.fullName || v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {lineData.length > 0 && (
        <section className="chart-section">
          <h3>Over time (line)</h3>
          <div className="chart-wrap line">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Spent']}
                />
                <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8' }} name="Spent" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {expenses.length === 0 && (
        <p className="empty-state">No transactions yet. Upload a CSV or paste a statement above.</p>
      )}
    </div>
  )
}

export function ExpenseList({ refreshKey, defaultLimit = 25, maxLimit = 1000 }) {
  const [expenses, setExpenses] = useState([])
  const [limit, setLimit] = useState(defaultLimit)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const data = await getExpensesLastN(maxLimit)
      if (!cancelled) {
        setExpenses(data)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [refreshKey, maxLimit])

  const show = expenses.slice(0, limit)
  const hasMore = limit < expenses.length
  const canExpand = expenses.length > defaultLimit && limit === defaultLimit

  const getColor = (cat) => {
    const map = {
      'Food & Dining': '#34d399', Transport: '#38bdf8', Shopping: '#a78bfa', 'Bills & Utilities': '#fbbf24',
      Entertainment: '#f472b6', Health: '#2dd4bf', Groceries: '#4ade80', Other: '#94a3b8',
    }
    return map[cat] || '#94a3b8'
  }

  if (loading) return <div className="expense-list loading">Loading…</div>

  return (
    <section className="expense-list">
      <div className="expense-list-header">
        <h3>Recent expenses</h3>
        <span className="count">Showing {show.length}{expenses.length > show.length ? ` of ${expenses.length}` : ''}</span>
      </div>
      <ul className="expense-items">
        {show.map((e) => (
          <li key={e.id || `${e.date}-${e.amount}-${e.description}`} className="expense-item">
            <span className="cat-dot" style={{ background: getColor(e.category) }} />
            <div className="expense-main">
              <span className="desc">{e.description}</span>
              <span className="meta">{e.date} {e.accountName ? ` · ${e.accountName}` : ''}</span>
            </div>
            <span className="amount">−${Number(e.amount).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      {canExpand && (
        <button type="button" className="expand-btn" onClick={() => setLimit(maxLimit)}>
          Show all ({expenses.length})
        </button>
      )}
      {limit === maxLimit && expenses.length > defaultLimit && (
        <button type="button" className="expand-btn secondary" onClick={() => setLimit(defaultLimit)}>
          Show less (last {defaultLimit})
        </button>
      )}
    </section>
  )
}
