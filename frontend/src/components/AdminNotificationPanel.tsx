import { useState, useEffect } from 'react'
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlineArrowRight,
} from 'react-icons/hi2'
import { getNotifications, getNotificationStats, clearNotifications } from '../services/notificationService'
import { panelLg } from '../pages/dashboard/dashboardUi'

interface NotificationData {
  id: string
  title: string
  description: string
  type: 'resource' | 'facility' | 'booking' | 'maintenance' | 'ticket'
  severity: 'info' | 'warning' | 'danger'
  createdAt: string
  read: boolean
}

interface NotificationCounts {
  resource: number
  facility: number
  booking: number
  maintenance: number
  ticket: number
}

export default function AdminNotificationPanel() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [counts, setCounts] = useState<NotificationCounts>({
    resource: 0,
    facility: 0,
    booking: 0,
    maintenance: 0,
    ticket: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      // Get stats
      const stats = await getNotificationStats()
      setCounts({
        resource: stats.resourceCount,
        facility: stats.facilityCount,
        booking: stats.bookingCount,
        maintenance: stats.maintenanceCount,
        ticket: stats.ticketCount,
      })

      // Get notifications
      const data = await getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

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

  const filteredNotifications = selectedType
    ? notifications.filter((n) => n.type === selectedType)
    : notifications

  const notificationTypes = [
    { key: 'resource', label: 'Resources', count: counts.resource, icon: '📦' },
    { key: 'facility', label: 'Facilities', count: counts.facility, icon: '🏢' },
    { key: 'booking', label: 'Bookings', count: counts.booking, icon: '📅' },
    { key: 'maintenance', label: 'Maintenance', count: counts.maintenance, icon: '🔧' },
    { key: 'ticket', label: 'Tickets', count: counts.ticket, icon: '🎫' },
  ]

  const totalNotifications = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className={panelLg}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#3B82F6]/15 p-2">
            <HiOutlineBell className="h-5 w-5 text-[#3B82F6]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Notifications Center</h3>
            <p className="text-xs text-[#94A3B8]">{totalNotifications} total alerts</p>
          </div>
        </div>
        {totalNotifications > 0 && (
          <button
            onClick={() => clearNotifications()}
            className="text-xs font-medium text-[#94A3B8] hover:text-white transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Notification Type Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedType === null
              ? 'bg-[#3B82F6] text-white'
              : 'bg-[#1F2937] text-[#94A3B8] hover:bg-[#334155]'
          }`}
        >
          All ({totalNotifications})
        </button>
        {notificationTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setSelectedType(type.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              selectedType === type.key
                ? 'bg-[#3B82F6] text-white'
                : 'bg-[#1F2937] text-[#94A3B8] hover:bg-[#334155]'
            }`}
          >
            <span>{type.icon}</span>
            {type.label} ({type.count})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-[#94A3B8]">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <HiOutlineCheckCircle className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
            <p className="text-[#94A3B8]">
              {selectedType ? `No ${selectedType} notifications` : 'No notifications'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border border-[#1F2937] p-4 transition-all ${getSeverityColor(
                notification.severity
              )} ${notification.read ? 'opacity-60' : ''}`}
            >
              <div className="flex gap-3">
                {/* Icon */}
                <div className="mt-1">
                  {notification.severity === 'danger' || notification.severity === 'warning' ? (
                    <HiOutlineExclamationTriangle className={`h-5 w-5 ${getSeverityIconColor(notification.severity)}`} />
                  ) : (
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{notification.title}</p>
                      <p className="mt-1 text-sm text-[#94A3B8]">{notification.description}</p>
                    </div>
                    <span className="mt-0.5 rounded-full bg-[#0F172A]/80 px-2 py-0.5 text-xs font-medium text-[#93C5FD]">
                      {notification.type}
                    </span>
                  </div>

                  {/* Meta Info */}
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-[#64748B]">
                      {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {notification.read && (
                      <HiOutlineCheckCircle className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats Grid */}
      {totalNotifications > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5 pt-4 border-t border-[#1F2937]">
          {notificationTypes.map((type) => (
            <div
              key={type.key}
              className="rounded-lg bg-[#0F172A] p-3 text-center cursor-pointer hover:bg-[#1F2937] transition-colors"
              onClick={() => setSelectedType(type.key)}
            >
              <p className="text-2xl">{type.icon}</p>
              <p className="mt-1 text-lg font-bold text-white">{type.count}</p>
              <p className="text-xs text-[#94A3B8]">{type.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Footer Action */}
      <div className="mt-6 flex gap-2 pt-4 border-t border-[#1F2937]">
        <button className="flex-1 rounded-lg bg-[#0F172A] px-4 py-2 text-sm font-medium text-[#94A3B8] hover:bg-[#1F2937] transition-colors flex items-center justify-center gap-2">
          <HiOutlineArrowRight className="h-4 w-4" />
          View all
        </button>
        <button
          onClick={fetchNotifications}
          className="flex-1 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
