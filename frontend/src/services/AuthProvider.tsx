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
      console.log('[AuthProvider] Checking authentication...')
      const userData = await getCurrentUser()
      console.log('[AuthProvider] User data received:', userData)
      if (userData) {
        console.log('[AuthProvider] User authenticated:', { email: userData.email, role: userData.role })
      } else {
        console.log('[AuthProvider] User not authenticated')
      }
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
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
