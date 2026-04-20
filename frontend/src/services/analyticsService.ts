import { apiClient } from './axiosConfig';

export interface TopResource {
  resourceId: number;
  resourceName: string;
  resourceType: string;
  location: string;
  bookingCount: number;
}

export interface PeakHour {
  hour: number;
  bookingCount: number;
  timeLabel: string;
}

export interface BookingsByType {
  type: string;
  bookingCount: number;
}

const ANALYTICS_API = '/api/admin/analytics';

export const analyticsService = {
  /**
   * Get top resources by booking count
   */
  getTopResources: async (limit: number = 10): Promise<TopResource[]> => {
    try {
      const response = await apiClient.get<TopResource[]>(`${ANALYTICS_API}/top-resources`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top resources:', error);
      throw error;
    }
  },

  /**
   * Get top resources by date range
   */
  getTopResourcesByDateRange: async (
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<TopResource[]> => {
    try {
      const response = await apiClient.get<TopResource[]>(`${ANALYTICS_API}/top-resources/range`, {
        params: { startDate, endDate, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top resources by date range:', error);
      throw error;
    }
  },

  /**
   * Get peak booking hours
   */
  getPeakBookingHours: async (): Promise<PeakHour[]> => {
    try {
      const response = await apiClient.get<PeakHour[]>(`${ANALYTICS_API}/peak-hours`);
      return response.data;
    } catch (error) {
      console.error('Error fetching peak hours:', error);
      throw error;
    }
  },

  /**
   * Get peak booking hours by date range
   */
  getPeakBookingHoursByDateRange: async (
    startDate: string,
    endDate: string
  ): Promise<PeakHour[]> => {
    try {
      const response = await apiClient.get<PeakHour[]>(`${ANALYTICS_API}/peak-hours/range`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching peak hours by date range:', error);
      throw error;
    }
  },

  /**
   * Get bookings by resource type
   */
  getBookingsByResourceType: async (): Promise<BookingsByType[]> => {
    try {
      const response = await apiClient.get<BookingsByType[]>(`${ANALYTICS_API}/by-type`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings by type:', error);
      throw error;
    }
  },

  /**
   * Get resource utilization
   */
  getResourceUtilization: async (): Promise<TopResource[]> => {
    try {
      const response = await apiClient.get<TopResource[]>(`${ANALYTICS_API}/resource-utilization`);
      return response.data;
    } catch (error) {
      console.error('Error fetching resource utilization:', error);
      throw error;
    }
  }
};
