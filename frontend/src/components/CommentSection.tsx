import { useState, useEffect } from 'react'
import { HiOutlineChatBubbleLeftRight, HiOutlinePaperAirplane, HiOutlineUserCircle } from 'react-icons/hi2'
import { Pill } from '../pages/dashboard/dashboardUi'
import { getComments, addComment } from '../services/ticketService'
import type { CommentResponseDTO } from '../services/ticketService'

function timeAgo(date: string) {
  const now = new Date()
  const then = new Date(date)
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function CommentSection({ ticketId }: { ticketId: string }) {
  const [comments, setComments] = useState<CommentResponseDTO[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const fetchComments = async () => {
    try {
      const response = await getComments(Number(ticketId))
      setComments(response.data)
    } catch (err) {
      console.error('Failed to fetch comments', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [ticketId])

  const handleSend = async () => {
    if (!newComment.trim() || isSending) return
    setIsSending(true)
    try {
      await addComment(Number(ticketId), newComment)
      setNewComment('')
      await fetchComments() // Refresh list
    } catch (err) {
      console.error('Failed to post comment', err)
      alert('Failed to send comment. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const getRoleDisplay = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
      case 'LECTURER':
        return 'staff'
      case 'TECHNICIAN':
        return 'technician'
      default:
        return 'student'
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <HiOutlineChatBubbleLeftRight className="h-5 w-5 text-[#3B82F6]" />
        <h3 className="text-lg font-bold text-white">Conversation</h3>
        <span className="ml-auto text-xs font-mono text-[#64748B]">Ticket ID: {ticketId}</span>
      </div>

      {/* Comment List */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1F2937] scrollbar-track-transparent">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3B82F6] border-t-transparent" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#64748B]">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          comments.map((c) => {
            const displayRole = getRoleDisplay(c.authorRole)
            return (
              <div key={c.id} className={`flex gap-3 ${c.isMe ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="shrink-0 pt-1">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    displayRole === 'technician' ? 'bg-amber-500/10 text-amber-500' : 
                    displayRole === 'staff' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    <HiOutlineUserCircle className="h-6 w-6" />
                  </div>
                </div>

                {/* Bubble */}
                <div className={`flex max-w-[85%] flex-col gap-1 ${c.isMe ? 'items-end' : ''}`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-bold text-white">{c.authorName}</span>
                    {displayRole !== 'student' && (
                      <Pill variant={displayRole === 'technician' ? 'warning' : 'info'}>
                        {displayRole.toUpperCase()}
                      </Pill>
                    )}
                    <span className="text-[10px] text-[#64748B]">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                  
                  <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    c.isMe 
                      ? 'bg-[#3B82F6] text-white rounded-tr-none' 
                      : 'bg-[#1F2937] text-[#D1D5DB] rounded-tl-none border border-[#334155]/30'
                  }`}>
                    {c.content}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input Area */}
      <div className="mt-8 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#3B82F6]/20 to-transparent blur opacity-0 transition-opacity duration-500 group-within:opacity-100" />
        <div className="relative flex items-center gap-2 rounded-2xl border border-[#334155] bg-[#0F172A]/80 p-2 backdrop-blur-xl transition-all focus-within:border-[#3B82F6] focus-within:ring-1 focus-within:ring-[#3B82F6]/50">
          <input
            type="text"
            value={newComment}
            disabled={isSending}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isSending ? "Sending..." : "Write a message..."}
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-[#64748B] focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!newComment.trim() || isSending}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6] text-white shadow-lg transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-40"
          >
            {isSending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <HiOutlinePaperAirplane className="h-5 w-5" />
            )}
          </button>
        </div>
        <p className="mt-2 text-[10px] text-[#64748B] text-center">
          Visible to students and technicians assigned to this ticket.
        </p>
      </div>
    </div>
  )
}
