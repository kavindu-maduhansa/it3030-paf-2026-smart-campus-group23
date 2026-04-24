import { useCallback, useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import { getResources, deleteResource, filterResources, toggleResourceStatus } from '../services/resourceService'
import type { Resource, FilterParams } from '../services/resourceService'
import type { ResourceEvent } from '../services/webSocketService'
import { createBooking } from '../services/bookingService'
import ResourceSearch from './ResourceSearch'
import ResourceFilter from './ResourceFilter'
import ResourceFormModal from './ResourceFormModal'
import { useAuth } from '../services/useAuth'
import { useWebSocket } from '../hooks/useWebSocket'

// Helper function to determine availability status
type AvailabilityStatus = 'AVAILABLE_NOW' | 'AVAILABLE_SOON' | 'NOT_AVAILABLE'
type BookingFormState = {
  bookingDate: string
  startTime: string
  endTime: string
  purpose: string
  expectedAttendees: string
}

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
  const isAdmin = user?.role === 'ADMIN'
  const isLecturer = user?.role === 'LECTURER'
  const isStudent = user?.role === 'STUDENT'
  const canBookResources = isLecturer || isStudent
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [refreshTime, setRefreshTime] = useState(0) // Triggers re-render for availability updates
  const [bookingResource, setBookingResource] = useState<Resource | null>(null)
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingForm, setBookingForm] = useState<BookingFormState>({
    bookingDate: '',
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    expectedAttendees: '',
  })

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

  const openBookingModal = (resource: Resource) => {
    setBookingResource(resource)
    setBookingError(null)
    setBookingSuccess(null)
    setBookingForm({
      bookingDate: '',
      startTime: '09:00',
      endTime: '10:00',
      purpose: '',
      expectedAttendees: '',
    })
  }

  const closeBookingModal = () => {
    if (bookingSubmitting) return
    setBookingResource(null)
  }

  const handleBookingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setBookingForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingError(null)
    setBookingSuccess(null)

    if (!bookingResource) return

    const trimmedPurpose = bookingForm.purpose.trim()
    if (!bookingForm.bookingDate) {
      setBookingError('Please select a booking date')
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(`${bookingForm.bookingDate}T00:00:00`)
    if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) {
      setBookingError('Booking date cannot be in the past')
      return
    }

    if (!bookingForm.startTime || !bookingForm.endTime) {
      setBookingError('Please select start and end time')
      return
    }
    if (bookingForm.endTime <= bookingForm.startTime) {
      setBookingError('End time must be after start time')
      return
    }

    if (!trimmedPurpose) {
      setBookingError('Purpose is required')
      return
    }
    if (trimmedPurpose.length < 5) {
      setBookingError('Purpose must be at least 5 characters')
      return
    }

    if (!bookingForm.expectedAttendees) {
      setBookingError('Expected attendees is required')
      return
    }
    const attendeeCount = Number(bookingForm.expectedAttendees)
    if (!Number.isFinite(attendeeCount) || attendeeCount < 1) {
      setBookingError('Expected attendees must be at least 1')
      return
    }
    if (bookingResource.capacity && attendeeCount > bookingResource.capacity) {
      setBookingError(`Expected attendees cannot exceed capacity (${bookingResource.capacity})`)
      return
    }
    if (!bookingResource.id) {
      setBookingError('Invalid resource selected')
      return
    }

    try {
      setBookingSubmitting(true)
      await createBooking({
        resourceId: bookingResource.id,
        bookingDate: bookingForm.bookingDate,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        purpose: trimmedPurpose,
        expectedAttendees: attendeeCount,
      })
      setBookingSuccess(`Booking request submitted for ${bookingResource.name}`)
      setTimeout(() => {
        setBookingResource(null)
      }, 700)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<unknown>
      const data = axiosError?.response?.data
      const message =
        (typeof data === 'string'
          ? data
          : (data as { message?: string; error?: string } | undefined)?.message ||
            (data as { message?: string; error?: string } | undefined)?.error) ||
        'Failed to submit booking request'
      setBookingError(message)
    } finally {
      setBookingSubmitting(false)
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

  const allowedLecturerTypes = new Set([
    'LECTURE_HALL',
    'LAB',
    'COMPUTER_LAB',
    'EQUIPMENT',
    'MEETING_ROOM',
    'LIBRARY',
    'WORKSPACE',
    'LIBRARY_WORKSPACE',
  ])
  const allowedStudentExactTypes = new Set(['MEETING_ROOM', 'LIBRARY', 'WORKSPACE', 'LIBRARY_WORKSPACE'])

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) {
      return false
    }

    if (!isLecturer && !isStudent) {
      return true
    }

    const normalizedType = resource.type.toUpperCase()
    if (isLecturer) {
      return (
        allowedLecturerTypes.has(normalizedType) ||
        normalizedType.includes('LIBRARY') ||
        normalizedType.includes('WORKSPACE')
      )
    }

    return (
      allowedStudentExactTypes.has(normalizedType) ||
      normalizedType.includes('LIBRARY') ||
      normalizedType.includes('WORKSPACE')
    )
  })

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

      {filteredResources.length === 0 ? (
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827] px-5 py-16 text-center text-[#94A3B8] shadow-xl shadow-black/40">
          No resources match your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => {
            const availabilityStatus = getAvailabilityStatus(resource)
            const badgeStyle = getAvailabilityBadgeStyle(availabilityStatus)
            const isActive = resource.status === 'ACTIVE'

            return (
              <article
                key={`${resource.id}-${refreshTime}`}
                className="rounded-2xl border border-[#1F2937] bg-[#111827] p-5 shadow-xl shadow-black/40 transition-all hover:border-[#3B82F6]/35 hover:bg-[#0F172A]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-white">{resource.name}</h3>
                  <span className="rounded-full bg-[#1E293B] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                    {resource.type}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-[#CBD5E1]">
                    <span className="text-[#94A3B8]">Capacity:</span>{' '}
                    <span className="font-medium tabular-nums text-white">{resource.capacity ?? '-'}</span>
                  </p>
                  <p className="text-[#CBD5E1]">
                    <span className="text-[#94A3B8]">Location:</span>{' '}
                    <span className="font-medium text-white">{resource.location}</span>
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badgeStyle.bg} ${badgeStyle.ring} ${badgeStyle.text}`}>
                    {badgeStyle.label}
                  </span>

                  {isAdmin ? (
                    <button
                      disabled={togglingId === resource.id}
                      onClick={() => handleToggleStatus(resource.id)}
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-all ${
                        isActive
                          ? 'bg-emerald-500/20 ring-emerald-500/35 text-emerald-300 hover:bg-emerald-500/30'
                          : 'bg-orange-500/20 ring-orange-500/35 text-orange-300 hover:bg-orange-500/30'
                      } disabled:opacity-50`}
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
                </div>

                {isAdmin && (
                  <div className="mt-5 flex gap-2">
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
                )}

                {canBookResources && (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => openBookingModal(resource)}
                      disabled={!isActive}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-[#3B82F6] px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-[#334155] disabled:text-[#94A3B8]"
                    >
                      {isActive ? 'Book Now' : 'Out of Service'}
                    </button>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

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

      {bookingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-white">Book Resource</h2>
                <p className="mt-1 text-sm text-[#94A3B8]">{bookingResource.name}</p>
              </div>
              <button
                type="button"
                onClick={closeBookingModal}
                className="text-[#94A3B8] transition-colors hover:text-white"
                aria-label="Close booking form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 px-6 py-5">
              {bookingError && (
                <div className="rounded-lg border border-[#EF4444]/30 bg-[#1E293B] px-4 py-3 text-sm text-[#F87171]">
                  {bookingError}
                </div>
              )}
              {bookingSuccess && (
                <div className="rounded-lg border border-emerald-500/30 bg-[#1E293B] px-4 py-3 text-sm text-emerald-300">
                  {bookingSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bookingDate" className="block text-sm font-semibold text-[#CBD5E1]">
                    Date
                  </label>
                  <input
                    id="bookingDate"
                    name="bookingDate"
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingForm.bookingDate}
                    onChange={handleBookingChange}
                    className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="expectedAttendees" className="block text-sm font-semibold text-[#CBD5E1]">
                    Expected attendees
                  </label>
                  <input
                    id="expectedAttendees"
                    name="expectedAttendees"
                    type="number"
                    min="1"
                    max={bookingResource.capacity ?? undefined}
                    required
                    value={bookingForm.expectedAttendees}
                    onChange={handleBookingChange}
                    className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                    placeholder="e.g., 20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-semibold text-[#CBD5E1]">
                    Start time
                  </label>
                  <input
                    id="startTime"
                    name="startTime"
                    type="time"
                    required
                    value={bookingForm.startTime}
                    onChange={handleBookingChange}
                    className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-semibold text-[#CBD5E1]">
                    End time
                  </label>
                  <input
                    id="endTime"
                    name="endTime"
                    type="time"
                    required
                    value={bookingForm.endTime}
                    onChange={handleBookingChange}
                    className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="purpose" className="block text-sm font-semibold text-[#CBD5E1]">
                  Purpose
                </label>
                <textarea
                  id="purpose"
                  name="purpose"
                  rows={3}
                  required
                  minLength={5}
                  value={bookingForm.purpose}
                  onChange={handleBookingChange}
                  placeholder="Add booking purpose"
                  className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-[#1F2937] pt-4">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#CBD5E1] hover:bg-[#1E293B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
                >
                  {bookingSubmitting ? 'Submitting...' : 'Submit Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResourceList
