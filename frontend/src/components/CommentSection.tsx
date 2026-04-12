import { useState } from 'react'
import { HiOutlineChatBubbleLeftRight, HiOutlinePaperAirplane, HiOutlineUserCircle } from 'react-icons/hi2'
import { Pill } from '../pages/dashboard/dashboardUi'

interface Comment {
  id: string
  author: string
  role: 'student' | 'staff' | 'technician'
  content: string
  timestamp: string
  isMe?: boolean
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    author: 'Alex Johnson',
    role: 'student',
    content: "The projector still has a weird yellow tint after I turned it on this morning. Is it possible the bulb needs replacing?",
    timestamp: '2h ago',
    isMe: false
  },
  {
    id: '2',
    author: 'Mike Tech',
    role: 'technician',
    content: "Thanks for the update, Alex. I've ordered a replacement bulb and will stop by Hall A around 2 PM to swap it out.",
    timestamp: '1h ago',
    isMe: false
  },
  {
    id: '3',
    author: 'Sarah Admin',
    role: 'staff',
    content: "I've also notified the department head so they can adjust the lecture schedule if needed.",
    timestamp: '45m ago',
    isMe: true
  }
]

export default function CommentSection({ ticketId }: { ticketId: string }) {
  const [comments] = useState<Comment[]>(MOCK_COMMENTS)
  const [newComment, setNewComment] = useState('')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <HiOutlineChatBubbleLeftRight className="h-5 w-5 text-[#3B82F6]" />
        <h3 className="text-lg font-bold text-white">Conversation</h3>
        <span className="ml-auto text-xs font-mono text-[#64748B]">Ticket ID: {ticketId}</span>
      </div>

      {/* Comment List */}
      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#1F2937] scrollbar-track-transparent">
        {comments.map((c) => (
          <div key={c.id} className={`flex gap-3 ${c.isMe ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className="shrink-0 pt-1">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                c.role === 'technician' ? 'bg-amber-500/10 text-amber-500' : 
                c.role === 'staff' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-slate-700/50 text-slate-400'
              }`}>
                <HiOutlineUserCircle className="h-6 w-6" />
              </div>
            </div>

            {/* Bubble */}
            <div className={`flex max-w-[85%] flex-col gap-1 ${c.isMe ? 'items-end' : ''}`}>
              <div className="flex items-center gap-2 px-1">
                <span className="text-xs font-bold text-white">{c.author}</span>
                {c.role !== 'student' && (
                  <Pill variant={c.role === 'technician' ? 'warning' : 'info'}>
                    {c.role.toUpperCase()}
                  </Pill>
                )}
                <span className="text-[10px] text-[#64748B]">{c.timestamp}</span>
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
        ))}
      </div>

      {/* Input Area */}
      <div className="mt-8 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#3B82F6]/20 to-transparent blur opacity-0 transition-opacity duration-500 group-within:opacity-100" />
        <div className="relative flex items-center gap-2 rounded-2xl border border-[#334155] bg-[#0F172A]/80 p-2 backdrop-blur-xl transition-all focus-within:border-[#3B82F6] focus-within:ring-1 focus-within:ring-[#3B82F6]/50">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-[#64748B] focus:outline-none"
          />
          <button
            disabled={!newComment.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6] text-white shadow-lg transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-40"
          >
            <HiOutlinePaperAirplane className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-[#64748B] text-center">
          Visible to students and technicians assigned to this ticket.
        </p>
      </div>
    </div>
  )
}
