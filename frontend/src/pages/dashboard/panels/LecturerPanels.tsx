import { Link } from 'react-router-dom'
import { HiOutlineClock, HiOutlineMapPin } from 'react-icons/hi2'
import { Pill, SectionHeader, panelLg, tilePanel } from '../dashboardUi'

const todaySessions = [
  { module: 'IT3030 · Smart Campus', room: 'Lecture Hall A', time: '09:00 – 10:30', students: 48 },
  { module: 'IT3020 · Databases', room: 'Lab 3', time: '13:00 – 15:00', students: 32 },
]

const modules = [
  { code: 'IT3030', name: 'Smart Campus Project', bookings: 3 },
  { code: 'IT3020', name: 'Database Systems', bookings: 2 },
  { code: 'IT4010', name: 'Industry Seminar', bookings: 1 },
]

export default function LecturerPanels() {
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
              <Link
                to="/bookings"
                className="mt-4 block w-full rounded-lg bg-[#3B82F6] py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-500"
              >
                New booking
              </Link>
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
    </section>
  )
}
