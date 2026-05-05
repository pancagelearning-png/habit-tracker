import { useState, useEffect, createContext, useContext } from 'react'
import { api } from '../services/api'
import { seedDefaultCategories } from '../services/categories'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try { setUser(JSON.parse(stored)) } catch { logout() }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    seedDefaultCategories().catch(() => {})
    return data
  }

  async function signup(name, email, password) {
    const data = await api.post('/auth/signup', { name, email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    seedDefaultCategories().catch(() => {})
    return data
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  // Fallback for components that don't use the provider
  if (!ctx) {
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('user')
    const user = stored ? JSON.parse(stored) : null
    return {
      user,
      loading: false,
      login: async (email, password) => {
        const data = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        seedDefaultCategories().catch(() => {})
        return data
      },
      signup: async (name, email, password) => {
        const data = await api.post('/auth/signup', { name, email, password })
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        seedDefaultCategories().catch(() => {})
        return data
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }
  return ctx
}
