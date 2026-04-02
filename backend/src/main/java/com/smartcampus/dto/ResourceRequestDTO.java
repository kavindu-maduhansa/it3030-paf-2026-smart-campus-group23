package com.smartcampus.dto;

import com.smartcampus.model.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalTime;

/**
 * DTO for Resource creation and update requests
 * Includes validation annotations for input validation
 */
public class ResourceRequestDTO {

    @NotBlank(message = "Resource name is required")
    private String name;

    private String description;

    @NotBlank(message = "Resource type is required")
    private String type;

    @Positive(message = "Capacity must be positive")
    private int capacity;

    @NotBlank(message = "Resource location is required")
    private String location;

    @NotNull(message = "Resource status is required")
    private Resource.ResourceStatus status;

    private LocalTime availabilityStart;

    private LocalTime availabilityEnd;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Resource.ResourceStatus getStatus() {
        return status;
    }

    public void setStatus(Resource.ResourceStatus status) {
        this.status = status;
    }

    public LocalTime getAvailabilityStart() {
        return availabilityStart;
    }

    public void setAvailabilityStart(LocalTime availabilityStart) {
        this.availabilityStart = availabilityStart;
    }

    public LocalTime getAvailabilityEnd() {
        return availabilityEnd;
    }

    public void setAvailabilityEnd(LocalTime availabilityEnd) {
        this.availabilityEnd = availabilityEnd;
    }
}
