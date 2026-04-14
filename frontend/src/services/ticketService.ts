import { apiClient } from './axiosConfig'

export interface TicketRequestDTO {
  title: string
  description: string
  category: string
  priority: string
  contactDetails?: string
  resourceId?: number
}

export interface TicketResponseDTO {
  id: number
  title: string
  description: string
  category: string
  priority: string
  status: string
  contactDetails: string
  resourceName?: string
  imageUrls: string[]
  createdAt: string
  updatedAt: string
}

export interface CommentResponseDTO {
  id: number
  content: string
  authorName: string
  authorRole: string
  createdAt: string
  isMe: boolean
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

export const updateTicketStatus = (id: number, status: string) =>
  apiClient.patch<TicketResponseDTO>(`${API_URL}/${id}/status`, null, {
    params: { status },
  })

export const assignTechnician = (id: number, technicianId: number) =>
  apiClient.patch<TicketResponseDTO>(`${API_URL}/${id}/assign`, null, {
    params: { technicianId },
  })

export const getComments = (ticketId: number) =>
  apiClient.get<CommentResponseDTO[]>(`${API_URL}/${ticketId}/comments`)

export const addComment = (ticketId: number, content: string) =>
  apiClient.post<CommentResponseDTO>(`${API_URL}/${ticketId}/comments`, { content })
