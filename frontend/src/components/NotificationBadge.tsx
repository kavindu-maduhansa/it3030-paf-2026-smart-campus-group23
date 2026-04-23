import { useState, useEffect, useRef } from 'react'
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2'
import { useAuth } from '../services/useAuth'
import { getNotifications, getNotificationStats } from '../services/notificationService'

interface Notification {
  id: string
  title: string
  description: string
  type: 'resource' | 'facility' | 'booking' | 'maintenance' | 'ticket'
  severity: 'info' | 'warning' | 'danger'
  createdAt: string
  read: boolean
}

export default function NotificationBadge() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Only show badge for admin users
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'resource':
        return '📦'
      case 'facility':
        return '🏢'
      case 'booking':
        return '📅'
      case 'maintenance':
        return '🔧'
      case 'ticket':
        return '🎫'
      default:
        return '📌'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'border-red-500/20 bg-red-500/5'
      case 'warning':
        return 'border-amber-500/20 bg-amber-500/5'
      default:
        return 'border-blue-500/20 bg-blue-500/5'
    }
  }

  const getSeverityIconColor = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'text-red-400'
      case 'warning':
        return 'text-amber-400'
      default:
        return 'text-blue-400'
    }
  }

  const fetchNotifications = async () => {
    if (!isAdmin) return
    try {
      setLoading(true)
      const [notif, stats] = await Promise.all([
        getNotifications(),
        getNotificationStats(),
      ])
      setNotifications(notif)
      const total = stats.resourceCount + stats.facilityCount + stats.bookingCount + stats.maintenanceCount + stats.ticketCount
      setUnreadCount(total)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [isAdmin])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const filteredNotifications = selectedType
    ? notifications.filter((n) => n.type === selectedType)
    : notifications

  const notificationTypes = [
    { key: 'resource', label: '📦 Resources', count: notifications.filter(n => n.type === 'resource').length },
    { key: 'facility', label: '🏢 Facilities', count: notifications.filter(n => n.type === 'facility').length },
    { key: 'booking', label: '📅 Bookings', count: notifications.filter(n => n.type === 'booking').length },
    { key: 'maintenance', label: '🔧 Maintenance', count: notifications.filter(n => n.type === 'maintenance').length },
    { key: 'ticket', label: '🎫 Tickets', count: notifications.filter(n => n.type === 'ticket').length },
  ]

  if (!isAdmin) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) fetchNotifications()
        }}
        className="relative inline-flex items-center justify-center rounded-lg p-2.5 text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        title={`${unreadCount} unread notifications`}
      >
        <HiOutlineBell className="h-6 w-6" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-96 max-h-96 rounded-xl border border-[#1F2937] bg-[#111827] shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-[#1F2937] px-4 py-3 bg-[#0F172A]">
            <h3 className="font-semibold text-white">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#94A3B8] hover:text-white transition-colors"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-[#1F2937] px-3 py-2 bg-[#0F172A]">
            <button
              onClick={() => setSelectedType(null)}
              className={`px-3 py-1 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                selectedType === null
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-[#1F2937] text-[#94A3B8] hover:bg-[#334155]'
              }`}
            >
              All ({notifications.length})
            </button>
            {notificationTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedType === type.key
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-[#1F2937] text-[#94A3B8] hover:bg-[#334155]'
                }`}
              >
                {type.label} ({type.count})
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto space-y-2 p-3">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-[#94A3B8]">Loading...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <HiOutlineCheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                <p className="text-[#94A3B8]">No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-3 transition-all ${getSeverityColor(
                    notification.severity
                  )} ${notification.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex gap-2">
                    <div className="mt-0.5">
                      {notification.severity === 'danger' || notification.severity === 'warning' ? (
                        <HiOutlineExclamationTriangle className={`h-4 w-4 ${getSeverityIconColor(notification.severity)}`} />
                      ) : (
                        <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{notification.title}</p>
                      <p className="text-xs text-[#94A3B8] line-clamp-2">{notification.description}</p>
                      <p className="text-xs text-[#64748B] mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()} · {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {notification.read && (
                      <HiOutlineCheckCircle className="h-4 w-4 text-emerald-400 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-[#1F2937] px-3 py-2 bg-[#0F172A]">
              <button
                onClick={() => {
                  setIsOpen(false)
                  // You can navigate to notifications page here if needed
                }}
                className="w-full text-sm font-medium text-[#3B82F6] hover:text-[#93C5FD] transition-colors"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
