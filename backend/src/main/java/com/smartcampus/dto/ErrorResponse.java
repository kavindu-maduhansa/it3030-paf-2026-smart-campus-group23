package com.smartcampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Standard error response format for all API endpoints
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private String error;
    /** ISO-8601 UTC — avoids Java 8 date/time Jackson edge cases on some clients */
    private String timestamp;
    private String path;

    public ErrorResponse(int status, String message, String error) {
        this.status = status;
        this.message = message;
        this.error = error;
        this.timestamp = Instant.now().toString();
    }
}
