import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import EmptyState from './EmptyState'

interface Reservation {
  _id: string
  date: string
  timeSlot: string
  guestsCount: number
  status: string
  table?: { number: number; capacity: number }
  user?: { name: string; email: string }
}
interface Table {
  _id: string
  number: number
  capacity: number
  isActive: boolean
}
interface Stats {
  total: number
  active: number
  cancelled: number
  availableTables: number
}

export default function AdminDashboard() {
  const { token } = useAuth()
  const [tab, setTab] = useState<'reservations' | 'tables'>('reservations')
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [filterDate, setFilterDate] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // New Table form
  const [newTableNum, setNewTableNum] = useState('')
  const [newTableCap, setNewTableCap] = useState('')
  const [tableMsg, setTableMsg] = useState('')
  const [tableErr, setTableErr] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [rRes, tRes, sRes] = await Promise.all([
        fetch('/api/reservations', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/tables', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/reservations/stats', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      const [rData, tData, sData] = await Promise.all([rRes.json(), tRes.json(), sRes.json()])
      setReservations(Array.isArray(rData) ? rData : [])
      setTables(Array.isArray(tData) ? tData : [])
      setStats(sData)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this reservation?')) return
    await fetch(`/api/reservations/${id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchAll()
  }

  const toggleTable = async (t: Table) => {
    await fetch(`/api/tables/${t._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isActive: !t.isActive }),
    })
    fetchAll()
  }

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    setTableMsg(''); setTableErr('')
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ number: parseInt(newTableNum), capacity: parseInt(newTableCap) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setTableMsg(`✓ Table ${data.number} added!`)
      setNewTableNum(''); setNewTableCap('')
      fetchAll()
    } catch (err: unknown) {
      setTableErr(err instanceof Error ? err.message : 'Error adding table')
    }
  }

  const filtered = reservations.filter(r => {
    const matchDate = filterDate ? r.date === filterDate : true
    const matchSearch = search
      ? r.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.user?.email?.toLowerCase().includes(search.toLowerCase())
      : true
    return matchDate && matchSearch
  })

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-content">
        {/* Header */}
        <div style={{ marginBottom: 'var(--sp-lg)' }}>
          <h1 className="page-title">Admin Dashboard ⚙️</h1>
          <p className="page-subtitle">Manage all reservations and restaurant tables</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="stats-grid" style={{ marginBottom: 'var(--sp-lg)' }}>
            {[
              { label: 'Total Reservations', value: stats.total, icon: '📋' },
              { label: 'Active', value: stats.active, icon: '✅' },
              { label: 'Cancelled', value: stats.cancelled, icon: '❌' },
              { label: 'Tables Available Today', value: stats.availableTables, icon: '🪑' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="tab-bar">
          <button id="tab-reservations" className={`tab-btn ${tab === 'reservations' ? 'active' : ''}`} onClick={() => setTab('reservations')}>
            📋 Reservations ({reservations.length})
          </button>
          <button id="tab-tables" className={`tab-btn ${tab === 'tables' ? 'active' : ''}`} onClick={() => setTab('tables')}>
            🪑 Tables ({tables.length})
          </button>
        </div>

        {/* Reservations Tab */}
        {tab === 'reservations' && (
          <div className="animate-fade">
            <div className="filters-bar">
              <div className="form-group" style={{ flex: 1 }}>
                <input
                  id="search-customer"
                  type="text"
                  className="form-input"
                  placeholder="🔍 Search by customer name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  id="filter-date"
                  type="date"
                  className="form-input"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              {(filterDate || search) && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setFilterDate(''); setSearch('') }}>
                  Clear
                </button>
              )}
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <EmptyState icon="📋" title="No reservations found" description="Try adjusting your search or date filter." />
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Guests</th>
                      <th>Table</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r._id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.user?.name || '—'}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>{r.user?.email}</div>
                        </td>
                        <td>{r.date}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.timeSlot}</td>
                        <td>{r.guestsCount}</td>
                        <td>{r.table ? `Table ${r.table.number}` : '—'}</td>
                        <td>
                          <span className={`badge badge-${r.status}`}>
                            {r.status === 'confirmed' ? '✓' : '✕'} {r.status}
                          </span>
                        </td>
                        <td>
                          {r.status === 'confirmed' && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r._id)}>
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tables Tab */}
        {tab === 'tables' && (
          <div className="animate-fade">
            {/* Add Table Form */}
            <div className="card" style={{ marginBottom: 'var(--sp-lg)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>➕ Add New Table</h3>
              {tableMsg && <div className="alert alert-success" style={{ marginBottom: 12 }}>{tableMsg}</div>}
              {tableErr && <div className="alert alert-error" style={{ marginBottom: 12 }}>{tableErr}</div>}
              <form onSubmit={handleAddTable} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label" htmlFor="table-number">Table Number</label>
                  <input
                    id="table-number"
                    type="number"
                    className="form-input"
                    placeholder="e.g. 7"
                    min={1}
                    value={newTableNum}
                    onChange={e => setNewTableNum(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label" htmlFor="table-capacity">Capacity</label>
                  <input
                    id="table-capacity"
                    type="number"
                    className="form-input"
                    placeholder="e.g. 4"
                    min={1}
                    max={20}
                    value={newTableCap}
                    onChange={e => setNewTableCap(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: 46 }}>
                  Add Table
                </button>
              </form>
            </div>

            {/* Tables List */}
            {tables.length === 0 ? (
              <EmptyState icon="🪑" title="No tables found" description="Add a table using the form above." />
            ) : (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Table #</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tables.map(t => (
                      <tr key={t._id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Table {t.number}</td>
                        <td>{t.capacity} seats</td>
                        <td>
                          <span className={`badge ${t.isActive ? 'badge-confirmed' : 'badge-cancelled'}`}>
                            {t.isActive ? '● Active' : '○ Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${t.isActive ? 'btn-outline' : 'btn-ghost'}`}
                            onClick={() => toggleTable(t)}
                          >
                            {t.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
