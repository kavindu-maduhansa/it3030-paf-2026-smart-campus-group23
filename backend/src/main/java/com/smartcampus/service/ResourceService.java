package com.smartcampus.service;

import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.websocket.ResourceEvent;
import com.smartcampus.websocket.ResourceWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * MODULE A: Resource Service
 * Handles business logic for facility/asset management
 * Implements search, filtering, and CRUD operations
 */
@Service
@Transactional
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
     * Throws exception if not found
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
     * Filter resources by status
     */
    public List<Resource> getResourcesByStatus(Resource.ResourceStatus status) {
        return resourceRepository.findByStatus(status);
    }

    /**
     * Filter resources by minimum capacity (active only)
     */
    public List<Resource> getResourcesByCapacity(Integer minCapacity) {
        return resourceRepository.findByCapacityGreaterThanEqualAndStatus(minCapacity, Resource.ResourceStatus.ACTIVE);
    }

    /**
     * Advanced filtering: type, location, and status
     */
    public List<Resource> filterResources(String type, String location, Resource.ResourceStatus status) {
        return resourceRepository.findByTypeAndLocationAndStatus(type, location, status);
    }

    /**
     * Search resources by name/location/description (full-text search)
     */
    public List<Resource> searchResources(String query) {
        return resourceRepository.searchResources(query);
    }

    /**
     * Find available resources by type and capacity
     */
    public List<Resource> findAvailableResources(String type, Integer capacity) {
        return resourceRepository.findAvailableByTypeAndCapacity(type, capacity);
    }

    /**
     * Create new resource
     */
    public Resource createResource(Resource resource) {
        Resource saved = resourceRepository.save(resource);
        // Broadcast event to all connected WebSocket clients
        ResourceEvent event = ResourceEvent.created(
            saved.getId(),
            saved.getName(),
            saved.getType(),
            saved.getLocation()
        );
        ResourceWebSocketHandler.broadcastResourceUpdate(event);
        return saved;
    }

    /**
     * Update existing resource
     * Throws exception if resource not found
     */
    public Resource updateResource(Long id, Resource resourceDetails) {
        Resource existing = getResourceById(id);
        
        existing.setName(resourceDetails.getName());
        existing.setDescription(resourceDetails.getDescription());
        existing.setType(resourceDetails.getType());
        existing.setCapacity(resourceDetails.getCapacity());
        existing.setLocation(resourceDetails.getLocation());
        existing.setStatus(resourceDetails.getStatus());
        existing.setAvailabilityStart(resourceDetails.getAvailabilityStart());
        existing.setAvailabilityEnd(resourceDetails.getAvailabilityEnd());
        
        Resource updated = resourceRepository.save(existing);
        
        // Broadcast event to all connected WebSocket clients
        ResourceEvent event = ResourceEvent.updated(
            updated.getId(),
            updated.getName(),
            updated.getType(),
            updated.getLocation(),
            updated.getStatus().toString()
        );
        ResourceWebSocketHandler.broadcastResourceUpdate(event);
        
        return updated;
    }

    /**
     * Delete resource
     * Throws exception if resource not found
     */
    public void deleteResource(Long id) {
        Resource existing = getResourceById(id);
        String name = existing.getName();
        resourceRepository.delete(existing);
        
        // Broadcast event to all connected WebSocket clients
        ResourceEvent event = ResourceEvent.deleted(id, name);
        ResourceWebSocketHandler.broadcastResourceUpdate(event);
    }

    /**
     * Get count of resources by type
     */
    public Long countResourcesByType(String type) {
        return resourceRepository.countByType(type);
    }

    /**
     * Get count of active resources
     */
    public Long countActiveResources() {
        return resourceRepository.countByStatus(Resource.ResourceStatus.ACTIVE);
    }
}
