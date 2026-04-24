import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  eyebrow?: string
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, eyebrow, action }: PageHeaderProps) {
  return (
    <header className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-blue)]">{eyebrow}</p>
        ) : null}
        <h1 className={`text-xl font-bold tracking-tight text-white sm:text-2xl ${eyebrow ? 'mt-2' : ''}`}>
          {title}
        </h1>
        {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}

