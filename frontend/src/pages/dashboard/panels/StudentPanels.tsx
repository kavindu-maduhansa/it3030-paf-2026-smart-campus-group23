import { Link } from 'react-router-dom'
import { HiOutlineArrowTopRightOnSquare, HiOutlineLightBulb, HiOutlineSparkles } from 'react-icons/hi2'
import type { User } from '../../../services/authService'
import { KpiMini, Pill, SectionHeader, panelLg, tilePanel } from '../dashboardUi'

const upcoming = [
  { title: 'Computer Lab 1 · Project workshop', when: 'Thu 10 Apr · 14:00–16:00', status: 'confirmed' as const },
  { title: 'Study pod · Building B', when: 'Sat 12 Apr · 10:00–12:00', status: 'pending' as const },
  { title: 'Meeting Room 101 · Group sync', when: 'Mon 14 Apr · 09:00–10:00', status: 'confirmed' as const },
]

export default function StudentPanels({ user }: { user: User | null }) {
  const first = user?.name?.trim().split(/\s+/)[0] ?? 'there'

  return (
    <section className="mt-12 space-y-10" aria-label="Student workspace">
      <div>
        <SectionHeader
          eyebrow="At a glance"
          title="Your campus week"
          subtitle="Snapshot of reservations and shortcuts — live data will replace demos when bookings API is connected."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiMini label="Active bookings" value="2" hint="Including 1 awaiting approval" />
          <KpiMini
            label="Facilities favourited"
            value="4"
            hint="Labs & halls you browsed recently"
            accent="from-emerald-500/40 to-transparent"
          />
          <KpiMini
            label="Campus notices"
            value="1 new"
            hint="Library hours update"
            accent="from-amber-500/40 to-transparent"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${panelLg} lg:col-span-2`}>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-white">Upcoming reservations</h3>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#3B82F6] hover:text-[#93C5FD]"
            >
              View all
              <HiOutlineArrowTopRightOnSquare className="h-4 w-4" />
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-[#1F2937]">
            {upcoming.map((row) => (
              <li key={row.title} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{row.title}</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">{row.when}</p>
                </div>
                <Pill variant={row.status === 'confirmed' ? 'success' : 'warning'}>
                  {row.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </Pill>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div
            className={`${tilePanel} border-blue-500/20 bg-gradient-to-b from-[#3B82F6]/10 to-transparent py-6`}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]/20 text-[#3B82F6]">
                <HiOutlineLightBulb className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Tip for {first}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
                  Peak hours fill fast on Tuesdays. Book labs before noon or try Building C pods for quieter slots.
                </p>
              </div>
            </div>
          </div>
          <div className={tilePanel}>
            <div className="flex items-center gap-2 text-[#3B82F6]">
              <HiOutlineSparkles className="h-5 w-5" />
              <span className="text-sm font-semibold text-white">Explore</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Labs', 'Projectors', 'Quiet zones', 'Sports hall'].map((chip) => (
                <Link
                  key={chip}
                  to="/resources"
                  className="rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-1.5 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-[#3B82F6]/50 hover:text-white"
                >
                  {chip}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
