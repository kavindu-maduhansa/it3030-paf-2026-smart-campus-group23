import { Link } from 'react-router-dom'
import { hubFeatures, hubHeroHighlights, hubStats } from '../content/hubContent'
import { useAuth } from '../services/useAuth'

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const isTechnician = user?.role === 'TECHNICIAN'
  const visibleHubFeatures = isTechnician
    ? hubFeatures.filter((feature) => feature.title !== 'Smart booking')
    : hubFeatures
  const featureGridClass =
    visibleHubFeatures.length <= 3
      ? 'mt-14 mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8'
      : 'mt-14 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-8'

  return (
    <div className="bg-[#020617]">
      <section
        className="relative overflow-hidden bg-gradient-to-b from-[#020617] via-[#050816] to-[#0a0f1c] px-4 pb-20 pt-12 sm:px-6 sm:pb-28 sm:pt-16 lg:px-8 lg:pb-32 lg:pt-20"
        aria-labelledby="hero-heading"
      >
        <div
          className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-[#3B82F6]/20 blur-[120px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-1/3 h-72 w-96 -translate-x-1/2 rounded-full bg-[#3B82F6]/10 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-500/15 blur-[110px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#3B82F6]/45 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[min(78vh,52rem)] max-w-4xl flex-col items-center justify-center text-center">
          <h1
            id="hero-heading"
            className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-[3.5rem]"
          >
            <span className="text-[#3B82F6]">Smart Campus</span>
            <br />
            <span className="text-white">Operations Hub</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-[#94A3B8] sm:text-lg md:text-xl">
            Book facilities, report issues, and track maintenance requests all in one unified platform—
            built for staff and students who need clarity, not clutter.
          </p>
          <Link
            to="/about"
            className="mt-6 text-sm font-semibold text-[#3B82F6] transition-colors hover:text-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
          >
            About Smart Campus →
          </Link>

          <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/resources'}
              className="inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-[#3B82F6] px-8 text-base font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_0_36px_rgba(59,130,246,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
            >
              Get started
            </Link>
            <a
              href="#features"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-8 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
            >
              Learn more
            </a>
          </div>

          <ul
            className="mt-16 flex w-full max-w-2xl flex-col gap-10 sm:mt-20 sm:flex-row sm:items-start sm:justify-center sm:gap-0 sm:divide-x sm:divide-white/10"
            aria-label="Key highlights"
          >
            {hubHeroHighlights.map(({ value, label }, i) => (
              <li
                key={label}
                className="flex flex-col items-center px-6 text-center sm:min-w-[8.5rem]"
              >
                <span className="text-3xl font-bold tracking-tight text-[#3B82F6] sm:text-4xl">
                  {value}
                </span>
                <span className="mt-1.5 text-sm font-medium text-[#94A3B8]">{label}</span>
                {i < hubHeroHighlights.length - 1 && (
                  <span
                    className="mt-6 block h-px w-12 bg-white/10 sm:hidden"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="features"
        className="relative scroll-mt-20 overflow-hidden border-t border-[#1F2937] bg-[#020617] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        aria-labelledby="features-heading"
      >
        <div
          className="pointer-events-none absolute right-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#3B82F6]/8 blur-[90px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl">
          <h2
            id="features-heading"
            className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
          >
            Powerful features
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-base text-[#94A3B8] sm:text-lg">
            Everything you need to run campus operations in one place—discover, book, fix, and stay
            informed without switching tools.
          </p>

          <ul className={featureGridClass}>
            {visibleHubFeatures.map(({ to, title, description, Icon, circleClass }) => (
              <li key={title}>
                <Link
                  to={to}
                  className="group flex h-full flex-col rounded-2xl border border-[#1F2937] bg-[#111827] p-6 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/35 hover:bg-[#151f2e] hover:shadow-[0_0_32px_rgba(59,130,246,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
                >
                  <span
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${circleClass} transition-transform duration-300 group-hover:scale-105`}
                  >
                    <Icon className="h-7 w-7" aria-hidden />
                  </span>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#94A3B8]">
                    {description}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-[#3B82F6] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                    Open module →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="relative overflow-hidden border-t border-[#1F2937] bg-[#050816] px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
        aria-labelledby="stats-heading"
      >
        <div
          className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-[#3B82F6]/10 blur-[80px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl">
          <h2
            id="stats-heading"
            className="text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Platform statistics
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[#94A3B8]">
            Snapshot metrics your team can rally around—clear numbers, zero noise.
          </p>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {hubStats.map(({ value, label, color }) => (
              <li
                key={label}
                className="rounded-2xl border border-[#1F2937] bg-[#111827] p-8 text-center shadow-lg shadow-black/25 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#334155] hover:shadow-[0_0_24px_rgba(59,130,246,0.08)]"
              >
                <p className={`text-4xl font-bold tracking-tight sm:text-5xl ${color}`}>
                  {value}
                </p>
                <p className="mt-2 text-sm font-medium text-[#94A3B8]">{label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="relative overflow-hidden border-t border-[#1F2937] bg-[#020617] px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
        aria-labelledby="cta-heading"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-48 w-[min(100%,36rem)] -translate-x-1/2 rounded-full bg-[#3B82F6]/12 blur-[80px]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <h2
            id="cta-heading"
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {isAuthenticated ? 'Welcome back to Smart Campus' : 'Ready to streamline your campus?'}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[#94A3B8]">
            {isAuthenticated
              ? 'Go to your dashboard and continue managing bookings, facilities, and support tasks.'
              : 'Join hundreds of staff and students already using Smart Campus for their daily operations'}
          </p>
          {isAuthenticated ? (
            <Link
              to="/support"
              className="mt-10 inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-[#3B82F6] px-8 text-base font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-[0_0_36px_rgba(59,130,246,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              Get Support
            </Link>
          ) : (
            <Link
              to="/sign-in"
              className="mt-10 inline-flex min-h-[3rem] items-center justify-center rounded-xl bg-[#3B82F6] px-8 text-base font-semibold text-white shadow-[0_0_28px_rgba(59,130,246,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-[0_0_36px_rgba(59,130,246,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              Sign up with Google
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
