import { Link } from 'react-router-dom'
import { HiOutlineMapPin } from 'react-icons/hi2'
import { Pill, SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'

const weekDays = ['Mon 7', 'Tue 8', 'Wed 9', 'Thu 10', 'Fri 11'] as const

const blocks: Record<string, { time: string; label: string; room: string }[]> = {
  'Mon 7': [
    { time: '09:00', label: 'IT3030 · Lecture', room: 'Hall A' },
    { time: '14:00', label: 'Office hours', room: 'Online' },
  ],
  'Tue 8': [{ time: '10:00', label: 'IT3020 · Lab', room: 'Lab 3' }],
  'Wed 9': [],
  'Thu 10': [
    { time: '09:00', label: 'Project demos', room: 'Lab 1' },
    { time: '13:00', label: 'Faculty sync', room: 'Room 204' },
  ],
  'Fri 11': [{ time: '11:00', label: 'Seminar prep', room: 'Meeting 101' }],
}

export default function SchedulePage() {
  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Timetable"
          title="Teaching schedule"
          subtitle="Week overview for lecturers. Integrate faculty timetabling or ICS import when available."
          action={
            <div className="flex gap-2">
              <Link
                to="/dashboard"
                className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
              >
                Dashboard
              </Link>
              <Link
                to="/bookings"
                className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                New booking
              </Link>
            </div>
          }
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Sessions this week</p>
            <p className="mt-2 text-2xl font-bold text-white">7</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Campus hours on-site</p>
            <p className="mt-2 text-2xl font-bold text-[#3B82F6]">18h</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Rooms used</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">4</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-5">
          {weekDays.map((day) => (
            <div key={day} className={panelLg}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-white">{day}</h3>
                {blocks[day].length === 0 ? <Pill variant="default">Free</Pill> : null}
              </div>
              <ul className="mt-4 space-y-3">
                {blocks[day].map((b) => (
                  <li
                    key={b.time + b.label}
                    className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-3 text-sm"
                  >
                    <p className="font-mono text-xs text-[#3B82F6]">{b.time}</p>
                    <p className="mt-1 font-medium text-white">{b.label}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-[#94A3B8]">
                      <HiOutlineMapPin className="h-3.5 w-3.5" />
                      {b.room}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
