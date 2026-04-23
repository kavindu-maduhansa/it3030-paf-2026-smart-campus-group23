import { apiClient } from './axiosConfig'

export interface ContactMessagePayload {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactMessageItem {
  id?: string
  _id: string
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  role?: string
  read?: boolean
  readAt?: string | null
}

export const sendContactMessage = (payload: ContactMessagePayload) =>
  apiClient.post<{ message: string; id: string }>('/api/contact/messages', payload)

export const getContactMessages = () =>
  apiClient.get<ContactMessageItem[]>('/api/contact/messages')

export const markContactMessageAsRead = (id: string) =>
  apiClient.patch<{ message: string }>(`/api/contact/messages/${id}/read`)

export const deleteContactMessage = (id: string) =>
  apiClient.delete<{ message: string }>(`/api/contact/messages/${id}`)
