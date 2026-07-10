import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

interface Slot {
  slot: string
  available: boolean
  tableId: string | null
  tableNumber: number | null
}

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const TIME_SLOTS = [
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 22:00',
]

export default function ReservationModal({ onClose, onSuccess }: Props) {
  const { token } = useAuth()
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState(2)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [slots, setSlots] = useState<Slot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const today = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (date && guests >= 1) {
      setSelectedSlot('')
      setLoadingSlots(true)
      fetch(`/api/reservations/slots?date=${date}&guests=${guests}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => setSlots(Array.isArray(data) ? data : []))
        .catch(() => setSlots(TIME_SLOTS.map(s => ({ slot: s, available: true, tableId: null, tableNumber: null }))))
        .finally(() => setLoadingSlots(false))
    }
  }, [date, guests, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!date || !selectedSlot) { setError('Please select a date and time slot.'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date, timeSlot: selectedSlot, guestsCount: guests }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Booking failed')
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>Book a Table</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Select date, guests, and time</p>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 20, padding: '4px 8px' }}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-sm)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="res-date">Date</label>
              <input
                id="res-date"
                type="date"
                className="form-input"
                min={today}
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="res-guests">Guests</label>
              <input
                id="res-guests"
                type="number"
                className="form-input"
                min={1}
                max={8}
                value={guests}
                onChange={e => setGuests(parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Time Slot
              {loadingSlots && <span style={{ fontSize: 11, color: 'var(--text-hint)', marginLeft: 8 }}>Checking availability...</span>}
            </label>
            {slots.length > 0 ? (
              <div className="slot-grid">
                {slots.map(s => (
                  <button
                    key={s.slot}
                    type="button"
                    className={`slot-btn${selectedSlot === s.slot ? ' slot-selected' : ''}${!s.available ? ' slot-unavailable' : ''}`}
                    onClick={() => s.available && setSelectedSlot(s.slot)}
                    disabled={!s.available}
                    title={!s.available ? 'No tables available' : `Table ${s.tableNumber}`}
                  >
                    {s.slot}
                    {!s.available && <span style={{ display: 'block', fontSize: 10, marginTop: 2 }}>Full</span>}
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-hint)', fontStyle: 'italic' }}>
                {date && guests ? 'Loading slots...' : 'Select a date and number of guests first'}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost w-full" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary w-full" disabled={submitting || !selectedSlot}>
              {submitting ? 'Booking...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
