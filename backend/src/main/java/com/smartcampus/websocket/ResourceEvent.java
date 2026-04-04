package com.smartcampus.websocket;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Resource Event Model
 * Used for broadcasting resource updates through WebSocket
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceEvent {
    
    @JsonProperty("type")
    private String type; // CREATE, UPDATE, DELETE
    
    @JsonProperty("action")
    private String action;
    
    @JsonProperty("resourceId")
    private Long resourceId;
    
    @JsonProperty("resourceName")
    private String resourceName;
    
    @JsonProperty("resourceType")
    private String resourceType;
    
    @JsonProperty("location")
    private String location;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("timestamp")
    private Long timestamp;
    
    @JsonProperty("message")
    private String message;

    /**
     * Factory method for CREATE event
     */
    public static ResourceEvent created(Long id, String name, String type, String location) {
        return new ResourceEvent(
            "RESOURCE_CREATED",
            "CREATE",
            id,
            name,
            type,
            location,
            "ACTIVE",
            System.currentTimeMillis(),
            "Resource '" + name + "' has been created"
        );
    }

    /**
     * Factory method for UPDATE event
     */
    public static ResourceEvent updated(Long id, String name, String type, String location, String status) {
        return new ResourceEvent(
            "RESOURCE_UPDATED",
            "UPDATE",
            id,
            name,
            type,
            location,
            status,
            System.currentTimeMillis(),
            "Resource '" + name + "' has been updated"
        );
    }

    /**
     * Factory method for DELETE event
     */
    public static ResourceEvent deleted(Long id, String name) {
        return new ResourceEvent(
            "RESOURCE_DELETED",
            "DELETE",
            id,
            name,
            null,
            null,
            null,
            System.currentTimeMillis(),
            "Resource '" + name + "' has been deleted"
        );
    }
}
