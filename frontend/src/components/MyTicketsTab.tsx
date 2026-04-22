import { useState, useEffect } from 'react'
import { HiOutlineClock, HiOutlineMapPin, HiOutlineChatBubbleLeftRight, HiOutlineEye } from 'react-icons/hi2'
import { getMyTickets } from '../services/ticketService'
import type { TicketResponseDTO } from '../services/ticketService'
import { Pill, panelLg } from '../pages/dashboard/dashboardUi'

export default function MyTicketsTab() {
  const [tickets, setTickets] = useState<TicketResponseDTO[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await getMyTickets()
        setTickets(response.data)
      } catch (err) {
        console.error('Failed to load my tickets', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
                  t.status === 'RESOLVED' ? 'text-emerald-400' : 'text-slate-400'
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
                className="ml-2 rounded-lg p-2 text-[#94A3B8] hover:bg-[#334155] hover:text-[#3B82F6] transition-all"
                title="View Details"
              >
                <HiOutlineEye className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
