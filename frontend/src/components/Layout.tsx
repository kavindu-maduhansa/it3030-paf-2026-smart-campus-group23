import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { HiMenuAlt3, HiX } from 'react-icons/hi'
import { useAuth } from '../services/useAuth'
import { logout } from '../services/authService'
import NotificationBadge from './NotificationBadge'

type LayoutProps = {
  children: ReactNode
}

const navLinkBase =
  'rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]'

function navLinkClass(isActive: boolean) {
  return isActive
    ? `${navLinkBase} bg-[#1F2937] font-semibold text-white`
    : `${navLinkBase} text-[#9CA3AF] hover:bg-white/5 hover:text-white`
}

export default function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()

  const closeMobile = () => setMobileOpen(false)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] font-sans antialiased">
      <header className="sticky top-0 z-50 border-b border-[#1F2937] bg-[#020617]/95 shadow-lg shadow-black/40 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            onClick={closeMobile}
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6] text-sm font-bold tracking-tight text-white shadow-[0_0_22px_rgba(59,130,246,0.55)]"
              aria-hidden
            >
              SC
            </span>
            <span className="text-lg font-bold tracking-tight text-[#3B82F6]">
              Smart Campus
            </span>
          </Link>

          <nav
            className="hidden items-center gap-0.5 md:flex"
            aria-label="Main navigation"
          >
            <NavLink to="/" end className={({ isActive }) => navLinkClass(isActive)}>
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => navLinkClass(isActive)}
            >
              About us
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => navLinkClass(isActive)}
            >
              Contact
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => navLinkClass(isActive)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/resources"
              className={({ isActive }) => navLinkClass(isActive)}
            >
              Facilities
            </NavLink>
            <NavLink
              to="/bookings"
              className={({ isActive }) => navLinkClass(isActive)}
            >
              Bookings
            </NavLink>

          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated && user ? (
              <>
                <NotificationBadge />
                <span className="text-sm text-[#94A3B8]">
                  Welcome, <span className="font-medium text-white">{user.name}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg bg-[#EF4444] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_26px_rgba(239,68,68,0.35)] transition-all duration-200 hover:bg-[#DC2626] hover:shadow-[0_0_32px_rgba(239,68,68,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F87171]"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_26px_rgba(59,130,246,0.45)] transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_32px_rgba(59,130,246,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
              >
                Sign in
              </Link>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <HiX className="h-7 w-7" /> : <HiMenuAlt3 className="h-7 w-7" />}
          </button>
        </div>

        <div
          id="mobile-menu"
          className={`border-t border-[#1F2937] bg-[#020617] md:hidden ${mobileOpen ? 'block' : 'hidden'}`}
        >
          <nav
            className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6"
            aria-label="Mobile navigation"
          >
            <NavLink
              to="/"
              end
              onClick={closeMobile}
              className={({ isActive }) => `${navLinkClass(isActive)} px-4 py-3`}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              onClick={closeMobile}
              className={({ isActive }) => `${navLinkClass(isActive)} px-4 py-3`}
            >
              About us
            </NavLink>
            <NavLink
              to="/contact"
              onClick={closeMobile}
              className={({ isActive }) => `${navLinkClass(isActive)} px-4 py-3`}
            >
              Contact
            </NavLink>
            <NavLink
              to="/dashboard"
              onClick={closeMobile}
              className={({ isActive }) => `${navLinkClass(isActive)} px-4 py-3`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/resources"
              onClick={closeMobile}
              className={({ isActive }) => `${navLinkClass(isActive)} px-4 py-3`}
            >
              Facilities
            </NavLink>
            <NavLink
              to="/bookings"
              onClick={closeMobile}
              className={({ isActive }) => `${navLinkClass(isActive)} px-4 py-3`}
            >
              Bookings
            </NavLink>

            {isAuthenticated && user ? (
              <div className="mt-4 border-t border-[#1F2937] pt-4">
                <div className="mb-3 px-4 text-sm text-[#94A3B8]">
                  Logged in as: <span className="font-medium text-white">{user.name}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg bg-[#EF4444] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_0_22px_rgba(239,68,68,0.3)] transition-colors hover:bg-[#DC2626]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={closeMobile}
                className="mt-2 rounded-lg bg-[#3B82F6] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_0_22px_rgba(59,130,246,0.4)] transition-colors hover:bg-blue-500"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#1F2937] bg-[#020617]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3B82F6] text-xs font-bold text-white shadow-[0_0_18px_rgba(59,130,246,0.45)]"
              aria-hidden
            >
              SC
            </span>
            <p className="text-sm text-[#94A3B8]">
              © 2026 Smart Campus Operations Hub
            </p>
          </div>
          <nav
            className="flex flex-wrap items-center gap-x-6 gap-y-2"
            aria-label="Footer"
          >
            <a
              href="#privacy"
              className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
            >
              Privacy
            </a>
            <a
              href="#terms"
              className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
            >
              Terms
            </a>
            <a
              href="#support"
              className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
            >
              Support
            </a>
            <Link
              to="/about"
              className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
            >
              About us
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
            >
              Contact
            </Link>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#94A3B8] transition-colors hover:text-white"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
