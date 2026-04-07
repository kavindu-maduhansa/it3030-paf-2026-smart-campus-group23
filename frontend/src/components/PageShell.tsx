import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
}

/** Inner pages canvas — same midnight palette as marketing hero (#020617). */
export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-brand-navy">
      <div
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#3B82F6]/15 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#3B82F6]/10 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-600/5 blur-[80px]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {children}
      </div>
    </div>
  )
}
