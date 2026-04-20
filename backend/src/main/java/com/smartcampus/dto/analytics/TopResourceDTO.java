package com.smartcampus.dto.analytics;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for top resources by booking count
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopResourceDTO {
    private Long resourceId;
    private String resourceName;
    private String resourceType;
    private String location;
    private Long bookingCount;
}
