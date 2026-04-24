import { apiClient } from './axiosConfig'

const API_URL = '/api/technician-alerts'

export interface TechnicianAlert {
  id: string
  title: string
  message: string
  type: 'CRITICAL' | 'WARNING' | 'INFO'
  targetRoles: string
  createdAt: string
}

export const getAllAlerts = () => {
  return apiClient.get<TechnicianAlert[]>(API_URL)
}

export const createAlert = (alert: Omit<TechnicianAlert, 'id' | 'createdAt'>) => {
  return apiClient.post<TechnicianAlert>(API_URL, alert)
}

export const updateAlert = (id: string, alert: Partial<TechnicianAlert>) => {
  return apiClient.put<TechnicianAlert>(`${API_URL}/${id}`, alert)
}

export const deleteAlert = (id: string) => {
  return apiClient.delete(`${API_URL}/${id}`)
}
