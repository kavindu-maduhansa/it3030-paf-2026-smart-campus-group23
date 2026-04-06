import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/resources', label: 'Facilities', hint: 'Catalogue & availability' },
  { to: '/bookings', label: 'Bookings', hint: 'Requests & approvals' },
  { to: '/maintenance', label: 'Maintenance', hint: 'Tickets & updates' },
] as const

const snapshot = [
  { value: '150+', label: 'Facilities', accent: 'text-[#3B82F6]' },
  { value: '2.4k', label: 'Bookings / mo', accent: 'text-[#10B981]' },
  { value: '95%', label: 'Resolved', accent: 'text-[#F59E0B]' },
  { value: '24h', label: 'Avg. response', accent: 'text-[#EF4444]' },
] as const

export default function DashboardPage() {
  return (
    <div>
      <header className="mb-10 border-b border-[#1F2937] pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">Overview</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-[#94A3B8]">
          Your operations snapshot—jump into modules or review high-level activity at a glance.
        </p>
      </header>

      <ul className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {snapshot.map(({ value, label, accent }) => (
          <li
            key={label}
            className="rounded-2xl border border-[#1F2937] bg-[#111827] px-5 py-5 shadow-lg shadow-black/25"
          >
            <p className={`text-2xl font-bold tracking-tight sm:text-3xl ${accent}`}>{value}</p>
            <p className="mt-1 text-sm font-medium text-[#94A3B8]">{label}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="quick-links-heading">
        <h2 id="quick-links-heading" className="text-lg font-semibold text-white">
          Quick access
        </h2>
        <p className="mt-1 text-sm text-[#94A3B8]">Open a module without using the top navigation.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {quickLinks.map(({ to, label, hint }) => (
            <li key={to}>
              <Link
                to={to}
                className="block rounded-2xl border border-[#1F2937] bg-[#111827] p-5 transition-all hover:border-[#3B82F6]/40 hover:shadow-[0_0_24px_rgba(59,130,246,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
              >
                <span className="font-semibold text-white">{label}</span>
                <span className="mt-1 block text-sm text-[#94A3B8]">{hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
