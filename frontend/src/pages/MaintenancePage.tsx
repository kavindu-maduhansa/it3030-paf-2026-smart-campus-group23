import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  HiOutlineUser
} from 'react-icons/hi2'
import { Pill, SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'
import CommentSection from '../components/CommentSection'

interface Ticket {
  id: string
  title: string
  description: string
  loc: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: string
  updated: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  category: string
}

const initialTickets: Ticket[] = [
  {
    id: 'TK-1842',
    title: 'Projector intermittent · Lecture Hall A',
    description: 'The projector in Lecture Hall A flickers every few minutes. Seems like a cable issue or overheating.',
    loc: 'Building A · Floor 1',
    priority: 'high',
    assignee: 'Mike Tech',
    updated: '2h ago',
    status: 'IN_PROGRESS',
    category: 'AV & Projector'
  },
  {
    id: 'TK-1839',
    title: 'HVAC noise reported',
    description: 'Loud rattling noise coming from the ceiling vents in Building B Level 2. Likely a loose fan belt.',
    loc: 'Building B · L2',
    priority: 'medium',
    assignee: 'Unassigned',
    updated: '5h ago',
    status: 'OPEN',
    category: 'HVAC / Air Con'
  },
  {
    id: 'TK-1821',
    title: 'Network drop · Lab 5',
    description: 'Ethernet ports 12-15 are completely dead. Switches rebooted but no change.',
    loc: 'Building C · Lab 5',
    priority: 'low',
    assignee: 'Mike Tech',
    updated: '1d ago',
    status: 'OPEN',
    category: 'IT & Network'
  },
]

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [filter, setFilter] = useState<'all' | 'high' | 'mine'>('all')
  const [activeModal, setActiveModal] = useState<'view' | 'edit' | 'delete' | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  
  // For Edit Form
  const [editForm, setEditForm] = useState<Partial<Ticket>>({})

  const list =
    filter === 'high'
      ? tickets.filter((t) => t.priority === 'high' || t.priority === 'urgent')
      : filter === 'mine'
        ? tickets.filter((t) => t.assignee === 'Mike Tech')
        : tickets

  const handleOpenModal = (type: 'view' | 'edit' | 'delete', ticket: Ticket) => {
    setSelectedTicket(ticket)
    setEditForm(ticket)
    setActiveModal(type)
  }

  const handleCloseModal = () => {
    setActiveModal(null)
    setSelectedTicket(null)
  }

  const handleUpdateTicket = () => {
    if (!selectedTicket || !editForm) return
    setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, ...editForm } as Ticket : t))
    handleCloseModal()
  }

  const handleDeleteTicket = () => {
    if (!selectedTicket) return
    setTickets(prev => prev.filter(t => t.id !== selectedTicket.id))
    handleCloseModal()
  }

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Operations"
          title="Maintenance & tickets"
          subtitle="Prioritised work across campus. Hook this view to your tickets API and WebSocket stream."
          action={
            <div className="flex gap-2">
              <Link
                to="/dashboard"
                className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
              >
                Dashboard
              </Link>
              <Link
                to="/maintenance/report"
                className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 active:scale-95"
              >
                <HiOutlineWrenchScrewdriver className="h-4 w-4" />
                New ticket
              </Link>
            </div>
          }
        />

        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              ['all', 'All open'],
              ['high', 'High priority'],
              ['mine', 'My queue'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === key
                  ? 'bg-[#3B82F6] text-white'
                  : 'border border-[#334155] text-[#94A3B8] hover:border-[#3B82F6]/40 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Open</p>
            <p className="mt-2 text-2xl font-bold text-white">{tickets.length}</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">SLA risk</p>
            <p className="mt-2 text-2xl font-bold text-red-400">1</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Avg. resolve (demo)</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">1.2d</p>
          </div>
        </div>

        <ul className="mt-8 space-y-4">
          {list.map((t) => {
            const borderAccent =
              t.priority === 'urgent' || t.priority === 'high'
                ? 'border-l-red-500'
                : t.priority === 'medium'
                  ? 'border-l-amber-500'
                  : 'border-l-slate-600'
            
            return (
            <li key={t.id} className={`${panelLg} border-l-4 ${borderAccent} group transition-all hover:bg-[#1E293B]/80 hover:ring-1 hover:ring-blue-500/20`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-xs text-[#64748B]">{t.id}</p>
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
                      {t.loc}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HiOutlineClock className="h-4 w-4 text-[#64748B]" />
                      Updated {t.updated}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <HiOutlineUser className="h-4 w-4 text-[#64748B]" />
                      {t.assignee}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-start">
                  <Pill
                    variant={
                      t.priority === 'urgent' || t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : 'default'
                    }
                  >
                    {t.priority.toUpperCase()}
                  </Pill>
                  
                  <div className="ml-2 flex items-center gap-1">
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
          })}
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
                    <p className="font-mono text-xs text-[#64748B]">{selectedTicket.id}</p>
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
                          selectedTicket.priority === 'high' ? 'text-red-400' : 
                          selectedTicket.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>{selectedTicket.priority.toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-[#64748B]">Description</h4>
                      <p className="mt-2 text-white leading-relaxed">{selectedTicket.description}</p>
                    </div>
                    
                    <div className="grid gap-4 sm:grid-cols-3 text-sm pb-6">
                      <div>
                        <h4 className="font-semibold text-[#64748B]">Category</h4>
                        <p className="mt-1 text-white">{selectedTicket.category}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#64748B]">Location</h4>
                        <p className="mt-1 text-white">{selectedTicket.loc}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#64748B]">Assignee</h4>
                        <p className="mt-1 text-white">{selectedTicket.assignee}</p>
                      </div>
                    </div>
                  </div>

                  {/* COMMENT SECTION */}
                  <div className="border-t border-[#1F2937] pt-8">
                    <CommentSection ticketId={selectedTicket.id} />
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
                      value={editForm.assignee}
                      onChange={(e) => setEditForm(prev => ({ ...prev, assignee: e.target.value }))}
                      className="w-full rounded-xl border border-[#334155] bg-[#0F172A] px-4 py-2.5 text-white focus:border-[#3B82F6] outline-none"
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
                    Are you sure you want to delete <span className="font-bold text-white">{selectedTicket.id}</span>? 
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

