package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * MODULE C: Ticket Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequestDTO {
    private String title;
    private String description;
    private String category;
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    private String contactDetails;
    private Long resourceId; // Optional - if incident is for a specific resource
}
