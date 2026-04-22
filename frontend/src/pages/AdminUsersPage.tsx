import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineMagnifyingGlass, HiOutlineUserPlus, HiXMark } from 'react-icons/hi2'
import { Pill, SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'
import { apiClient } from '../services/axiosConfig'
import { useAuth } from '../services/useAuth'

interface User {
  id: number
  name: string
  email: string
  role: string
  provider?: string
  createdAt?: string
}

interface EditingState {
  userId: number | null
  newRole: string | null
}

function rolePill(role: string) {
  const r = role.toUpperCase()
  if (r === 'ADMIN') return <Pill variant="danger">Admin</Pill>
  if (r === 'LECTURER') return <Pill variant="info">Lecturer</Pill>
  if (r === 'TECHNICIAN') return <Pill variant="warning">Technician</Pill>
  return <Pill variant="success">Student</Pill>
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<EditingState>({ userId: null, newRole: null })
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    // Don't attempt to load users if not authenticated
    if (!user) {
      console.log('[AdminUsersPage] User not authenticated, skipping users load')
      setLoading(false)
      return
    }

    // Check if user has ADMIN role
    if (user.role !== 'ADMIN') {
      console.error('[AdminUsersPage] User is not ADMIN, role:', user.role)
      setError('Access denied: Admin role required')
      setLoading(false)
      return
    }

    try {
      console.log('[AdminUsersPage] Loading users for admin:', user?.email, 'role:', user?.role, 'authenticated:', !!user)
      setLoading(true)
      setError(null)
      const response = await apiClient.get('/api/admin/users')
      console.log('[AdminUsersPage] Users loaded successfully, count:', response.data?.length)
      setUsers(response.data)
      setError(null)
    } catch (err) {
      console.error('[AdminUsersPage] Failed to fetch users:', err)
      // Check if it's an authentication error
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: any } }
        if (error.response?.status === 401) {
          console.error('[AdminUsersPage] 401 Unauthorized - session expired or invalid')
          console.error('[AdminUsersPage] Response:', error.response?.data)
          setError('Session expired. Please refresh the page and try again.')
          // Don't auto-redirect - let user see the error and refresh
        } else if (error.response?.status === 403) {
          console.error('[AdminUsersPage] 403 Forbidden - insufficient permissions')
          setError('Access denied: Admin role required')
        } else {
          console.error('[AdminUsersPage] Error status:', error.response?.status)
          setError(`Failed to load users: ${error.response?.status || 'Network error'}`)
        }
      } else {
        setError('Failed to load users from the server')
      }
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    // Wait for auth to complete before loading users
    if (!authLoading) {
      void fetchUsers()
    }
  }, [fetchUsers, authLoading])

  const openEditRoleModal = (userId: number, currentRole: string) => {
    setEditing({ userId, newRole: currentRole })
    setUpdateError(null)
  }

  const closeEditRoleModal = () => {
    setEditing({ userId: null, newRole: null })
    setUpdateError(null)
  }

  const handleUpdateRole = async () => {
    if (!editing.userId || !editing.newRole) return

    try {
      setUpdating(true)
      setUpdateError(null)
      console.log(`[AdminUsersPage] Updating user ${editing.userId} role to ${editing.newRole}`)
      
      const response = await apiClient.put(`/api/admin/users/${editing.userId}/role`, {
        role: editing.newRole,
      })
      
      console.log('[AdminUsersPage] Role updated successfully:', response.data)
      
      // Update the users list with the new data
      setUsers(users.map((u) => (u.id === editing.userId ? { ...u, role: editing.newRole as string } : u)))
      closeEditRoleModal()
    } catch (err) {
      console.error('[AdminUsersPage] Failed to update role:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { status?: number; data?: any } }
        setUpdateError(`Failed to update role: ${error.response?.status || 'Network error'}`)
      } else {
        setUpdateError('Failed to update role. Please try again.')
      }
    } finally {
      setUpdating(false)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
  )

  // Show loading while auth is in progress
  if (authLoading || loading) {
    return (
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className={`${panelLg} mt-8 p-8 text-center text-[#64748B]`}>
            Loading...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Administration"
          title="User management"
          subtitle="Search and review all campus accounts"
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard"
                className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
              >
                Dashboard
              </Link>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white opacity-70"
                title="Connect API to enable"
              >
                <HiOutlineUserPlus className="h-4 w-4" />
                Add user
              </button>
            </div>
          }
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Total users</p>
            <p className="mt-2 text-2xl font-bold text-white">{users.length}</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Admins</p>
            <p className="mt-2 text-2xl font-bold text-red-400">
              {users.filter((u) => u.role === 'ADMIN').length}
            </p>
          </div>
        </div>

        {error && (
          <div className={`${panelLg} mt-8 border border-red-500/30 bg-red-500/10 p-4`}>
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30"
            >
              Refresh Page
            </button>
          </div>
        )}

        {loading ? (
          <div className={`${panelLg} mt-8 p-8 text-center text-[#64748B]`}>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className={`${panelLg} mt-8 p-8 text-center text-[#64748B]`}>
            No users found
          </div>
        ) : (
          <div className={`${panelLg} mt-8 overflow-hidden p-0`}>
            <div className="flex flex-col gap-4 border-b border-[#1F2937] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-md flex-1">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name or email…"
                  className="w-full rounded-xl border border-[#334155] bg-[#0F172A] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>
              <p className="text-sm text-[#64748B]">
                Showing <strong className="text-[#94A3B8]">{filtered.length}</strong> users
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1F2937] bg-[#0F172A]/50 text-xs uppercase tracking-wide text-[#64748B]">
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937]">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-[#0F172A]/40">
                      <td className="px-5 py-4 font-medium text-white">{u.name}</td>
                      <td className="px-5 py-4 text-[#94A3B8]">{u.email}</td>
                      <td className="px-5 py-4">{rolePill(u.role)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openEditRoleModal(u.id, u.role)}
                          className="text-xs font-semibold text-[#3B82F6] hover:underline"
                        >
                          Edit role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit Role Modal */}
        {editing.userId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-[#334155] bg-[#0F172A] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Edit User Role</h3>
                <button
                  onClick={closeEditRoleModal}
                  className="text-[#64748B] hover:text-white"
                  disabled={updating}
                >
                  <HiXMark className="h-5 w-5" />
                </button>
              </div>

              {updateError && (
                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-sm text-red-400">{updateError}</p>
                </div>
              )}

              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-[#94A3B8]">Select new role:</label>
                <select
                  value={editing.newRole || ''}
                  onChange={(e) => setEditing({ ...editing, newRole: e.target.value })}
                  disabled={updating}
                  className="w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-white focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6] disabled:opacity-50"
                >
                  <option value="STUDENT">Student</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="TECHNICIAN">Technician</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeEditRoleModal}
                  disabled={updating}
                  className="flex-1 rounded-lg border border-[#334155] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E293B] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateRole}
                  disabled={updating}
                  className="flex-1 rounded-lg bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2563EB] disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Role'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
