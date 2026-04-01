package com.smartcampus.controller;

import com.smartcampus.model.Resource;
import com.smartcampus.service.ResourceService;
import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.dto.ResourceRequestDTO;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


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
     * POST: Create new resource
     * HTTP: 201 CREATED, 400 BAD REQUEST
     */
    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody ResourceRequestDTO request) {
        Resource resource = new Resource();
        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setStatus(request.getStatus());
        
        Resource created = resourceService.createResource(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT: Update existing resource
     * HTTP: 200 OK, 400 BAD REQUEST, 404 NOT FOUND
     */
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody Resource resourceDetails) {
        Resource updated = resourceService.updateResource(id, resourceDetails);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE: Delete resource
     * HTTP: 204 NO CONTENT, 404 NOT FOUND
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET: Search resources by query
     * HTTP: 200 OK
     */
    @GetMapping("/search")
    public ResponseEntity<List<Resource>> searchResources(@RequestParam String query) {
        List<Resource> results = resourceService.searchResources(query);
        return ResponseEntity.ok(results);
    }

    /**
     * GET: Filter resources by type
     * HTTP: 200 OK
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Resource>> getResourcesByType(@PathVariable String type) {
        List<Resource> resources = resourceService.getResourcesByType(type);
        return ResponseEntity.ok(resources);
    }

    /**
     * GET: Filter resources by location
     * HTTP: 200 OK
     */
    @GetMapping("/location/{location}")
    public ResponseEntity<List<Resource>> getResourcesByLocation(@PathVariable String location) {
        List<Resource> resources = resourceService.getResourcesByLocation(location);
        return ResponseEntity.ok(resources);
    }
}
