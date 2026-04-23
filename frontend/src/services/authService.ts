import { getOAuthBaseUrl } from '../config/apiBase'
import { apiClient } from './axiosConfig'

const API_URL = '/api/auth'

export interface User {
  name: string
  email: string
  picture?: string
  role?: string
  authenticated: boolean
}

export interface AuthStatus {
  authenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface UpdateProfilePayload {
  name: string
}

export const getAuthStatus = async (): Promise<AuthStatus> => {
  try {
    const response = await apiClient.get<AuthStatus>(`${API_URL}/status`)
    return response.data
  } catch (error) {
    return { authenticated: false }
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get<User>(`${API_URL}/user`)
    if (response.data.authenticated) {
      return response.data
    }
    return null
  } catch (error) {
    return null
  }
}

export const loginWithCredentials = async (credentials: LoginCredentials): Promise<User> => {
  const response = await apiClient.post<User>(`${API_URL}/login`, credentials)
  return response.data
}

export const register = async (data: RegisterData): Promise<User> => {
  const response = await apiClient.post<User>(`${API_URL}/register`, data)
  return response.data
}

export const loginWithGoogle = () => {
  window.location.href = `${getOAuthBaseUrl()}/oauth2/authorization/google`
}

export const logout = async () => {
  try {
    await apiClient.post(`${API_URL}/logout`, {})
    window.location.href = '/logout'
  } catch (error) {
    console.error('Logout failed:', error)
    // Force logout anyway
    window.location.href = '/login'
  }
}

export const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  const response = await apiClient.patch<User>(`${API_URL}/profile`, payload)
  return response.data
}
