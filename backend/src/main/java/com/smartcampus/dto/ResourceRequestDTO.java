package com.smartcampus.dto;

import com.smartcampus.model.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ResourceRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String type;

    @Positive
    private int capacity;

    @NotBlank
    private String location;

    @NotNull
    private Resource.ResourceStatus status;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
}
