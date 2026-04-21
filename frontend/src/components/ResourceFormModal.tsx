// React modal form component for creating and editing resources
// fields: name, type, capacity, location, availabilityStart, availabilityEnd, description, status
// use useState to manage form data
// call createResource when creating and updateResource when editing
// accept props: resource, onClose, onSaved
// Status can be updated in this form or via quick toggle in ResourceList

import { useState, useEffect } from 'react'
import type { AxiosError } from 'axios'
import { createResource, updateResource } from '../services/resourceService'
import type { Resource } from '../services/resourceService'

interface ResourceFormModalProps {
  resource?: Resource | null
  onClose: () => void
  onSaved: () => void
}

const ResourceFormModal = ({ resource, onClose, onSaved }: ResourceFormModalProps) => {
  const [formData, setFormData] = useState<Resource>({
    name: '',
    type: 'CLASSROOM',
    location: '',
    capacity: 0,
    description: '',
    availabilityStart: '08:00',
    availabilityEnd: '18:00',
    status: 'ACTIVE',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (resource) {
      setFormData(resource)
    }
  }, [resource])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (resource?.id) {
        await updateResource(resource.id, formData)
      } else {
        await createResource(formData)
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      console.error('Error saving resource:', err)
      const axiosError = err as AxiosError<{ message: string }>
      setError(
        axiosError?.response?.data?.message || 'Failed to save resource'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#1F2937] bg-[#111827] shadow-2xl">
        {/* Header */}
        <div className="border-b border-[#1F2937] px-8 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {resource?.id ? 'Edit Resource' : 'Add Resource'}
            </h2>
            <button
              onClick={onClose}
              className="text-[#94A3B8] transition-colors hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col">
          <div className="space-y-6 overflow-y-auto px-8 py-6">
            {error && (
              <div className="rounded-lg border border-[#EF4444]/30 bg-[#1E293B] p-4 text-sm text-[#F87171]">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-[#CBD5E1]">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-white placeholder-[#64748B] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              placeholder="e.g., Room 101"
            />
          </div>

          {/* Type and Capacity */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-[#CBD5E1]">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-white transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              >
                <option value="CLASSROOM">Classroom</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="LIBRARY">Library</option>
                <option value="GYM">Gym</option>
                <option value="CANTEEN">Canteen</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-semibold text-[#CBD5E1]">
                Capacity
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity || ''}
                onChange={handleChange}
                min="0"
                className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-white placeholder-[#64748B] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                placeholder="e.g., 40"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-[#CBD5E1]">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-white placeholder-[#64748B] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              placeholder="e.g., Building A, 1st Floor"
            />
          </div>

          {/* Availability Times */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="availabilityStart" className="block text-sm font-semibold text-[#CBD5E1]">
                Availability Start
              </label>
              <input
                type="time"
                id="availabilityStart"
                name="availabilityStart"
                value={formData.availabilityStart || ''}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-white transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>

            <div>
              <label htmlFor="availabilityEnd" className="block text-sm font-semibold text-[#CBD5E1]">
                Availability End
              </label>
              <input
                type="time"
                id="availabilityEnd"
                name="availabilityEnd"
                value={formData.availabilityEnd || ''}
                onChange={handleChange}
                className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-white transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-[#CBD5E1]">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status || 'ACTIVE'}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-white transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            >
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-[#CBD5E1]">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="mt-2 w-full rounded-lg border border-[#334155] bg-[#1E293B] px-4 py-2.5 text-white placeholder-[#64748B] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              placeholder="Add any additional information about this resource..."
            />
          </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-[#1F2937] px-8 py-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-6 py-2.5 text-sm font-semibold text-[#CBD5E1] transition-colors hover:bg-[#1E293B]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#3B82F6] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(59,130,246,0.5)] disabled:opacity-50"
            >
              {loading ? 'Saving...' : resource?.id ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResourceFormModal
