interface ReservationCardProps {
  reservation: {
    _id: string
    date: string
    timeSlot: string
    guestsCount: number
    status: string
    table?: { number: number; capacity: number }
    user?: { name: string; email: string }
  }
  showCustomer?: boolean
  onCancel?: (id: string) => void
}

export default function ReservationCard({ reservation, showCustomer, onCancel }: ReservationCardProps) {
  const { _id, date, timeSlot, guestsCount, status, table, user } = reservation
  return (
    <div className="reservation-card">
      <div className="reservation-card-header">
        <span className="reservation-date">📅 {date}</span>
        <span className={`badge badge-${status}`}>
          {status === 'confirmed' ? '✓' : '✕'} {status}
        </span>
      </div>

      {showCustomer && user && (
        <div style={{ padding: '8px 12px', background: 'var(--surface-alt)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong> — {user.email}
        </div>
      )}

      <div className="reservation-meta">
        <div className="reservation-meta-item">
          <span className="meta-label">⏰ Time Slot</span>
          <span className="meta-value">{timeSlot}</span>
        </div>
        <div className="reservation-meta-item">
          <span className="meta-label">👥 Guests</span>
          <span className="meta-value">{guestsCount}</span>
        </div>
        <div className="reservation-meta-item">
          <span className="meta-label">🪑 Table</span>
          <span className="meta-value">
            {table ? `Table ${table.number} (${table.capacity} seats)` : '—'}
          </span>
        </div>
        <div className="reservation-meta-item">
          <span className="meta-label"># Booking ID</span>
          <span className="meta-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {_id.slice(-8)}
          </span>
        </div>
      </div>

      {onCancel && status === 'confirmed' && (
        <button className="btn btn-danger btn-sm" onClick={() => onCancel(_id)} style={{ alignSelf: 'flex-start' }}>
          Cancel Reservation
        </button>
      )}
    </div>
  )
}
