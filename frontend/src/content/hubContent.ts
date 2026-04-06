import {
  HiOutlineBell,
  HiOutlineCalendar,
  HiOutlineSquares2X2,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2'

export const hubHeroHighlights = [
  { value: '150+', label: 'Facilities live' },
  { value: '24/7', label: 'Always accessible' },
  { value: '100%', label: 'Unified platform' },
] as const

export const hubFeatures = [
  {
    to: '/resources',
    title: 'Facilities catalogue',
    description:
      'Browse and search lecture halls, labs, meeting rooms and equipment with real-time availability',
    Icon: HiOutlineSquares2X2,
    circleClass: 'bg-emerald-500/15 text-[#10B981] ring-1 ring-emerald-500/30',
  },
  {
    to: '/bookings',
    title: 'Smart booking',
    description:
      'Request and manage bookings with automated conflict detection and approval workflows',
    Icon: HiOutlineCalendar,
    circleClass: 'bg-blue-500/15 text-[#3B82F6] ring-1 ring-blue-500/30',
  },
  {
    to: '/maintenance',
    title: 'Maintenance tickets',
    description:
      'Report issues, track progress and communicate with technicians through the full lifecycle',
    Icon: HiOutlineWrenchScrewdriver,
    circleClass: 'bg-amber-500/15 text-[#F59E0B] ring-1 ring-amber-500/30',
  },
  {
    to: '/sign-in',
    title: 'Real-time notifications',
    description:
      'Stay updated on booking approvals, ticket status changes and important campus updates',
    Icon: HiOutlineBell,
    circleClass: 'bg-red-500/15 text-[#EF4444] ring-1 ring-red-500/30',
  },
] as const

export const hubStats = [
  { value: '150+', label: 'Facilities available', color: 'text-[#3B82F6]' },
  { value: '2,400+', label: 'Bookings this month', color: 'text-[#10B981]' },
  { value: '95%', label: 'Issue resolution rate', color: 'text-[#F59E0B]' },
  { value: '24hr', label: 'Average response time', color: 'text-[#EF4444]' },
] as const
