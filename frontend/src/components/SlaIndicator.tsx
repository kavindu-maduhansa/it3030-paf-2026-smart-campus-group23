import React from 'react'
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2'

interface SlaIndicatorProps {
  createdAt: string
  slaLimit: number // in hours
  resolvedAt?: string
  isAgentView?: boolean
}

export default function SlaIndicator({ createdAt, slaLimit, resolvedAt, isAgentView = false }: SlaIndicatorProps) {
  const [, setTick] = React.useState(0)

  React.useEffect(() => {
    if (resolvedAt) return
    const interval = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(interval)
  }, [resolvedAt])

  const start = new Date(createdAt).getTime()
  const now = resolvedAt ? new Date(resolvedAt).getTime() : Date.now()
  const limitMs = slaLimit * 60 * 60 * 1000
  const elapsed = now - start
  const percentage = (elapsed / limitMs) * 100

  let status: 'active' | 'warning' | 'breached' = 'active'
  if (percentage >= 100) status = 'breached'
  else if (percentage >= 75) status = 'warning'

  const getColorClass = () => {
    if (status === 'breached') return 'text-red-500 bg-red-500/10 border-red-500/20'
    if (status === 'warning') return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
  }

  const getLabel = () => {
    if (resolvedAt) return 'Resolved'
    if (isAgentView) {
      if (status === 'breached') return 'SLA Breached'
      if (status === 'warning') return 'SLA Warning'
      return 'On Track'
    } else {
      if (status === 'breached') return 'High Priority'
      if (status === 'warning') return 'Actively Processing'
      return 'Under Review'
    }
  }

  const getIcon = () => {
    if (resolvedAt) return <HiOutlineCheckCircle className="h-4 w-4" />
    if (status === 'breached') return <HiOutlineExclamationTriangle className="h-4 w-4" />
    return <HiOutlineClock className="h-4 w-4" />
  }

  const getTimerLabel = () => {
    const diffMs = limitMs - elapsed
    const isOverdue = diffMs < 0
    const absDiff = Math.abs(diffMs)
    const hours = Math.floor(absDiff / (60 * 60 * 1000))
    const minutes = Math.floor((absDiff % (60 * 60 * 1000)) / (60 * 1000))

    if (hours > 48) return `${Math.floor(hours / 24)}d left`
    return `${hours}h ${minutes}m ${isOverdue ? 'over' : 'left'}`
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getColorClass()}`}>
      {getIcon()}
      <span>{getLabel()}</span>
      {!resolvedAt && (
        <span className="ml-1 opacity-60">
          {getTimerLabel()}
        </span>
      )}
    </div>
  )
}
