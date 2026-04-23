package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationStatsDTO {
    
    private long resourceCount;
    private long facilityCount;
    private long bookingCount;
    private long maintenanceCount;
    private long ticketCount;
    
    public long getTotal() {
        return resourceCount + facilityCount + bookingCount + maintenanceCount + ticketCount;
    }
}
