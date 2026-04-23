import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineBellAlert,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlineChevronLeft,
  HiOutlineXMark
} from 'react-icons/hi2'
import { SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'
import { getAllAlerts, createAlert, updateAlert, deleteAlert, type TechnicianAlert } from '../services/alertService'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'

export default function TechnicianAlertsPage() {
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState<TechnicianAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'WARNING' | 'CRITICAL',
    targetRoles: [] as string[]
  })

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      setIsLoading(true)
      const response = await getAllAlerts()
      setAlerts(response.data)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.message || formData.targetRoles.length === 0) {
      if (formData.targetRoles.length === 0) alert('Please select at least one target role');
      return
    }

    setIsSaving(true)
    try {
      if (editingId) {
        await updateAlert(editingId, {
          ...formData,
          targetRoles: formData.targetRoles.join(',')
        })
      } else {
        await createAlert({
          ...formData,
          targetRoles: formData.targetRoles.join(',')
        })
      }
      await fetchAlerts()
      setShowModal(false)
      setEditingId(null)
      setFormData({ title: '', message: '', type: 'INFO', targetRoles: [] })
    } catch (error: any) {
      console.error('Failed to save alert:', error)
      const errorMessage = error.response?.data || `Failed to ${editingId ? 'update' : 'broadcast'} alert`
      alert(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (alert: TechnicianAlert) => {
    setEditingId(alert.id)
    setFormData({
      title: alert.title,
      message: alert.message,
      type: alert.type,
      targetRoles: alert.targetRoles ? alert.targetRoles.split(',') : []
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAlert(id)
      setAlerts(alerts.filter(a => a.id !== id))
      toast.success('Alert deleted successfully')
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete alert:', error)
      toast.error('Failed to delete alert')
    }
  }

  return (
    <div className="mx-auto max-w-5xl pb-20">
      <SectionHeader
        eyebrow="Campus Security"
        title="Technician Alerts"
        subtitle="Manage and broadcast critical operations updates to all users."
        action={
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/technician/dashboard')}
              className="flex items-center gap-2 rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50 transition-all hover:bg-white/5"
            >
              <HiOutlineChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <button
              onClick={() => {
                setEditingId(null)
                setFormData({ title: '', message: '', type: 'INFO', targetRoles: [] })
                setShowModal(true)
              }}
              className="flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
            >
              <HiOutlinePlus className="h-5 w-5" />
              New Alert
            </button>
          </div>
        }
      />

      <div className="mt-8 space-y-6">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500 mb-4"></div>
            <p className="text-[#64748B]">Fetching operations alerts...</p>
          </div>
        ) : alerts.map((alert) => (
          <div
            key={alert.id}
            className={`${panelLg} group relative overflow-hidden border-l-4 ${alert.type === 'CRITICAL' ? 'border-l-rose-500 bg-rose-500/[0.02]' :
              alert.type === 'WARNING' ? 'border-l-amber-500 bg-amber-500/[0.02]' :
                'border-l-blue-500 bg-blue-500/[0.02]'
              }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${alert.type === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' :
                  alert.type === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                  {alert.type === 'CRITICAL' ? <HiOutlineExclamationTriangle className="h-6 w-6" /> :
                    alert.type === 'WARNING' ? <HiOutlineBellAlert className="h-6 w-6" /> :
                      <HiOutlineInformationCircle className="h-6 w-6" />}
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{alert.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${alert.type === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' :
                      alert.type === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                      {alert.type}
                    </span>
                  </div>
                  <p className="mt-2 text-[#94A3B8] leading-relaxed max-w-3xl">
                    {alert.message}
                  </p>
                  <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[#475569]">
                    Target: <span className="text-blue-400">{alert.targetRoles || 'General'}</span> · Broadcasted {alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleEdit(alert)}
                  className="rounded-lg p-2 text-[#64748B] hover:bg-[#1F2937] hover:text-white transition-all"
                  title="Edit Alert"
                >
                  <HiOutlinePencilSquare className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(alert.id)}
                  className="rounded-lg p-2 text-[#64748B] hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                  title="Delete Alert"
                >
                  <HiOutlineTrash className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && alerts.length === 0 && (
          <div className="py-20 text-center rounded-[2.5rem] border border-dashed border-[#1F2937] bg-[#0F172A]/30">
            <HiOutlineBellAlert className="mx-auto h-12 w-12 text-[#334155] mb-4" />
            <h3 className="text-xl font-bold text-white">No active alerts</h3>
            <p className="mt-2 text-[#64748B]">All operations are currently normal.</p>
          </div>
        )}
      </div>


      {/* New Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg transform overflow-hidden rounded-[2rem] border border-[#1F2937] bg-[#0F172A] p-8 shadow-2xl transition-all">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Alert' : 'Broadcast Alert'}</h2>
                <p className="mt-1 text-sm text-[#64748B]">{editingId ? 'Update your broadcasted message.' : 'Notify the maintenance team immediately.'}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full bg-white/5 p-2 text-[#64748B] hover:text-white transition-colors">
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#475569] mb-3">Alert Title</label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Server Room Temperature"
                  className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-white placeholder:text-[#334155] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#475569] mb-3">Priority Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['INFO', 'WARNING', 'CRITICAL'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`rounded-xl border py-2.5 text-xs font-bold transition-all ${formData.type === t
                        ? t === 'CRITICAL' ? 'border-rose-500 bg-rose-500/10 text-rose-500' :
                          t === 'WARNING' ? 'border-amber-500 bg-amber-500/10 text-amber-500' :
                            'border-blue-500 bg-blue-500/10 text-blue-500'
                        : 'border-[#1F2937] bg-[#111827] text-[#475569] hover:border-[#334155]'
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#475569] mb-3">Target Audience (Pick Multiple)</label>
                <div className="flex flex-wrap gap-2">
                  {['STUDENT', 'LECTURER', 'ADMIN', 'TECHNICIAN'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        const newRoles = formData.targetRoles.includes(role)
                          ? formData.targetRoles.filter(r => r !== role)
                          : [...formData.targetRoles, role];
                        setFormData({ ...formData, targetRoles: newRoles });
                      }}
                      className={`rounded-xl border px-4 py-2 text-[10px] font-bold transition-all ${formData.targetRoles.includes(role)
                        ? 'border-[#3B82F6] bg-blue-500/10 text-[#3B82F6] ring-1 ring-[#3B82F6]'
                        : 'border-[#1F2937] bg-[#111827] text-[#475569] hover:border-[#334155]'
                        }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#475569] mb-3">Detailed Message</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe the situation and required actions..."
                  className="w-full rounded-xl border border-[#1F2937] bg-[#0F172A] px-4 py-3 text-white placeholder:text-[#334155] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-[#1F2937] px-6 py-3 text-sm font-bold text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-8 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  ) : editingId ? (
                    <HiOutlinePencilSquare className="h-4 w-4" />
                  ) : (
                    <HiOutlineBellAlert className="h-4 w-4" />
                  )}
                  {isSaving ? (editingId ? 'Updating...' : 'Broadcasting...') : (editingId ? 'Update Alert' : 'Broadcast Alert')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        show={showDeleteConfirm !== null}
        title="Delete Alert"
        message="Are you sure you want to delete this alert? This action cannot be undone."
        onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
        onCancel={() => setShowDeleteConfirm(null)}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
