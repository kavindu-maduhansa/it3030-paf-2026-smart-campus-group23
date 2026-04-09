package com.smartcampus.dto;

import com.smartcampus.model.Ticket.TicketPriority;
import com.smartcampus.model.Ticket.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String location;
    private TicketPriority priority;
    private TicketStatus status;
    private String contactDetails;
    private Long resourceId;
    private String resourceName;
    private Long userId;
    private String userName;
    private Long assignedToId;
    private String assignedToName;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
