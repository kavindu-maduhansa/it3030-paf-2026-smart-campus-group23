package com.smartcampus.controller;

import com.smartcampus.model.Resource;
import com.smartcampus.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Resource Management Controller for Development
 * Allows creating test resources for demonstration
 */
@RestController
@RequestMapping("/api/dev/resources")
public class DevResourceController {

    @Autowired
    private ResourceService resourceService;

    @PostMapping("/create")
    public ResponseEntity<?> createResource(
            @RequestParam String name,
            @RequestParam String type,
            @RequestParam String location,
            @RequestParam(required = false, defaultValue = "50") Integer capacity,
            @RequestParam(required = false, defaultValue = "ACTIVE") String status) {
        try {
            Resource resource = new Resource();
            resource.setName(name);
            resource.setType(type);
            resource.setLocation(location);
            resource.setCapacity(capacity);
            resource.setStatus(Resource.ResourceStatus.valueOf(status.toUpperCase()));
            resource.setAvailabilityStart(LocalTime.of(8, 0)); // 8 AM
            resource.setAvailabilityEnd(LocalTime.of(22, 0)); // 10 PM
            resource.setDescription("Sample resource for testing");

            Resource created = resourceService.createResource(resource);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Resource created successfully");
            response.put("id", created.getId());
            response.put("name", created.getName());
            response.put("type", created.getType());
            response.put("location", created.getLocation());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("success", "false");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/create-samples")
    public ResponseEntity<?> createSampleResources() {
        try {
            String[][] samples = {
                    {"Lecture Hall A", "LECTURE_HALL", "Building A, First Floor", "100"},
                    {"Lecture Hall B", "LECTURE_HALL", "Building A, Second Floor", "80"},
                    {"Computer Lab 1", "LAB", "Building B, Ground Floor", "40"},
                    {"Physics Lab", "LAB", "Building B, First Floor", "30"},
                    {"Meeting Room 101", "MEETING_ROOM", "Building C, First Floor", "12"},
                    {"Meeting Room 102", "MEETING_ROOM", "Building C, Second Floor", "8"},
                    {"Projector", "EQUIPMENT", "Available for loan", "1"},
                    {"Microscope", "EQUIPMENT", "Biology Department", "1"}
            };

            int created = 0;
            for (String[] sample : samples) {
                try {
                    Resource resource = new Resource();
                    resource.setName(sample[0]);
                    resource.setType(sample[1]);
                    resource.setLocation(sample[2]);
                    resource.setCapacity(Integer.parseInt(sample[3]));
                    resource.setStatus(Resource.ResourceStatus.ACTIVE);
                    resource.setAvailabilityStart(LocalTime.of(8, 0));
                    resource.setAvailabilityEnd(LocalTime.of(22, 0));
                    resource.setDescription("Sample resource for testing");
                    resourceService.createResource(resource);
                    created++;
                } catch (Exception ignored) {
                    // Skip duplicates
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Sample resources created successfully");
            response.put("count", created);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("success", "false");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
