import { Link } from 'react-router-dom'
import {
  HiOutlineBolt,
  HiOutlineClipboardDocumentList,
  HiOutlineCpuChip,
  HiOutlineMapPin,
  HiOutlineBellAlert,
  HiOutlineChartBar,
} from 'react-icons/hi2'
import { DashboardDecor, KpiMini, Pill, SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'
import { useAuth } from '../services/useAuth'

const activeWorkQueue = [
  { id: 'TK-1842', title: 'Projector flicker · Hall A', priority: 'high' as const, status: 'IN_PROGRESS', due: 'Today 16:00' },
  { id: 'TK-1839', title: 'HVAC noise · Bldg B L2', priority: 'medium' as const, status: 'OPEN', due: 'Tomorrow' },
  { id: 'TK-1835', title: 'Lab PC 7 disk warning', priority: 'low' as const, status: 'OPEN', due: 'Fri' },
  { id: 'TK-1821', title: 'Network drop · Lab 5', priority: 'high' as const, status: 'IN_PROGRESS', due: '2h ago' },
]

const equipmentHealth = [
  { name: 'Central HVAC System', health: 88, status: 'Stable' },
  { name: 'Core Network Switch', health: 94, status: 'Healthy' },
  { name: 'AV Rack - Auditorium', health: 45, status: 'Maintenance' },
  { name: 'Lab B-12 Power Unit', health: 76, status: 'Warning' },
]

const recentActivity = [
  { user: 'Mike Tech', action: 'Resolved TK-1840 (Projector)', time: '45m ago' },
  { user: 'Sarah Admin', action: 'Assigned TK-1844 to your queue', time: '2h ago' },
  { user: 'System', action: 'HVAC Alert: High pressure in Bldg A', time: '3h ago' },
]

export default function TechnicianDashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'Technician'

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
          <div className="flex flex-wrap gap-2">
            <Link
              to="/maintenance"
              className="rounded-lg bg-[#F97316]/15 px-4 py-2 text-sm font-semibold text-[#FB923C] ring-1 ring-[#F97316]/30 transition-all hover:bg-[#F97316]/25"
            >
              All Tickets
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[#94A3B8] transition-colors hover:border-white/25 hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Global Stats */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiMini label="My Active Jobs" value="4" hint="2 High priority" accent="from-orange-500/40 to-transparent" />
          <KpiMini label="SLA Compliance" value="96.2%" hint="+1.4% this week" accent="from-emerald-500/40 to-transparent" />
          <KpiMini label="Parts Pending" value="3" hint="Expected tomorrow" accent="from-blue-500/40 to-transparent" />
          <KpiMini label="Open Campus Alerts" value="2" hint="HVAC, Power" accent="from-rose-500/40 to-transparent" />
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
                <span className="text-xs font-mono text-[#64748B]">Last updated: 2m ago</span>
             </div>
             
             <div className="space-y-4">
                {activeWorkQueue.map((ticket) => (
                  <div key={ticket.id} className="group relative flex flex-col gap-4 rounded-xl border border-[#1F2937] bg-[#0F172A]/50 p-4 transition-all hover:border-[#3B82F6]/30 hover:bg-[#0F172A]/80 sm:flex-row sm:items-center">
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[#64748B]">{ticket.id}</span>
                        <Pill variant={ticket.priority === 'high' ? 'danger' : ticket.priority === 'medium' ? 'warning' : 'default'}>
                          {ticket.priority.toUpperCase()}
                        </Pill>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${ticket.status === 'IN_PROGRESS' ? 'text-blue-400' : 'text-slate-500'}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="mt-2 text-base font-semibold text-white group-hover:text-[#3B82F6] transition-colors">{ticket.title}</h4>
                      <div className="mt-2 flex items-center gap-4 text-xs text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <HiOutlineMapPin className="h-4 w-4" />
                          Smart Campus
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineBolt className="h-4 w-4" />
                          Due {ticket.due}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Link 
                        to={`/maintenance`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#334155] px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-[#3B82F6] hover:border-[#3B82F6]"
                      >
                        Action →
                      </Link>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Equipment Status Section */}
          <div className={panelLg}>
            <SectionHeader 
              title="Infrastructure Health" 
              subtitle="Real-time monitoring of critical campus assets and utility systems."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {equipmentHealth.map((item) => (
                <div key={item.name} className={`${tilePanel} flex items-center gap-4`}>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    item.health > 90 ? 'bg-emerald-500/10 text-emerald-500' : 
                    item.health > 70 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    <HiOutlineCpuChip className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <span className="text-xs font-mono text-[#64748B]">{item.health}%</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-[#1F2937]">
                      <div 
                        className={`h-full rounded-full ${
                          item.health > 90 ? 'bg-emerald-500' : 
                          item.health > 70 ? 'bg-amber-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${item.health}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-[#64748B] uppercase tracking-wider font-bold">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar info */}
        <div className="space-y-6">
          {/* Alerts & Notifications */}
          <div className={`${tilePanel} border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent`}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <HiOutlineBellAlert className="h-5 w-5 text-rose-500" />
              Critical Alerts
            </h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg border border-rose-500/20 bg-[#0F172A] p-3">
                <p className="text-xs font-bold text-rose-400 uppercase">Emergency - Power</p>
                <p className="mt-1 text-sm text-[#CBD5E1]">Fluctuating voltage in IT Lab 2. Shutdown procedures suggested if persistent.</p>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className={panelLg}>
             <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-4">
                <HiOutlineChartBar className="h-5 w-5 text-[#3B82F6]" />
                Recent Operations
             </h3>
             <ul className="space-y-4">
                {recentActivity.map((act, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-[#1F2937] flex items-center justify-center text-[10px] font-bold text-[#3B82F6]">
                      {act.user.split(' ')[0][0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#CBD5E1] truncate">
                        <span className="font-bold">{act.user}</span> {act.action}
                      </p>
                      <p className="text-[10px] text-[#64748B]">{act.time}</p>
                    </div>
                  </li>
                ))}
             </ul>
          </div>

          {/* Shift Handover Hint */}
          <div className={`${tilePanel} border-blue-500/20 bg-[#0F172A]`}>
             <h3 className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Handover Note</h3>
             <p className="mt-2 text-sm text-[#94A3B8] italic">
               "Bldg C main riser is being inspected at 18:00. Please ensure all Lab 5 tickets are closed before end of shift."
             </p>
             <p className="mt-2 text-[10px] text-[#64748B]">— Lead Technician</p>
          </div>

          {/* Tools & Safety Quick Access */}
          <div className={tilePanel}>
            <h3 className="text-sm font-bold text-white mb-3">Field Resources</h3>
            <div className="grid grid-cols-2 gap-2">
               <button className="rounded-lg bg-[#334155] p-2 text-[10px] font-bold text-white hover:bg-[#475569]">SAFETY LOGS</button>
               <button className="rounded-lg bg-[#334155] p-2 text-[10px] font-bold text-white hover:bg-[#475569]">EQUIP. MAPS</button>
               <button className="rounded-lg bg-[#334155] p-2 text-[10px] font-bold text-white hover:bg-[#475569]">VENDOR COMMS</button>
               <button className="rounded-lg bg-[#334155] p-2 text-[10px] font-bold text-white hover:bg-[#475569]">SLA REPORT</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardDecor>
  )
}
