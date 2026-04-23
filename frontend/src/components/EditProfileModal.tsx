import { useState, useRef, useCallback, useEffect } from 'react'
import { HiOutlineCamera, HiOutlineXMark, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineUser } from 'react-icons/hi2'
import { useAuth } from '../services/useAuth'
import { updateProfile } from '../services/authService'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const MAX_SIZE_MB = 2
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

function resizeImage(file: File, maxDim = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function EditProfileModal({ isOpen, onClose }: Props) {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [preview, setPreview] = useState<string | null>(user?.picture ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setName(user?.name ?? '')
      setPreview(user?.picture ?? null)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen, user])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, etc.)')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`Image must be smaller than ${MAX_SIZE_MB}MB`)
      return
    }
    setError(null)
    try {
      const dataUrl = await resizeImage(file)
      setPreview(dataUrl)
    } catch {
      setError('Failed to process image. Please try another file.')
    }
  }, [])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const updated = await updateProfile(name.trim(), preview ?? undefined)
      // Update global auth context immediately
      setUser((prev) => prev ? { ...prev, name: updated.name ?? name.trim(), picture: (updated as any).picture ?? preview ?? undefined } : prev)
      setSuccess(true)
      setTimeout(onClose, 1200)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? 'Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const initial = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1117] shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 id="edit-profile-title" className="text-lg font-semibold text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-[#3B82F6]/40 shadow-lg shadow-blue-500/20"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#6366F1] ring-4 ring-[#3B82F6]/40 shadow-lg shadow-blue-500/20">
                  <span className="text-3xl font-bold text-white">{initial}</span>
                </div>
              )}

              {/* Camera overlay button */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#3B82F6] text-white shadow-lg ring-2 ring-[#0D1117] transition-transform hover:scale-110 hover:bg-blue-500"
                aria-label="Upload profile picture"
              >
                <HiOutlineCamera className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm font-medium text-[#3B82F6] transition-colors hover:text-[#93C5FD]"
              >
                Change photo
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="text-xs text-[#64748B] transition-colors hover:text-red-400"
                >
                  Remove photo
                </button>
              )}
              <p className="text-xs text-[#475569]">JPG, PNG or WebP · max {MAX_SIZE_MB}MB</p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-hidden
              onChange={handleFileChange}
            />
          </div>

          {/* Name input */}
          <div className="space-y-1.5">
            <label htmlFor="profile-name" className="flex items-center gap-1.5 text-sm font-medium text-[#94A3B8]">
              <HiOutlineUser className="h-4 w-4" />
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              maxLength={80}
              placeholder="Enter your name…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-[#475569] outline-none transition-all focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            />
            <p className="text-right text-[10px] text-[#475569]">{name.length}/80</p>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#64748B]">Email</label>
            <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-[#64748B]">
              {user?.email}
            </div>
            <p className="text-[10px] text-[#475569]">Email cannot be changed</p>
          </div>

          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <HiOutlineExclamationCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              <HiOutlineCheckCircle className="h-4 w-4 shrink-0" />
              Profile updated successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            id="save-profile-btn"
            onClick={handleSave}
            disabled={saving || success}
            className="relative flex items-center gap-2 rounded-xl bg-[#3B82F6] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 disabled:opacity-60"
          >
            {saving && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {saving ? 'Saving…' : success ? 'Saved!' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
