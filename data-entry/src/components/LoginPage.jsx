import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { AuthForm } from '@chrisandrewsedu/ev-ui'

function LoginPage() {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { login, register } = useAuth()

  const handleSubmit = async (username, password) => {
    try {
      setSubmitting(true)
      setError(null)
      if (mode === 'register') {
        await register(username, password)
      } else {
        await login(username, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthForm
      logoSrc="/EVLogo.svg"
      appName="Empowered Vote"
      appSubtitle="Stance Data Entry"
      mode={mode}
      onSubmit={handleSubmit}
      onModeSwitch={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
      error={error}
      submitting={submitting}
    />
  )
}

export default LoginPage
