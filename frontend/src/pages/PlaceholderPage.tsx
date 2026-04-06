import { Link } from 'react-router-dom'

type PlaceholderPageProps = {
  title: string
  description: string
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] shadow-xl shadow-black/50">
        <div className="h-1.5 bg-gradient-to-r from-[#3B82F6] via-blue-400 to-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
        <div className="px-8 py-10 sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">
            Smart Campus
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-4 leading-relaxed text-[#94A3B8]">{description}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#3B82F6] px-6 text-sm font-semibold text-white shadow-[0_0_26px_rgba(59,130,246,0.45)] transition-all hover:bg-blue-500 hover:shadow-[0_0_32px_rgba(59,130,246,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60A5FA]"
            >
              Back to home
            </Link>
            <Link
              to="/resources"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#334155] bg-transparent px-6 text-sm font-semibold text-white transition-colors hover:border-[#3B82F6]/60 hover:bg-[#1E293B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3B82F6]"
            >
              View facilities
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
