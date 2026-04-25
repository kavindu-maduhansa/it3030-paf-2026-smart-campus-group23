import { apiClient } from './axiosConfig'

export interface TicketRequestDTO {
  title: string
  description: string
  category: string
  priority: string
  contactDetails?: string
  resourceId?: number
  status?: string
  removedAttachmentIds?: number[]
  onBehalfOfUserId?: number
  resolutionNotes?: string
}

export interface AttachmentDTO {
  id: number
  url: string
  name: string
}

export interface TicketResponseDTO {
  id: number
  title: string
  description: string
  category: string
  priority: string
  status: string
  contactDetails: string
  userId?: number
  userName?: string
  assignedToId?: number | null
  assignedToName?: string | null
  resourceId?: number
  resourceName?: string
  location?: string
  imageUrls: string[]
  attachments?: AttachmentDTO[]
  resolutionNotes?: string
  resolvedAt?: string
  firstReplyAt?: string
  slaLimit?: number
  createdAt: string
  updatedAt: string
}

export interface CommentResponseDTO {
  id: number
  ticketId: number
  userId: number
  userName: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface CommentRequestDTO {
  content: string
}

const API_URL = '/api/tickets'

export const createTicket = async (ticket: TicketRequestDTO, images: File[]) => {
  const formData = new FormData()
  
  // Create a blob for the JSON part
  const jsonBlob = new Blob([JSON.stringify(ticket)], { type: 'application/json' })
  formData.append('ticket', jsonBlob)
  
  // Append images
  images.forEach((image) => {
    formData.append('images', image)
  })

  return apiClient.post<TicketResponseDTO>(API_URL, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

export const getAllTickets = (params?: { status?: string; priority?: string }) =>
  apiClient.get<TicketResponseDTO[]>(API_URL, { params })

export const getTicketById = (id: number) =>
  apiClient.get<TicketResponseDTO>(`${API_URL}/${id}`)

export const getMyTickets = () =>
  apiClient.get<TicketResponseDTO[]>(`${API_URL}/my`)

export const getAssignedTickets = () =>
  apiClient.get<TicketResponseDTO[]>(`${API_URL}/assigned`)

export const updateTicketStatus = (id: number, status: string) =>
  apiClient.patch<TicketResponseDTO>(`${API_URL}/${id}/status`, null, {
    params: { status },
  })

export const updateTicket = async (id: number, ticketData: Partial<TicketRequestDTO>, images?: File[]): Promise<TicketResponseDTO> => {
  const formData = new FormData()
  
  // Append ticket data as a JSON blob to match @RequestPart in Spring Boot
  formData.append('ticket', new Blob([JSON.stringify(ticketData)], { type: 'application/json' }))
  
  if (images && images.length > 0) {
    images.forEach((image) => {
      formData.append('images', image)
    })
  }

  const response = await apiClient.post<TicketResponseDTO>(`${API_URL}/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const assignTechnician = (id: number, technicianId: number) =>
  apiClient.patch<TicketResponseDTO>(`${API_URL}/${id}/assign`, null, {
    params: { technicianId },
  })

export const selfAssign = (id: number) =>
  apiClient.patch<TicketResponseDTO>(`${API_URL}/${id}/self-assign`)

export const unassignTechnician = (id: number) =>
  apiClient.patch<TicketResponseDTO>(`${API_URL}/${id}/unassign`)

export const deleteTicket = (id: number) =>
  apiClient.delete(`${API_URL}/${id}`)

// Comments API
export const getTicketComments = (ticketId: number) =>
  apiClient.get<CommentResponseDTO[]>(`${API_URL}/${ticketId}/comments`)

export const addComment = (ticketId: number, data: CommentRequestDTO) =>
  apiClient.post<CommentResponseDTO>(`${API_URL}/${ticketId}/comments`, data)

export const updateComment = (commentId: number, data: CommentRequestDTO) =>
  apiClient.put<CommentResponseDTO>(`${API_URL}/comments/${commentId}`, data)

export const deleteComment = (commentId: number) =>
  apiClient.delete(`${API_URL}/comments/${commentId}`)
