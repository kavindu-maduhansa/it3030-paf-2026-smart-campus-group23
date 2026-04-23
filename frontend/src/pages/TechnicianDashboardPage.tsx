import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  HiOutlineBolt,
  HiOutlineClipboardDocumentList,
  HiOutlineMapPin,
  HiOutlineBellAlert,
  HiOutlineUserCircle,
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineUserPlus,
  HiOutlineXMark,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'
import { DashboardDecor, Pill, SectionHeader, panelLg, tilePanel, featureCard, iconBase } from './dashboard/dashboardUi'
import { useAuth } from '../services/useAuth'
import { 
  getAssignedTickets, 
  updateTicket,
  deleteTicket,
  selfAssign,
  type TicketResponseDTO 
} from '../services/ticketService'
import { formatDistanceToNow } from 'date-fns'




export default function TechnicianDashboardPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null)
  const [activeModal, setActiveModal] = useState<'view' | 'edit' | 'delete' | null>(null)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    status: '',
    contactDetails: ''
  })
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<number[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  const firstName = user?.name?.split(' ')[0] ?? 'Technician'

  useEffect(() => {
    fetchMyTickets()
  }, [])

  const fetchMyTickets = async () => {
    try {
      const response = await getAssignedTickets()
      setTickets(response.data)
    } catch (error) {
      console.error('Failed to fetch assigned tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseModal = () => {
    setActiveModal(null)
    setSelectedTicket(null)
    setSelectedFiles([])
    setRemovedAttachmentIds([])
    setIsUpdating(false)
  }

  const handleOpenEdit = (t: TicketResponseDTO) => {
    setSelectedTicket(t)
    setEditForm({
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      status: t.status,
      contactDetails: t.contactDetails || ''
    })
    setActiveModal('edit')
  }

  const handleUpdateTicket = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedTicket) return
    setIsUpdating(true)
    try {
      await updateTicket(selectedTicket.id, {
        ...editForm,
        removedAttachmentIds
      }, selectedFiles)
      fetchMyTickets()
      handleCloseModal()
    } catch (err) {
      console.error('Update failed', err)
      alert('Failed to update ticket.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return
    try {
      await deleteTicket(selectedTicket.id)
      fetchMyTickets()
      handleCloseModal()
    } catch (err) {
      console.error('Delete failed', err)
      alert('Failed to delete ticket.')
    }
  }

  const handleSelfAssign = async (ticketId: number) => {
    try {
      await selfAssign(ticketId)
      fetchMyTickets()
    } catch (err) {
      console.error('Self assignment failed', err)
      alert('Failed to self-assign.')
    }
  }


  return (
    <DashboardDecor>
      {/* Hero / Header */}
      <section className="pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F97316]">
              Smart Campus · Technician Control
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Terminal: <span className="text-[#3B82F6]">{firstName}</span>
            </h1>
            <p className="mt-2 text-sm text-[#94A3B8] sm:text-base">
              Monitor campus health, manage high-priority maintenance tickets, and track SLA performance.
            </p>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Link to="/maintenance" className={featureCard}>
             <span className={`${iconBase} bg-blue-500/10 text-blue-500`}>
                <HiOutlineClipboardDocumentList className="h-7 w-7" />
             </span>
             <h3 className="text-lg font-bold text-white">All Tickets</h3>
             <p className="mt-2 text-sm text-[#94A3B8]">Browse and manage all campus maintenance requests.</p>
             <span className="mt-4 text-sm font-semibold text-[#3B82F6] opacity-0 transition-opacity group-hover:opacity-100">
                View All →
             </span>
          </Link>

          <Link to="/maintenance?filter=mine" className={featureCard}>
             <span className={`${iconBase} bg-emerald-500/10 text-emerald-500`}>
                <HiOutlineUserCircle className="h-7 w-7" />
             </span>
             <h3 className="text-lg font-bold text-white">My Jobs</h3>
             <p className="mt-2 text-sm text-[#94A3B8]">Quickly access tickets assigned to your active queue.</p>
             <span className="mt-4 text-sm font-semibold text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100">
                My Queue →
             </span>
          </Link>
        </div>

      </section>

      {/* Main Content Grid */}
      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Work Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className={panelLg}>
             <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2 text-xl font-bold text-white">
                  <HiOutlineClipboardDocumentList className="h-6 w-6 text-[#3B82F6]" />
                  Active Work Queue
                </h3>
             </div>
             
             <div className="space-y-4">
                {isLoading ? (
                  <div className="py-12 text-center text-[#64748B]">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500 mb-4"></div>
                    <p>Connecting to database...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="py-12 text-center rounded-xl border border-dashed border-[#1F2937] bg-[#0F172A]/30">
                    <p className="text-[#64748B]">Your queue is clear. No active jobs assigned.</p>
                  </div>
                ) : (
                  tickets.slice(0, 4).map((t) => (
                    <li 
                      key={t.id} 
                      className="group relative list-none overflow-hidden rounded-2xl border border-[#1F2937] bg-[#0F172A] p-5 transition-all hover:border-[#3B82F6]/50 hover:shadow-2xl hover:shadow-blue-500/10"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 gap-4">
                          {/* Left: Status Icon */}
                          <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            t.status === 'OPEN' ? 'bg-orange-500/10 text-orange-500' :
                            t.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                            'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            <HiOutlineBolt className="h-5 w-5" />
                          </div>

                          <div className="flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-[#475569]">TK-{t.id}</span>
                              <Pill variant={t.priority === 'URGENT' || t.priority === 'HIGH' ? 'danger' : t.priority === 'MEDIUM' ? 'warning' : 'default'}>
                                {t.priority}
                              </Pill>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                t.status === 'OPEN' ? 'text-orange-400' :
                                t.status === 'IN_PROGRESS' ? 'text-blue-400' :
                                t.status === 'RESOLVED' ? 'text-emerald-400' :
                                t.status === 'REJECTED' ? 'text-red-400' : 'text-slate-400'
                              }`}>
                                {t.status.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#3B82F6]">
                              {t.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-xs font-medium text-[#64748B]">
                              <span className="flex items-center gap-1.5">
                                <HiOutlineUser className="h-3.5 w-3.5" />
                                {t.userName}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <HiOutlineMapPin className="h-3.5 w-3.5" />
                                {t.resourceName || t.location}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <HiOutlineClock className="h-3.5 w-3.5" />
                                {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:ml-4">
                          <button 
                            onClick={() => { setSelectedTicket(t); setActiveModal('view'); }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F2937] bg-[#111827] text-[#64748B] transition-all hover:border-[#3B82F6] hover:text-[#3B82F6] hover:shadow-lg hover:shadow-blue-500/10"
                            title="View"
                          >
                            <HiOutlineEye className="h-5 w-5" />
                          </button>
                          {t.status !== 'REJECTED' && (
                            <button 
                              onClick={() => handleOpenEdit(t)}
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F2937] bg-[#111827] text-[#64748B] transition-all hover:border-amber-500/50 hover:text-amber-500 hover:shadow-lg hover:shadow-amber-500/10"
                              title="Update"
                            >
                              <HiOutlinePencilSquare className="h-5 w-5" />
                            </button>
                          )}
                          {!t.assignedToId && (
                            <button 
                              onClick={() => handleSelfAssign(t.id)}
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F2937] bg-[#111827] text-[#64748B] transition-all hover:border-emerald-500/50 hover:text-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10"
                              title="Claim Ticket"
                            >
                              <HiOutlineUserPlus className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))
                )}
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className={`${tilePanel} border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent`}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <HiOutlineBellAlert className="h-5 w-5 text-rose-500" />
              Critical Alerts
            </h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-rose-500/20 bg-[#0F172A] p-3">
                <p className="text-xs font-bold text-rose-400 uppercase">Emergency - Power</p>
                <p className="mt-1 text-sm text-[#CBD5E1]">Fluctuating voltage in IT Lab 2.</p>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* MODALS */}
      {activeModal && selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleCloseModal} />
          <div className="relative w-full max-w-4xl transform overflow-hidden rounded-[2.5rem] border border-[#334155] bg-[#0F172A] shadow-2xl transition-all">
            
            {activeModal === 'view' && (
              <div className="flex flex-col">
                {/* Content */}
                <div className="p-8 lg:p-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#475569]">TK-{selectedTicket.id}</span>
                      <Pill variant={selectedTicket.priority === 'HIGH' || selectedTicket.priority === 'URGENT' ? 'danger' : 'warning'}>
                        {selectedTicket.priority}
                      </Pill>
                    </div>
                    <button onClick={handleCloseModal} className="rounded-full bg-white/5 p-2 text-[#64748B] hover:text-white transition-colors">
                      <HiOutlineXMark className="h-6 w-6" />
                    </button>
                  </div>

                  <h2 className="text-3xl font-bold text-white leading-tight">{selectedTicket.title}</h2>
                  
                  <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6 border-y border-[#1F2937]/50 py-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#475569]">Reporter</p>
                      <p className="mt-1 text-sm font-bold text-white">{selectedTicket.userName || 'Anonymous'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#475569]">Location</p>
                      <p className="mt-1 flex items-center gap-2 text-sm font-bold text-white">
                        <HiOutlineMapPin className="h-4 w-4 text-[#3B82F6]" />
                        {selectedTicket.resourceName || selectedTicket.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#475569]">Status</p>
                      <p className={`mt-1 text-sm font-black uppercase tracking-wider ${
                        selectedTicket.status === 'REJECTED' ? 'text-rose-500' : 'text-[#3B82F6]'
                      }`}>{selectedTicket.status.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#475569]">Logged</p>
                      <p className="mt-1 text-sm font-bold text-white">{formatDistanceToNow(new Date(selectedTicket.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>

                  <div className="mt-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#475569]">Incident Details</p>
                    <p className="mt-4 text-base leading-relaxed text-[#94A3B8] font-medium">{selectedTicket.description}</p>
                  </div>

                  {selectedTicket.imageUrls && selectedTicket.imageUrls.length > 0 && (
                    <div className="mt-10">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#475569] mb-4">Evidence & Photos</p>
                      <div className="flex flex-wrap gap-4">
                        {selectedTicket.imageUrls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer" className="relative group overflow-hidden rounded-3xl border border-[#1F2937] hover:border-[#3B82F6]/50 transition-all">
                            <img src={url} alt="Attachment" className="h-32 w-32 object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <HiOutlineEye className="text-white h-6 w-6" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeModal === 'edit' && (
              <form onSubmit={handleUpdateTicket} className="flex flex-col">
                <div className="flex items-center justify-between border-b border-[#1F2937] p-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Edit Ticket Details</h2>
                    <p className="mt-1 text-sm text-[#64748B]">Update essential information and manage attachments.</p>
                  </div>
                  <button type="button" onClick={handleCloseModal} className="rounded-full bg-white/5 p-2 text-[#64748B] hover:text-white transition-colors">
                    <HiOutlineXMark className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  <div className="max-w-md mx-auto space-y-8">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">Ticket Status</label>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
                          <button 
                            key={s} type="button"
                            onClick={() => setEditForm({...editForm, status: s})}
                            className={`flex-1 rounded-2xl border py-3 text-xs font-bold transition-all ${
                              editForm.status === s 
                              ? 'border-[#3B82F6] bg-blue-500/10 text-[#3B82F6] shadow-lg shadow-blue-500/10' 
                              : 'border-[#1F2937] bg-[#0F172A] text-[#475569] hover:border-[#334155]'
                            }`}
                          >
                            {s.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#475569]">Priority Level</label>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(p => (
                          <button 
                            key={p} type="button"
                            onClick={() => setEditForm({...editForm, priority: p})}
                            className={`flex-1 rounded-2xl border py-3 text-xs font-bold transition-all ${
                              editForm.priority === p 
                              ? 'border-[#3B82F6] bg-blue-500/10 text-[#3B82F6] shadow-lg shadow-blue-500/10' 
                              : 'border-[#1F2937] bg-[#0F172A] text-[#475569] hover:border-[#334155]'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#1F2937] bg-[#111827]/50 p-8 flex justify-end gap-4">
                  <button type="button" onClick={handleCloseModal} className="rounded-2xl border border-[#334155] px-8 py-3 text-sm font-bold text-white hover:bg-white/5 transition-all">
                    Discard Changes
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="rounded-2xl bg-[#3B82F6] px-10 py-3 text-sm font-bold text-white hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Update Ticket'}
                  </button>
                </div>
              </form>
            )}

            {activeModal === 'delete' && (
              <div className="flex flex-col items-center p-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 shadow-inner">
                  <HiOutlineExclamationTriangle className="h-10 w-10" />
                </div>
                <h2 className="mt-8 text-3xl font-bold text-white">Permanent Deletion</h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-[#94A3B8]">
                  Are you absolutely sure? This will permanently remove ticket <span className="font-mono font-bold text-white">TK-{selectedTicket.id}</span> from the campus records. This operation cannot be reversed.
                </p>
                <div className="mt-12 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                  <button onClick={handleCloseModal} className="rounded-2xl border border-[#334155] px-10 py-3.5 text-sm font-bold text-white hover:bg-white/5 transition-all order-2 sm:order-1">
                    Keep Ticket
                  </button>
                  <button onClick={handleDeleteTicket} className="rounded-2xl bg-rose-600 px-10 py-3.5 text-sm font-bold text-white hover:bg-rose-500 hover:shadow-2xl hover:shadow-rose-500/30 transition-all order-1 sm:order-2">
                    Confirm Deletion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardDecor>
  )
}
