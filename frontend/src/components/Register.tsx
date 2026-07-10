import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Register({ onGoLogin }: { onGoLogin: () => void }) {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'customer' | 'admin'>('customer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) { setError('All fields are required.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await register(name, email, password, role)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-icon">🍽</div>
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-header">
          <div className="auth-logo-wrap">🍽</div>
          <h1 className="auth-title">RESERVETABLE</h1>
          <p className="auth-subtitle">Create your account to get started</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">I am a...</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-card ${role === 'customer' ? 'active' : ''}`}
                onClick={() => setRole('customer')}
                id="role-customer"
              >
                <span className="role-icon">👤</span>
                <span className="role-label">Customer</span>
              </button>
              <button
                type="button"
                className={`role-card ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
                id="role-admin"
              >
                <span className="role-icon">🏪</span>
                <span className="role-label">Admin</span>
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          Already have an account?{' '}
          <button className="link-btn" onClick={onGoLogin}>Sign in here</button>
        </div>
      </div>
    </div>
  )
}
