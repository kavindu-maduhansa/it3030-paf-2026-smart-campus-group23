import { HiOutlineExclamationTriangle, HiOutlineXMark } from 'react-icons/hi2'

interface ConfirmModalProps {
  show: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning'
}: ConfirmModalProps) {
  if (!show) return null

  const iconColors = {
    danger: 'bg-red-500/10 text-red-500',
    warning: 'bg-amber-500/10 text-amber-500',
    info: 'bg-blue-500/10 text-blue-500'
  }

  const buttonColors = {
    danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
    warning: 'bg-[#3B82F6] hover:bg-blue-500 shadow-blue-500/20',
    info: 'bg-[#3B82F6] hover:bg-blue-500 shadow-blue-500/20'
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] border border-[#334155] bg-[#0F172A] p-8 shadow-2xl transition-all animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-6">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconColors[variant]}`}>
            <HiOutlineExclamationTriangle className="h-7 w-7" />
          </div>
          <button 
            onClick={onCancel}
            className="rounded-full p-2 text-[#64748B] hover:bg-[#1F2937] hover:text-white transition-colors"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="mt-4 text-[#94A3B8] leading-relaxed">
          {message}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-2xl border border-[#334155] px-6 py-2.5 text-sm font-bold text-white hover:bg-white/5 transition-all order-2 sm:order-1"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-2xl px-8 py-2.5 text-sm font-bold text-white transition-all shadow-lg order-1 sm:order-2 ${buttonColors[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
