import { Link } from 'react-router-dom'
import { HiOutlineExclamationTriangle, HiOutlineShieldExclamation } from 'react-icons/hi2'
import { KpiMini, Pill, SectionHeader, panelLg, tilePanel } from '../dashboardUi'

const attention = [
  { title: '12 bookings awaiting approval', detail: 'Mostly lecture halls · Fri peak', severity: 'warning' as const },
  { title: '3 maintenance tickets breaching SLA', detail: 'AV in Lab 2, AC Building A', severity: 'danger' as const },
  { title: 'Role audit due', detail: 'Review ADMIN escalations from last month', severity: 'info' as const },
]

const recent = [
  { who: 'Dr. Silva', action: 'Promoted to LECTURER', when: '2h ago' },
  { who: 'System', action: 'Resource “Projector Pro X1” marked maintenance', when: '5h ago' },
  { who: 'Admin', action: 'Policy: booking lead time 24h', when: 'Yesterday' },
]

export default function AdminPanels() {
  return (
    <section className="mt-12 space-y-10" aria-label="Admin operations">
      <div>
        <SectionHeader
          eyebrow="Operations"
          title="Campus control centre"
          subtitle="Overview metrics are illustrative — wire to `/api/admin` and analytics when ready."
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiMini label="Registered users" value="248" hint="+6 this week" />
          <KpiMini
            label="Pending bookings"
            value="12"
            hint="Oldest 4 days"
            accent="from-amber-500/40 to-transparent"
          />
          <KpiMini
            label="Open tickets"
            value="19"
            hint="5 unassigned"
            accent="from-violet-500/40 to-transparent"
          />
          <KpiMini
            label="Resources active"
            value="42"
            hint="2 in maintenance"
            accent="from-emerald-500/40 to-transparent"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={panelLg}>
          <div className="flex items-center gap-2">
            <HiOutlineShieldExclamation className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-white">Needs attention</h3>
          </div>
          <ul className="mt-4 space-y-3">
            {attention.map((item) => (
              <li
                key={item.title}
                className="flex gap-3 rounded-xl border border-[#1F2937] bg-[#0F172A]/80 p-4"
              >
                <HiOutlineExclamationTriangle
                  className={
                    item.severity === 'danger'
                      ? 'mt-0.5 h-5 w-5 shrink-0 text-red-400'
                      : item.severity === 'warning'
                        ? 'mt-0.5 h-5 w-5 shrink-0 text-amber-400'
                        : 'mt-0.5 h-5 w-5 shrink-0 text-blue-400'
                  }
                />
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              to="/analytics"
              className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
            >
              View analytics
            </Link>
            <Link
              to="/bookings"
              className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
            >
              Review bookings
            </Link>
            <Link
              to="/maintenance"
              className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
            >
              Open maintenance
            </Link>
          </div>
        </div>

        <div className={panelLg}>
          <h3 className="text-lg font-semibold text-white">Recent admin activity</h3>
          <ul className="mt-4 space-y-3">
            {recent.map((row) => (
              <li
                key={row.action + row.when}
                className="flex items-start justify-between gap-4 border-b border-[#1F2937] pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm text-white">
                    <span className="font-semibold text-[#93C5FD]">{row.who}</span>{' '}
                    <span className="text-[#94A3B8]">{row.action}</span>
                  </p>
                </div>
                <Pill variant="default">{row.when}</Pill>
              </li>
            ))}
          </ul>
          <Link
            to="/admin/users"
            className="mt-6 inline-flex text-sm font-semibold text-[#3B82F6] hover:text-[#93C5FD]"
          >
            Manage all users →
          </Link>
        </div>
      </div>

      <div className={tilePanel}>
        <p className="text-sm text-[#94A3B8]">
          <strong className="text-white">Security tip:</strong> Rotate shared service accounts quarterly and
          restrict ADMIN role to break-glass accounts when SSO is enabled.
        </p>
      </div>
    </section>
  )
}
