package com.smartcampus.controller;

import com.smartcampus.entity.User;
import com.smartcampus.security.Role;
import com.smartcampus.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * User Management Controller for Development
 * Allows creating test users with credentials
 */
@RestController
@RequestMapping("/api/dev/users")
public class DevUserController {

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createUser(
            @RequestParam String email,
            @RequestParam String name,
            @RequestParam String password,
            @RequestParam(required = false, defaultValue = "STUDENT") String role) {
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            User user = userService.createUserWithPassword(email, name, password, userRole);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User created successfully");
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("success", "false");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
