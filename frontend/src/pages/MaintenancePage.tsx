import { useState, useEffect, useContext } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  HiOutlineWrenchScrewdriver, 
  HiOutlineEye, 
  HiOutlinePencilSquare, 
  HiOutlineTrash,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineUserPlus,
  HiOutlineMagnifyingGlass,
  HiOutlineFunnel
} from 'react-icons/hi2'
import { AuthContext } from '../services/AuthContext'

const CATEGORIES = [
  'Electrical', 'Plumbing', 'IT & Network', 'AV & Projector', 
  'HVAC / Air Con', 'Furniture', 'Janitorial', 'Other'
]
import { Pill, SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'
import CommentSection from '../components/CommentSection'
import { 
  getAllTickets, 
  updateTicketStatus,
  updateTicket,
  deleteTicket,
  selfAssign,
  type TicketResponseDTO 
} from '../services/ticketService'
import { formatDistanceToNow } from 'date-fns'



export default function MaintenancePage() {
  const authContext = useContext(AuthContext)
  const user = authContext?.user
  
  const [searchParams] = useSearchParams()
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([])
  const [filter, setFilter] = useState<'all' | 'mine'>(searchParams.get('filter') === 'mine' ? 'mine' : 'all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  
  const [activeModal, setActiveModal] = useState<'view' | 'edit' | 'delete' | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // For Edit Form
  const [editForm, setEditForm] = useState<Partial<TicketResponseDTO>>({})

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    const q = searchParams.get('filter')
    if (q === 'mine') setFilter('mine')
    else if (q === 'all') setFilter('all')
  }, [searchParams])

  const fetchTickets = async () => {
    setIsLoading(true)
    try {
      const response = await getAllTickets()
      setTickets(response.data)
    } catch (err) {
      console.error('Failed to fetch tickets', err)
    } finally {
      setIsLoading(false)
    }
  }

  const list = tickets.filter((t) => {
    const matchesSearch = searchTerm === '' || 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter
    
    let matchesQueue = true
    if (filter === 'mine') {
       // Using == for loose comparison in case of string/number mismatch from different providers
       matchesQueue = t.assignedToId != null && user?.id != null && String(t.assignedToId) === String(user.id)
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesQueue
  })

  const handleOpenModal = (type: 'view' | 'edit' | 'delete', ticket: TicketResponseDTO) => {
    setSelectedTicket(ticket)
    setEditForm(ticket)
    setActiveModal(type)
  }

  const handleCloseModal = () => {
    setActiveModal(null)
    setSelectedTicket(null)
  }

  const handleUpdateTicket = async () => {
    if (!selectedTicket || !editForm.status) return
    try {
      // First update status if it changed
      if (editForm.status !== selectedTicket.status) {
        await updateTicketStatus(selectedTicket.id, editForm.status)
      }
      
      // Then update other fields (title, description, category, priority are required by DTO)
      await updateTicket(selectedTicket.id, {
        title: editForm.title || selectedTicket.title,
        description: editForm.description || selectedTicket.description,
        category: editForm.category || selectedTicket.category,
        priority: editForm.priority || selectedTicket.priority,
        contactDetails: editForm.contactDetails,
        resourceId: editForm.resourceId
      })
      
      await fetchTickets()
      handleCloseModal()
    } catch (err) {
      console.error('Failed to update ticket', err)
      alert('Error updating ticket. Check console for details.')
    }
  }

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return
    try {
      await deleteTicket(selectedTicket.id)
      await fetchTickets()
      handleCloseModal()
    } catch (err) {
      console.error('Failed to delete ticket', err)
      alert('Error deleting ticket. Check console for details.')
    }
  }

  const handleSelfAssign = async (ticketId: number) => {
    try {
      await selfAssign(ticketId)
      await fetchTickets()
    } catch (err) {
      console.error('Failed to self-assign ticket', err)
      alert('Error assigning ticket. Check console for details.')
    }
  }


  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Operations"
          title="Maintenance & tickets"
          subtitle="Prioritised work across campus. Hook this view to your tickets API and WebSocket stream."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/technician/dashboard"
                className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50 transition-all hover:bg-white/5"
              >
                Back to Dashboard
              </Link>

              {filter === 'all' && (
                <div className="flex rounded-xl border border-[#1F2937] bg-[#111827] p-1">
                  <button
                    onClick={() => setFilter('all')}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                      filter === 'all' ? 'bg-[#3B82F6] text-white shadow-lg' : 'text-[#64748B] hover:text-white'
                    }`}
                  >
                    All Tickets
                  </button>
                  <button
                    onClick={() => setFilter('mine')}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                      filter === 'mine' ? 'bg-[#3B82F6] text-white shadow-lg' : 'text-[#64748B] hover:text-white'
                    }`}
                  >
                    My Queue
                  </button>
                </div>
              )}
            </div>
          }
        />

        <div className="mt-8 rounded-2xl border border-[#1F2937] bg-[#0F172A] p-4 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-3 h-5 w-5 text-[#475569]" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#111827] pl-10 pr-4 text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
              />
            </div>

            {filter === 'all' && (
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter */}
                <div className="flex items-center gap-2 rounded-xl border border-[#1F2937] bg-[#111827] px-3 py-2">
                  <span className="text-[10px] font-bold uppercase text-[#475569]">Status</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ALL" className="bg-[#0F172A] text-white">All</option>
                    <option value="OPEN" className="bg-[#0F172A] text-white">Open</option>
                    <option value="IN_PROGRESS" className="bg-[#0F172A] text-white">In Progress</option>
                    <option value="RESOLVED" className="bg-[#0F172A] text-white">Resolved</option>
                    <option value="CLOSED" className="bg-[#0F172A] text-white">Closed</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-2 rounded-xl border border-[#1F2937] bg-[#111827] px-3 py-2">
                  <span className="text-[10px] font-bold uppercase text-[#475569]">Priority</span>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ALL" className="bg-[#0F172A] text-white">All</option>
                    <option value="LOW" className="bg-[#0F172A] text-white">Low</option>
                    <option value="MEDIUM" className="bg-[#0F172A] text-white">Medium</option>
                    <option value="HIGH" className="bg-[#0F172A] text-white">High</option>
                    <option value="URGENT" className="bg-[#0F172A] text-white">Urgent</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 rounded-xl border border-[#1F2937] bg-[#111827] px-3 py-2">
                  <span className="text-[10px] font-bold uppercase text-[#475569]">Category</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ALL" className="bg-[#0F172A] text-white">All</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-[#0F172A] text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {filter === 'all' && (
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <div className={tilePanel}>
              <p className="text-xs font-semibold uppercase text-[#94A3B8]">Total Tickets</p>
              <p className="mt-2 text-2xl font-bold text-white">{tickets.length}</p>
            </div>
            <div className={tilePanel}>
              <p className="text-xs font-semibold uppercase text-[#94A3B8]">Open</p>
              <p className="mt-2 text-2xl font-bold text-orange-400">
                {tickets.filter(t => t.status === 'OPEN').length}
              </p>
            </div>
            <div className={tilePanel}>
              <p className="text-xs font-semibold uppercase text-[#94A3B8]">In Progress</p>
              <p className="mt-2 text-2xl font-bold text-blue-400">
                {tickets.filter(t => t.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <div className={tilePanel}>
              <p className="text-xs font-semibold uppercase text-[#94A3B8]">Resolved</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">
                {tickets.filter(t => t.status === 'RESOLVED').length}
              </p>
            </div>
          </div>
        )}

        <ul className="mt-8 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500 mb-4"></div>
              <p>Fetching campus tickets...</p>
            </div>
          ) : (
            list.map((t) => {
              const priority = t.priority.toLowerCase()
              const borderAccent =
                priority === 'urgent' || priority === 'high'
                  ? 'border-l-red-500'
                  : priority === 'medium'
                    ? 'border-l-amber-500'
                    : 'border-l-slate-600'
              
              const updatedText = formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true })
              const assigneeText = t.assignedToName || 'Unassigned'

              return (
              <li key={t.id} className={`${panelLg} border-l-4 ${borderAccent} group transition-all hover:bg-[#1E293B]/80 hover:ring-1 hover:ring-blue-500/20`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-xs text-[#64748B]">TK-{t.id}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${
                        t.status === 'OPEN' ? 'text-blue-400' : 
                        t.status === 'IN_PROGRESS' ? 'text-amber-400' :
                        t.status === 'RESOLVED' ? 'text-emerald-400' : 'text-slate-400'
                      }`}>
                        {t.status.replace('_', ' ')}
                      </p>
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-white">{t.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#94A3B8]">
                      <span className="flex items-center gap-1.5">
                        <HiOutlineMapPin className="h-4 w-4 text-[#64748B]" />
                        {t.location || 'Campus'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HiOutlineClock className="h-4 w-4 text-[#64748B]" />
                        Updated {updatedText}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HiOutlineUser className="h-4 w-4 text-[#64748B]" />
                        {assigneeText}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <Pill
                      variant={
                        priority === 'urgent' || priority === 'high' ? 'danger' : priority === 'medium' ? 'warning' : 'default'
                      }
                    >
                      {priority.toUpperCase()}
                    </Pill>
                    
                    <div className="ml-2 flex items-center gap-1">
                      {!t.assignedToId && (user?.role === 'TECHNICIAN' || user?.role === 'ADMIN') && (
                        <button 
                          onClick={() => handleSelfAssign(t.id)}
                          className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-emerald-400 transition-all"
                          title="Self-Assign"
                        >
                          <HiOutlineUserPlus className="h-5 w-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleOpenModal('view', t)}
                        className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-[#3B82F6] transition-all"
                        title="View Details"
                      >
                        <HiOutlineEye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal('edit', t)}
                        className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-amber-400 transition-all"
                        title="Edit Ticket"
                      >
                        <HiOutlinePencilSquare className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleOpenModal('delete', t)}
                        className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-red-400 transition-all"
                        title="Delete Ticket"
                      >
                        <HiOutlineTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
              )
            })
          )}
        </ul>


        {list.length === 0 ? (
          <div className={`${panelLg} mt-8 py-12 text-center`}>
            <p className="text-[#64748B]">No tickets match this filter.</p>
          </div>
        ) : null}
      </div>

      {/* MODALS */}
      {activeModal && selectedTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={handleCloseModal}
          />
          
          {/* Content */}
          <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl border border-[#334155] bg-[#0F172A] p-0 shadow-2xl transition-all">
            
            {/* VIEW MODAL */}
            {activeModal === 'view' && (
              <div className="flex flex-col">
                <div className="flex items-center justify-between border-b border-[#1F2937] p-6">
                  <div>
                    <p className="font-mono text-xs text-[#64748B]">TK-{selectedTicket.id}</p>
                    <h2 className="mt-1 text-2xl font-bold text-white">{selectedTicket.title}</h2>
                  </div>
                  <button onClick={handleCloseModal} className="rounded-full p-2 text-[#94A3B8] hover:bg-[#1F2937] hover:text-white transition-all">
                    <HiOutlineXMark className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="max-h-[80vh] overflow-y-auto p-6 space-y-8">
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className={tilePanel}>
                        <span className="text-xs font-semibold uppercase text-[#64748B]">Status</span>
                        <p className="mt-1 font-semibold text-blue-400">{selectedTicket.status}</p>
                      </div>
                      <div className={tilePanel}>
                        <span className="text-xs font-semibold uppercase text-[#64748B]">Priority</span>
                        <p className={`mt-1 font-semibold ${
                          selectedTicket.priority.toLowerCase() === 'high' ? 'text-red-400' : 
                          selectedTicket.priority.toLowerCase() === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>{selectedTicket.priority.toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-[#64748B]">Description</h4>
                      <p className="mt-2 text-white leading-relaxed">{selectedTicket.description}</p>
                    </div>

                    {selectedTicket.imageUrls && selectedTicket.imageUrls.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold uppercase text-[#64748B] mb-3">Attached Images</h4>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                          {selectedTicket.imageUrls.map((url, i) => (
                            <div key={i} className="aspect-square overflow-hidden rounded-xl border border-[#1F2937] bg-[#0F172A]">
                              <img 
                                src={url} 
                                alt={`Attachment ${i + 1}`} 
                                className="h-full w-full object-cover transition-transform hover:scale-110 cursor-pointer" 
                                onClick={() => window.open(url, '_blank')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid gap-4 sm:grid-cols-3 text-sm pb-6">
                      <div>
                        <h4 className="font-semibold text-[#64748B]">Category</h4>
                        <p className="mt-1 text-white">{selectedTicket.category}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#64748B]">Location</h4>
                        <p className="mt-1 text-white">{selectedTicket.location || 'Campus'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#64748B]">Assignee</h4>
                        <p className="mt-1 text-white">{selectedTicket.assignedToName || 'Unassigned'}</p>
                      </div>
                    </div>
                  </div>

                  {/* COMMENT SECTION */}
                  <div className="border-t border-[#1F2937] pt-8">
                    <CommentSection ticketId={selectedTicket.id.toString()} />
                  </div>
                </div>
                
                <div className="bg-[#111827] p-6 flex justify-end">
                  <button 
                    onClick={handleCloseModal}
                    className="rounded-xl bg-[#3B82F6] px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-500 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* EDIT MODAL */}
            {activeModal === 'edit' && (
              <div className="flex flex-col">
                <div className="flex items-center justify-between border-b border-[#1F2937] p-6">
                  <h2 className="text-2xl font-bold text-white">Modify Ticket</h2>
                  <button onClick={handleCloseModal} className="rounded-full p-2 text-[#94A3B8] hover:bg-[#1F2937] hover:text-white transition-all">
                    <HiOutlineXMark className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Priority</label>
                      <select 
                        value={editForm.priority}
                        onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as any }))}
                        className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-2.5 text-white focus:border-[#3B82F6] outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Status</label>
                      <select 
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-2.5 text-white focus:border-[#3B82F6] outline-none"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Assignee</label>
                    <input 
                      type="text"
                      disabled
                      value={editForm.assignedToName || 'Unassigned'}
                      className="w-full rounded-xl border border-[#334155] bg-[#0F172A]/50 px-4 py-2.5 text-[#94A3B8] outline-none cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Internal Notes</label>
                    <textarea 
                      rows={3}
                      placeholder="Add resolution notes or technical updates..."
                      className="w-full rounded-xl border border-[#334155] bg-[#0F172A] p-4 text-white focus:border-[#3B82F6] outline-none resize-none"
                    />
                  </div>
                </div>
                
                <div className="bg-[#111827] p-6 flex justify-end gap-3">
                  <button 
                    onClick={handleCloseModal}
                    className="rounded-xl border border-[#334155] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1F2937] transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdateTicket}
                    className="rounded-xl bg-[#3B82F6] px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-500 transition-all flex items-center gap-2"
                  >
                    <HiOutlineCheckCircle className="h-5 w-5" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* DELETE MODAL */}
            {activeModal === 'delete' && (
              <div className="flex flex-col">
                <div className="p-8 text-center sm:text-left">
                  <div className="mx-auto sm:mx-0 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-500 mb-6">
                    <HiOutlineExclamationTriangle className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Delete Ticket?</h2>
                  <p className="mt-3 text-[#94A3B8] leading-relaxed">
                    Are you sure you want to delete <span className="font-bold text-white">TK-{selectedTicket.id}</span>? 
                    This action will permanently remove it from the operations board. This cannot be undone.
                  </p>
                </div>
                
                <div className="bg-[#111827] p-6 flex flex-col sm:flex-row justify-end gap-3">
                  <button 
                    onClick={handleCloseModal}
                    className="rounded-xl border border-[#334155] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1F2937] transition-all order-2 sm:order-1"
                  >
                    Keep Ticket
                  </button>
                  <button 
                    onClick={handleDeleteTicket}
                    className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    <HiOutlineTrash className="h-5 w-5" />
                    Delete Permanently
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

