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

export default function ResourceFilter({ onFilter, onReset }: ResourceFilterProps) {
  const [type, setType] = useState('')
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState('')
  const [capacity, setCapacity] = useState('')

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    const filters: FilterParams = {}
    
    if (type) filters.type = type
    if (location) filters.location = location
    if (status) filters.status = status
    if (capacity.trim() !== '') {
      const parsed = Number(capacity)
      if (Number.isFinite(parsed) && parsed > 0) {
        filters.capacity = parsed
      }
    }
    
    onFilter(filters)
  }

  const handleReset = () => {
    setType('')
    setLocation('')
    setStatus('')
    setCapacity('')
    onReset()
  }

  const hasActiveFilters = type || location || status || capacity

  return (
    <form onSubmit={handleFilter} className="ui-panel mb-6 p-5">
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Filter Resources
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Type Dropdown */}
          <div className="flex flex-col gap-2">
            <label htmlFor="type" className="text-xs font-medium text-[var(--color-text-secondary)]">
              Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="ui-input px-3 py-2 text-sm"
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
            <label htmlFor="location" className="text-xs font-medium text-[var(--color-text-secondary)]">
              Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g., A, B, Building 3"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="ui-input px-3 py-2 text-sm"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-xs font-medium text-[var(--color-text-secondary)]">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="ui-input px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>

          {/* Minimum Capacity */}
          <div className="flex flex-col gap-2">
            <label htmlFor="capacity" className="text-xs font-medium text-[var(--color-text-secondary)]">
              Min Capacity
            </label>
            <input
              id="capacity"
              type="number"
              min="1"
              placeholder="e.g., 30"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="ui-input px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Filter and Reset Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="ui-button-primary px-5 py-2 text-sm font-medium"
          >
            Filter
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="ui-button-secondary px-5 py-2 text-sm font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
