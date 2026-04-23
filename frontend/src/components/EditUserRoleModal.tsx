import { useState } from 'react'
import { HiOutlineXMark } from 'react-icons/hi2'
import { apiClient } from '../services/axiosConfig'

interface EditUserRoleModalProps {
  isOpen: boolean
  user: { id: number; name: string; email: string; role: string } | null
  onClose: () => void
  onSuccess: (updatedUser: any) => void
}

const ROLES = ['STUDENT', 'LECTURER', 'TECHNICIAN', 'ADMIN']

export default function EditUserRoleModal({ isOpen, user, onClose, onSuccess }: EditUserRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState(user?.role || 'STUDENT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.put(`/api/admin/users/${user.id}/role`, {
        role: selectedRole,
      })
      onSuccess(response.data)
      onClose()
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.response?.data?.error || 'Failed to update user role'
      setError(message)
      console.error('Error updating user role:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#1F2937] bg-[#111827] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Edit User Role</h2>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-white focus:outline-none"
          >
            <HiOutlineXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 p-3 text-sm text-[#F87171]">
              {error}
            </div>
          )}

          {/* User Info */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">User</p>
            <p className="mt-1 text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-[#64748B]">{user.email}</p>
          </div>

          {/* Current Role */}
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Current Role</p>
            <div className="mt-2 inline-block rounded-full bg-[#0F172A] px-3 py-1 text-sm font-semibold text-[#3B82F6]">
              {user.role}
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label htmlFor="role" className="block text-sm font-semibold text-[#CBD5E1] mb-2">
              New Role
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-lg border border-[#1F2937] bg-[#0F172A] px-4 py-2.5 text-white focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[#64748B]">
              {selectedRole === 'ADMIN' && 'Admins can manage users and view admin panel.'}
              {selectedRole === 'LECTURER' && 'Lecturers can manage their courses and resources.'}
              {selectedRole === 'TECHNICIAN' && 'Technicians can manage maintenance tickets.'}
              {selectedRole === 'STUDENT' && 'Students can book resources and view their bookings.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-[#334155] px-4 py-2.5 text-sm font-semibold text-white hover:border-[#475569] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedRole === user.role}
              className="flex-1 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/30 hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
