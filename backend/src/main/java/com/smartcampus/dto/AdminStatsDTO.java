package com.smartcampus.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsDTO {
    private long totalUsers;
    private long pendingBookings;
    private long openTickets;
    private long activeResources;
}
