import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineMagnifyingGlass, HiOutlineUserPlus } from 'react-icons/hi2'
import { Pill, SectionHeader, panelLg, tilePanel } from './dashboard/dashboardUi'

const demoUsers = [
  { name: 'Navodya Perera', email: 'navodya@smartcampus.edu', role: 'STUDENT', status: 'Active' },
  { name: 'Admin User', email: 'admin@smartcampus.edu', role: 'ADMIN', status: 'Active' },
  { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@smartcampus.edu', role: 'LECTURER', status: 'Active' },
  { name: 'Mike Tech', email: 'mike.tech@smartcampus.edu', role: 'TECHNICIAN', status: 'Active' },
  { name: 'Alice Student', email: 'alice.student@smartcampus.edu', role: 'STUDENT', status: 'Invited' },
]

function rolePill(role: string) {
  const r = role.toUpperCase()
  if (r === 'ADMIN') return <Pill variant="danger">Admin</Pill>
  if (r === 'LECTURER') return <Pill variant="info">Lecturer</Pill>
  if (r === 'TECHNICIAN') return <Pill variant="warning">Technician</Pill>
  return <Pill variant="success">Student</Pill>
}

export default function AdminUsersPage() {
  const [q, setQ] = useState('')
  const filtered = demoUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Administration"
          title="User management"
          subtitle="Search and review campus accounts. Live data will load from GET /api/admin/users when the UI is wired."
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard"
                className="rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold text-white hover:border-[#3B82F6]/50"
              >
                Dashboard
              </Link>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white opacity-70"
                title="Connect API to enable"
              >
                <HiOutlineUserPlus className="h-4 w-4" />
                Add user
              </button>
            </div>
          }
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Total users</p>
            <p className="mt-2 text-2xl font-bold text-white">{demoUsers.length}</p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Active</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {demoUsers.filter((u) => u.status === 'Active').length}
            </p>
          </div>
          <div className={tilePanel}>
            <p className="text-xs font-semibold uppercase text-[#94A3B8]">Pending invites</p>
            <p className="mt-2 text-2xl font-bold text-amber-400">
              {demoUsers.filter((u) => u.status !== 'Active').length}
            </p>
          </div>
        </div>

        <div className={`${panelLg} mt-8 overflow-hidden p-0`}>
          <div className="flex flex-col gap-4 border-b border-[#1F2937] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748B]" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full rounded-xl border border-[#334155] bg-[#0F172A] py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              />
            </div>
            <p className="text-sm text-[#64748B]">
              Showing <strong className="text-[#94A3B8]">{filtered.length}</strong> users
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#1F2937] bg-[#0F172A]/50 text-xs uppercase tracking-wide text-[#64748B]">
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F2937]">
                {filtered.map((u) => (
                  <tr key={u.email} className="hover:bg-[#0F172A]/40">
                    <td className="px-5 py-4 font-medium text-white">{u.name}</td>
                    <td className="px-5 py-4 text-[#94A3B8]">{u.email}</td>
                    <td className="px-5 py-4">{rolePill(u.role)}</td>
                    <td className="px-5 py-4">
                      <Pill variant={u.status === 'Active' ? 'success' : 'warning'}>{u.status}</Pill>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="text-xs font-semibold text-[#3B82F6] hover:underline disabled:opacity-50"
                        disabled
                      >
                        Edit role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
