import { Link } from 'react-router-dom'
import { useAuth } from '../services/useAuth'

export default function SupportPage() {
  const { user, isAuthenticated } = useAuth()
  const role = user?.role ?? 'GUEST'
  const isTechnician = role === 'TECHNICIAN'

  const roleGuidance: Record<string, { title: string; details: string[]; ctaLabel: string; ctaPath: string }> = {
    STUDENT: {
      title: 'Student Support Guide',
      details: [
        'Check your booking date, time, and status first when a reservation looks incorrect.',
        'For facility access issues, include your student ID and booking reference when contacting support.',
        'Use your dashboard to quickly view upcoming bookings before submitting a support request.',
      ],
      ctaLabel: 'Open My Bookings',
      ctaPath: '/bookings',
    },
    LECTURER: {
      title: 'Lecturer Support Guide',
      details: [
        'Review room availability and booking confirmations before class sessions.',
        'When requesting support, include course name, session time, and required facilities.',
        'Use clear booking purpose notes so approvals and support follow-up are faster.',
      ],
      ctaLabel: 'Go to Facilities',
      ctaPath: '/resources',
    },
    TECHNICIAN: {
      title: 'Technician Support Guide',
      details: [
        'Use support updates to help users with resource availability and service interruptions.',
        'Keep issue responses clear by sharing status updates and expected recovery times.',
        'Coordinate with admins when repeated support requests indicate a larger facility problem.',
      ],
      ctaLabel: 'View Dashboard',
      ctaPath: '/dashboard',
    },
    ADMIN: {
      title: 'Admin Support Guide',
      details: [
        'Monitor facility usage patterns and address high-impact support requests first.',
        'Standardize response templates for booking issues, access issues, and account concerns.',
        'Track recurring complaints and improve resource rules to reduce repeat support volume.',
      ],
      ctaLabel: 'Manage Facilities',
      ctaPath: '/resources',
    },
    GUEST: {
      title: 'Guest Support Guide',
      details: [
        'Sign in to access role-based support for bookings, facilities, and account actions.',
        'You can still send general questions through the contact page.',
        'For faster help, include your name, email, and a short issue summary.',
      ],
      ctaLabel: 'Sign In',
      ctaPath: '/login',
    },
  }

  const activeGuidance = roleGuidance[role] ?? roleGuidance.GUEST

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[#1F2937] bg-[#0B1224] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#60A5FA]">Help Center</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Support</h1>
        <p className="mt-3 text-sm text-[#94A3B8]">
          Quickly find the right place to report issues or ask questions.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
          <h2 className="text-base font-semibold text-white">General Help</h2>
          <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
            Need account help or booking guidance? Reach us through the contact page.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-flex rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Contact Us
          </Link>
        </section>

        {!isTechnician ? (
          <section className="rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
            <h2 className="text-base font-semibold text-white">Booking and Access Help</h2>
            <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
              Get help with booking status, role permissions, facility visibility, and access questions.
            </p>
            <Link
              to="/bookings"
              className="mt-4 inline-flex rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-[#CBD5E1] hover:border-[#3B82F6]/50"
            >
              Open Bookings
            </Link>
          </section>
        ) : null}
      </div>

      <section className="mt-6 rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white">{activeGuidance.title}</h2>
          <span className="rounded-full bg-[#1E293B] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#93C5FD]">
            {isAuthenticated ? role : 'Guest'}
          </span>
        </div>

        <ul className="mt-3 space-y-2 text-sm leading-7 text-[#CBD5E1]">
          {activeGuidance.details.map((detail) => (
            <li key={detail} className="rounded-lg border border-[#1E293B] bg-[#0B1224] px-3 py-2">
              {detail}
            </li>
          ))}
        </ul>

        <Link
          to={activeGuidance.ctaPath}
          className="mt-4 inline-flex rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-[#CBD5E1] hover:border-[#3B82F6]/50"
        >
          {activeGuidance.ctaLabel}
        </Link>
      </section>

      <div className="mt-6 rounded-xl border border-[#1F2937] bg-[#0F172A] p-5">
        <h2 className="text-base font-semibold text-white">Response Times</h2>
        <p className="mt-2 text-sm leading-7 text-[#CBD5E1]">
          General inquiries are typically reviewed within one business day. Booking and access questions are prioritized
          around active class hours.
        </p>
      </div>
    </div>
  )
}
