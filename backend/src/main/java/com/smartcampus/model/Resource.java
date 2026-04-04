package com.smartcampus.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalTime;

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

    @Column(columnDefinition = "TEXT")
    private String description;

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

    @Column(name = "availability_start", columnDefinition = "TIME")
    private LocalTime availabilityStart;

    @Column(name = "availability_end", columnDefinition = "TIME")
    private LocalTime availabilityEnd;

    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "DATETIME")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

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
