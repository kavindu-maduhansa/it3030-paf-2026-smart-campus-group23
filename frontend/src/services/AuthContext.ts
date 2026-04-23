import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { User } from './authService'

export interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  checkAuth: () => Promise<void>
  setUser: Dispatch<SetStateAction<User | null>>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
