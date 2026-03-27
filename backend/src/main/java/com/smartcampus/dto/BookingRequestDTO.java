package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MODULE B: Booking Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {
    private Long resourceId;
    private String bookingDate;
    private String startTime;
    private String endTime;
    private String purpose;
    private Integer expectedAttendees;
}
