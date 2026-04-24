import type { ReactNode } from 'react'

export const tilePanel =
  'ui-panel px-5 py-4 transition-colors hover:border-[#334155]'

export const panelLg =
  'ui-panel p-6'

export const featureCard =
  'ui-panel group flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#3B82F6]/35 hover:bg-[#151f2e] hover:shadow-[0_0_32px_rgba(59,130,246,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]'

export const iconBase =
  'mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105'

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: ReactNode
}

export function SectionHeader({ eyebrow, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">{eyebrow}</p>
        ) : null}
        <h2 className={`text-xl font-bold tracking-tight text-white sm:text-2xl ${eyebrow ? 'mt-2' : ''}`}>
          {title}
        </h2>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#94A3B8]">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function DashboardDecor({ children }: { children: ReactNode }) {
  return (
    <div className="relative -mx-4 overflow-hidden sm:-mx-6 lg:-mx-8">
      <div
        className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-[#3B82F6]/18 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-blue-500/12 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-24 left-1/3 h-64 w-96 -translate-x-1/2 rounded-full bg-[#3B82F6]/10 blur-[90px]"
        aria-hidden
      />
      <div className="relative px-4 pb-4 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}

type PillProps = { children: ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }

const pillStyles: Record<NonNullable<PillProps['variant']>, string> = {
  default: 'bg-[#1F2937] text-[#94A3B8] ring-1 ring-[#334155]',
  success: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/35',
  danger: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/35',
  info: 'bg-blue-500/15 text-blue-200 ring-1 ring-blue-500/35',
}

export function Pill({ children, variant = 'default' }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold leading-none tracking-wide ${pillStyles[variant]}`}
    >
      {children}
    </span>
  )
}

type KpiProps = { label: string; value: string; hint?: string; accent?: string }

export function KpiMini({ label, value, hint, accent = 'from-[#3B82F6]/40 to-transparent' }: KpiProps) {
  return (
    <div className={`${panelLg} relative overflow-hidden`}>
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${accent}`}
        aria-hidden
      />
      <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-white">{value}</p>
      {hint ? <p className="mt-2 text-xs text-[#64748B]">{hint}</p> : null}
    </div>
  )
}
