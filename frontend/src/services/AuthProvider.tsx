import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { getCurrentUser, type User } from './authService'
import { AuthContext } from './AuthContext'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      setLoading(true)
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('[AuthProvider] Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('[AuthProvider] Mounting - initial auth check')
    checkAuth()
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    checkAuth,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
