import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AxiosError } from 'axios'
import { Link } from 'react-router-dom'
import { HiOutlineCalendarDays, HiOutlineFunnel } from 'react-icons/hi2'
import { Pill, panelLg, tilePanel } from './dashboard/dashboardUi'
import {
  approveBooking,
  cancelBooking,
  deleteBooking,
  getAllBookings,
  getMyBookings,
  rejectBooking,
  type BookingAdminFilters,
  type BookingResponse,
  updateBooking,
} from '../services/bookingService'
import { useAuth } from '../services/useAuth'
import PageHeader from '../components/PageHeader'

type AdminStatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
type EditBookingFormState = {
  bookingDate: string
  startTime: string
  endTime: string
  purpose: string
  expectedAttendees: string
}

export default function BookingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const canShowUserQr = user?.role === 'STUDENT' || user?.role === 'LECTURER'
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [adminFilter, setAdminFilter] = useState<AdminStatusFilter>('ALL')
  const [adminDateFrom, setAdminDateFrom] = useState('')
  const [adminDateTo, setAdminDateTo] = useState('')
  const [adminResourceId, setAdminResourceId] = useState('')
  const [adminUserId, setAdminUserId] = useState('')
  const [rows, setRows] = useState<BookingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [qrBooking, setQrBooking] = useState<BookingResponse | null>(null)
  const [editingBooking, setEditingBooking] = useState<BookingResponse | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editFormError, setEditFormError] = useState<string | null>(null)
  const [decisionModal, setDecisionModal] = useState<{ type: 'APPROVE' | 'REJECT'; row: BookingResponse } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [decisionSubmitting, setDecisionSubmitting] = useState(false)
  const [editForm, setEditForm] = useState<EditBookingFormState>({
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
  })

  const { upcoming, past } = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const up: BookingResponse[] = []
    const old: BookingResponse[] = []

    rows.forEach((row) => {
      const date = new Date(`${row.bookingDate}T00:00:00`)
      const isPast = row.status === 'COMPLETED' || row.status === 'CANCELLED' || date < today
      if (isPast) {
        old.push(row)
      } else {
        up.push(row)
      }
    })

    return { upcoming: up, past: old }
  }, [rows])

  const currentRows = isAdmin ? rows : tab === 'upcoming' ? upcoming : past
  const pendingCount = rows.filter((u) => u.status === 'PENDING').length
  const approvedCount = rows.filter((u) => u.status === 'APPROVED').length
  const rejectedCount = rows.filter((u) => u.status === 'REJECTED').length
  const cancelledCount = rows.filter((u) => u.status === 'CANCELLED').length

  const visibleRows = useMemo(() => currentRows, [currentRows])

  const formatWhen = (row: BookingResponse) => {
    const start = String(row.startTime ?? '').slice(0, 5)
    const end = String(row.endTime ?? '').slice(0, 5)
    const date = new Date(`${row.bookingDate}T00:00:00`)
    const dateText = Number.isNaN(date.getTime())
      ? String(row.bookingDate ?? '')
      : date.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
    if (!start || !end) {
      return dateText
    }
    return `${dateText} · ${start}–${end}`
  }

  const mapStatus = (status: string): { label: string; variant: 'success' | 'warning' | 'danger' | 'default' } => {
    if (status === 'APPROVED') return { label: 'Confirmed', variant: 'success' }
    if (status === 'PENDING') return { label: 'Pending', variant: 'warning' }
    if (status === 'REJECTED') return { label: 'Rejected', variant: 'danger' }
    if (status === 'CANCELLED') return { label: 'Cancelled', variant: 'default' }
    return { label: 'Completed', variant: 'default' }
  }

  const buildAdminFilters = (): BookingAdminFilters => {
    const filters: BookingAdminFilters = {}
    if (adminFilter !== 'ALL') filters.status = adminFilter
    if (adminDateFrom) filters.startDate = adminDateFrom
    if (adminDateTo) filters.endDate = adminDateTo
    if (adminResourceId.trim() !== '') {
      const parsedResourceId = Number(adminResourceId)
      if (Number.isFinite(parsedResourceId) && parsedResourceId > 0) {
        filters.resourceId = parsedResourceId
      }
    }
    if (adminUserId.trim() !== '') {
      const parsedUserId = Number(adminUserId)
      if (Number.isFinite(parsedUserId) && parsedUserId > 0) {
        filters.userId = parsedUserId
      }
    }
    return filters
  }

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true)
      const response = isAdmin ? await getAllBookings(buildAdminFilters()) : await getMyBookings()
      setRows(Array.isArray(response.data) ? response.data : [])
      setError(null)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<unknown>
      const data = axiosError?.response?.data
      let apiMessage: string | undefined
      if (typeof data === 'string') {
        apiMessage = data.trim() || undefined
      } else if (data && typeof data === 'object') {
        const d = data as { message?: string; error?: string }
        apiMessage = d.message || d.error
      }
      if (!axiosError?.response) {
        setError('Cannot reach backend server. Please make sure backend is running.')
      } else {
        setError(apiMessage || 'Failed to load bookings')
      }
    } finally {
      setLoading(false)
    }
  }, [isAdmin, adminFilter, adminDateFrom, adminDateTo, adminResourceId, adminUserId])

  const handleDelete = async (row: BookingResponse) => {
    if (!window.confirm(`Delete booking BK-${row.id}?`)) return
    try {
      setActionLoadingId(row.id)
      await deleteBooking(row.id)
      await loadBookings()
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string; error?: string } | string>
      const data = axiosError.response?.data
      const message =
        typeof data === 'string'
          ? data
          : data?.message || data?.error || 'Failed to delete booking'
      setError(message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleEdit = async (row: BookingResponse) => {
    setSuccessMessage(null)
    setEditFormError(null)
    setEditingBooking(row)
    setEditForm({
      bookingDate: row.bookingDate,
      startTime: String(row.startTime ?? '').slice(0, 5),
      endTime: String(row.endTime ?? '').slice(0, 5),
      purpose: row.purpose || '',
      expectedAttendees: String(row.expectedAttendees ?? ''),
    })
  }

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const closeEditModal = () => {
    if (editSubmitting) return
    setEditingBooking(null)
    setEditFormError(null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBooking) return

    const purpose = editForm.purpose.trim()
    if (!editForm.bookingDate) {
      setEditFormError('Please select a booking date')
      return
    }
    if (!editForm.startTime || !editForm.endTime) {
      setEditFormError('Please select start and end time')
      return
    }
    if (editForm.endTime <= editForm.startTime) {
      setEditFormError('End time must be after start time')
      return
    }
    if (purpose.length < 5) {
      setEditFormError('Purpose must be at least 5 characters')
      return
    }
    const expectedAttendees = Number(editForm.expectedAttendees)
    if (!Number.isFinite(expectedAttendees) || expectedAttendees < 1) {
      setEditFormError('Expected attendees must be at least 1')
      return
    }

    try {
      setActionLoadingId(editingBooking.id)
      setEditSubmitting(true)
      await updateBooking(editingBooking.id, {
        resourceId: editingBooking.resourceId,
        bookingDate: editForm.bookingDate,
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        purpose,
        expectedAttendees,
      })
      await loadBookings()
      setSuccessMessage('Booking updated successfully.')
      setEditingBooking(null)
      setEditFormError(null)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string; error?: string } | string>
      const data = axiosError.response?.data
      const message =
        typeof data === 'string'
          ? data
          : data?.message || data?.error || 'Failed to update booking'
      setEditFormError(message)
    } finally {
      setEditSubmitting(false)
      setActionLoadingId(null)
    }
  }

  const openApproveModal = (row: BookingResponse) => {
    setError(null)
    setDecisionModal({ type: 'APPROVE', row })
    setRejectReason('')
  }

  const openRejectModal = (row: BookingResponse) => {
    setError(null)
    setDecisionModal({ type: 'REJECT', row })
    setRejectReason('')
  }

  const closeDecisionModal = () => {
    if (decisionSubmitting) return
    setDecisionModal(null)
    setRejectReason('')
  }

  const handleDecisionSubmit = async () => {
    if (!decisionModal) return

    const reason = rejectReason.trim()
    if (decisionModal.type === 'REJECT' && !reason) {
      setError('Reject reason is required')
      return
    }

    try {
      setActionLoadingId(decisionModal.row.id)
      setDecisionSubmitting(true)
      if (decisionModal.type === 'APPROVE') {
        await approveBooking(decisionModal.row.id)
        setSuccessMessage('Booking approved successfully.')
      } else {
        await rejectBooking(decisionModal.row.id, reason)
        setSuccessMessage('Booking rejected successfully.')
      }
      await loadBookings()
      setDecisionModal(null)
      setRejectReason('')
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string; error?: string } | string>
      const data = axiosError.response?.data
      const message =
        typeof data === 'string'
          ? data
          : data?.message || data?.error || `Failed to ${decisionModal.type.toLowerCase()} booking`
      setError(message)
    } finally {
      setDecisionSubmitting(false)
      setActionLoadingId(null)
    }
  }

  const handleCancel = async (row: BookingResponse) => {
    if (!window.confirm(`Cancel booking BK-${row.id}?`)) return
    try {
      setActionLoadingId(row.id)
      await cancelBooking(row.id)
      await loadBookings()
      setSuccessMessage('Booking cancelled successfully.')
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string; error?: string } | string>
      const data = axiosError.response?.data
      const message =
        typeof data === 'string'
          ? data
          : data?.message || data?.error || 'Failed to cancel booking'
      setError(message)
    } finally {
      setActionLoadingId(null)
    }
  }

  const getQrUrl = (row: BookingResponse) => {
    const dateText = new Date(`${row.bookingDate}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    const start = String(row.startTime ?? '').slice(0, 5)
    const end = String(row.endTime ?? '').slice(0, 5)
    const detailsText = [
      'BOOKING CONFIRMED',
      `Name: ${user?.name || row.userName || 'User'}`,
      `Booking ID: ${row.id}`,
      `Date: ${dateText}`,
      `Time: ${start} – ${end}`,
      `Capacity: ${row.expectedAttendees ?? '-'}`,
      'Status: Confirmed',
    ].join('\n')
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(detailsText)}`
  }

  const handleViewQr = (row: BookingResponse) => {
    setQrBooking(row)
  }

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  useEffect(() => {
    const timer = window.setInterval(() => {
      void loadBookings()
    }, 10000)
    return () => window.clearInterval(timer)
  }, [loadBookings, tab])

  useEffect(() => {
    if (!successMessage) return
    const timer = window.setTimeout(() => setSuccessMessage(null), 2500)
    return () => window.clearTimeout(timer)
  }, [successMessage])

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Reservations"
          title="Bookings"
          subtitle={isAdmin ? 'Review and manage booking requests quickly.' : 'Track space and equipment you’ve reserved.'}
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard"
                className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
              >
                Dashboard
              </Link>
              <Link
                to="/resources"
                className="ui-button-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
              >
                <HiOutlineCalendarDays className="h-4 w-4" />
                Browse facilities
              </Link>
            </div>
          }
        />

        {!isAdmin ? (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-xl border border-[#1F2937] bg-[#0F172A] p-1">
              <button
                type="button"
                onClick={() => setTab('upcoming')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === 'upcoming' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Upcoming
              </button>
              <button
                type="button"
                onClick={() => setTab('past')}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  tab === 'past' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Past
              </button>
            </div>
            <button
              type="button"
              className="ui-button-secondary inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
              disabled
            >
              <HiOutlineFunnel className="h-4 w-4" />
              Filters (soon)
            </button>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Active holds</p>
            <p className="mt-2 text-2xl font-bold text-white">{upcoming.length}</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">{isAdmin ? 'Pending approval' : 'Awaiting approval'}</p>
            <p className="mt-2 text-2xl font-bold text-amber-400">{pendingCount}</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">{isAdmin ? 'Approved' : 'Completed'}</p>
            <p className="mt-2 text-2xl font-bold text-[#34D399]">{isAdmin ? approvedCount : past.length}</p>
          </div>
        </div>

        {isAdmin ? (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="adminDateFrom" className="mb-1 block text-xs font-semibold text-[#94A3B8]">From</label>
                <input
                  id="adminDateFrom"
                  type="date"
                  value={adminDateFrom}
                  onChange={(e) => setAdminDateFrom(e.target.value)}
                  className="ui-input py-2"
                />
              </div>
              <div>
                <label htmlFor="adminDateTo" className="mb-1 block text-xs font-semibold text-[#94A3B8]">To</label>
                <input
                  id="adminDateTo"
                  type="date"
                  value={adminDateTo}
                  onChange={(e) => setAdminDateTo(e.target.value)}
                  className="ui-input py-2"
                />
              </div>
              <div>
                <label htmlFor="adminResourceId" className="mb-1 block text-xs font-semibold text-[#94A3B8]">Resource ID</label>
                <input
                  id="adminResourceId"
                  type="number"
                  min="1"
                  placeholder="e.g. 12"
                  value={adminResourceId}
                  onChange={(e) => setAdminResourceId(e.target.value)}
                  className="ui-input py-2"
                />
              </div>
              <div>
                <label htmlFor="adminUserId" className="mb-1 block text-xs font-semibold text-[#94A3B8]">User ID</label>
                <input
                  id="adminUserId"
                  type="number"
                  min="1"
                  placeholder="e.g. 7"
                  value={adminUserId}
                  onChange={(e) => setAdminUserId(e.target.value)}
                  className="ui-input py-2"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'ALL' as const, label: `All (${currentRows.length})` },
                { value: 'PENDING' as const, label: `Pending (${pendingCount})` },
                { value: 'APPROVED' as const, label: `Approved (${approvedCount})` },
                { value: 'REJECTED' as const, label: `Rejected (${rejectedCount})` },
                { value: 'CANCELLED' as const, label: `Cancelled (${cancelledCount})` },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAdminFilter(option.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    adminFilter === option.value
                      ? 'border-[#3B82F6] bg-[#3B82F6]/20 text-[#93C5FD]'
                      : 'border-[var(--color-border-strong)] text-[var(--color-text-muted)] hover:border-[#3B82F6]/40 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAdminFilter('ALL')
                  setAdminDateFrom('')
                  setAdminDateTo('')
                  setAdminResourceId('')
                  setAdminUserId('')
                }}
                className="ui-button-secondary px-3 py-1.5 text-xs"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className={`${panelLg} mt-8 text-center`}>
            <p className="text-[#94A3B8]">Loading bookings...</p>
          </div>
        ) : successMessage ? (
          <div className={`${panelLg} mt-8 text-center`}>
            <p className="text-emerald-300">{successMessage}</p>
          </div>
        ) : error ? (
          <div className={`${panelLg} mt-8 text-center`}>
            <p className="text-[#F87171]">{error}</p>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {visibleRows.map((row) => {
              const status = mapStatus(row.status)
              return (
                <li key={row.id} className={panelLg}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-[#64748B]">BK-{row.id}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{row.resourceName}</h3>
                  <p className="mt-2 text-sm text-[#94A3B8]">{formatWhen(row)}</p>
                  <p className="mt-1 text-sm text-[#64748B]">{row.resourceLocation}</p>
                  {isAdmin && (
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      Requested by {row.userName || '-'} ({row.userEmail || 'N/A'})
                    </p>
                  )}
                  {isAdmin ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-[#334155] bg-[#0F172A] px-2 py-1 text-xs text-[#CBD5E1]">
                        Attendees: {row.expectedAttendees ?? '-'}
                      </span>
                      {row.purpose ? (
                        <span className="max-w-[420px] truncate rounded-md border border-[#334155] bg-[#0F172A] px-2 py-1 text-xs text-[#CBD5E1]">
                          Purpose: {row.purpose}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  {row.status === 'REJECTED' && row.adminComment ? (
                    <p className="mt-1 text-xs text-[#F87171]">Reason: {row.adminComment}</p>
                  ) : null}
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Pill variant={status.variant}>{status.label}</Pill>
                  {isAdmin && row.status === 'PENDING' ? (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-40"
                        onClick={() => openApproveModal(row)}
                        disabled={actionLoadingId === row.id}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="rounded-md bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-[#FCA5A5] hover:bg-red-500/30 disabled:opacity-40"
                        onClick={() => openRejectModal(row)}
                        disabled={actionLoadingId === row.id}
                      >
                        Reject
                      </button>
                    </div>
                  ) : !isAdmin && row.status === 'PENDING' ? (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-[#2563EB]/40 bg-[#2563EB]/20 px-3 py-1.5 text-xs font-semibold text-[#93C5FD] hover:bg-[#2563EB]/30 disabled:opacity-40"
                        onClick={() => handleEdit(row)}
                        disabled={actionLoadingId === row.id}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-[#DC2626]/40 bg-[#DC2626]/20 px-3 py-1.5 text-xs font-semibold text-[#FCA5A5] hover:bg-[#DC2626]/30 disabled:opacity-40"
                        onClick={() => handleDelete(row)}
                        disabled={actionLoadingId === row.id}
                      >
                        Delete
                      </button>
                    </div>
                  ) : row.status === 'APPROVED' && canShowUserQr ? (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-[#0EA5E9]/40 bg-[#0EA5E9]/20 px-3 py-1.5 text-xs font-semibold text-[#7DD3FC] hover:bg-[#0EA5E9]/30"
                        onClick={() => handleViewQr(row)}
                      >
                        View QR
                      </button>
                      {tab === 'upcoming' ? (
                        <button
                          type="button"
                          className="rounded-md border border-[#DC2626]/40 bg-[#DC2626]/20 px-3 py-1.5 text-xs font-semibold text-[#FCA5A5] hover:bg-[#DC2626]/30 disabled:opacity-40"
                          onClick={() => handleCancel(row)}
                          disabled={actionLoadingId === row.id}
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
              )
            })}
          </ul>
        )}

        {!loading && !error && visibleRows.length === 0 ? (
          <div className={`${panelLg} mt-8 text-center`}>
            <p className="text-[#94A3B8]">
              {isAdmin ? 'No bookings match the selected filter.' : 'No bookings in this view.'}
            </p>
            <Link to="/resources" className="mt-4 inline-block text-sm font-semibold text-[#3B82F6]">
              Find a space →
            </Link>
          </div>
        ) : null}

        {editingBooking ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-5">
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Booking</h3>
                  <p className="mt-1 text-sm text-[#94A3B8]">{editingBooking.resourceName}</p>
                </div>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-[#94A3B8] transition-colors hover:text-white"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 px-6 py-5">
                {editFormError ? (
                  <div className="rounded-lg border border-red-500/30 bg-[#1E293B] px-4 py-3 text-sm text-[#FCA5A5]">
                    {editFormError}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="editBookingDate" className="block text-sm font-semibold text-[#CBD5E1]">
                      Date
                    </label>
                    <input
                      id="editBookingDate"
                      name="bookingDate"
                      type="date"
                      required
                      value={editForm.bookingDate}
                      onChange={handleEditFormChange}
                      className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="editExpectedAttendees" className="block text-sm font-semibold text-[#CBD5E1]">
                      Expected attendees
                    </label>
                    <input
                      id="editExpectedAttendees"
                      name="expectedAttendees"
                      type="number"
                      min="1"
                      required
                      value={editForm.expectedAttendees}
                      onChange={handleEditFormChange}
                      className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="editStartTime" className="block text-sm font-semibold text-[#CBD5E1]">
                      Start time
                    </label>
                    <input
                      id="editStartTime"
                      name="startTime"
                      type="time"
                      required
                      value={editForm.startTime}
                      onChange={handleEditFormChange}
                      className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="editEndTime" className="block text-sm font-semibold text-[#CBD5E1]">
                      End time
                    </label>
                    <input
                      id="editEndTime"
                      name="endTime"
                      type="time"
                      required
                      value={editForm.endTime}
                      onChange={handleEditFormChange}
                      className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="editPurpose" className="block text-sm font-semibold text-[#CBD5E1]">
                    Purpose
                  </label>
                  <textarea
                    id="editPurpose"
                    name="purpose"
                    rows={3}
                    minLength={5}
                    required
                    value={editForm.purpose}
                    onChange={handleEditFormChange}
                    className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-[#1F2937] pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-[#CBD5E1] hover:bg-[#1E293B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
                  >
                    {editSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {decisionModal ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl">
              <div className="border-b border-[#1F2937] px-6 py-5">
                <h3 className="text-lg font-bold text-white">
                  {decisionModal.type === 'APPROVE' ? 'Approve booking' : 'Reject booking'}
                </h3>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Booking BK-{decisionModal.row.id} · {decisionModal.row.resourceName}
                </p>
              </div>

              <div className="space-y-4 px-6 py-5">
                {decisionModal.type === 'REJECT' ? (
                  <div>
                    <label htmlFor="rejectReason" className="block text-sm font-semibold text-[#CBD5E1]">
                      Rejection reason
                    </label>
                    <textarea
                      id="rejectReason"
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                      placeholder="Enter reason to notify requester"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-[#CBD5E1]">This will mark the booking as approved and notify the requester.</p>
                )}

                <div className="flex justify-end gap-3 border-t border-[#1F2937] pt-4">
                  <button
                    type="button"
                    onClick={closeDecisionModal}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-[#CBD5E1] hover:bg-[#1E293B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={decisionSubmitting}
                    onClick={handleDecisionSubmit}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-50 ${
                      decisionModal.type === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                    }`}
                  >
                    {decisionSubmitting
                      ? decisionModal.type === 'APPROVE'
                        ? 'Approving...'
                        : 'Rejecting...'
                      : decisionModal.type === 'APPROVE'
                        ? 'Confirm Approve'
                        : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {qrBooking ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
            <div className="w-full max-w-xs rounded-2xl border border-[#23335A] bg-[#0A1330] p-4 shadow-2xl">
              <div className="text-center">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#7E92C8]">Check-in QR</p>
              </div>

              <div className="mt-3 flex justify-center rounded-lg bg-white p-3">
                <img src={getQrUrl(qrBooking)} alt={`Booking QR ${qrBooking.id}`} className="h-36 w-36" />
              </div>

              <p className="mt-3 truncate text-center text-[10px] text-[#7E92C8]">
                Booking #{qrBooking.id} - {String(qrBooking.startTime ?? '').slice(0, 5)} to{' '}
                {String(qrBooking.endTime ?? '').slice(0, 5)}
              </p>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(getQrUrl(qrBooking))}
                className="mt-3 w-full rounded-md border border-[#2C447D] bg-[#122552] px-3 py-1.5 text-xs font-semibold text-[#8EC5FF] hover:bg-[#183066]"
              >
                Copy QR image link
              </button>

              <p className="mt-2 text-center text-[10px] leading-4 text-[#7E92C8]">
                Scan this QR to view booking details quickly.
              </p>

              <button
                type="button"
                className="mt-3 w-full rounded-md px-3 py-1.5 text-xs font-semibold text-[#94A3B8] hover:bg-[#101B3A] hover:text-white"
                onClick={() => setQrBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
