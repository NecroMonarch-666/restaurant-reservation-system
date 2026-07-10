import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">🍽</div>
        <div>
          <div className="navbar-title">ReserveTable</div>
          <div className="navbar-subtitle">Restaurant Management</div>
        </div>
      </div>
      <div className="navbar-right">
        {user && (
          <>
            <div className="user-chip">
              <span style={{ fontSize: 16 }}>{user.role === 'admin' ? '⚙️' : '👤'}</span>
              <span className="user-chip-name">{user.name}</span>
              <span className="user-chip-role">{user.role}</span>
            </div>
            <button className="btn btn-outline btn-sm" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
