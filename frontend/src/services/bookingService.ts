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

export interface BookingAdminFilters {
  status?: string
  startDate?: string
  endDate?: string
  resourceId?: number
  userId?: number
}

export const createBooking = (payload: BookingCreateRequest) =>
  apiClient.post<BookingResponse>(API_URL, payload)

export const getMyBookings = () =>
  apiClient.get<BookingResponse[]>(`${API_URL}/my`)

export const getAllBookings = (filters?: BookingAdminFilters) => {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.startDate) params.append('startDate', filters.startDate)
  if (filters?.endDate) params.append('endDate', filters.endDate)
  if (typeof filters?.resourceId === 'number' && Number.isFinite(filters.resourceId)) {
    params.append('resourceId', String(filters.resourceId))
  }
  if (typeof filters?.userId === 'number' && Number.isFinite(filters.userId)) {
    params.append('userId', String(filters.userId))
  }
  const query = params.toString()
  return apiClient.get<BookingResponse[]>(query ? `${API_URL}?${query}` : API_URL)
}

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
