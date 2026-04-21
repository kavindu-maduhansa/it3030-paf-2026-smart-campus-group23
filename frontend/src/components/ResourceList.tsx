import { useCallback, useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import { getResources, deleteResource, filterResources, toggleResourceStatus } from '../services/resourceService'
import type { Resource, FilterParams } from '../services/resourceService'
import type { ResourceEvent } from '../services/webSocketService'
import ResourceSearch from './ResourceSearch'
import ResourceFilter from './ResourceFilter'
import ResourceFormModal from './ResourceFormModal'
import { useAuth } from '../services/useAuth'
import { useWebSocket } from '../hooks/useWebSocket'

// Helper function to determine availability status
type AvailabilityStatus = 'AVAILABLE_NOW' | 'AVAILABLE_SOON' | 'NOT_AVAILABLE'

const getAvailabilityStatus = (resource: Resource): AvailabilityStatus => {
  // If neither time is provided, consider it available now
  if (!resource.availabilityStart && !resource.availabilityEnd) {
    return 'AVAILABLE_NOW'
  }

  // Get current time in HH:MM format
  const now = new Date()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  // Parse availability times (format: "HH:MM" from backend)
  const startTime = resource.availabilityStart ? String(resource.availabilityStart).substring(0, 5) : null
  const endTime = resource.availabilityEnd ? String(resource.availabilityEnd).substring(0, 5) : null

  // Check if current time is within the availability window
  if (startTime && endTime) {
    if (currentTime >= startTime && currentTime < endTime) {
      return 'AVAILABLE_NOW'
    } else if (currentTime < startTime) {
      return 'AVAILABLE_SOON'
    } else {
      return 'NOT_AVAILABLE'
    }
  }

  // If only start time exists
  if (startTime && !endTime) {
    if (currentTime >= startTime) {
      return 'AVAILABLE_NOW'
    } else {
      return 'AVAILABLE_SOON'
    }
  }

  // If only end time exists
  if (!startTime && endTime) {
    if (currentTime < endTime) {
      return 'AVAILABLE_NOW'
    } else {
      return 'NOT_AVAILABLE'
    }
  }

  return 'AVAILABLE_NOW'
}

// Helper function to get badge styling
const getAvailabilityBadgeStyle = (status: AvailabilityStatus) => {
  switch (status) {
    case 'AVAILABLE_NOW':
      return {
        bg: 'bg-emerald-500/20',
        ring: 'ring-emerald-500/35',
        text: 'text-emerald-300',
        label: 'Available Now',
      }
    case 'AVAILABLE_SOON':
      return {
        bg: 'bg-yellow-500/20',
        ring: 'ring-yellow-500/35',
        text: 'text-yellow-300',
        label: 'Available Soon',
      }
    case 'NOT_AVAILABLE':
      return {
        bg: 'bg-red-500/20',
        ring: 'ring-red-500/35',
        text: 'text-red-300',
        label: 'Not Available',
      }
  }
}

const ResourceList = () => {
  const { user, loading: authLoading } = useAuth()
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN'
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [refreshTime, setRefreshTime] = useState(0) // Triggers re-render for availability updates

  const loadResources = useCallback(async () => {
    // Don't attempt to load resources if not authenticated
    if (!user) {
      console.log('[ResourceList] User not authenticated, skipping resource load')
      setLoading(false)
      return
    }
    
    try {
      console.log('[ResourceList] Loading resources for user:', user?.email, 'role:', user?.role, 'authenticated:', !!user)
      setLoading(true)
      const response = await getResources()
      console.log('[ResourceList] Resources loaded successfully, count:', response.data?.length)
      setResources(response.data)
      setError(null)
    } catch (err: unknown) {
      // Check if it's an authentication error
      const axiosError = err as AxiosError<{ message: string }>
      if (axiosError?.response?.status === 401) {
        console.error('[ResourceList] 401 Unauthorized - user needs to login')
        setError('Please log in to view resources')
        // Redirect to login
        window.location.href = '/login'
      } else {
        console.error('[ResourceList] Error loading resources:', axiosError?.response?.status, axiosError?.message, axiosError?.response?.data)
        setError('Failed to load resources')
        console.error(err)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleFilter = useCallback(async (newFilters: FilterParams) => {
    if (!user) return
    
    try {
      setLoading(true)
      console.log('[ResourceList] Applying filters:', newFilters)
      const response = await filterResources(newFilters)
      console.log('[ResourceList] Filter successful, returned', response.data?.length, 'resources')
      setResources(response.data)
      setError(null)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>
      console.error('[ResourceList] Filter error:', axiosError?.response?.status, axiosError?.message)
      setError('Failed to filter resources')
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleResetFilter = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await getResources()
      console.log('[ResourceList] Filters reset, count:', response.data?.length)
      setResources(response.data)
      setError(null)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>
      console.error('[ResourceList] Error resetting filters:', axiosError?.message)
      setError('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleResourceEvent = useCallback((event: ResourceEvent) => {
    console.log('[ResourceList] WebSocket event received:', event.action, event.resourceId);
    
    if (event.action === 'DELETE') {
      setResources((prev) => prev.filter((r) => r.id !== event.resourceId))
      return
    }
    if (event.action === 'CREATE' || event.action === 'UPDATE') {
      void loadResources()
    }
  }, [loadResources])

  // Connect to WebSocket with proper lifecycle management
  useWebSocket(handleResourceEvent, !authLoading && !!user)

  const handleDelete = async (id: number | undefined) => {
    if (!id || !window.confirm('Are you sure you want to delete this resource?')) return
    try {
      setDeletingId(id)
      await deleteResource(id)
      setResources((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      console.error('Failed to delete resource:', err)
      alert('Failed to delete resource')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (id: number | undefined) => {
    if (!id) return
    try {
      setTogglingId(id)
      const response = await toggleResourceStatus(id)
      // Update the resource in the list with the new status
      setResources((prev) =>
        prev.map((r) => (r.id === id ? response.data : r))
      )
    } catch (err) {
      console.error('Failed to toggle resource status:', err)
      alert('Failed to toggle resource status')
    } finally {
      setTogglingId(null)
    }
  }

  useEffect(() => {
    // Wait for auth to complete before loading resources
    if (!authLoading && user) {
      console.log('[ResourceList] Loading resources for authenticated user');
      void loadResources()
    }
  }, [authLoading, user, loadResources])

  // Auto-update availability status every second
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshTime((prev) => prev + 1)
    }, 1000) // Update every 1 second

    return () => clearInterval(timer)
  }, [])

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[#1F2937] border-t-[#3B82F6]"
          aria-hidden
        />
        <p className="text-sm font-medium text-[#94A3B8]">Loading facilities…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-[#EF4444]/30 bg-[#111827] p-6 text-center shadow-lg shadow-black/30"
        role="alert"
      >
        <p className="font-semibold text-[#F87171]">{error}</p>
        <button
          type="button"
          onClick={() => loadResources()}
          className="mt-4 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(59,130,246,0.5)]"
        >
          Try again
        </button>
      </div>
    )
  }

  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Use refreshTime to trigger re-renders for availability updates (avoids stale status)

  return (
    <div>
      <header className="mb-8 border-b border-[#1F2937] pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">
          Module A · Facilities
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Facilities catalogue
        </h1>
        <p className="mt-2 max-w-2xl text-[#94A3B8]">
          Browse rooms, labs, and equipment.
        </p>
      </header>

      <ResourceFilter onFilter={handleFilter} onReset={handleResetFilter} />

      <ResourceSearch onSearch={setSearchTerm} />

      <div className="mb-6 flex items-center justify-between">
        {isAdmin && (
          <button
            className="rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(59,130,246,0.5)]"
            onClick={() => {
              setSelectedResource(null)
              setShowForm(true)
            }}
          >
            + Add Resource
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] shadow-xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#1E293B]">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Name
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Type
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Capacity
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Location
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Availability
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Status
                </th>
                {isAdmin && (
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-[#CBD5E1]">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-5 py-16 text-center text-[#94A3B8]">
                    No resources match your search.
                  </td>
                </tr>
              ) : (
                filteredResources.map((resource) => {
                  const availabilityStatus = getAvailabilityStatus(resource)
                  const badgeStyle = getAvailabilityBadgeStyle(availabilityStatus)
                  const isActive = resource.status === 'ACTIVE'
                  
                  return (
                    <tr
                      key={`${resource.id}-${refreshTime}`}
                      className="transition-colors hover:bg-[#3B82F6]/[0.08]"
                    >
                      <td className="px-5 py-4 font-medium text-white">{resource.name}</td>
                      <td className="px-5 py-4">{resource.type}</td>
                      <td className="px-5 py-4 tabular-nums">{resource.capacity}</td>
                      <td className="px-5 py-4">{resource.location}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badgeStyle.bg} ${badgeStyle.ring} ${badgeStyle.text}`}>
                          {badgeStyle.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isAdmin ? (
                          <button
                            disabled={togglingId === resource.id}
                            onClick={() => handleToggleStatus(resource.id)}
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-all ${
                              isActive
                                ? 'bg-emerald-500/20 ring-emerald-500/35 text-emerald-300 hover:bg-emerald-500/30'
                                : 'bg-orange-500/20 ring-orange-500/35 text-orange-300 hover:bg-orange-500/30'
                            } disabled:opacity-50 cursor-pointer`}
                          >
                            {togglingId === resource.id ? 'Updating...' : isActive ? 'Active' : 'Out of Service'}
                          </button>
                        ) : (
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                            isActive
                              ? 'bg-emerald-500/20 ring-emerald-500/35 text-emerald-300'
                              : 'bg-orange-500/20 ring-orange-500/35 text-orange-300'
                          }`}>
                            {isActive ? 'Active' : 'Out of Service'}
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button
                              className="rounded-lg bg-[#3B82F6]/20 px-3 py-1.5 text-xs font-medium text-[#3B82F6] transition-all hover:bg-[#3B82F6]/30"
                              onClick={() => {
                                setSelectedResource(resource)
                                setShowForm(true)
                              }}
                            >
                              Edit
                            </button>
                            <button
                              disabled={deletingId === resource.id}
                              className="rounded-lg bg-[#EF4444]/20 px-3 py-1.5 text-xs font-medium text-[#F87171] transition-all hover:bg-[#EF4444]/30 disabled:opacity-50"
                              onClick={() => handleDelete(resource.id)}
                            >
                              {deletingId === resource.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ResourceFormModal
          resource={selectedResource}
          onClose={() => {
            setShowForm(false)
            setSelectedResource(null)
          }}
          onSaved={loadResources}
        />
      )}
    </div>
  )
}

export default ResourceList
