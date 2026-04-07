import { Link } from 'react-router-dom'
import { HiOutlineBolt, HiOutlineMapPin } from 'react-icons/hi2'
import { KpiMini, Pill, SectionHeader, panelLg, tilePanel } from '../dashboardUi'

const queue = [
  { id: 'TK-1842', title: 'Projector flicker · Lecture Hall A', priority: 'high' as const, due: 'Today 16:00' },
  { id: 'TK-1839', title: 'HVAC noise · Building B L2', priority: 'medium' as const, due: 'Tomorrow' },
  { id: 'TK-1835', title: 'Lab PC 7 disk warning', priority: 'low' as const, due: 'Fri' },
]

const checklist = ['Van stock check', 'Badge reader B-12', 'Handover note for night shift']

export default function TechnicianPanels() {
  return (
    <section className="mt-12 space-y-10" aria-label="Technician desk">
      <div>
        <SectionHeader
          eyebrow="Field ops"
          title="Work queue & priorities"
          subtitle="Ticket data is illustrative — connect maintenance API for live SLAs and assignments."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiMini label="My open jobs" value="5" hint="2 due today" />
          <KpiMini
            label="First response SLA"
            value="94%"
            hint="Campus average"
            accent="from-emerald-500/40 to-transparent"
          />
          <KpiMini
            label="Parts on order"
            value="3"
            hint="Lamp kit, PSU, network NIC"
            accent="from-orange-500/40 to-transparent"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className={`${panelLg} lg:col-span-2`}>
          <div className="flex items-center justify-between gap-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <HiOutlineBolt className="h-5 w-5 text-orange-400" />
              Assigned tickets
            </h3>
            <Link to="/maintenance" className="text-sm font-semibold text-[#3B82F6] hover:text-[#93C5FD]">
              Full board
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {queue.map((t) => (
              <li
                key={t.id}
                className="rounded-xl border border-[#1F2937] bg-[#0F172A]/70 p-4 sm:flex sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-xs text-[#64748B]">{t.id}</p>
                  <p className="mt-1 font-medium text-white">{t.title}</p>
                  <p className="mt-2 flex items-center gap-1 text-sm text-[#94A3B8]">
                    <HiOutlineMapPin className="h-4 w-4" />
                    Smart Campus
                  </p>
                </div>
                <div className="mt-3 flex shrink-0 flex-col items-start gap-2 sm:mt-0 sm:items-end">
                  <Pill
                    variant={
                      t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'default'
                    }
                  >
                    {t.priority.toUpperCase()}
                  </Pill>
                  <span className="text-xs text-[#64748B]">Due {t.due}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className={tilePanel}>
            <h3 className="text-sm font-semibold text-white">Shift checklist</h3>
            <ul className="mt-3 space-y-2">
              {checklist.map((item, i) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-lg border border-[#1F2937] bg-[#0F172A] px-3 py-2"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#334155] text-xs text-[#64748B]">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#CBD5E1]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`${tilePanel} border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent`}
          >
            <p className="text-sm text-[#94A3B8]">
              <strong className="text-emerald-300">Safety:</strong> Lock out lab breakers before opening ceiling
              tiles. Photos in ticket help close-outs faster.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
