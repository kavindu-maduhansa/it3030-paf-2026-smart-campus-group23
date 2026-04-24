import { useEffect, useState } from 'react'
import type { AxiosError } from 'axios'
import { Link } from 'react-router-dom'
import { HiOutlineClock, HiOutlineMapPin } from 'react-icons/hi2'
import { Pill, SectionHeader, panelLg, tilePanel } from '../dashboardUi'
import { createBooking } from '../../../services/bookingService'
import { getResources, type Resource } from '../../../services/resourceService'

const todaySessions = [
  { module: 'IT3030 · Smart Campus', room: 'Lecture Hall A', time: '09:00 – 10:30', students: 48 },
  { module: 'IT3020 · Databases', room: 'Lab 3', time: '13:00 – 15:00', students: 32 },
]

const modules = [
  { code: 'IT3030', name: 'Smart Campus Project', bookings: 3 },
  { code: 'IT3020', name: 'Database Systems', bookings: 2 },
  { code: 'IT4010', name: 'Industry Seminar', bookings: 1 },
]

type BookingFormState = {
  resourceId: string
  bookingDate: string
  startTime: string
  endTime: string
  purpose: string
  expectedAttendees: string
}

export default function LecturerPanels() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingForm, setBookingForm] = useState<BookingFormState>({
    resourceId: '',
    bookingDate: '',
    startTime: '09:00',
    endTime: '10:00',
    purpose: '',
    expectedAttendees: '',
  })

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoadingResources(true)
        const response = await getResources()
        const activeResources = Array.isArray(response.data)
          ? response.data.filter((resource) => resource.status !== 'OUT_OF_SERVICE')
          : []
        setResources(activeResources)
      } catch {
        setResources([])
      } finally {
        setLoadingResources(false)
      }
    }
    void loadResources()
  }, [])

  const openBookingModal = () => {
    setShowBookingModal(true)
    setBookingError(null)
    setBookingSuccess(null)
    setBookingForm({
      resourceId: '',
      bookingDate: '',
      startTime: '09:00',
      endTime: '10:00',
      purpose: '',
      expectedAttendees: '',
    })
  }

  const closeBookingModal = () => {
    if (bookingSubmitting) return
    setShowBookingModal(false)
  }

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBookingForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingError(null)
    setBookingSuccess(null)

    const resourceId = Number(bookingForm.resourceId)
    const expectedAttendees = Number(bookingForm.expectedAttendees)
    const purpose = bookingForm.purpose.trim()

    if (!Number.isFinite(resourceId) || resourceId < 1) {
      setBookingError('Please select a resource')
      return
    }
    if (!bookingForm.bookingDate) {
      setBookingError('Please select a booking date')
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
    if (purpose.length < 5) {
      setBookingError('Purpose must be at least 5 characters')
      return
    }
    if (!Number.isFinite(expectedAttendees) || expectedAttendees < 1) {
      setBookingError('Expected attendees must be at least 1')
      return
    }

    try {
      setBookingSubmitting(true)
      await createBooking({
        resourceId,
        bookingDate: bookingForm.bookingDate,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        purpose,
        expectedAttendees,
      })
      setBookingSuccess('Booking request submitted successfully.')
      window.setTimeout(() => setShowBookingModal(false), 800)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string; error?: string } | string>
      const data = axiosError.response?.data
      const message =
        typeof data === 'string'
          ? data
          : data?.message || data?.error || 'Failed to submit booking request'
      setBookingError(message)
    } finally {
      setBookingSubmitting(false)
    }
  }

  return (
    <section className="mt-12 space-y-10" aria-label="Lecturer workspace">
      <div>
        <SectionHeader
          eyebrow="Teaching day"
          title="Sessions & venues"
          subtitle="A concise view of where you need to be — timetable sync can replace demo content later."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className={`${panelLg} lg:col-span-2`}>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <HiOutlineClock className="h-5 w-5 text-[#3B82F6]" />
              Today&apos;s schedule
            </h3>
            <ul className="mt-4 space-y-4">
              {todaySessions.map((s) => (
                <li
                  key={s.module}
                  className="rounded-xl border border-[#1F2937] bg-[#0F172A]/60 p-4 sm:flex sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-white">{s.module}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-[#94A3B8]">
                      <HiOutlineMapPin className="h-4 w-4 shrink-0 text-[#3B82F6]" />
                      {s.room}
                    </p>
                    <p className="mt-1 text-sm text-[#64748B]">{s.time}</p>
                  </div>
                  <Pill variant="info">{s.students} students</Pill>
                </li>
              ))}
            </ul>
            <Link
              to="/schedule"
              className="mt-6 inline-flex text-sm font-semibold text-[#3B82F6] hover:text-[#93C5FD]"
            >
              Open full week view →
            </Link>
          </div>

          <div className="space-y-4">
            <div className={tilePanel}>
              <h3 className="text-sm font-semibold text-white">Quick reserve</h3>
              <p className="mt-2 text-sm text-[#94A3B8]">Book a lab or projector for your next session.</p>
              <button
                type="button"
                onClick={openBookingModal}
                className="mt-4 block w-full rounded-lg bg-[#3B82F6] py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-500"
              >
                New booking
              </button>
            </div>
            <div className={tilePanel}>
              <h3 className="text-sm font-semibold text-white">Your modules</h3>
              <ul className="mt-3 space-y-2">
                {modules.map((m) => (
                  <li
                    key={m.code}
                    className="flex items-center justify-between rounded-lg border border-[#1F2937] bg-[#0F172A] px-3 py-2"
                  >
                    <span className="text-sm text-[#E2E8F0]">
                      <span className="font-mono text-xs text-[#3B82F6]">{m.code}</span> · {m.name}
                    </span>
                    <span className="text-xs text-[#64748B]">{m.bookings} slots</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {showBookingModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-white">New Booking</h3>
                <p className="mt-1 text-sm text-[#94A3B8]">Create a booking request for your next teaching session.</p>
              </div>
              <button type="button" onClick={closeBookingModal} className="text-[#94A3B8] transition-colors hover:text-white">
                Close
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4 px-6 py-5">
              {bookingError ? (
                <div className="rounded-lg border border-red-500/30 bg-[#1E293B] px-4 py-3 text-sm text-[#FCA5A5]">
                  {bookingError}
                </div>
              ) : null}
              {bookingSuccess ? (
                <div className="rounded-lg border border-emerald-500/30 bg-[#1E293B] px-4 py-3 text-sm text-emerald-300">
                  {bookingSuccess}
                </div>
              ) : null}

              <div>
                <label htmlFor="resourceId" className="block text-sm font-semibold text-[#CBD5E1]">
                  Resource
                </label>
                <select
                  id="resourceId"
                  name="resourceId"
                  required
                  value={bookingForm.resourceId}
                  onChange={handleBookingChange}
                  className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                >
                  <option value="">Select resource</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name} ({resource.location})
                    </option>
                  ))}
                </select>
                {loadingResources ? <p className="mt-2 text-xs text-[#94A3B8]">Loading resources...</p> : null}
              </div>

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
                    required
                    value={bookingForm.expectedAttendees}
                    onChange={handleBookingChange}
                    className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
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
                  className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-white focus:border-[#3B82F6] focus:outline-none"
                  placeholder="Describe session purpose"
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
                  disabled={bookingSubmitting || loadingResources}
                  className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-500 disabled:opacity-50"
                >
                  {bookingSubmitting ? 'Submitting...' : 'Submit Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
