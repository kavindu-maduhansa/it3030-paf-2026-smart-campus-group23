import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineWrenchScrewdriver } from 'react-icons/hi2'
import { Pill, SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'

const tickets = [
  {
    id: 'TK-1842',
    title: 'Projector intermittent · Lecture Hall A',
    loc: 'Building A',
    priority: 'high' as const,
    assignee: 'Mike Tech',
    updated: '2h ago',
  },
  {
    id: 'TK-1839',
    title: 'HVAC noise reported',
    loc: 'Building B · L2',
    priority: 'medium' as const,
    assignee: 'Unassigned',
    updated: '5h ago',
  },
  {
    id: 'TK-1821',
    title: 'Network drop · Lab 5',
    loc: 'Building C',
    priority: 'low' as const,
    assignee: 'Mike Tech',
    updated: '1d ago',
  },
]

export default function MaintenancePage() {
  const [filter, setFilter] = useState<'all' | 'high' | 'mine'>('all')
  const list =
    filter === 'high'
      ? tickets.filter((t) => t.priority === 'high')
      : filter === 'mine'
        ? tickets.filter((t) => t.assignee === 'Mike Tech')
        : tickets

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Operations"
          title="Maintenance & tickets"
          subtitle="Prioritised work across campus. Hook this view to your tickets API and WebSocket stream."
          action={
            <div className="flex gap-2">
              <Link
                to="/dashboard"
                className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
              >
                Dashboard
              </Link>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white opacity-70"
              >
                <HiOutlineWrenchScrewdriver className="h-4 w-4" />
                New ticket
              </button>
            </div>
          }
        />

        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ['all', 'All open'],
              ['high', 'High priority'],
              ['mine', 'My queue'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === key
                  ? 'bg-[#3B82F6] text-white'
                  : 'border border-[#334155] text-[#94A3B8] hover:border-[#3B82F6]/40 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Open</p>
            <p className="mt-2 text-2xl font-bold text-white">{tickets.length}</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">SLA risk</p>
            <p className="mt-2 text-2xl font-bold text-red-400">1</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Avg. resolve (demo)</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">1.2d</p>
          </div>
        </div>

        <ul className="mt-8 space-y-4">
          {list.map((t) => {
            const borderAccent =
              t.priority === 'high'
                ? 'border-l-red-500'
                : t.priority === 'medium'
                  ? 'border-l-amber-500'
                  : 'border-l-slate-600'
            return (
            <li key={t.id} className={`${panelLg} border-l-4 ${borderAccent}`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-[#64748B]">{t.id}</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">{t.title}</h3>
                  <p className="mt-2 text-sm text-[#94A3B8]">{t.loc}</p>
                  <p className="mt-1 text-xs text-[#64748B]">
                    Assignee: <span className="text-[#CBD5E1]">{t.assignee}</span> · Updated {t.updated}
                  </p>
                </div>
                <Pill
                  variant={
                    t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'default'
                  }
                >
                  {t.priority.toUpperCase()}
                </Pill>
              </div>
            </li>
            )
          })}
        </ul>

        {list.length === 0 ? (
          <p className="mt-8 text-center text-sm text-[#64748B]">No tickets match this filter.</p>
        ) : null}
      </div>
    </div>
  )
}
