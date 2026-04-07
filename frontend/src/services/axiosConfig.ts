import axios from 'axios'
import { getApiBaseUrl } from '../config/apiBase'

export const API_BASE_URL = getApiBaseUrl()

// Create a centralized axios instance with consistent configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Add response interceptor for auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log 401 errors but don't auto-redirect - let components handle it
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized - authentication required')
    }
    return Promise.reject(error)
  }
)

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => Promise.reject(error)
)

export default apiClient
