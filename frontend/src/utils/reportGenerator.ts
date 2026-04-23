/**
 * Generate and download a CSV report of all users
 */
export function downloadUserReport(users: Array<{
  id: number
  name: string
  email: string
  role: string
  provider?: string
  createdAt?: string
}>) {
  if (users.length === 0) {
    alert('No users to export')
    return
  }

  // CSV Headers
  const headers = ['ID', 'Name', 'Email', 'Role', 'Provider', 'Created Date']

  // Format user data for CSV
  const rows = users.map((user) => [
    user.id.toString(),
    `"${user.name}"`,
    user.email,
    user.role,
    user.provider || 'N/A',
    user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A',
  ])

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `user-management-report-${timestamp}.csv`

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
