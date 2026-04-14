import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  HiOutlineWrenchScrewdriver, 
  HiOutlinePhoto, 
  HiOutlineXMark, 
  HiOutlineMagnifyingGlass,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle
} from 'react-icons/hi2'
import { getResources } from '../services/resourceService'
import type { Resource } from '../services/resourceService'
import { createTicket } from '../services/ticketService'
import type { TicketRequestDTO } from '../services/ticketService'
import { SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'IT & Network',
  'AV & Projector',
  'HVAC / Air Con',
  'Furniture',
  'Janitorial',
  'Other'
]

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'text-slate-400 bg-slate-500/10' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-amber-400 bg-amber-500/10' },
  { value: 'HIGH', label: 'High', color: 'text-orange-400 bg-orange-500/10' },
  { value: 'URGENT', label: 'Urgent', color: 'text-red-400 bg-red-500/10' }
]

export default function ReportIncidentPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<TicketRequestDTO>({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM',
    contactDetails: '',
    resourceId: undefined
  })
  
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showResourceList, setShowResourceList] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchResources()
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResourceList(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchResources() {
    try {
      const response = await getResources()
      setResources(response.data)
    } catch (err) {
      console.error('Failed to fetch resources', err)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      const remainingSlots = 3 - images.length
      
      if (remainingSlots <= 0) return
      
      const filesToAdd = selectedFiles.slice(0, remainingSlots)
      const newImages = [...images, ...filesToAdd]
      setImages(newImages)
      
      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file))
      setPreviews([...previews, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
    
    URL.revokeObjectURL(previews[index])
    const newPreviews = [...previews]
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)
  }

  const filteredResources = resources.filter(res => 
    res.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    res.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.location.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await createTicket(formData, images)
      setIsSuccess(true)
      setTimeout(() => navigate('/maintenance'), 2000)
    } catch (err) {
      console.error('Failed to create ticket', err)
      alert('Error submitting report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
          <HiOutlineCheckCircle className="h-12 w-12" />
        </div>
        <h2 className="text-3xl font-bold text-white">Incident Reported!</h2>
        <p className="mt-4 text-[#94A3B8]">Your ticket has been submitted. A technician will be assigned shortly.</p>
        <p className="mt-2 text-sm text-[#64748B]">Redirecting you back to maintenance...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <SectionHeader
        eyebrow="Maintenance"
        title="Report an Incident"
        subtitle="Found something broken? Let us know and we'll fix it as fast as possible."
        action={
          <button
            onClick={() => navigate('/maintenance')}
            className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
          >
            Cancel
          </button>
        }
      />

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Main Info Section */}
        <div className={panelLg}>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-white">Title</label>
              <input
                required
                type="text"
                placeholder="e.g., Projector not working in Hall A"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 text-white focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white">Priority</label>
              <div className="mt-2 flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p.value })}
                    className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                      formData.priority === p.value 
                        ? `${p.color} ring-1 ring-inset ring-current` 
                        : 'bg-[#1F2937] text-[#64748B] opacity-50 hover:opacity-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resource Selection */}
        <div className={panelLg}>
          <label className="block text-sm font-semibold text-white">Affected Resource (Optional)</label>
          <p className="text-xs text-[#64748B] mt-1 mb-3">Link this incident to a specific campus resource to help us locate it faster.</p>
          
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-3.5 h-4 w-4 text-[#475569]" />
              <input
                type="text"
                placeholder="Search resources (e.g., Hall A, Lab 5...)"
                value={selectedResource ? selectedResource.name : searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (selectedResource) {
                    setSelectedResource(null)
                    setFormData({ ...formData, resourceId: undefined })
                  }
                  setShowResourceList(true)
                }}
                onFocus={() => setShowResourceList(true)}
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-10 pr-4 text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
              {selectedResource && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedResource(null)
                    setFormData({ ...formData, resourceId: undefined })
                    setSearchQuery('')
                  }}
                  className="absolute right-3 top-3 text-[#64748B] hover:text-white"
                >
                  <HiOutlineXMark className="h-5 w-5" />
                </button>
              )}
            </div>

            {showResourceList && searchQuery && !selectedResource && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[#1F2937] bg-[#111827] shadow-2xl">
                {filteredResources.length > 0 ? (
                  filteredResources.map(res => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => {
                        setSelectedResource(res)
                        setFormData({ ...formData, resourceId: res.id })
                        setShowResourceList(false)
                      }}
                      className="flex w-full flex-col px-4 py-3 text-left hover:bg-[#1F2937]"
                    >
                      <span className="text-sm font-medium text-white">{res.name}</span>
                      <span className="text-xs text-[#64748B]">{res.type} · {res.location}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-[#64748B]">No matching resources found.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Description */}
        <div className={panelLg}>
          <label className="block text-sm font-semibold text-white">Full Description</label>
          <textarea
            required
            rows={4}
            placeholder="Tell us exactly what's wrong. Be as detailed as possible."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-2 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] p-4 text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>

        {/* Image Upload */}
        <div className={panelLg}>
          <label className="block text-sm font-semibold text-white">Attach Images (Max 3)</label>
          <p className="text-xs text-[#64748B] mt-1 mb-4">Sharing photos helps our technicians understand the issue before they arrive.</p>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {previews.map((preview, i) => (
              <div key={preview} className="group relative aspect-square overflow-hidden rounded-xl border border-[#1F2937] bg-[#0F172A]">
                <img src={preview} alt="Upload preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <HiOutlineXMark className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {images.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1F2937] bg-[#0F172A] text-[#475569] transition-colors hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5 hover:text-[#3B82F6]"
              >
                <HiOutlinePhoto className="h-8 w-8" />
                <span className="mt-2 text-xs font-medium">Add Photo</span>
              </button>
            )}
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Contact Details */}
        <div className={panelLg}>
          <label className="block text-sm font-semibold text-white">Contact Details (Optional)</label>
          <input
            type="text"
            placeholder="e.g., Found near the main door. Reach me at ext. 421"
            value={formData.contactDetails}
            onChange={(e) => setFormData({ ...formData, contactDetails: e.target.value })}
            className="mt-2 h-11 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
          />
        </div>

        {/* Warnings / Tips */}
        <div className={`${tilePanel} flex gap-3 border-blue-500/20 bg-blue-500/5`}>
          <HiOutlineInformationCircle className="h-5 w-5 shrink-0 text-[#3B82F6]" />
          <p className="text-xs leading-relaxed text-[#94A3B8]">
            <strong className="text-white">Heads up:</strong> Submission creates a formal work order. 
            Technicians may contact you if they need more info. For life-threatening emergencies, please call campus security immediately.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading || !formData.title || !formData.description || !formData.category}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#3B82F6] px-8 text-base font-bold text-white transition-all hover:bg-blue-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <HiOutlineWrenchScrewdriver className="h-5 w-5" />
            )}
            {isLoading ? 'Reporting...' : 'Submit Work Order'}
          </button>
        </div>
      </form>
    </div>
  )
}
