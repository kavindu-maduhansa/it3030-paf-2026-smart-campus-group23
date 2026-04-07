import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineCalendarDays, HiOutlineFunnel } from 'react-icons/hi2'
import { Pill, SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'

const upcoming = [
  {
    id: 'BK-2401',
    title: 'Computer Lab 1 · Group project',
    when: 'Thu 10 Apr 2026 · 14:00–16:00',
    place: 'Building B',
    status: 'confirmed' as const,
  },
  {
    id: 'BK-2398',
    title: 'Meeting Room 101',
    when: 'Mon 14 Apr 2026 · 09:00–10:00',
    place: 'Building A',
    status: 'pending' as const,
  },
]

const past = [
  {
    id: 'BK-2204',
    title: 'Study pod · Building C',
    when: 'Mon 24 Mar 2026',
    place: 'Building C',
    status: 'completed' as const,
  },
]

export default function BookingsPage() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const rows = tab === 'upcoming' ? upcoming : past

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Reservations"
          title="Bookings"
          subtitle="Track space and equipment you’ve reserved. Live list will come from the bookings API."
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
                className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                <HiOutlineCalendarDays className="h-4 w-4" />
                Browse facilities
              </Link>
            </div>
          }
        />

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
            className="inline-flex items-center gap-2 rounded-lg border border-[#334155] px-4 py-2 text-sm font-medium text-[#94A3B8] hover:border-[#3B82F6]/40 hover:text-white"
            disabled
          >
            <HiOutlineFunnel className="h-4 w-4" />
            Filters (soon)
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Active holds</p>
            <p className="mt-2 text-2xl font-bold text-white">{upcoming.length}</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Awaiting approval</p>
            <p className="mt-2 text-2xl font-bold text-amber-400">
              {upcoming.filter((u) => u.status === 'pending').length}
            </p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Completed (demo)</p>
            <p className="mt-2 text-2xl font-bold text-[#64748B]">{past.length}</p>
          </div>
        </div>

        <ul className="mt-8 space-y-4">
          {rows.map((row) => (
            <li key={row.id} className={panelLg}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-[#64748B]">{row.id}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{row.title}</h3>
                  <p className="mt-2 text-sm text-[#94A3B8]">{row.when}</p>
                  <p className="mt-1 text-sm text-[#64748B]">{row.place}</p>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Pill
                    variant={
                      row.status === 'confirmed'
                        ? 'success'
                        : row.status === 'pending'
                          ? 'warning'
                          : 'default'
                    }
                  >
                    {row.status === 'confirmed'
                      ? 'Confirmed'
                      : row.status === 'pending'
                        ? 'Pending'
                        : 'Completed'}
                  </Pill>
                  <button
                    type="button"
                    className="text-xs font-semibold text-[#3B82F6] hover:underline disabled:opacity-40"
                    disabled
                  >
                    Modify / cancel
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {rows.length === 0 ? (
          <div className={`${panelLg} mt-8 text-center`}>
            <p className="text-[#94A3B8]">No bookings in this view.</p>
            <Link to="/resources" className="mt-4 inline-block text-sm font-semibold text-[#3B82F6]">
              Find a space →
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
