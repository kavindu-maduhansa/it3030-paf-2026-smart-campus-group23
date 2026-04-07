package com.smartcampus.dto;

import com.smartcampus.security.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String provider;
    private LocalDateTime createdAt;
}
