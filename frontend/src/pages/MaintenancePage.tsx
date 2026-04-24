import { useState, useEffect, useContext } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import {
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
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi2'
import { AuthContext } from '../services/AuthContext'
import { apiClient } from '../services/axiosConfig'
import type { User } from '../services/authService'

const CATEGORIES = [
  'Electrical', 'Plumbing', 'IT & Network', 'AV & Projector',
  'HVAC / Air Con', 'Furniture', 'Janitorial', 'Other'
]
import { Pill, SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'
import {
  getAllTickets,
  updateTicketStatus,
  updateTicket,
  deleteTicket,
  selfAssign,
  assignTechnician,
  unassignTechnician,
  type TicketResponseDTO
} from '../services/ticketService'
import { formatDistanceToNow } from 'date-fns'
import CommentSection from '../components/CommentSection'
import ConfirmModal from '../components/ConfirmModal'



export default function MaintenancePage() {
  const authContext = useContext(AuthContext)
  const user = authContext?.user
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN'
  const isTechnician = user?.role?.toUpperCase() === 'TECHNICIAN'

  const [searchParams] = useSearchParams()
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  const [activeModal, setActiveModal] = useState<'view' | 'edit' | 'delete' | 'assign' | 'alert' | 'reject' | 'confirm' | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketResponseDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [technicians, setTechnicians] = useState<User[]>([])
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type?: 'error' | 'warning' | 'info' }>({
    title: '',
    message: '',
    type: 'info'
  })
  const [rejectionReason, setRejectionReason] = useState('')
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info'
  }>({ title: '', message: '', onConfirm: () => { } })
  const [showCommentPrompt, setShowCommentPrompt] = useState(false)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // For Edit Form
  const [editForm, setEditForm] = useState<Partial<TicketResponseDTO>>({
    category: '',
    priority: '',
    status: '',
    contactDetails: '',
    resolutionNotes: '',
    assignedToId: null
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter])

  useEffect(() => {
    // We no longer use the filter search param here to avoid getting stuck in a partial view
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
    const search = searchTerm.toLowerCase().trim()
    const idSearch = search.startsWith('tk-') ? search.replace('tk-', '') : search

    const matchesSearch = search === '' ||
      t.title.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search) ||
      t.id.toString().includes(idSearch) ||
      (t.userName && t.userName.toLowerCase().includes(search)) ||
      (t.assignedToName && t.assignedToName.toLowerCase().includes(search))

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter

    let matchesQueue = true

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesQueue
  })

  // Pagination Logic
  const totalPages = Math.ceil(list.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedList = list.slice(startIndex, startIndex + itemsPerPage)

  const showAlert = (title: string, message: string, type: 'error' | 'warning' | 'info' = 'info') => {
    if (type === 'error') toast.error(`${title}: ${message}`)
    else if (type === 'warning') toast(message, { icon: '⚠️' })
    else toast.success(message)
  }

  const handleOpenModal = async (type: 'view' | 'edit' | 'delete' | 'assign', ticket: TicketResponseDTO) => {
    setSelectedTicket(ticket)
    if (type === 'edit' && isTechnician && !ticket.assignedToId) {
      showAlert(
        "Action Restricted",
        "This ticket is currently unassigned. Technicians can only edit tickets that are assigned to them. Please self-assign the ticket first.",
        "warning"
      )
      return
    }

    if (type === 'delete' && isTechnician) {
      showAlert(
        "Action Restricted",
        "Technicians do not have permission to delete tickets. Please contact an administrator if a ticket needs to be removed.",
        "error"
      )
      return
    }

    if (type === 'edit') setEditForm(ticket)
    if (type === 'assign') {
      try {
        const res = await apiClient.get<User[]>('/api/admin/users')
        setTechnicians(res.data.filter(u => u.role === 'TECHNICIAN'))
      } catch (err) {
        console.error('Failed to fetch technicians', err)
      }
    }
    setActiveModal(type)
  }

  const handleCloseModal = () => {
    setActiveModal(null)
    setSelectedTicket(null)
    setShowCommentPrompt(false)
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
        contactDetails: editForm.contactDetails || '',
        resolutionNotes: editForm.resolutionNotes || '',
        resourceId: editForm.resourceId
      })

      await fetchTickets()
      
      if (editForm.status === 'CLOSED' || editForm.status === 'REJECTED') {
        const updated = tickets.find(t => t.id === selectedTicket.id) || selectedTicket
        setSelectedTicket({ ...updated, status: editForm.status })
        setActiveModal('view')
        setShowCommentPrompt(true)
        toast.success('Ticket closed and finalized.')
      } else {
        handleCloseModal()
        toast.success('Ticket updated successfully')
      }
    } catch (err) {
      console.error('Failed to update ticket', err)
      showAlert("Update Failed", "There was an error updating the ticket. Please check the console for details.", "error")
    }
  }

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return
    try {
      await deleteTicket(selectedTicket.id)
      await fetchTickets()
      handleCloseModal()
      toast.success('Ticket deleted successfully')
    } catch (err) {
      console.error('Failed to delete ticket', err)
      showAlert("Deletion Failed", "There was an error deleting the ticket.", "error")
    }
  }

  const handleSelfAssign = async (ticketId: number) => {
    try {
      await selfAssign(ticketId)
      await fetchTickets()
      toast.success('Ticket assigned to you')
    } catch (err) {
      console.error('Failed to self-assign ticket', err)
      showAlert("Assignment Failed", "Could not self-assign the ticket.", "error")
    }
  }

  const handleAssignToTechnician = async (technicianId: number) => {
    if (!selectedTicket) return
    try {
      await assignTechnician(selectedTicket.id, technicianId)
      await fetchTickets()
      handleCloseModal()
    } catch (err) {
      console.error('Failed to assign technician', err)
      showAlert("Assignment Failed", "Could not assign the technician.", "error")
    }
  }

  const handleUnassign = async () => {
    if (!selectedTicket) return
    try {
      await unassignTechnician(selectedTicket.id)
      await fetchTickets()
      handleCloseModal()
    } catch (err) {
      console.error('Failed to unassign ticket', err)
      showAlert("Unassignment Failed", "Could not unassign the technician.", "error")
    }
  }

  const handleRejectTicket = async () => {
    if (!selectedTicket || !rejectionReason.trim()) {
      setAlertConfig({
        title: "Reason Required",
        message: "Please provide a reason for rejection so the reporter knows why.",
        type: 'warning'
      })
      setActiveModal('alert')
      return
    }

    setConfirmConfig({
      title: "Confirm Rejection",
      message: `Are you sure you want to reject ticket TK-${selectedTicket.id}? This action cannot be undone.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          // Send rejection reason in resolutionNotes field
          await updateTicket(selectedTicket.id, {
            title: selectedTicket.title,
            description: selectedTicket.description,
            category: selectedTicket.category,
            priority: selectedTicket.priority,
            status: 'REJECTED',
            contactDetails: selectedTicket.contactDetails,
            resourceId: selectedTicket.resourceId,
            resolutionNotes: rejectionReason
          })
          await fetchTickets()
          setActiveModal('view')
          setShowCommentPrompt(true)
          setRejectionReason('')
        } catch (err) {
          console.error('Failed to reject ticket', err)
          showAlert("Action Failed", "Could not reject the ticket.", "error")
        }
      }
    })
    setActiveModal('confirm')
  }


  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Operations"
          title="Maintenance & tickets"
          subtitle="Browse and manage all the maintenance tickets."
          action={
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/technician/dashboard"
                className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50 transition-all hover:bg-white/5"
              >
                Back to Dashboard
              </Link>
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
                placeholder="Search by Title, ID (e.g. TK-10), Reporter or Assignee..."
                className="h-11 w-full rounded-xl border border-[#1F2937] bg-[#0F172A] pl-10 pr-4 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

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
                  <option value="REJECTED" className="bg-[#0F172A] text-white">Rejected</option>
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
          </div>
        </div>

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

        <ul className="mt-8 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500 mb-4"></div>
              <p>Fetching campus tickets...</p>
            </div>
          ) : (
            paginatedList.map((t) => {
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
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${t.status === 'OPEN' ? 'text-blue-400' :
                            t.status === 'IN_PROGRESS' ? 'text-amber-400' :
                              t.status === 'RESOLVED' ? 'text-emerald-400' : 
                                t.status === 'REJECTED' ? 'text-red-400' : 'text-slate-400'
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
                          {t.userName || 'Anonymous'}
                        </span>
                        <span className="flex items-center gap-1.5 border-l border-[#1F2937] pl-4">
                          <span className="text-[#64748B]">Assigned:</span>
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
                        {((!t.assignedToId && isTechnician && t.status !== 'REJECTED') || isAdmin) && (
                          <button
                            onClick={() => isAdmin ? handleOpenModal('assign', t) : handleSelfAssign(t.id)}
                            className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-emerald-400 transition-all"
                            title={isAdmin ? "Assign Technician" : "Self-Assign"}
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
                        {(isAdmin || (isTechnician && t.status !== 'REJECTED')) && (
                          <button
                            onClick={() => handleOpenModal('edit', t)}
                            className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-amber-400 transition-all"
                            title="Edit Ticket"
                          >
                            <HiOutlinePencilSquare className="h-5 w-5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenModal('delete', t)}
                            className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-red-400 transition-all"
                            title="Delete Ticket"
                          >
                            <HiOutlineTrash className="h-5 w-5" />
                          </button>
                        )}
                        {isAdmin && t.status !== 'REJECTED' && (
                          <button
                            onClick={() => {
                              setSelectedTicket(t)
                              setRejectionReason('')
                              setActiveModal('reject')
                            }}
                            className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-rose-500 transition-all"
                            title="Reject Ticket"
                          >
                            <HiOutlineXMark className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              )
            })
          )}
        </ul>


        {list.length > 0 && (
          <div className="mt-8 flex items-center justify-between border-t border-[#1F2937] pt-6">
            <p className="text-sm text-[#64748B]">
              Showing <span className="font-medium text-white">{startIndex + 1}</span> to{' '}
              <span className="font-medium text-white">
                {Math.min(startIndex + itemsPerPage, list.length)}
              </span>{' '}
              of <span className="font-medium text-white">{list.length}</span> tickets
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F2937] bg-[#111827] text-[#94A3B8] transition-all hover:bg-[#1E293B] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <HiOutlineChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  // Only show current, first, last, and neighbors if many pages
                  if (
                    totalPages > 7 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) > 1
                  ) {
                    if (Math.abs(page - currentPage) === 2) return <span key={page} className="px-1 text-[#475569]">...</span>
                    return null
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-10 w-10 rounded-xl text-sm font-bold transition-all ${currentPage === page
                          ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-500/20'
                          : 'border border-[#1F2937] bg-[#111827] text-[#64748B] hover:border-[#334155] hover:text-white'
                        }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1F2937] bg-[#111827] text-[#94A3B8] transition-all hover:bg-[#1E293B] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <HiOutlineChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {list.length === 0 ? (
          <div className={`${panelLg} mt-8 py-12 text-center`}>
            <p className="text-[#64748B]">No tickets match this filter.</p>
          </div>
        ) : null}
      </div>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseModal}
          />

          {/* Content */}
          <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl border border-[#334155] bg-[#0F172A] p-0 shadow-2xl transition-all">

            {/* VIEW MODAL */}
            {activeModal === 'view' && selectedTicket && (
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

                <div className="max-h-[80vh] overflow-y-auto custom-scrollbar p-6 space-y-8">
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
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
                        <span className="text-xs font-semibold uppercase text-[#64748B]">Priority</span>
                        <p className={`mt-1 font-semibold ${selectedTicket.priority.toLowerCase() === 'high' ? 'text-red-400' :
                            selectedTicket.priority.toLowerCase() === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>{selectedTicket.priority.toUpperCase()}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold uppercase text-[#64748B]">Description</h4>
                      <div className="mt-2 text-white leading-relaxed whitespace-pre-wrap">
                        {selectedTicket.description.split('[REJECTION REASON]:')[0].trim()}
                      </div>
                    </div>

                    {(selectedTicket.resolutionNotes || selectedTicket.description.includes('[REJECTION REASON]:')) && (
                      <div className={`mt-6 rounded-xl border p-4 ${
                        selectedTicket.status === 'REJECTED' 
                          ? 'border-red-500/20 bg-red-500/5 text-red-400' 
                          : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                      }`}>
                        <span className="font-bold uppercase tracking-wider text-xs block mb-1">
                          {selectedTicket.status === 'REJECTED' ? 'Rejection Reason' : 'Resolution Notes'}
                        </span>
                        <p className="whitespace-pre-wrap text-sm text-[#CBD5E1]">
                          {selectedTicket.resolutionNotes || selectedTicket.description.split('[REJECTION REASON]:')[1]?.trim()}
                        </p>
                      </div>
                    )}

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

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 text-sm pb-6 border-b border-[#1F2937]/50">
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Category</h4>
                        <p className="mt-1 text-white font-medium">{selectedTicket.category}</p>
                      </div>
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Location</h4>
                        <p className="mt-1 text-white font-medium">{selectedTicket.location || 'Campus'}</p>
                      </div>
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Reporter</h4>
                        <p className="mt-1 text-[#3B82F6] font-bold">{selectedTicket.userName || 'Anonymous'}</p>
                      </div>
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Contact</h4>
                        <p className="mt-1 text-emerald-500 font-bold">{selectedTicket.contactDetails || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#64748B]">Assignee</h4>
                        <p className="mt-1 text-amber-500 font-bold">{selectedTicket.assignedToName || 'Unassigned'}</p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#1F2937]">
                      <CommentSection 
                  ticketId={selectedTicket.id} 
                  autoFocus={showCommentPrompt} 
                  reporterId={selectedTicket.userId}
                  assigneeId={selectedTicket.assignedToId}
                />
                    </div>
                  </div>

                </div>

                <div className="bg-[#111827] p-6 flex justify-end gap-3">
                  {isAdmin && selectedTicket.status !== 'REJECTED' && (
                    <button
                      onClick={() => {
                        setRejectionReason('')
                        setActiveModal('reject')
                      }}
                      className="rounded-xl border border-red-500/30 bg-red-500/5 px-6 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Reject Ticket
                    </button>
                  )}
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
            {activeModal === 'edit' && selectedTicket && (
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
                        {isAdmin && <option value="REJECTED">Rejected</option>}
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
                     <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Internal Notes (Staff Only)</label>
                     <textarea
                       rows={3}
                       value={editForm.resolutionNotes}
                       onChange={(e) => setEditForm({ ...editForm, resolutionNotes: e.target.value })}
                       disabled={!isTechnician && !isAdmin}
                       placeholder={isTechnician || isAdmin ? "Add resolution notes or technical updates..." : "Only staff can add resolution notes."}
                       className={`w-full rounded-xl border border-[#334155] bg-[#0F172A] p-4 text-white focus:border-[#3B82F6] outline-none resize-none ${!isTechnician && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            {activeModal === 'delete' && selectedTicket && (
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

            {/* ASSIGN MODAL */}
            {activeModal === 'assign' && selectedTicket && (
              <div className="flex flex-col">
                <div className="flex items-center justify-between border-b border-[#1F2937] p-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Assign Technician</h2>
                    <p className="mt-1 text-sm text-[#64748B]">Select a staff member for TK-{selectedTicket.id}</p>
                  </div>
                  <button onClick={handleCloseModal} className="rounded-full p-2 text-[#94A3B8] hover:bg-[#1F2937] hover:text-white transition-all">
                    <HiOutlineXMark className="h-6 w-6" />
                  </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-6">
                  {selectedTicket.assignedToId && (
                    <div className="mb-6">
                      <button
                        onClick={handleUnassign}
                        className="flex w-full items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 transition-all hover:bg-rose-500/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
                            <HiOutlineXMark className="h-6 w-6" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-rose-500">Unassign Current Technician</p>
                            <p className="text-xs text-rose-500/70">Remove {selectedTicket.assignedToName} from this ticket</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  )}

                  <div className="grid gap-3">
                    {technicians.length === 0 ? (
                      <p className="py-8 text-center text-[#64748B]">No technicians found.</p>
                    ) : (
                      technicians.map((tech) => (
                        <button
                          key={tech.id}
                          onClick={() => handleAssignToTechnician(tech.id)}
                          className="flex items-center justify-between rounded-2xl border border-[#1F2937] bg-[#111827] p-4 transition-all hover:border-[#3B82F6]/50 hover:bg-[#1E293B]"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold">
                              {tech.name.charAt(0)}
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-white">{tech.name}</p>
                              <p className="text-xs text-[#64748B]">{tech.email}</p>
                            </div>
                          </div>
                          <HiOutlineUserPlus className="h-5 w-5 text-[#3B82F6]" />
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-[#111827] p-6 flex justify-end">
                  <button
                    onClick={handleCloseModal}
                    className="rounded-xl border border-[#334155] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1F2937] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* CONFIRM MODAL */}
            {activeModal === 'confirm' && (
              <div className="flex flex-col">
                <div className="p-8 text-center sm:text-left">
                  <div className={`mx-auto sm:mx-0 flex h-14 w-14 items-center justify-center rounded-full mb-6 ${
                    confirmConfig.type === 'danger' ? 'bg-red-500/20 text-red-500' :
                    confirmConfig.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    <HiOutlineExclamationTriangle className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{confirmConfig.title}</h2>
                  <p className="mt-3 text-[#94A3B8] leading-relaxed">
                    {confirmConfig.message}
                  </p>
                </div>

                <div className="bg-[#111827] p-6 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={() => setActiveModal('reject')}
                    className="rounded-xl border border-[#334155] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1F2937] transition-all order-2 sm:order-1"
                  >
                    Back
                  </button>
                  <button
                    onClick={confirmConfig.onConfirm}
                    className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-all flex items-center justify-center gap-2 order-1 sm:order-2 ${
                      confirmConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-500' :
                      confirmConfig.type === 'warning' ? 'bg-amber-600 hover:bg-amber-500' :
                      'bg-blue-600 hover:bg-blue-500'
                    }`}
                  >
                    Confirm Action
                  </button>
                </div>
              </div>
            )}

            {/* REJECT MODAL */}
            {activeModal === 'reject' && selectedTicket && (
              <div className="flex flex-col p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Reject Ticket</h2>
                  <p className="mt-1 text-sm text-[#64748B]">Please provide a reason for rejecting TK-{selectedTicket.id}</p>
                </div>

                <div className="space-y-4">
                  <textarea
                    required
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Type the reason for rejection here..."
                    className="w-full rounded-xl border border-[#334155] bg-[#0F172A] p-4 text-white focus:border-red-500 outline-none resize-none"
                  />

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={handleCloseModal}
                      className="rounded-xl border border-[#334155] px-6 py-2.5 text-sm font-bold text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectTicket}
                      className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-all shadow-lg shadow-red-500/20"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ALERT MODAL */}
            {activeModal === 'alert' && (
              <div className="flex flex-col">
                <div className="p-8 text-center">
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-6 ${
                    alertConfig.type === 'error' ? 'bg-red-500/20 text-red-500' :
                    alertConfig.type === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {alertConfig.type === 'error' ? (
                      <HiOutlineExclamationTriangle className="h-10 w-10" />
                    ) : alertConfig.type === 'warning' ? (
                      <HiOutlineExclamationTriangle className="h-10 w-10" />
                    ) : (
                      <HiOutlineCheckCircle className="h-10 w-10" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{alertConfig.title}</h2>
                  <p className="mt-3 text-[#94A3B8] leading-relaxed">
                    {alertConfig.message}
                  </p>
                </div>

                <div className="bg-[#111827] p-6 flex justify-center">
                  <button
                    onClick={handleCloseModal}
                    className={`rounded-xl px-8 py-3 text-sm font-bold text-white transition-all ${
                      alertConfig.type === 'error' ? 'bg-red-600 hover:bg-red-500' :
                      alertConfig.type === 'warning' ? 'bg-amber-600 hover:bg-amber-500' :
                      'bg-[#3B82F6] hover:bg-blue-500'
                    }`}
                  >
                    Understood
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        show={activeModal === 'confirm'}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.type || 'warning'}
        onConfirm={() => {
          confirmConfig.onConfirm()
          handleCloseModal()
        }}
        onCancel={() => setActiveModal('reject')}
      />
    </div>
  )
}

