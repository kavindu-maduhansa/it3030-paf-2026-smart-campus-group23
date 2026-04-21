// create a resourceService that calls the Spring Boot API using axios
// include methods: getResources, getResourceById, createResource, updateResource, deleteResource

import { apiClient } from './axiosConfig'

const API_URL = '/api/resources'

export interface Resource {
  id?: number
  name: string
  type: string
  location: string
  capacity?: number
  available?: boolean
  description?: string
  availabilityStart?: string
  availabilityEnd?: string
  status?: 'ACTIVE' | 'OUT_OF_SERVICE'
}

export const getResources = () => apiClient.get<Resource[]>(API_URL)

export const getResourceById = (id: number) =>
  apiClient.get<Resource>(`${API_URL}/${id}`)

export interface FilterParams {
  type?: string
  location?: string
  status?: string
}

export const filterResources = (params: FilterParams) => {
  const queryParams = new URLSearchParams()
  if (params.type) queryParams.append('type', params.type)
  if (params.location) queryParams.append('location', params.location)
  if (params.status) queryParams.append('status', params.status)
  
  return apiClient.get<Resource[]>(`${API_URL}/filter?${queryParams.toString()}`)
}

export const createResource = (resource: Resource) =>
  apiClient.post<Resource>(API_URL, resource)

export const updateResource = (id: number, resource: Resource) =>
  apiClient.put<Resource>(`${API_URL}/${id}`, resource)

export const deleteResource = (id: number) =>
  apiClient.delete(`${API_URL}/${id}`)

export const toggleResourceStatus = (id: number) =>
  apiClient.patch<Resource>(`${API_URL}/${id}/status`)
