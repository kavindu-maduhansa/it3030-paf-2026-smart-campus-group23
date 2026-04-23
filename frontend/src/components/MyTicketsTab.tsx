import { useState, useEffect } from 'react'
import { HiOutlineClock, HiOutlineMapPin, HiOutlineChatBubbleLeftRight, HiOutlineEye, HiOutlinePencilSquare, HiOutlineXMark, HiOutlineCheckCircle, HiOutlineUser, HiOutlinePlus } from 'react-icons/hi2'
import { getMyTickets, updateTicketStatus, updateTicket } from '../services/ticketService'
import type { TicketResponseDTO } from '../services/ticketService'
import { Pill, panelLg, tilePanel } from '../pages/dashboard/dashboardUi'

const CATEGORIES = [
  'Electrical', 'Plumbing', 'IT & Network', 'AV & Projector', 
  'HVAC / Air Con', 'Furniture', 'Janitorial', 'Other'
]

export default function MyTicketsTab() {
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null)
  const [activeModal, setActiveModal] = useState<'view' | 'edit' | null>(null)
  const [editForm, setEditForm] = useState<Partial<TicketResponseDTO>>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([])
  const [newImages, setNewImages] = useState<File[]>([])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const response = await getMyTickets()
      setTickets(response.data)
    } catch (err) {
      console.error('Failed to load my tickets', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTickets()
  }, [])

  const handleOpenModal = async (type: 'view' | 'edit', ticket: TicketResponseDTO) => {
    try {
      console.log('Opening modal:', type, ticket.id)
      setSelectedTicket(ticket)
      setEditForm(ticket)
      setActiveModal(type)
      
      setRemovedImageIds([])
      setNewImages([])
    } catch (err) {
      console.error('Failed to open modal', err)
    }
  }

  const handleCloseModal = () => {
    setActiveModal(null)
    setSelectedTicket(null)
  }

  const handleUpdateStatus = async (status: string, ticketId?: number) => {
    const id = ticketId || selectedTicket?.id
    if (!id) return
    
    try {
      setIsUpdating(true)
      await updateTicketStatus(id, status)
      await loadTickets()
      if (activeModal) handleCloseModal()
    } catch (err) {
      console.error('Failed to update status', err)
      alert('Error updating ticket status.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedTicket) return
    try {
      setIsUpdating(true)
      await updateTicket(selectedTicket.id, {
        title: editForm.title || selectedTicket.title,
        description: editForm.description || selectedTicket.description,
        category: editForm.category || selectedTicket.category,
        priority: selectedTicket.priority,
        contactDetails: editForm.contactDetails,
        resourceId: editForm.resourceId,
        removedAttachmentIds: removedImageIds
      }, newImages)
      await loadTickets()
      handleCloseModal()
    } catch (err) {
      console.error('Failed to save edit', err)
      alert('Error saving changes.')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex py-20 justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#3B82F6]" />
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className={`${panelLg} py-16 text-center mt-6`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1F2937] text-[#475569] mb-4">
          <HiOutlineChatBubbleLeftRight className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-white">No tickets yet</h3>
        <p className="mt-2 text-[#94A3B8]">When you report an incident, it will appear here for you to track.</p>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-4 pb-12">
      {tickets.map((t) => (
        <div 
          key={t.id} 
          className={`${panelLg} border-l-4 ${
            t.priority === 'URGENT' || t.priority === 'HIGH' ? 'border-l-red-500' : 
            t.priority === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-slate-600'
          } group transition-all hover:bg-[#1E293B]/80 hover:ring-1 hover:ring-blue-500/20`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <p className="font-mono text-xs text-[#64748B]">TK-{t.id}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                  t.status === 'OPEN' ? 'text-blue-400' : 
                  t.status === 'IN_PROGRESS' ? 'text-amber-400' :
                  t.status === 'RESOLVED' ? 'text-emerald-400' :
                  t.status === 'REJECTED' ? 'text-red-400' : 'text-slate-400'
                }`}>
                  {t.status.replace('_', ' ')}
                </p>
              </div>
              <h3 className="mt-1 text-lg font-semibold text-white truncate">{t.title}</h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#94A3B8]">
                <span className="flex items-center gap-1.5">
                  <HiOutlineMapPin className="h-4 w-4 text-[#64748B]" />
                  {t.resourceName || 'Smart Campus'}
                </span>
                <span className="flex items-center gap-1.5">
                  <HiOutlineClock className="h-4 w-4 text-[#64748B]" />
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end sm:self-start">
              <Pill
                variant={
                  t.priority === 'URGENT' || t.priority === 'HIGH' ? 'danger' : t.priority === 'MEDIUM' ? 'warning' : 'default'
                }
              >
                {t.priority}
              </Pill>
              
              <button 
                onClick={() => handleOpenModal('view', t)}
                className="ml-2 rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-[#3B82F6] transition-all"
                title="View Details"
              >
                <HiOutlineEye className="h-5 w-5" />
              </button>
              
              {t.status !== 'CLOSED' && t.status !== 'REJECTED' && (
                <>
                  {!t.assignedToId && (
                    <button 
                      onClick={() => handleOpenModal('edit', t)}
                      className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-amber-400 transition-all"
                      title="Edit Ticket"
                    >
                      <HiOutlinePencilSquare className="h-5 w-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to close this ticket?')) {
                        handleUpdateStatus('CLOSED', t.id)
                      }
                    }}
                    className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-emerald-400 transition-all"
                    title="Close Ticket"
                  >
                    <HiOutlineCheckCircle className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Detail Modal */}
      {activeModal && selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col rounded-3xl border border-[#1F2937] bg-[#0F172A] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1F2937] p-6">
              <div>
                <p className="font-mono text-xs text-[#64748B]">TK-{selectedTicket.id}</p>
                <h2 className="mt-1 text-2xl font-bold text-white">
                  {activeModal === 'view' ? 'Ticket Details' : 'Edit Ticket'}
                </h2>
              </div>
              <button onClick={handleCloseModal} className="rounded-full p-2 hover:bg-[#1F2937] text-[#94A3B8]">
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
              {activeModal === 'view' ? (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className={tilePanel}>
                      <span className="text-xs font-semibold uppercase text-[#64748B]">Status</span>
                      <p className={`mt-1 font-semibold ${
                        selectedTicket.status === 'OPEN' ? 'text-blue-400' :
                        selectedTicket.status === 'IN_PROGRESS' ? 'text-amber-400' :
                        selectedTicket.status === 'RESOLVED' ? 'text-emerald-400' :
                        selectedTicket.status === 'REJECTED' ? 'text-red-400' : 'text-slate-400'
                      }`}>{selectedTicket.status}</p>
                    </div>
                    <div className={tilePanel}>
                      <span className="text-xs font-semibold uppercase text-[#64748B]">Category</span>
                      <p className="mt-1 font-semibold text-white">{selectedTicket.category}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold uppercase text-[#64748B]">Issue Description</h4>
                    <p className="mt-2 text-lg text-white font-medium">{selectedTicket.title}</p>
                    <p className="mt-2 text-[#94A3B8] leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>

                   <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <h4 className="font-semibold text-[#64748B]">Resource/Location</h4>
                      <div className="mt-2 flex items-center gap-2 text-white">
                        <HiOutlineMapPin className="h-4 w-4 text-[#3B82F6]" />
                        {selectedTicket.resourceName || 'General Campus'}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#64748B]">Reporter</h4>
                      <div className="mt-2 flex items-center gap-2 text-white">
                        <HiOutlineUser className="h-4 w-4 text-[#3B82F6]" />
                        {selectedTicket.userName || 'Anonymous'}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#64748B]">Assigned Technician</h4>
                      <div className="mt-2 flex items-center gap-2 text-white">
                        <HiOutlineUser className="h-4 w-4 text-amber-500" />
                        {selectedTicket.assignedToName || 'Awaiting assignment'}
                      </div>
                    </div>
                  </div>

                  {/* Attached Images */}
                  {selectedTicket.imageUrls && selectedTicket.imageUrls.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-sm font-semibold uppercase text-[#64748B] mb-3">Attachments</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {selectedTicket.imageUrls.map((url, i) => (
                          <div key={i} className="aspect-square overflow-hidden rounded-xl border border-[#1F2937] bg-[#111827]">
                            <img 
                              src={url} 
                              alt="Ticket attachment" 
                              className="h-full w-full object-cover transition-transform hover:scale-105 cursor-pointer"
                              onClick={() => window.open(url, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-white">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="mt-2 h-11 w-full rounded-xl border border-[#1F2937] bg-[#111827] px-4 text-white focus:border-[#3B82F6] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white">Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        className="mt-2 h-11 w-full rounded-xl border border-[#1F2937] bg-[#111827] px-4 text-white focus:border-[#3B82F6] focus:outline-none cursor-pointer"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat} className="bg-[#0F172A] text-white">
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white">Description</label>
                    <textarea
                      rows={6}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-[#1F2937] bg-[#111827] p-4 text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>

                  {/* Image Management in Edit Modal */}
                  <div>
                    <h4 className="text-sm font-semibold uppercase text-[#64748B] mb-3">Manage Images (Max 3 Total)</h4>
                    
                    {/* Existing Images */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      {selectedTicket.attachments?.map((att) => (
                        !removedImageIds.includes(att.id) && (
                          <div key={att.id} className="relative aspect-square overflow-hidden rounded-xl border border-[#1F2937] bg-[#111827]">
                            <img src={att.url} alt={att.name} className="h-full w-full object-cover opacity-60" />
                            <button 
                              onClick={() => setRemovedImageIds([...removedImageIds, att.id])}
                              className="absolute top-1 right-1 rounded-full bg-red-500/80 p-1 text-white hover:bg-red-600"
                            >
                              <HiOutlineXMark className="h-4 w-4" />
                            </button>
                          </div>
                        )
                      ))}
                      
                      {/* New Image Previews */}
                      {newImages.map((file, i) => (
                        <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-[#3B82F6]/30 bg-[#111827]">
                          <img src={URL.createObjectURL(file)} alt="new preview" className="h-full w-full object-cover" />
                          <button 
                            onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))}
                            className="absolute top-1 right-1 rounded-full bg-red-500/80 p-1 text-white hover:bg-red-600"
                          >
                            <HiOutlineXMark className="h-4 w-4" />
                          </button>
                        </div>
                      ))}

                      {/* Add Button */}
                      {(selectedTicket.attachments?.length || 0) - removedImageIds.length + newImages.length < 3 && (
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#1F2937] bg-[#111827] text-[#475569] hover:border-[#3B82F6]/50 hover:text-[#3B82F6] transition-all">
                          <HiOutlinePlus className="h-6 w-6 mb-1" />
                          <span className="text-[10px] font-bold">Add</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setNewImages([...newImages, e.target.files[0]])
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#1F2937] p-6 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="rounded-xl border border-[#1F2937] px-6 py-2.5 text-sm font-bold text-[#94A3B8] hover:bg-[#1F2937]"
              >
                Cancel
              </button>
              {activeModal === 'edit' && (
                <button
                  disabled={isUpdating}
                  onClick={handleSaveEdit}
                  className="rounded-xl bg-[#3B82F6] px-8 py-2.5 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              {activeModal === 'view' && selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'REJECTED' && (
                <button
                  disabled={isUpdating}
                  onClick={() => {
                    if (confirm('Are you sure you want to close this ticket?')) {
                      handleUpdateStatus('CLOSED', selectedTicket.id)
                    }
                  }}
                  className="rounded-xl bg-emerald-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-emerald-500"
                >
                  Close Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
