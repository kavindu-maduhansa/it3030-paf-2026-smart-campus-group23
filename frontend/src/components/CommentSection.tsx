import { useState, useEffect } from 'react'
import { 
  HiOutlineChatBubbleLeftRight, HiOutlinePaperAirplane, 
  HiOutlinePencilSquare, HiOutlineTrash, HiOutlineXMark,
  HiOutlineCheck
} from 'react-icons/hi2'
import ConfirmModal from './ConfirmModal'
import { getTicketComments, addComment, updateComment, deleteComment } from '../services/ticketService'
import type { CommentResponseDTO } from '../services/ticketService'
import { useAuth } from '../services/useAuth'
import { toast } from '../services/toast'

interface CommentSectionProps {
  ticketId: number
  autoFocus?: boolean
  reporterId?: number
  assigneeId?: number | null
}

export default function CommentSection({ ticketId, autoFocus = false, reporterId, assigneeId }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<CommentResponseDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null)

  const isAdmin = user?.role === 'ADMIN'
  const isOwner = user?.id === reporterId
  const isAssignee = user?.id === assigneeId
  const canComment = isAdmin || isOwner || isAssignee

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await getTicketComments(ticketId)
      setComments(response.data)
    } catch (err) {
      console.error('Failed to load comments', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [ticketId])

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newComment.trim() || submitting) return

    try {
      setSubmitting(true)
      await addComment(ticketId, { content: newComment.trim() })
      setNewComment('')
      await loadComments()
      toast.success('Comment added successfully')
    } catch (err) {
      console.error('Failed to add comment', err)
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStartEdit = (comment: CommentResponseDTO) => {
    setEditingCommentId(comment.id)
    setEditValue(comment.content)
  }

  const handleSaveEdit = async (commentId: number) => {
    if (!editValue.trim()) return
    try {
      setSubmitting(true)
      await updateComment(commentId, { content: editValue.trim() })
      setEditingCommentId(null)
      await loadComments()
      toast.success('Comment updated')
    } catch (err) {
      console.error('Failed to update comment', err)
      toast.error('Failed to update comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId)
      await loadComments()
      toast.success('Comment deleted')
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Failed to delete comment', err)
      toast.error('Failed to delete comment')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-[#1F2937] pb-4">
        <HiOutlineChatBubbleLeftRight className="h-5 w-5 text-[#3B82F6]" />
        <h3 className="text-lg font-bold text-white">Comments ({comments.length})</h3>
      </div>

      {/* Add Comment Input */}
      {canComment ? (
        <form onSubmit={handleAddComment} className="relative">
          <textarea
            autoFocus={autoFocus}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment or update..."
            className="w-full rounded-2xl border border-[#1F2937] bg-[#111827] p-4 pr-12 text-sm text-white placeholder:text-[#475569] focus:border-[#3B82F6] focus:outline-none transition-all min-h-[100px] resize-none"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6] text-white transition-all hover:bg-blue-500 disabled:opacity-30"
          >
            <HiOutlinePaperAirplane className="h-5 w-5 rotate-90" />
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-[#1F2937] bg-[#111827]/50 p-4 text-center">
          <p className="text-xs text-[#64748B]">Only the ticket owner and assigned technician can participate in this discussion.</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <div className="flex py-10 justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#3B82F6]" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center py-10 text-[#64748B] text-sm">No comments yet. Start the conversation!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group relative rounded-2xl border border-[#1F2937] bg-[#0F172A] p-4 hover:border-[#334155] transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E293B] text-[10px] font-bold text-[#3B82F6] uppercase">
                    {comment.userName.substring(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{comment.userName}</p>
                    <p className="text-[10px] text-[#64748B]">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {/* Ownership Actions */}
                {(user?.id === comment.userId || user?.role === 'ADMIN') && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleStartEdit(comment)}
                      className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#1F2937] hover:text-amber-400"
                    >
                      <HiOutlinePencilSquare className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(comment.id)}
                      className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#1F2937] hover:text-red-400"
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3">
                {editingCommentId === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full rounded-xl border border-[#3B82F6] bg-[#111827] p-3 text-sm text-white focus:outline-none min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingCommentId(null)}
                        className="rounded-lg p-2 text-[#64748B] hover:bg-[#1F2937]"
                      >
                        <HiOutlineXMark className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleSaveEdit(comment.id)}
                        className="rounded-lg bg-[#3B82F6] p-2 text-white hover:bg-blue-500"
                      >
                        <HiOutlineCheck className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        show={showDeleteConfirm !== null}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={() => showDeleteConfirm && handleDeleteComment(showDeleteConfirm)}
        onCancel={() => setShowDeleteConfirm(null)}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
