import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login({ onGoRegister }: { onGoRegister: () => void }) {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-icon">🍽</div>
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-wrap">🍽</div>
          <h1 className="auth-title">ReserveTable</h1>
          <p className="auth-subtitle">Restaurant Management System</p>
        </div>

        <div style={{ marginBottom: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>Welcome Back</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>Please enter your details to sign in</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-md)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="e.g. manager@restaurant.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: 20 }}>
          Don't have an account?{' '}
          <button className="link-btn" onClick={onGoRegister}>Register here</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--gold-border)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-hint)' }}>© 2026 ReserveTable Pro</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-hint)', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ fontSize: 11, color: 'var(--text-hint)', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
