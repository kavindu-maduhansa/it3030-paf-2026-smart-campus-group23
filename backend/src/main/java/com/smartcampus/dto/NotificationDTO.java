package com.smartcampus.dto;

import com.smartcampus.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    
    private Long id;
    private String title;
    private String description;
    private String type;
    private String severity;
    private Boolean read;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;

    public static NotificationDTO fromEntity(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .description(notification.getDescription())
                .type(notification.getType().name().toLowerCase())
                .severity(notification.getSeverity().name().toLowerCase())
                .read(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}
