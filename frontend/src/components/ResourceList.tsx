import { useCallback, useEffect, useState } from 'react'
import { getResources } from '../services/resourceService'
import type { Resource } from '../services/resourceService'
import webSocketService from '../services/webSocketService'
import type { ResourceEvent } from '../services/webSocketService'
import ResourceSearch from './ResourceSearch'

const ResourceList = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const loadResources = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getResources()
      setResources(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to load resources')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleResourceEvent = useCallback(
    (event: ResourceEvent) => {
      if (event.action === 'DELETE') {
        setResources((prev) => prev.filter((r) => r.id !== event.resourceId))
        return
      }
      if (event.action === 'CREATE' || event.action === 'UPDATE') {
        void loadResources()
      }
    },
    [loadResources]
  )

  const connectWebSocket = useCallback(async () => {
    try {
      await webSocketService.connect()
      webSocketService.subscribe(handleResourceEvent)
    } catch (err) {
      console.error('Failed to connect WebSocket:', err)
    }
  }, [handleResourceEvent])

  useEffect(() => {
    void loadResources()
    void connectWebSocket()
    return () => {
      webSocketService.disconnect()
    }
  }, [loadResources, connectWebSocket])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-[#1F2937] border-t-[#3B82F6]"
          aria-hidden
        />
        <p className="text-sm font-medium text-[#94A3B8]">Loading facilities…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="rounded-2xl border border-[#EF4444]/30 bg-[#111827] p-6 text-center shadow-lg shadow-black/30"
        role="alert"
      >
        <p className="font-semibold text-[#F87171]">{error}</p>
        <button
          type="button"
          onClick={() => loadResources()}
          className="mt-4 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(59,130,246,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_28px_rgba(59,130,246,0.5)]"
        >
          Try again
        </button>
      </div>
    )
  }

  const filteredResources = resources.filter(
    (resource) =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <header className="mb-8 border-b border-[#1F2937] pb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#3B82F6]">
          Module A · Facilities
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Facilities catalogue
        </h1>
        <p className="mt-2 max-w-2xl text-[#94A3B8]">
          Browse rooms, labs, and equipment. Data updates in real time when WebSocket is connected.
        </p>
      </header>

      <ResourceSearch onSearch={setSearchTerm} />

      <div className="overflow-hidden rounded-2xl border border-[#1F2937] bg-[#111827] shadow-xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#1E293B]">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Name
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Type
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Capacity
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Location
                </th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-[#CBD5E1]">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-[#94A3B8]">
                    No resources match your search.
                  </td>
                </tr>
              ) : (
                filteredResources.map((resource) => (
                  <tr
                    key={resource.id}
                    className="transition-colors hover:bg-[#3B82F6]/[0.08]"
                  >
                    <td className="px-5 py-4 font-medium text-white">{resource.name}</td>
                    <td className="px-5 py-4">{resource.type}</td>
                    <td className="px-5 py-4 tabular-nums">{resource.capacity}</td>
                    <td className="px-5 py-4">{resource.location}</td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          resource.status === 'ACTIVE'
                            ? 'inline-flex rounded-full bg-[#10B981]/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-[#10B981]/35'
                            : 'inline-flex rounded-full bg-[#1E293B] px-3 py-1 text-xs font-semibold text-[#94A3B8] ring-1 ring-[#334155]'
                        }
                      >
                        {resource.status === 'ACTIVE' ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ResourceList
