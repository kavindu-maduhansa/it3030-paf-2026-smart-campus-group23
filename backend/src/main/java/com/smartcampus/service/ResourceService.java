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
    
    @Autowired
    private MongoResourceSyncService mongoResourceSyncService;

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
     * Filter resources by minimum capacity
     */
    public List<Resource> getResourcesByCapacity(Integer minCapacity) {
        return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
    }

    /**
     * Advanced filtering: type and location
     */
    public List<Resource> filterResources(String type, String location) {
        return resourceRepository.findByTypeAndLocation(type, location);
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
        mongoResourceSyncService.upsertResource(saved);
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
        existing.setAvailabilityStart(resourceDetails.getAvailabilityStart());
        existing.setAvailabilityEnd(resourceDetails.getAvailabilityEnd());
        existing.setStatus(resourceDetails.getStatus());
        
        Resource updated = resourceRepository.save(existing);
        mongoResourceSyncService.upsertResource(updated);
        
        // Broadcast event to all connected WebSocket clients
        ResourceEvent event = ResourceEvent.updated(
            updated.getId(),
            updated.getName(),
            updated.getType(),
            updated.getLocation(),
            "updated"
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
        mongoResourceSyncService.deleteResource(id);
        
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
     * Get resources by status (ACTIVE or OUT_OF_SERVICE)
     */
    public List<Resource> getResourcesByStatus(String status) {
        try {
            com.smartcampus.model.ResourceStatus statusEnum = com.smartcampus.model.ResourceStatus.valueOf(status.toUpperCase());
            return resourceRepository.findByStatus(statusEnum);
        } catch (IllegalArgumentException e) {
            // Invalid status, return empty list
            return List.of();
        }
    }

    /**
     * Toggle resource status (ACTIVE <-> OUT_OF_SERVICE)
     * Throws exception if resource not found
     */
    public Resource toggleResourceStatus(Long id) {
        Resource existing = getResourceById(id);
        
        if (existing.getStatus() == com.smartcampus.model.ResourceStatus.ACTIVE) {
            existing.setStatus(com.smartcampus.model.ResourceStatus.OUT_OF_SERVICE);
        } else {
            existing.setStatus(com.smartcampus.model.ResourceStatus.ACTIVE);
        }
        
        Resource updated = resourceRepository.save(existing);
        mongoResourceSyncService.upsertResource(updated);
        
        // Broadcast event to all connected WebSocket clients
        ResourceEvent event = ResourceEvent.updated(
            updated.getId(),
            updated.getName(),
            updated.getType(),
            updated.getLocation(),
            "status changed to " + updated.getStatus()
        );
        ResourceWebSocketHandler.broadcastResourceUpdate(event);
        
        return updated;
    }


}
