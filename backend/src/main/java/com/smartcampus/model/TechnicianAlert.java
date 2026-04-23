package com.smartcampus.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "technician_alarts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianAlert {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    @Field("message")
    private String message;

    private AlertType type = AlertType.INFO;

    @Field("target_roles")
    private String targetRoles;

    @Field("created_at")
    private LocalDateTime createdAt;

    public enum AlertType {
        CRITICAL, WARNING, INFO
    }
}
