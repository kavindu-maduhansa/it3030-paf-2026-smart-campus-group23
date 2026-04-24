package com.smartcampus.controller;

import com.smartcampus.model.Resource;
import com.smartcampus.service.ResourceService;
import com.smartcampus.dto.ResourceRequestDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * MODULE A: Resource Management REST Controller
 * Provides endpoints for managing facilities and assets catalogue
 * Supports CRUD operations and advanced filtering
 */
@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    /**
     * GET: Retrieve all resources
     * HTTP: 200 OK
     */
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources() {
        List<Resource> resources = resourceService.getAllResources();
        return ResponseEntity.ok(resources);
    }

    /**
     * GET: Retrieve resource by ID
     * HTTP: 200 OK, 404 NOT FOUND
     */
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        Resource resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    /**
     * POST: Create new resource with validation
     * HTTP: 201 CREATED, 400 BAD REQUEST
     * Requires: name, type, capacity, location, status
     * Restricted to: ADMIN, TECHNICIAN
     */
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody ResourceRequestDTO request) {
        Resource resource = new Resource();
        resource.setName(request.getName());
        resource.setDescription(request.getDescription());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setAvailabilityStart(request.getAvailabilityStart());
        resource.setAvailabilityEnd(request.getAvailabilityEnd());
        resource.setStatus(request.getStatus() != null ? request.getStatus() : com.smartcampus.model.ResourceStatus.ACTIVE);
        
        Resource created = resourceService.createResource(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT: Update existing resource with validation
     * HTTP: 200 OK, 400 BAD REQUEST, 404 NOT FOUND
     * Restricted to: ADMIN, TECHNICIAN
     */
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequestDTO request) {
        Resource resourceDetails = new Resource();
        resourceDetails.setName(request.getName());
        resourceDetails.setDescription(request.getDescription());
        resourceDetails.setType(request.getType());
        resourceDetails.setCapacity(request.getCapacity());
        resourceDetails.setLocation(request.getLocation());
        resourceDetails.setAvailabilityStart(request.getAvailabilityStart());
        resourceDetails.setAvailabilityEnd(request.getAvailabilityEnd());
        resourceDetails.setStatus(request.getStatus() != null ? request.getStatus() : com.smartcampus.model.ResourceStatus.ACTIVE);
        
        Resource updated = resourceService.updateResource(id, resourceDetails);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE: Delete resource
     * HTTP: 204 NO CONTENT, 404 NOT FOUND
     * Restricted to: ADMIN, TECHNICIAN
     */
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET: Search resources by name, location, or description
     * HTTP: 200 OK
     * Query Param: query (search term)
     */
    @GetMapping("/search")
    public ResponseEntity<List<Resource>> searchResources(@RequestParam String query) {
        List<Resource> results = resourceService.searchResources(query);
        return ResponseEntity.ok(results);
    }

    /**
     * GET: Filter resources by type
     * HTTP: 200 OK
     * Example: /api/resources/type/LECTURE_HALL
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Resource>> getResourcesByType(@PathVariable String type) {
        List<Resource> resources = resourceService.getResourcesByType(type);
        return ResponseEntity.ok(resources);
    }

    /**
     * GET: Filter resources by location
     * HTTP: 200 OK
     * Example: /api/resources/location/Building%20A
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<List<Resource>> getResourcesByLocation(@PathVariable String location) {
        List<Resource> resources = resourceService.getResourcesByLocation(location);
        return ResponseEntity.ok(resources);
    }

    /**
     * GET: Filter resources by minimum capacity
     * HTTP: 200 OK
     * Query Param: capacity (minimum capacity required)
     */
    @GetMapping("/capacity")
    public ResponseEntity<List<Resource>> getResourcesByCapacity(@RequestParam Integer minCapacity) {
        List<Resource> resources = resourceService.getResourcesByCapacity(minCapacity);
        return ResponseEntity.ok(resources);
    }

    /**
     * GET: Advanced filtering with multiple criteria
     * HTTP: 200 OK
     * Query Params: type, location
     */
    @GetMapping("/filter")
    public ResponseEntity<List<Resource>> filterResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer capacity) {
        List<Resource> resources = resourceService.filterResources(type, location, status, capacity);
        return ResponseEntity.ok(resources);
    }

    /**
     * GET: Filter resources by status
     * HTTP: 200 OK
     * Example: /api/resources/status/ACTIVE
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Resource>> getResourcesByStatus(@PathVariable String status) {
        List<Resource> resources = resourceService.getResourcesByStatus(status);
        return ResponseEntity.ok(resources);
    }

    /**
     * PATCH: Toggle resource status (ACTIVE <-> OUT_OF_SERVICE)
     * HTTP: 200 OK, 404 NOT FOUND
     * Restricted to: ADMIN, TECHNICIAN
     */
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Resource> toggleResourceStatus(@PathVariable Long id) {
        Resource updated = resourceService.toggleResourceStatus(id);
        return ResponseEntity.ok(updated);
    }
}

