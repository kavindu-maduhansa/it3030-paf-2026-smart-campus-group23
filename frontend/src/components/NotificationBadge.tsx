import { useState, useEffect, useRef, useCallback } from 'react'
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
  HiOutlineTrash,
} from 'react-icons/hi2'
import { useAuth } from '../services/useAuth'
import {
  getNotifications,
  markNotificationAsRead,
  clearNotifications,
} from '../services/notificationService'

interface Notification {
  id: string
  title: string
  description: string
  type: 'resource' | 'facility' | 'booking' | 'maintenance' | 'ticket'
  severity: 'info' | 'warning' | 'danger'
  createdAt: string
  read: boolean
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  booking: { label: 'Bookings', icon: '📅', color: 'text-blue-400' },
  ticket: { label: 'Maintenance', icon: '🔧', color: 'text-amber-400' },
  resource: { label: 'Resources', icon: '📦', color: 'text-emerald-400' },
  facility: { label: 'Facilities', icon: '🏢', color: 'text-purple-400' },
  maintenance: { label: 'Tickets', icon: '🎫', color: 'text-rose-400' },
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationBadge() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'

  const fetchNotifications = useCallback(async () => {
    if (!isAdmin) return
    try {
      setLoading(true)
      const notifs = await getNotifications()
      setNotifications(notifs as Notification[])
      setUnreadCount(notifs.filter((n: Notification) => !n.read).length)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [isAdmin, fetchNotifications])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const handleMarkRead = async (id: string) => {
    const notif = notifications.find((n) => n.id === id)
    if (!notif || notif.read) return
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
    try {
      await markNotificationAsRead(id)
    } catch {
      // Rollback
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      )
      setUnreadCount((c) => c + 1)
    }
  }

  const handleClear = async (type?: string) => {
    setClearing(true)
    try {
      await clearNotifications(type)
      if (type) {
        setNotifications((prev) => prev.filter((n) => n.type !== type))
        setUnreadCount((c) => {
          const removed = notifications.filter((n) => n.type === type && !n.read).length
          return Math.max(0, c - removed)
        })
      } else {
        setNotifications([])
        setUnreadCount(0)
        setSelectedType(null)
      }
    } catch (err) {
      console.error('Error clearing notifications:', err)
    } finally {
      setClearing(false)
    }
  }

  const filteredNotifications = selectedType
    ? notifications.filter((n) => n.type === selectedType)
    : notifications

  // Collect types that actually have notifications
  const availableTypes = Array.from(new Set(notifications.map((n) => n.type)))

  if (!isAdmin) return null

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="admin-notifications-bell"
        type="button"
        onClick={() => {
          setIsOpen((o) => !o)
          if (!isOpen) fetchNotifications()
        }}
        className="relative inline-flex items-center justify-center rounded-xl p-2.5 text-[#94A3B8] transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
        aria-label={`Admin notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <HiOutlineBell className="h-6 w-6" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <>
            {/* Pulse ring */}
            <span className="absolute top-1 right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/40">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </span>
          </>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-14 z-50 flex w-[22rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0D1117] shadow-2xl shadow-black/60 backdrop-blur-xl"
          style={{ maxHeight: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#0F172A] px-4 py-3">
            <div className="flex items-center gap-2">
              <HiOutlineBell className="h-5 w-5 text-[#3B82F6]" />
              <h3 className="font-semibold text-white">Admin Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  title="Clear all notifications"
                  onClick={() => handleClear()}
                  disabled={clearing}
                  className="rounded-lg p-1.5 text-[#64748B] transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-[#64748B] transition-colors hover:bg-white/10 hover:text-white"
              >
                <HiOutlineXMark className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          {notifications.length > 0 && (
            <div className="flex gap-1 overflow-x-auto border-b border-white/10 bg-[#0A0F1A] px-3 py-2 scrollbar-hide">
              <button
                onClick={() => setSelectedType(null)}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedType === null
                    ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                    : 'bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-white'
                }`}
              >
                All
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${selectedType === null ? 'bg-white/20' : 'bg-white/10'}`}>
                  {notifications.length}
                </span>
              </button>

              {availableTypes.map((type) => {
                const cfg = TYPE_CONFIG[type] ?? { label: type, icon: '📌', color: 'text-white' }
                const count = notifications.filter((n) => n.type === type).length
                const unread = notifications.filter((n) => n.type === type && !n.read).length
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                    className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedType === type
                        ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                        : 'bg-white/5 text-[#94A3B8] hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{cfg.icon}</span>
                    {cfg.label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${selectedType === type ? 'bg-white/20' : 'bg-white/10'}`}>
                      {count}
                    </span>
                    {unread > 0 && (
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-[#64748B]">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#3B82F6] border-t-transparent" />
                <p className="text-sm">Loading notifications…</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10">
                <HiOutlineCheckCircle className="h-10 w-10 text-emerald-400" />
                <p className="text-sm font-medium text-[#94A3B8]">All caught up!</p>
                <p className="text-xs text-[#64748B]">No notifications here</p>
              </div>
            ) : (
              filteredNotifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? { label: n.type, icon: '📌', color: 'text-white' }
                const borderColor =
                  n.severity === 'danger'
                    ? 'border-red-500/30'
                    : n.severity === 'warning'
                    ? 'border-amber-500/30'
                    : 'border-blue-500/20'
                const bgColor =
                  n.severity === 'danger'
                    ? 'bg-red-500/5'
                    : n.severity === 'warning'
                    ? 'bg-amber-500/5'
                    : 'bg-blue-500/5'

                return (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleMarkRead(n.id)}
                    className={`group relative cursor-pointer rounded-xl border p-3 transition-all duration-200 hover:brightness-110 ${borderColor} ${bgColor} ${
                      n.read ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-400" />
                    )}

                    <div className="flex gap-3 pr-4">
                      {/* Icon */}
                      <div className="mt-0.5 shrink-0 text-lg leading-none">
                        {n.severity === 'danger' || n.severity === 'warning' ? (
                          <HiOutlineExclamationTriangle
                            className={`h-5 w-5 ${
                              n.severity === 'danger' ? 'text-red-400' : 'text-amber-400'
                            }`}
                          />
                        ) : (
                          <span>{cfg.icon}</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-white leading-snug">{n.title}</p>
                        <p className="mt-0.5 text-xs text-[#94A3B8] line-clamp-2">{n.description}</p>
                        <p className="mt-1.5 text-[10px] text-[#64748B]">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer: Clear filtered type */}
          {selectedType && notifications.filter((n) => n.type === selectedType).length > 0 && (
            <div className="border-t border-white/10 bg-[#0A0F1A] px-3 py-2">
              <button
                onClick={() => handleClear(selectedType)}
                disabled={clearing}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-[#64748B] transition-colors hover:text-red-400"
              >
                <HiOutlineTrash className="h-3.5 w-3.5" />
                Clear {TYPE_CONFIG[selectedType]?.label ?? selectedType} notifications
              </button>
            </div>
          )}

          {/* Refresh hint */}
          {!loading && notifications.length > 0 && !selectedType && (
            <div className="border-t border-white/10 bg-[#0A0F1A] px-3 py-2 text-center">
              <button
                onClick={fetchNotifications}
                className="text-xs font-medium text-[#3B82F6] transition-colors hover:text-[#93C5FD]"
              >
                ↻ Refresh notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
