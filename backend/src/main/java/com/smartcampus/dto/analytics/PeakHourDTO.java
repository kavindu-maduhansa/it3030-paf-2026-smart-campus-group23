package com.smartcampus.dto.analytics;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for peak booking hours
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PeakHourDTO {
    private int hour;
    private Long bookingCount;
    private String timeLabel; // e.g., "09:00 - 10:00"
}
