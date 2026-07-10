import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'
import ReservationCard from './ReservationCard'
import ReservationModal from './ReservationModal'
import EmptyState from './EmptyState'

interface Reservation {
  _id: string
  date: string
  timeSlot: string
  guestsCount: number
  status: string
  table?: { number: number; capacity: number }
}

export default function CustomerDashboard() {
  const { user, token } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reservations', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setReservations(Array.isArray(data) ? data : [])
    } catch {
      setReservations([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchReservations() }, [fetchReservations])

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this reservation?')) return
    try {
      await fetch(`/api/reservations/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchReservations()
    } catch {
      // silent
    }
  }

  const handleBookingSuccess = () => {
    setShowModal(false)
    setSuccessMsg('🎉 Table booked successfully!')
    fetchReservations()
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const confirmed = reservations.filter(r => r.status === 'confirmed')
  const cancelled = reservations.filter(r => r.status === 'cancelled')

  return (
    <div className="dashboard">
      <Navbar />
      <div className="dashboard-content">
        {/* Welcome */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 'var(--sp-lg)' }}>
          <div>
            <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="page-subtitle">Manage your restaurant reservations below</p>
          </div>
          <button id="create-reservation-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Create Reservation
          </button>
        </div>

        {/* Success alert */}
        {successMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}>{successMsg}</div>}

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-md)', marginBottom: 'var(--sp-lg)' }}>
          {[
            { label: 'Total Bookings', value: reservations.length, icon: '📋' },
            { label: 'Active', value: confirmed.length, icon: '✅' },
            { label: 'Cancelled', value: cancelled.length, icon: '❌' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Active Reservations */}
        <div style={{ marginBottom: 'var(--sp-lg)' }}>
          <div className="section-header">
            <h2 className="section-title">My Reservations</h2>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--surface-alt)', padding: '4px 12px', borderRadius: 'var(--r-full)', border: '1px solid var(--gold-border)' }}>
              {confirmed.length} active
            </span>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading reservations...</div>
          ) : confirmed.length === 0 ? (
            <EmptyState
              icon="🍽️"
              title="No active reservations"
              description="You have no upcoming bookings. Book a table to get started!"
              action={
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  Book a Table
                </button>
              }
            />
          ) : (
            <div className="reservations-grid">
              {confirmed.map(r => (
                <ReservationCard key={r._id} reservation={r} onCancel={handleCancel} />
              ))}
            </div>
          )}
        </div>

        {/* Past / Cancelled */}
        {cancelled.length > 0 && (
          <div>
            <div className="section-header">
              <h2 className="section-title" style={{ color: 'var(--text-secondary)' }}>Past & Cancelled</h2>
            </div>
            <div className="reservations-grid">
              {cancelled.map(r => (
                <ReservationCard key={r._id} reservation={r} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ReservationModal
          onClose={() => setShowModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}
