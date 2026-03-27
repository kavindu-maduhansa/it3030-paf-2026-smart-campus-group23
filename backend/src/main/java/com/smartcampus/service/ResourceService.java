package com.smartcampus.service;

import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * MODULE A: Resource Service
 * Handles business logic for facility/asset management
 */
@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    /**
     * Get all resources
     */
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    /**
     * Get resource by ID
     */
    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    /**
     * Search resources by type
     */
    public List<Resource> getResourcesByType(String type) {
        return resourceRepository.findByType(type);
    }

    /**
     * Search resources by location
     */
    public List<Resource> getResourcesByLocation(String location) {
        return resourceRepository.findByLocation(location);
    }

    /**
     * Search resources by name/location (full-text search)
     */
    public List<Resource> searchResources(String query) {
        return resourceRepository.searchResources(query);
    }

    /**
     * Create new resource
     */
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    /**
     * Update resource
     */
    public Resource updateResource(Long id, Resource resourceDetails) {
        Resource resource = getResourceById(id);
        // TODO: Update fields
        return resourceRepository.save(resource);
    }

    /**
     * Delete resource
     */
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    /**
     * Find available resources by type and capacity
     */
    public List<Resource> findAvailableResources(String type, Integer capacity) {
        return resourceRepository.findAvailableByTypeAndCapacity(type, capacity);
    }
}
