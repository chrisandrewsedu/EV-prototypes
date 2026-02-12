import { createContext, useContext, useState, useEffect } from 'react'
import { checkAuth, login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/sheets'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
      .then(data => {
        if (data) {
          setUser({ user_id: data.user_id, username: data.username })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const result = await apiLogin(username, password)
    setUser({ user_id: result.user_id, username: result.username || username })
  }

  const register = async (username, password) => {
    await apiRegister(username, password)
    // Register doesn't set a session cookie, so log in immediately after
    const loginResult = await apiLogin(username, password)
    setUser({ user_id: loginResult.user_id, username })
  }

  const logout = async () => {
    await apiLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
