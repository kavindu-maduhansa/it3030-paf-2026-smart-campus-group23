package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * MODULE A: Resource DTO for API responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceDTO {
    private Long id;
    private String name;
    private String type;
    private String location;
    private Integer capacity;
    private String status; // ACTIVE, OUT_OF_SERVICE
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
