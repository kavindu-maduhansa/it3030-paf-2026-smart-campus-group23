package com.smartcampus.service;

import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * MODULE A: Resource Service
 * Handles business logic for facility/asset management
 */
@Service
@Transactional
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    // improve this service to follow best practices
    // throw proper exceptions if resource is not found
    // updateResource should first find the resource then update fields
    // deleteResource should check if resource exists before deleting

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
        Resource existing = getResourceById(id);
        
        existing.setName(resourceDetails.getName());
        existing.setType(resourceDetails.getType());
        existing.setCapacity(resourceDetails.getCapacity());
        existing.setLocation(resourceDetails.getLocation());
        existing.setStatus(resourceDetails.getStatus());
        
        return resourceRepository.save(existing);
    }

    /**
     * Delete resource
     */
    public void deleteResource(Long id) {
        Resource existing = getResourceById(id);
        resourceRepository.delete(existing);
    }

    /**
     * Find available resources by type and capacity
     */
    public List<Resource> findAvailableResources(String type, Integer capacity) {
        return resourceRepository.findAvailableByTypeAndCapacity(type, capacity);
    }
}
