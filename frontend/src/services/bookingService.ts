import { apiClient } from './axiosConfig'

const API_URL = '/api/bookings'

export interface BookingCreateRequest {
  resourceId: number
  bookingDate: string
  startTime: string
  endTime: string
  purpose: string
  expectedAttendees: number
}

export interface BookingResponse {
  id: number
  resourceId: number
  resourceName: string
  resourceLocation: string
  userId?: number
  userName?: string
  userEmail?: string
  bookingDate: string
  startTime: string
  endTime: string
  purpose: string
  expectedAttendees: number
  status: string
  adminComment?: string | null
  createdAt: string
}

export const createBooking = (payload: BookingCreateRequest) =>
  apiClient.post<BookingResponse>(API_URL, payload)

export const getMyBookings = () =>
  apiClient.get<BookingResponse[]>(`${API_URL}/my`)

export const getAllBookings = () =>
  apiClient.get<BookingResponse[]>(API_URL)

export const updateBooking = (id: number, payload: BookingCreateRequest) =>
  apiClient.put<BookingResponse>(`${API_URL}/${id}`, payload)

export const deleteBooking = (id: number) =>
  apiClient.delete(`${API_URL}/${id}`)

export const cancelBooking = (id: number) =>
  apiClient.patch<BookingResponse>(`${API_URL}/${id}/cancel`)

export const approveBooking = (id: number) =>
  apiClient.patch<BookingResponse>(`${API_URL}/${id}/approve`)

export const rejectBooking = (id: number, reason: string) =>
  apiClient.patch<BookingResponse>(`${API_URL}/${id}/reject`, { reason })
