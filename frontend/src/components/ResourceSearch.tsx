interface Props {
  onSearch: (keyword: string) => void
}

export default function ResourceSearch({ onSearch }: Props) {
  return (
    <div className="mb-6">
      <label htmlFor="resource-search-input" className="sr-only">
        Search resources
      </label>
      <input
        id="resource-search-input"
        type="search"
        placeholder="Search by name or type..."
        autoComplete="off"
        onChange={(e) => onSearch(e.target.value)}
        className="h-12 w-full max-w-md rounded-xl border border-[#1F2937] bg-[#111827] px-4 text-white shadow-inner transition-all placeholder:text-[#94A3B8] focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/40 focus:shadow-[0_0_24px_rgba(59,130,246,0.15)] hover:border-[#334155]"
      />
    </div>
  )
}
