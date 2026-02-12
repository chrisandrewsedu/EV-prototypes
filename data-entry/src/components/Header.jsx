import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="header-logo">
          Stance Data Entry
        </Link>
        {location.pathname !== '/' && (
          <Link to="/" className="back-link">
            Home
          </Link>
        )}
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="volunteer-name">{user.username}</span>
          <button onClick={logout} className="btn-small btn-secondary">Logout</button>
        </div>
      </div>
    </header>
  )
}

export default Header
