package com.smartcampus.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Resource name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Resource type is required")
    @Column(nullable = false)
    private String type; // e.g., LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT

    @NotBlank(message = "Resource location is required")
    @Column(nullable = false)
    private String location;

    @PositiveOrZero(message = "Capacity must be zero or positive")
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status; // ACTIVE, OUT_OF_SERVICE

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum ResourceStatus {
        ACTIVE, OUT_OF_SERVICE
    }
}
