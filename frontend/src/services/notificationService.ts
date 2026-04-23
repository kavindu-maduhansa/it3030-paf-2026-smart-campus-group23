import { apiClient } from './axiosConfig'

export interface Notification {
  id: string
  title: string
  description: string
  type: 'resource' | 'facility' | 'booking' | 'maintenance' | 'ticket'
  severity: 'info' | 'warning' | 'danger'
  createdAt: string
  read: boolean
}

export interface NotificationStats {
  resourceCount: number
  facilityCount: number
  bookingCount: number
  maintenanceCount: number
  ticketCount: number
  total: number
}

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<Notification[]>('/api/admin/notifications')
    return response.data || []
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return []
  }
}

export const getNotificationStats = async (): Promise<NotificationStats> => {
  try {
    const response = await apiClient.get<NotificationStats>('/api/admin/notifications/stats')
    return response.data || { resourceCount: 0, facilityCount: 0, bookingCount: 0, maintenanceCount: 0, ticketCount: 0, total: 0 }
  } catch (error) {
    console.error('Failed to fetch notification stats:', error)
    return { resourceCount: 0, facilityCount: 0, bookingCount: 0, maintenanceCount: 0, ticketCount: 0, total: 0 }
  }
}

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await apiClient.put(`/api/admin/notifications/${notificationId}/read`)
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
  }
}

export const clearNotifications = async (type?: string): Promise<void> => {
  try {
    if (type) {
      await apiClient.delete(`/api/admin/notifications?type=${type}`)
    } else {
      await apiClient.delete('/api/admin/notifications')
    }
  } catch (error) {
    console.error('Failed to clear notifications:', error)
  }
}
