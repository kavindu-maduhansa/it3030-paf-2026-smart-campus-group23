import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  HiOutlineWrenchScrewdriver as WrenchIcon, 
  HiOutlinePhoto as PhotoIcon, 
  HiOutlineXMark as XIcon, 
  HiOutlineMagnifyingGlass as SearchIcon,
  HiOutlineInformationCircle as InfoIcon,
  HiOutlineCheckCircle as CheckIcon,
  HiOutlineListBullet as ListIcon 
} from 'react-icons/hi2'

import { getResources } from '../services/resourceService'
import type { Resource } from '../services/resourceService'
import { createTicket } from '../services/ticketService'
import type { TicketRequestDTO } from '../services/ticketService'
import { SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'
import MyTicketsTab from '../components/MyTicketsTab'

const CATEGORIES = [
  'Electrical', 'Plumbing', 'IT & Network', 'AV & Projector', 
  'HVAC / Air Con', 'Furniture', 'Janitorial', 'Other'
]



export default function MaintenanceSupportPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report')
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
      // Reset form
      setFormData({
        title: '', description: '', category: '', 
        priority: 'MEDIUM', contactDetails: '', resourceId: undefined
      })
      setImages([])
      setPreviews([])
      setSelectedResource(null)
    } catch (err) {
      console.error('Failed to create ticket', err)
      alert('Error submitting report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <SectionHeader
        eyebrow="Campus Maintenance"
        title="Support Hub"
        subtitle="Report an issue or track your existing maintenance requests."
        action={
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50 transition-all"
          >
            Back to Dashboard
          </button>
        }
      />

      {/* TABS */}
      <div className="mt-8 flex border-b border-[#1F2937]">
        <button
          onClick={() => { setActiveTab('report'); setIsSuccess(false); }}
          className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition-all ${
            activeTab === 'report' 
              ? 'border-[#3B82F6] text-white' 
              : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
          }`}
        >
          <WrenchIcon className="h-5 w-5" />
          Report Incident
        </button>
        <button
          onClick={() => { setActiveTab('history'); setIsSuccess(false); }}
          className={`flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-bold transition-all ${
            activeTab === 'history' 
              ? 'border-[#3B82F6] text-white' 
              : 'border-transparent text-[#64748B] hover:text-[#94A3B8]'
          }`}
        >
          <ListIcon className="h-5 w-5" />
          My Tickets
        </button>
      </div>

      {activeTab === 'report' ? (
        <div className="mt-8 transition-all animate-in fade-in slide-in-from-bottom-2 duration-500">
          {isSuccess ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckIcon className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-bold text-white">Report Submitted!</h2>
              <p className="mt-4 text-[#94A3B8]">Your incident has been logged. You can track its progress in the "My Tickets" tab.</p>
              <button
                onClick={() => setActiveTab('history')}
                className="mt-8 rounded-xl bg-[#3B82F6] px-8 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500 active:scale-95"
              >
                View My Tickets
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className={panelLg}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-white">Title</label>
                    <input
                      required
                      type="text"
                      placeholder="Enter a descriptive title for this incident"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-2 h-11 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-white">Category</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mt-2 h-11 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 text-white focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className={panelLg}>
                <label className="block text-sm font-semibold text-white">Location / Resource</label>
                <div className="relative mt-2" ref={dropdownRef}>
                  <SearchIcon className="absolute left-3 top-3.5 h-4 w-4 text-[#475569]" />
                  <input
                    type="text"
                    placeholder="Search resources (e.g., Hall A, Lab 5...)"
                    value={selectedResource ? selectedResource.name : searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      if (selectedResource) { setSelectedResource(null); setFormData({ ...formData, resourceId: undefined }); }
                      setShowResourceList(true)
                    }}
                    onFocus={() => setShowResourceList(true)}
                    className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-10 pr-4 text-white"
                  />
                  {showResourceList && searchQuery && !selectedResource && (
                    <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-[#1F2937] bg-[#111827] shadow-2xl">
                      {filteredResources.map(res => (
                        <button key={res.id} type="button" onClick={() => { setSelectedResource(res); setFormData({ ...formData, resourceId: res.id }); setShowResourceList(false); }} className="flex w-full flex-col px-4 py-3 text-left hover:bg-[#1F2937]">
                          <span className="text-sm font-medium text-white">{res.name}</span>
                          <span className="text-xs text-[#64748B]">{res.type} · {res.location}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={panelLg}>
                <label className="block text-sm font-semibold text-white">Full Details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the incident in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] p-4 text-white outline-none focus:border-[#3B82F6]"
                />
              </div>

              <div className={panelLg}>
                <label className="block text-sm font-semibold text-white">Photos (Max 3)</label>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {previews.map((preview, i) => (
                    <div key={preview} className="group relative aspect-square overflow-hidden rounded-xl border border-[#1F2937]">
                      <img src={preview} alt="Upload preview" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 group-hover:opacity-100"><XIcon className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {images.length < 3 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1F2937] hover:border-[#3B82F6]/50 transition-all text-[#475569]">
                      <PhotoIcon className="h-8 w-8" />
                      <span className="mt-2 text-xs font-medium">Add Photo</span>
                    </button>
                  )}
                </div>
                <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              </div>

              <div className={`${tilePanel} flex gap-3 border-blue-500/20 bg-blue-500/5`}>
                <InfoIcon className="h-5 w-5 shrink-0 text-[#3B82F6]" />
                <p className="text-xs leading-relaxed text-[#94A3B8]">
                  Submission creates a formal work order. Technicians will be notified immediately of high-priority issues.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !formData.title || !formData.description}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#3B82F6] px-8 text-base font-bold text-white hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : <WrenchIcon className="h-5 w-5" />}
                  {isLoading ? 'Reporting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="transition-all animate-in fade-in slide-in-from-bottom-2 duration-500">
          <MyTicketsTab />
        </div>
      )}
    </div>
  )
}
