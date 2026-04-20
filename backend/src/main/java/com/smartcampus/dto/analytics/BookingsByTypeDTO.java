package com.smartcampus.dto.analytics;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for bookings by resource type
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingsByTypeDTO {
    private String type;
    private Long bookingCount;
}
