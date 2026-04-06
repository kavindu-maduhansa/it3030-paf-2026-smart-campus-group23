package com.smartcampus.controller;

import com.smartcampus.dto.LoginRequest;
import com.smartcampus.dto.LoginResponse;
import com.smartcampus.dto.RegisterRequest;
import com.smartcampus.entity.User;
import com.smartcampus.security.Role;
import com.smartcampus.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Authentication Controller
 * Provides endpoints for checking authentication status
 */
@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus(
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // Check for session-based auth first (local login)
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("user") != null) {
            log.info("[Auth Status] User authenticated via session");
            response.put("authenticated", true);
            return ResponseEntity.ok(response);
        }
        
        // Check for OAuth2 principal
        boolean isAuthenticated = principal != null;
        log.info("[Auth Status] OAuth2 principal present: {}", isAuthenticated);
        response.put("authenticated", isAuthenticated);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getCurrentUser(
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        // First check for local auth user in session
        HttpSession session = request.getSession(false);
        if (session != null) {
            User sessionUser = (User) session.getAttribute("user");
            if (sessionUser != null) {
                log.info("[Get User] Returning session user: {} with role: {}", sessionUser.getEmail(), sessionUser.getRole());
                response.put("authenticated", true);
                response.put("name", sessionUser.getName());
                response.put("email", sessionUser.getEmail());
                response.put("role", sessionUser.getRole().name());
                return ResponseEntity.ok(response);
            }
        }
        
        // If no session user, check OAuth2 principal
        if (principal == null) {
            log.info("[Get User] No user found (unauthenticated)");
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }

        Object emailAttr = principal.getAttribute("email");
        log.info("[Get User] Returning OAuth2 user: {}", emailAttr);
        
        // Extract role from authorities
        String role = principal.getAuthorities().stream()
                .filter(auth -> auth.getAuthority().startsWith("ROLE_"))
                .map(auth -> auth.getAuthority().substring(5)) // Remove "ROLE_" prefix
                .findFirst()
                .orElse("STUDENT");
        
        response.put("authenticated", true);
        response.put("name", principal.getAttribute("name"));
        response.put("email", principal.getAttribute("email"));
        response.put("picture", principal.getAttribute("picture"));
        response.put("role", role);
        response.put("attributes", principal.getAttributes());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            log.info("[Login] Attempting login for email: {}", loginRequest.getEmail());
            User user = userService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
            
            log.info("[Login] Authentication successful for user: {} with role: {}", user.getEmail(), user.getRole());
            
            // Create session
            HttpSession session = request.getSession(true);
            session.setAttribute("user", user);
            session.setAttribute("authenticated", true);
            
            log.info("[Login] Session created with ID: {}", session.getId());
            
            LoginResponse response = LoginResponse.builder()
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole().name())
                    .message("Login successful")
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[Login] Login failed for email: {}, error: {}", loginRequest.getEmail(), e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid credentials");
            error.put("message", e.getMessage());
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest, 
                                     BindingResult bindingResult,
                                     HttpServletRequest request) {
        // Check for validation errors
        if (bindingResult.hasErrors()) {
            log.warn("[Register] Validation errors for email: {}", registerRequest.getEmail());
            Map<String, String> errors = bindingResult.getFieldErrors().stream()
                    .collect(Collectors.toMap(
                            error -> error.getField(),
                            error -> error.getDefaultMessage()
                    ));
            return ResponseEntity.badRequest().body(errors);
        }

        // Check if passwords match
        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            log.warn("[Register] Passwords do not match for email: {}", registerRequest.getEmail());
            Map<String, String> error = new HashMap<>();
            error.put("confirmPassword", "Passwords do not match");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            log.info("[Register] Creating new user with email: {}", registerRequest.getEmail());
            // Create user with STUDENT role by default
            User user = userService.createUserWithPassword(
                    registerRequest.getEmail(),
                    registerRequest.getName(),
                    registerRequest.getPassword(),
                    Role.STUDENT
            );
            
            log.info("[Register] User created successfully: {} with role: {}", user.getEmail(), user.getRole());
            
            // Auto-login after registration
            HttpSession session = request.getSession(true);
            session.setAttribute("user", user);
            session.setAttribute("authenticated", true);
            
            LoginResponse response = LoginResponse.builder()
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole().name())
                    .message("Registration successful")
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("[Register] User already exists: {}", registerRequest.getEmail());
            Map<String, String> error = new HashMap<>();
            error.put("email", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("[Register] Registration failed for email: {}, error: {}", registerRequest.getEmail(), e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Registration failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            log.info("[Logout] Invalidating session for user");
            session.invalidate();
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}
