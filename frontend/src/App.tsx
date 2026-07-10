import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import CustomerDashboard from './components/CustomerDashboard'
import AdminDashboard from './components/AdminDashboard'
import { useState } from 'react'

function AppRoutes() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<'login' | 'register'>('login')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: 48, height: 48, background: 'var(--gold)', borderRadius: 'var(--r-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, animation: 'pulse-gold 1.5s infinite' }}>🍽️</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600 }}>Loading ReserveTable...</p>
      </div>
    )
  }

  if (!user) {
    if (page === 'login') return <Login onGoRegister={() => setPage('register')} />
    return <Register onGoLogin={() => setPage('login')} />
  }

  if (user.role === 'admin') return <AdminDashboard />
  return <CustomerDashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
