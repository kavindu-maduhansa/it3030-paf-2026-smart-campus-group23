import { useState } from 'react'
import type { FilterParams } from '../services/resourceService'

interface ResourceFilterProps {
  onFilter: (filters: FilterParams) => void
  onReset: () => void
}

const RESOURCE_TYPES = [
  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
  { value: 'LAB', label: 'Lab' },
  { value: 'MEETING_ROOM', label: 'Meeting Room' },
  { value: 'EQUIPMENT', label: 'Equipment' }
]

const STATUSES = [
  { value: 'ACTIVE', label: 'Available' },
  { value: 'OUT_OF_SERVICE', label: 'Unavailable' }
]

export default function ResourceFilter({ onFilter, onReset }: ResourceFilterProps) {
  const [type, setType] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('')

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    const filters: FilterParams = {}
    
    if (type) filters.type = type
    if (location) filters.location = location
    if (status) filters.status = status as 'ACTIVE' | 'OUT_OF_SERVICE'
    
    onFilter(filters)
  }

  const handleReset = () => {
    setType('')
    setLocation('')
    setStatus('')
    onReset()
  }

  const hasActiveFilters = type || location || status

  return (
    <form onSubmit={handleFilter} className="mb-6 rounded-2xl border border-[#1F2937] bg-[#111827] p-5 shadow-lg shadow-black/30">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#94A3B8]">
          Filter Resources
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Type Dropdown */}
          <div className="flex flex-col gap-2">
            <label htmlFor="type" className="text-xs font-medium text-[#CBD5E1]">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-sm text-[#E2E8F0] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
            >
              <option value="">All Types</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="text-xs font-medium text-[#CBD5E1]">
              Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g., A, B, Building 3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-sm text-[#E2E8F0] placeholder-[#64748B] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-xs font-medium text-[#CBD5E1]">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-sm text-[#E2E8F0] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30"
            >
              <option value="">All Status</option>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter and Reset Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-[#3B82F6] px-5 py-2 text-sm font-medium text-white shadow-[0_0_24px_rgba(59,130,246,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(59,130,246,0.5)]"
          >
            Filter
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-[#334155] px-5 py-2 text-sm font-medium text-[#94A3B8] transition-colors hover:border-[#475569] hover:text-[#CBD5E1]"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
