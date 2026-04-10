import type { ElementType } from 'react'
import {
  HiOutlineAcademicCap,
  HiOutlineBellAlert,
  HiOutlineCalendar,
  HiOutlineClipboardDocumentList,
  HiOutlineCpuChip,
  HiOutlinePencilSquare,
  HiOutlineSquares2X2,
  HiOutlineUserCircle,
  HiOutlineUserGroup,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2'

export type CampusRole = 'STUDENT' | 'ADMIN' | 'LECTURER' | 'TECHNICIAN'

export interface StatusItem {
  label: string
  value: string
  highlight: boolean
}

export interface QuickCard {
  to: string
  title: string
  description: string
  Icon: ElementType<{ className?: string }>
  iconClass: string
}

export interface RoleDashboardConfig {
  /** Fills "Campus role" tile */
  roleLabel: string
  tagline: string
  statusStrip: StatusItem[]
  quickCards: QuickCard[]
  accountHint: string
  footerNote: string
}

const thru: StatusItem = { label: 'Access valid through', value: 'April 2026', highlight: false }
const active: StatusItem = { label: 'Status', value: 'Active', highlight: true }

export const ROLE_DASHBOARD: Record<CampusRole, RoleDashboardConfig> = {
  STUDENT: {
    roleLabel: 'Student',
    tagline: 'Manage bookings, facilities, and campus updates in one operations hub.',
    statusStrip: [
      { label: 'Campus role', value: 'Student', highlight: false },
      thru,
      active,
    ],
    quickCards: [
      {
        to: '/profile',
        title: 'My profile',
        description: 'View personal information and account details.',
        Icon: HiOutlineUserCircle,
        iconClass: 'bg-blue-500/15 text-[#3B82F6] ring-1 ring-blue-500/30',
      },
      {
        to: '/resources',
        title: 'Facilities',
        description: 'Browse lecture halls, labs, and equipment availability.',
        Icon: HiOutlineSquares2X2,
        iconClass: 'bg-emerald-500/15 text-[#10B981] ring-1 ring-emerald-500/30',
      },
      {
        to: '/bookings',
        title: 'My bookings',
        description: 'View and manage your space and resource reservations.',
        Icon: HiOutlineCalendar,
        iconClass: 'bg-amber-500/15 text-[#F59E0B] ring-1 ring-amber-500/30',
      },
      {
        to: '/profile',
        title: 'Settings',
        description: 'Edit profile, notifications, and security preferences.',
        Icon: HiOutlinePencilSquare,
        iconClass: 'bg-red-500/15 text-[#EF4444] ring-1 ring-red-500/30',
      },
      {
        to: '/maintenance/report',
        title: 'Report incident',
        description: 'Notify maintenance about broken equipment or facility issues.',
        Icon: HiOutlineWrenchScrewdriver,
        iconClass: 'bg-violet-500/15 text-[#8B5CF6] ring-1 ring-violet-500/30',
      },
    ],
    accountHint:
      'Summary details for your Smart Campus profile. Update your email and preferences from Settings when available.',
    footerNote:
      'IT3030 · Smart Campus — student hub. Bookings and profile tools connect as APIs go live.',
  },
  ADMIN: {
    roleLabel: 'Administrator',
    tagline: 'Oversee users, resources, bookings, and maintenance from one admin console.',
    statusStrip: [
      { label: 'Campus role', value: 'Administrator', highlight: false },
      thru,
      active,
    ],
    quickCards: [
      {
        to: '/admin/users',
        title: 'User management',
        description: 'View roles, invite accounts, and manage campus access levels.',
        Icon: HiOutlineUserGroup,
        iconClass: 'bg-blue-500/15 text-[#3B82F6] ring-1 ring-blue-500/30',
      },
      {
        to: '/resources',
        title: 'Resources & facilities',
        description: 'Audit lecture halls, labs, and equipment inventory across campus.',
        Icon: HiOutlineSquares2X2,
        iconClass: 'bg-emerald-500/15 text-[#10B981] ring-1 ring-emerald-500/30',
      },
      {
        to: '/bookings',
        title: 'Bookings oversight',
        description: 'Review pending approvals, capacity, and scheduling conflicts.',
        Icon: HiOutlineCalendar,
        iconClass: 'bg-amber-500/15 text-[#F59E0B] ring-1 ring-amber-500/30',
      },
      {
        to: '/maintenance',
        title: 'Maintenance & tickets',
        description: 'Monitor open tickets, SLA status, and technician assignments.',
        Icon: HiOutlineWrenchScrewdriver,
        iconClass: 'bg-violet-500/15 text-[#8B5CF6] ring-1 ring-violet-500/30',
      },
    ],
    accountHint:
      'Administrator view — sensitive actions may require re-authentication when policy is enabled.',
    footerNote:
      'IT3030 · Smart Campus — admin operations hub. Connect `/api/admin` endpoints for live data.',
  },
  LECTURER: {
    roleLabel: 'Lecturer',
    tagline: 'Manage teaching spaces, sessions, and resource requests for your modules.',
    statusStrip: [
      { label: 'Campus role', value: 'Lecturer', highlight: false },
      thru,
      active,
    ],
    quickCards: [
      {
        to: '/profile',
        title: 'Teaching profile',
        description: 'Department, modules, and contact details for students.',
        Icon: HiOutlineAcademicCap,
        iconClass: 'bg-blue-500/15 text-[#3B82F6] ring-1 ring-blue-500/30',
      },
      {
        to: '/resources',
        title: 'Facilities & labs',
        description: 'Reserve labs, projectors, and shared learning spaces.',
        Icon: HiOutlineSquares2X2,
        iconClass: 'bg-emerald-500/15 text-[#10B981] ring-1 ring-emerald-500/30',
      },
      {
        to: '/bookings',
        title: 'My bookings',
        description: 'Session slots, venues, and equipment tied to your teaching.',
        Icon: HiOutlineCalendar,
        iconClass: 'bg-amber-500/15 text-[#F59E0B] ring-1 ring-amber-500/30',
      },
      {
        to: '/schedule',
        title: 'Teaching schedule',
        description: 'Week view of classes and confirmed room allocations.',
        Icon: HiOutlineClipboardDocumentList,
        iconClass: 'bg-cyan-500/15 text-[#06B6D4] ring-1 ring-cyan-500/30',
      },
      {
        to: '/maintenance/report',
        title: 'Report incident',
        description: 'Escalate projector, HVAC, or furniture issues in your venues.',
        Icon: HiOutlineWrenchScrewdriver,
        iconClass: 'bg-violet-500/15 text-[#8B5CF6] ring-1 ring-violet-500/30',
      },
    ],
    accountHint:
      'Lecturer workspace — timetable integrations will appear here when linked to your faculty system.',
    footerNote:
      'IT3030 · Smart Campus — lecturer hub. Bookings APIs power room and lab reservations.',
  },
  TECHNICIAN: {
    roleLabel: 'Technician',
    tagline: 'Track work orders, equipment health, and facility support across campus.',
    statusStrip: [
      { label: 'Campus role', value: 'Technician', highlight: false },
      thru,
      active,
    ],
    quickCards: [
      {
        to: '/maintenance',
        title: 'Work queue',
        description: 'Prioritized tickets, locations, and resolution notes.',
        Icon: HiOutlineWrenchScrewdriver,
        iconClass: 'bg-orange-500/15 text-[#F97316] ring-1 ring-orange-500/30',
      },
      {
        to: '/resources',
        title: 'Equipment & assets',
        description: 'Inspect lab gear, AV kits, and lifecycle status in the field.',
        Icon: HiOutlineCpuChip,
        iconClass: 'bg-emerald-500/15 text-[#10B981] ring-1 ring-emerald-500/30',
      },
      {
        to: '/maintenance',
        title: 'Assigned jobs',
        description: 'What you own today: SLAs, parts, and escalation paths.',
        Icon: HiOutlineClipboardDocumentList,
        iconClass: 'bg-amber-500/15 text-[#F59E0B] ring-1 ring-amber-500/30',
      },
      {
        to: '/profile',
        title: 'Alerts & handover',
        description: 'Shift notes, on-call updates, and notification preferences.',
        Icon: HiOutlineBellAlert,
        iconClass: 'bg-rose-500/15 text-[#F43F5E] ring-1 ring-rose-500/30',
      },
    ],
    accountHint:
      'Technician desk — sync with the maintenance service for live ticket updates.',
    footerNote:
      'IT3030 · Smart Campus — technician field hub. Wire WebSocket or polling for ticket streams.',
  },
}

export function normalizeCampusRole(role: string | undefined): CampusRole {
  const u = (role ?? 'STUDENT').toUpperCase()
  if (u === 'ADMIN' || u === 'LECTURER' || u === 'TECHNICIAN' || u === 'STUDENT') {
    return u
  }
  return 'STUDENT'
}
