import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineEnvelope, HiOutlineShieldCheck, HiOutlineUserCircle, HiOutlinePencilSquare } from 'react-icons/hi2'
import { useAuth } from '../services/useAuth'
import { SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'
import { normalizeCampusRole, ROLE_DASHBOARD } from './dashboard/roleDashboardConfig'
import EditProfileModal from '../components/EditProfileModal'

function initials(name: string | undefined): string {
  if (!name?.trim()) return '?'
  const p = name.trim().split(/\s+/)
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase()
  return (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

export default function ProfilePage() {
  const { user } = useAuth()
  const role = normalizeCampusRole(user?.role)
  const roleLabel = ROLE_DASHBOARD[role].roleLabel

  const [editOpen, setEditOpen] = useState(false)
  const [notifEmail, setNotifEmail] = useState(true)
  const [notifBookings, setNotifBookings] = useState(true)
  const [notifMaintenance, setNotifMaintenance] = useState(false)

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="My profile"
          subtitle="Review how you appear across Smart Campus. Editable fields will sync with the user API when connected."
          action={
            <Link
              to="/dashboard"
              className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
            >
              ← Dashboard
            </Link>
          }
        />

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] shadow-xl shadow-black/40">
          <div className="h-28 bg-gradient-to-r from-[#1e3a5f] via-[#1e40af] to-[#3B82F6]/80 sm:h-32" />
          <div className="relative px-6 pb-8 pt-0 sm:px-8">
            <div className="-mt-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                {/* Avatar: show picture if set, else gradient initials */}
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-28 w-28 rounded-2xl border-4 border-[#111827] object-cover shadow-lg shadow-[#3B82F6]/30"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-[#111827] bg-gradient-to-br from-[#3B82F6] to-[#1d4ed8] text-2xl font-bold text-white shadow-lg shadow-[#3B82F6]/30">
                    {initials(user?.name)}
                  </div>
                )}
                <div className="mb-1 pb-1">
                  <p className="text-xl font-bold text-white">{user?.name?.trim() || 'Campus user'}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-[#94A3B8]">
                    <HiOutlineEnvelope className="h-4 w-4 shrink-0" />
                    {user?.email || '—'}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-[#93C5FD] ring-1 ring-blue-500/30">
                    <HiOutlineUserCircle className="h-3.5 w-3.5" />
                    {roleLabel}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 sm:mb-2">
                <button
                  type="button"
                  id="edit-profile-page-btn"
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/40"
                >
                  <HiOutlinePencilSquare className="h-4 w-4" />
                  Edit profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className={panelLg}>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <HiOutlineShieldCheck className="h-5 w-5 text-emerald-400" />
              Account security
            </h3>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Password changes and two-factor authentication will appear here for local accounts. OAuth users
              manage access through their provider.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-[#CBD5E1]">
              <li className="flex justify-between rounded-lg bg-[#0F172A] px-3 py-2">
                <span className="text-[#94A3B8]">Sign-in method</span>
                <span>Campus + optional Google</span>
              </li>
              <li className="flex justify-between rounded-lg bg-[#0F172A] px-3 py-2">
                <span className="text-[#94A3B8]">Last sign-in</span>
                <span>Tracked on next API release</span>
              </li>
            </ul>
          </div>

          <div className={panelLg}>
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <p className="mt-2 text-sm text-[#94A3B8]">Choose what we highlight in your inbox and dashboard.</p>
            <ul className="mt-4 space-y-2">
              {[
                { id: 'email', label: 'Product & campus announcements', checked: notifEmail, set: setNotifEmail },
                { id: 'book', label: 'Booking confirmations & reminders', checked: notifBookings, set: setNotifBookings },
                {
                  id: 'maint',
                  label: 'Maintenance impact near my bookings',
                  checked: notifMaintenance,
                  set: setNotifMaintenance,
                },
              ].map((row) => (
                <li key={row.id}>
                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-[#1F2937] bg-[#0F172A] px-4 py-3 transition-colors hover:border-[#334155]">
                    <span className="text-sm text-[#E2E8F0]">{row.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.checked}
                      onClick={() => row.set(!row.checked)}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                        row.checked ? 'bg-[#3B82F6]' : 'bg-[#334155]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                          row.checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`${tilePanel} mt-8`}>
          <p className="text-sm text-[#94A3B8]">
            Need a role correction? Contact your campus administrator or use the campus IT helpdesk via{' '}
            <Link to="/contact" className="font-semibold text-[#3B82F6] hover:underline">
              Contact
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
