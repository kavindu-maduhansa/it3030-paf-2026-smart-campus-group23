import { Link } from 'react-router-dom'
import {
  HiOutlineCalendar,
  HiOutlinePencilSquare,
  HiOutlineSquares2X2,
  HiOutlineUserCircle,
} from 'react-icons/hi2'

/** Replace with auth profile name when sign-in is connected. */
const WELCOME_NAME = 'Navodya'

const statusStrip = [
  { label: 'Campus role', value: 'Student', highlight: false },
  { label: 'Access valid through', value: 'April 2026', highlight: false },
  { label: 'Status', value: 'Active', highlight: true },
] as const

const quickCards = [
  {
    to: '/sign-in',
    title: 'My profile',
    description: 'View personal information and account details.',
    Icon: HiOutlineUserCircle,
    iconClass: 'bg-blue-500/15 text-[#3B82F6] ring-1 ring-blue-500/30',
  },
  {
    to: '/resources',
    title: 'Facilities',
    description: 'Browse lecture halls, labs, and equipment availability.',
    Icon: HiOutlineSquares2X2,
    iconClass: 'bg-emerald-500/15 text-[#10B981] ring-1 ring-emerald-500/30',
  },
  {
    to: '/bookings',
    title: 'My bookings',
    description: 'View and manage your space and resource reservations.',
    Icon: HiOutlineCalendar,
    iconClass: 'bg-amber-500/15 text-[#F59E0B] ring-1 ring-amber-500/30',
  },
  {
    to: '/sign-in',
    title: 'Settings',
    description: 'Edit profile, notifications, and security preferences.',
    Icon: HiOutlinePencilSquare,
    iconClass: 'bg-red-500/15 text-[#EF4444] ring-1 ring-red-500/30',
  },
] as const

const accountFields = [
  { label: 'Account type', value: 'Student · Smart Campus' },
  { label: 'University email', value: 'you@stu.sliit.lk' },
  { label: 'Member since', value: 'January 2026' },
] as const

/** Match homepage feature / stats tiles */
const tilePanel =
  'rounded-2xl border border-[#1F2937] bg-[#111827] px-5 py-4 shadow-lg shadow-black/25'

const featureCard =
  'group flex h-full flex-col rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/35 hover:bg-[#151f2e] hover:shadow-[0_0_32px_rgba(59,130,246,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]'

const iconBase =
  'mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105'

export default function DashboardPage() {
  return (
    <div className="relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8">
      <div
        className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-[#3B82F6]/18 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-blue-500/12 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-24 left-1/3 h-64 w-96 -translate-x-1/2 rounded-full bg-[#3B82F6]/10 blur-[90px]"
        aria-hidden
      />

      <div className="relative px-4 pb-4 sm:px-6 lg:px-8">
        <section className="pt-2" aria-labelledby="welcome-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">
                Smart Campus · Dashboard
              </p>
              <h1
                id="welcome-heading"
                className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Welcome back,{' '}
                <span className="text-[#3B82F6]">{WELCOME_NAME}</span>!
              </h1>
              <p className="mt-2 max-w-xl text-sm text-[#94A3B8] sm:text-base">
                Manage bookings, facilities, and campus updates in one operations hub.
              </p>
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
            {statusStrip.map(({ label, value, highlight }) => (
              <li key={label} className={tilePanel}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  {label}
                </p>
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
            {quickCards.map(({ to, title, description, Icon, iconClass }) => (
              <li key={title}>
                <Link to={to} className={featureCard}>
                  <span className={`${iconBase} ${iconClass}`} aria-hidden>
                    <Icon className="h-7 w-7" />
                  </span>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#94A3B8]">
                    {description}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-[#3B82F6] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="account-info-heading">
          <h2
            id="account-info-heading"
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
          >
            Account information
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#94A3B8]">
            Summary details for your Smart Campus profile. Full editing will be available after sign-in.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {accountFields.map(({ label, value }) => (
              <li
                key={label}
                className={`${tilePanel} py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#334155] hover:shadow-[0_0_24px_rgba(59,130,246,0.08)]`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  {label}
                </p>
                <p className="mt-2 break-words text-base font-medium text-white">{value}</p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-center text-xs text-[#64748B]">
          IT3030 · Smart Campus Operations Hub — demo data shown until authentication is enabled.
        </p>
      </div>
    </div>
  )
}
