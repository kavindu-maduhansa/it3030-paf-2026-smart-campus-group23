import { createContext } from 'react'
import type { User } from './authService'

export interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  checkAuth: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
