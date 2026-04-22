import { useEffect } from 'react'
import { HiOutlineCheckCircle, HiOutlineXMark } from 'react-icons/hi2'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose: () => void
}

export default function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    success: 'bg-[#10B981]/10 border-[#10B981]/30',
    error: 'bg-[#EF4444]/10 border-[#EF4444]/30',
    info: 'bg-[#3B82F6]/10 border-[#3B82F6]/30',
  }[type]

  const textColor = {
    success: 'text-[#10B981]',
    error: 'text-[#F87171]',
    info: 'text-[#60A5FA]',
  }[type]

  const Icon = {
    success: HiOutlineCheckCircle,
    error: HiOutlineXMark,
    info: HiOutlineCheckCircle,
  }[type]

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md rounded-lg border ${bgColor} p-4 shadow-lg animate-in slide-in-from-top-2`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${textColor}`} />
        <div className="flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-[#64748B] hover:text-white focus:outline-none"
        >
          <HiOutlineXMark className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
