import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { HiOutlineEnvelope, HiOutlineShieldCheck, HiOutlineUserCircle } from 'react-icons/hi2'
import { useAuth } from '../services/useAuth'
import { updateProfile } from '../services/authService'
import { SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'
import { normalizeCampusRole, ROLE_DASHBOARD } from './dashboard/roleDashboardConfig'

function initials(name: string | undefined): string {
  if (!name?.trim()) return '?'
  const p = name.trim().split(/\s+/)
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase()
  return (p[0][0] + p[p.length - 1][0]).toUpperCase()
}

export default function ProfilePage() {
  const { user, checkAuth } = useAuth()
  const role = normalizeCampusRole(user?.role)
  const roleLabel = ROLE_DASHBOARD[role].roleLabel
  const isStudent = role === 'STUDENT'
  const photoStorageKey = user?.email ? `smart-campus.profile-photo.${user.email.toLowerCase()}` : null

  const [notifEmail, setNotifEmail] = useState(true)
  const [notifBookings, setNotifBookings] = useState(true)
  const [notifMaintenance, setNotifMaintenance] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState(user?.name?.trim() || '')
  const [photoFileName, setPhotoFileName] = useState('')
  const [editError, setEditError] = useState<string | null>(null)
  const [editSuccess, setEditSuccess] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    const fallbackPhoto = user?.picture?.trim() || null
    if (!photoStorageKey) {
      setProfilePhoto(fallbackPhoto)
      return
    }
    const savedPhoto = localStorage.getItem(photoStorageKey)
    setProfilePhoto(savedPhoto || fallbackPhoto)
  }, [photoStorageKey, user?.picture])

  const openEditModal = () => {
    setEditName(user?.name?.trim() || '')
    setEditError(null)
    setEditSuccess(null)
    setPhotoFileName('')
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    if (savingProfile) return
    setShowEditModal(false)
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError(null)
    setEditSuccess(null)

    const trimmedName = editName.trim()
    if (trimmedName.length < 2) {
      setEditError('Name must be at least 2 characters')
      return
    }
    const currentName = user?.name?.trim() || ''
    const nameChanged = trimmedName !== currentName

    try {
      if (nameChanged) {
        setSavingProfile(true)
        await updateProfile({ name: trimmedName })
        await checkAuth()
        setEditSuccess('Profile updated successfully')
      } else {
        setEditSuccess('Profile changes saved')
      }
      setTimeout(() => {
        setShowEditModal(false)
      }, 700)
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; error?: string; name?: string; details?: string }>
      const data = axiosError.response?.data
      setEditError(data?.name || data?.message || data?.error || data?.details || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFileName(file.name)

    if (!file.type.startsWith('image/')) {
      setEditError('Please select a valid image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setEditError('Image size must be 2MB or less')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null
      if (!result) return
      setProfilePhoto(result)
      if (photoStorageKey) {
        localStorage.setItem(photoStorageKey, result)
      }
      setEditError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setProfilePhoto(user?.picture?.trim() || null)
    setPhotoFileName('')
    if (photoStorageKey) {
      localStorage.removeItem(photoStorageKey)
    }
  }

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="My profile"
          subtitle={
            isStudent
              ? 'Manage your account details, booking updates, and campus notifications in one place.'
              : 'Review how you appear across Smart Campus. Editable fields will sync with the user API when connected.'
          }
          action={
            <Link
              to="/dashboard"
              className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
            >
              ← Dashboard
            </Link>
          }
        />

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#1F2937] bg-gradient-to-b from-[#0F1B33] via-[#111827] to-[#111827] shadow-xl shadow-black/40">
          <div className="relative px-6 pb-7 pt-6 sm:px-8 sm:pt-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-[#111827] bg-gradient-to-br from-[#3B82F6] to-[#1d4ed8] text-2xl font-bold text-white shadow-lg shadow-[#3B82F6]/30 sm:h-24 sm:w-24">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    initials(user?.name)
                  )}
                </div>
                <div className="pt-2">
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
              <div className="flex gap-2 sm:pt-4">
                <button
                  type="button"
                  onClick={openEditModal}
                  className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                >
                  Edit profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {isStudent ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className={tilePanel}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Profile status</p>
              <p className="mt-2 text-lg font-semibold text-emerald-300">Active</p>
              <p className="mt-1 text-xs text-[#94A3B8]">Your account is ready to book facilities.</p>
            </div>
            <div className={tilePanel}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Quick access</p>
              <Link to="/bookings" className="mt-2 inline-block text-sm font-semibold text-[#93C5FD] hover:underline">
                View my bookings →
              </Link>
              <p className="mt-1 text-xs text-[#94A3B8]">Check upcoming reservations and status updates.</p>
            </div>
            <div className={tilePanel}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Need help?</p>
              <Link to="/support" className="mt-2 inline-block text-sm font-semibold text-[#93C5FD] hover:underline">
                Open support center →
              </Link>
              <p className="mt-1 text-xs text-[#94A3B8]">Get booking and account help quickly.</p>
            </div>
          </div>
        ) : null}

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
            <p className="mt-2 text-sm text-[#94A3B8]">
              {isStudent
                ? 'Choose what updates you want for bookings, reminders, and campus notices.'
                : 'Choose what we highlight in your inbox and dashboard.'}
            </p>
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

        <div className={`${panelLg} mt-8`}>
          <h3 className="text-lg font-semibold text-white">Account summary</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[#1F2937] bg-[#0F172A] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[#94A3B8]">Full name</p>
              <p className="mt-1 text-sm font-medium text-white">{user?.name?.trim() || 'Not set'}</p>
            </div>
            <div className="rounded-lg border border-[#1F2937] bg-[#0F172A] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[#94A3B8]">Email</p>
              <p className="mt-1 text-sm font-medium text-white">{user?.email || 'Not set'}</p>
            </div>
            <div className="rounded-lg border border-[#1F2937] bg-[#0F172A] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[#94A3B8]">Role</p>
              <p className="mt-1 text-sm font-medium text-white">{roleLabel}</p>
            </div>
          </div>
        </div>

        <div className={`${tilePanel} mt-8`}>
          <p className="text-sm text-[#94A3B8]">
            Need a name or role correction? Contact your campus administrator or use the campus IT helpdesk via{' '}
            <Link to="/contact" className="font-semibold text-[#3B82F6] hover:underline">
              Contact
            </Link>
            .
          </p>
        </div>

        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1F2937] px-6 py-5">
                <h2 className="text-lg font-bold text-white">Edit profile</h2>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="text-[#94A3B8] transition-colors hover:text-white"
                  aria-label="Close profile editor"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4 px-6 py-5">
                {editError && (
                  <div className="rounded-lg border border-[#EF4444]/30 bg-[#1E293B] px-4 py-3 text-sm text-[#F87171]">
                    {editError}
                  </div>
                )}
                {editSuccess && (
                  <div className="rounded-lg border border-emerald-500/30 bg-[#1E293B] px-4 py-3 text-sm text-emerald-300">
                    {editSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#CBD5E1]">Profile photo</label>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-[#334155] bg-[#0F172A]">
                      {profilePhoto ? (
                        <img src={profilePhoto} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#94A3B8]">
                          {initials(user?.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 items-center gap-2">
                      <label
                        htmlFor="profilePhoto"
                        className="ui-button-primary cursor-pointer px-3 py-2 text-xs"
                      >
                        Choose photo
                      </label>
                      <input
                        id="profilePhoto"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <span className="max-w-[150px] truncate text-xs text-[#94A3B8]">
                        {photoFileName || 'No file selected'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="mt-2 text-xs font-semibold text-[#93C5FD] hover:underline"
                  >
                    Remove photo
                  </button>
                </div>

                <div>
                  <label htmlFor="profileName" className="block text-sm font-semibold text-[#CBD5E1]">
                    Full name
                  </label>
                  <input
                    id="profileName"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={100}
                    required
                    className="ui-input mt-2 bg-[#1E293B]"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="profileEmail" className="block text-sm font-semibold text-[#CBD5E1]">
                    Email
                  </label>
                  <input
                    id="profileEmail"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="ui-input mt-2 cursor-not-allowed text-[#94A3B8]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={savingProfile}
                    className="ui-button-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="ui-button-primary"
                  >
                    {savingProfile ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
