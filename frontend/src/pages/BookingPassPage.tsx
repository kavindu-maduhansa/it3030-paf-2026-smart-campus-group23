import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

function formatDate(dateRaw: string) {
  const date = new Date(`${dateRaw}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateRaw || '-'
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function BookingPassPage() {
  const [params] = useSearchParams()

  const details = useMemo(
    () => ({
      name: params.get('name') || '-',
      bookingId: params.get('bookingId') || '-',
      date: formatDate(params.get('date') || ''),
      start: params.get('start') || '--:--',
      end: params.get('end') || '--:--',
      capacity: params.get('capacity') || '-',
      status: params.get('status') || 'Confirmed',
    }),
    [params]
  )

  const qrUrl = useMemo(() => {
    const payload = new URLSearchParams({
      name: details.name,
      bookingId: details.bookingId,
      date: params.get('date') || '',
      start: details.start,
      end: details.end,
      capacity: details.capacity,
      status: details.status,
    }).toString()
    const passUrl = `${window.location.origin}/booking-pass?${payload}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(passUrl)}`
  }, [details, params])

  return (
    <div className="flex min-h-[70vh] items-start justify-center px-4 pt-8 sm:pt-12">
      <div className="w-full max-w-xl rounded-3xl border border-[#1F2937] bg-[#07162B] p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-4xl font-bold tracking-wide text-emerald-300">BOOKING CONFIRMED</h1>
          <Link to="/" className="text-3xl font-semibold text-[#94A3B8] hover:text-white">
            Close
          </Link>
        </div>

        <div className="mt-6 space-y-2 text-4xl text-[#CBD5E1]">
          <p>Name: {details.name}</p>
          <p>Booking ID: {details.bookingId}</p>
          <p>Date: {details.date}</p>
          <p>
            Time: {details.start} - {details.end}
          </p>
          <p>Capacity: {details.capacity}</p>
          <p>Status: {details.status}</p>
        </div>

        <div className="mt-7 rounded-2xl bg-white p-4">
          <img src={qrUrl} alt={`Booking QR ${details.bookingId}`} className="mx-auto h-64 w-64" />
        </div>
      </div>
    </div>
  )
}
