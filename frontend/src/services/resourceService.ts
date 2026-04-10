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
  status?: string
  description?: string
  availabilityStart?: string
  availabilityEnd?: string
}

export const getResources = () => apiClient.get<Resource[]>(API_URL)

export const getResourceById = (id: number) =>
  apiClient.get<Resource>(`${API_URL}/${id}`)

export const createResource = (resource: Resource) =>
  apiClient.post<Resource>(API_URL, resource)

export const updateResource = (id: number, resource: Resource) =>
  apiClient.put<Resource>(`${API_URL}/${id}`, resource)

export const deleteResource = (id: number) =>
  apiClient.delete(`${API_URL}/${id}`)
