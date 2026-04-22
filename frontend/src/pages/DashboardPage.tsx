import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../services/useAuth'
import { DashboardDecor, featureCard, iconBase, tilePanel } from './dashboard/dashboardUi'
import AdminPanels from './dashboard/panels/AdminPanels'
import LecturerPanels from './dashboard/panels/LecturerPanels'
import StudentPanels from './dashboard/panels/StudentPanels'
import TechnicianPanels from './dashboard/panels/TechnicianPanels'
import { ROLE_DASHBOARD, normalizeCampusRole } from './dashboard/roleDashboardConfig'

function firstName(fullName: string | undefined): string {
  if (!fullName?.trim()) return 'there'
  return fullName.trim().split(/\s+/)[0] ?? 'there'
}

export default function DashboardPage() {
  const { user } = useAuth()
  const campusRole = normalizeCampusRole(user?.role)
  const config = ROLE_DASHBOARD[campusRole]
  const welcomeName = firstName(user?.name)

  const accountFields = [
    { label: 'Account type', value: `${config.roleLabel} · Smart Campus` },
    { label: 'University email', value: user?.email?.trim() || '—' },
    { label: 'Member since', value: 'January 2026' },
  ] as const

  const navigate = useNavigate()

  useEffect(() => {
    if (campusRole === 'TECHNICIAN') {
      navigate('/technician/dashboard', { replace: true })
    }
  }, [campusRole, navigate])

  if (campusRole === 'TECHNICIAN') {
    return null // Prevent flash of content before redirect
  }

  return (
    <DashboardDecor>
      <section className="pt-2" aria-labelledby="welcome-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">
              Smart Campus · {config.roleLabel} dashboard
            </p>
            <h1
              id="welcome-heading"
              className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl"
            >
              Welcome back, <span className="text-[#3B82F6]">{welcomeName}</span>!
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#94A3B8] sm:text-base">{config.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Link
              to="/"
              className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:border-white/25 hover:text-white"
            >
              Home
            </Link>
            <Link
              to="/contact"
              className="rounded-lg border border-[#3B82F6]/50 bg-[#3B82F6]/15 px-4 py-2 text-sm font-medium text-[#93C5FD] transition-colors hover:bg-[#3B82F6]/25 hover:text-white"
            >
              Contact
            </Link>
          </div>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {config.statusStrip.map(({ label, value, highlight }) => (
            <li key={label} className={tilePanel}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
              <p
                className={`mt-2 text-lg font-semibold sm:text-xl ${
                  highlight ? 'text-[#3B82F6]' : 'text-white'
                }`}
              >
                {value}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="quick-cards-heading">
        <h2 id="quick-cards-heading" className="sr-only">
          Quick navigation
        </h2>
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {config.quickCards.map(({ to, title, description, Icon, iconClass }) => (
            <li key={title}>
              <Link to={to} className={featureCard}>
                <span className={`${iconBase} ${iconClass}`} aria-hidden>
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#94A3B8]">{description}</p>
                <span className="mt-4 text-sm font-semibold text-[#3B82F6] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {campusRole === 'STUDENT' && <StudentPanels user={user ?? null} />}
      {campusRole === 'ADMIN' && <AdminPanels />}
      {campusRole === 'LECTURER' && <LecturerPanels />}
      {campusRole === 'TECHNICIAN' && <TechnicianPanels />}

      <section className="mt-14" aria-labelledby="account-info-heading">
        <h2
          id="account-info-heading"
          className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
        >
          Account information
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">{config.accountHint}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {accountFields.map(({ label, value }) => (
            <li
              key={label}
              className={`${tilePanel} py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#334155] hover:shadow-[0_0_24px_rgba(59,130,246,0.08)]`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
              <p className="mt-2 break-words text-base font-medium text-white">{value}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-center text-xs text-[#64748B]">{config.footerNote}</p>
    </DashboardDecor>
  )
}
