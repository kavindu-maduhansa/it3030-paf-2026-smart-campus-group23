import { apiClient } from './axiosConfig'

export interface UserDTO {
  id: number
  name: string
  email: string
  role: string
  provider?: string
}

const ADMIN_API = '/api/admin/users'

export const userService = {
  /**
   * Get all users (Admin/Technician restricted on backend)
   */
  getAllUsers: () => apiClient.get<UserDTO[]>(ADMIN_API),

  /**
   * Update a user's role
   */
  updateUserRole: (userId: number, role: string) => 
    apiClient.patch(`${ADMIN_API}/${userId}/role`, null, { params: { role } })
}
