import { HiOutlineXMark } from 'react-icons/hi2'
import { useState } from 'react'
import { apiClient } from '../services/axiosConfig'

interface DeleteUserModalProps {
  isOpen: boolean
  user: { id: number; name: string; email: string } | null
  onClose: () => void
  onSuccess: (userId: number) => void
}

export default function DeleteUserModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !user) return null

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      await apiClient.delete(`/api/admin/users/${user.id}`)
      onSuccess(user.id)
      onClose()
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.message === 'Request failed with status code 500'
          ? `Cannot delete this user. They may have active bookings or related data. Please check the backend logs for details.`
          : 'Failed to delete user')
      setError(message)
      console.error('Error deleting user:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-[#1F2937] bg-[#111827] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Delete User</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[#64748B] hover:text-white focus:outline-none disabled:opacity-50"
          >
            <HiOutlineXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 p-3 text-sm text-[#F87171]">
              {error}
            </div>
          )}

          <div className="mb-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EF4444]/20">
              <svg className="h-6 w-6 text-[#EF4444]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-white">Delete user?</h3>
            <p className="mt-2 text-[#94A3B8]">
              This action cannot be undone. All data associated with this user will be permanently
              deleted from the system.
            </p>
          </div>

          {/* User Info */}
          <div className="mb-6 rounded-lg bg-[#0F172A] border border-[#1F2937] p-4">
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">User to delete</p>
            <p className="mt-2 font-medium text-white">{user.name}</p>
            <p className="text-sm text-[#64748B]">{user.email}</p>
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
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 rounded-lg bg-[#EF4444] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#EF4444]/30 hover:bg-[#DC2626] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
