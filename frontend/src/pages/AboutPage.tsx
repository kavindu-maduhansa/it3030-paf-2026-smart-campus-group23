import { Link } from 'react-router-dom'
import {
  HiOutlineAcademicCap,
  HiOutlineBuildingLibrary,
  HiOutlineUserGroup,
} from 'react-icons/hi2'

const pillars = [
  {
    title: 'Who we serve',
    body: 'Faculty, administrative staff, technicians, and students who rely on shared spaces, labs, and equipment every day. Smart Campus is built so everyone sees the same source of truth.',
    Icon: HiOutlineUserGroup,
  },
  {
    title: 'What we solve',
    body: 'Scattered spreadsheets, unclear room availability, slow maintenance follow-up, and missed updates. We bring bookings, facilities data, tickets, and notifications into one operations hub.',
    Icon: HiOutlineBuildingLibrary,
  },
  {
    title: 'Why it matters',
    body: 'Modern universities run on coordination. When operations are transparent, campuses spend less time chasing status and more time teaching, learning, and maintaining world-class facilities.',
    Icon: HiOutlineAcademicCap,
  },
] as const

export default function AboutPage() {
  return (
    <div className="bg-[#020617]">
      <section
        className="relative overflow-hidden border-b border-[#1F2937] bg-gradient-to-b from-[#020617] via-[#050816] to-[#0a0f1c] px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8"
        aria-labelledby="about-hero-heading"
      >
        <div
          className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-[#3B82F6]/18 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500/12 blur-[90px]"
          aria-hidden
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">About us</p>
          <h1
            id="about-hero-heading"
            className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            The story behind{' '}
            <span className="text-[#3B82F6]">Smart Campus</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#94A3B8]">
            Smart Campus Operations Hub is a university modernization initiative for managing facilities,
            bookings, maintenance, and campus-wide updates—aligned with the same vision as our public
            homepage: clarity over clutter.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-8 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/35 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
            >
              Back to home
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-[#3B82F6] px-8 text-base font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.45)] transition-all hover:bg-blue-500 hover:shadow-[0_0_36px_rgba(59,130,246,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </section>

      <section
        className="border-b border-[#1F2937] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="mission-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="mission-heading" className="text-2xl font-bold text-white sm:text-3xl">
            Mission
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#94A3B8]">
            To give every campus stakeholder a single, trustworthy place to discover resources, schedule
            space, report and track issues, and stay informed—without juggling disconnected tools.
          </p>
        </div>
      </section>

      <section
        className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="pillars-heading"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            id="pillars-heading"
            className="text-center text-2xl font-bold text-white sm:text-3xl"
          >
            Built for real campus life
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[#94A3B8]">
            The same modules you see on the home page—facilities, bookings, maintenance, and
            notifications—reflect how teams actually work together.
          </p>
          <ul className="mt-12 grid gap-6 lg:grid-cols-3">
            {pillars.map(({ title, body, Icon }) => (
              <li
                key={title}
                className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8 shadow-lg shadow-black/25"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-[#3B82F6] ring-1 ring-blue-500/25">
                  <Icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#94A3B8]">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="border-t border-[#1F2937] bg-[#050816] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="academic-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="academic-heading" className="text-2xl font-bold text-white sm:text-3xl">
            Academic context
          </h2>
          <p className="mt-4 text-[#94A3B8] leading-relaxed">
            Smart Campus is developed as part of{' '}
            <span className="font-medium text-white">IT3030 — Industry-Based Application Development</span>{' '}
            at the Faculty of Computing, SLIIT. It is a team project demonstrating full-stack design:
            REST APIs, a modern React client, persistence, and real-time updates where applicable.
          </p>
        </div>
      </section>

      <section
        className="border-t border-[#1F2937] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="about-cta-heading"
      >
        <div className="relative mx-auto max-w-2xl text-center">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-32 w-[min(100%,28rem)] -translate-x-1/2 rounded-full bg-[#3B82F6]/15 blur-[60px]"
            aria-hidden
          />
          <h2
            id="about-cta-heading"
            className="relative text-2xl font-bold text-white sm:text-3xl"
          >
            Explore the platform
          </h2>
          <p className="relative mt-4 text-[#94A3B8]">
            Start from the homepage highlights or jump straight into facilities and your personal
            dashboard.
          </p>
          <div className="relative mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-[#3B82F6] px-8 text-base font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.45)] transition-all hover:bg-blue-600"
            >
              View homepage
            </Link>
            <Link
              to="/resources"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-xl border border-white/20 px-8 text-base font-semibold text-white transition-colors hover:border-white/35 hover:bg-white/5"
            >
              Browse facilities
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
