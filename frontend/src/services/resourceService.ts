// create a resourceService that calls the Spring Boot API using axios
// include methods: getResources, getResourceById, createResource, updateResource, deleteResource

import axios from "axios";

const API_URL = "http://localhost:8080/api/resources";

export interface Resource {
  id?: number;
  name: string;
  type: string;
  location: string;
  capacity?: number;
  available?: boolean;
  status?: string;
}

export const getResources = () => axios.get<Resource[]>(API_URL);

export const getResourceById = (id: number) =>
  axios.get<Resource>(`${API_URL}/${id}`);

export const createResource = (resource: Resource) =>
  axios.post<Resource>(API_URL, resource);

export const updateResource = (id: number, resource: Resource) =>
  axios.put<Resource>(`${API_URL}/${id}`, resource);

export const deleteResource = (id: number) =>
  axios.delete(`${API_URL}/${id}`);
