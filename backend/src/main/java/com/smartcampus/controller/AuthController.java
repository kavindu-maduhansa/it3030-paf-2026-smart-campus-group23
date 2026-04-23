package com.smartcampus.controller;

import com.smartcampus.dto.LoginRequest;
import com.smartcampus.dto.RegisterRequest;
import com.smartcampus.dto.SessionUser;
import com.smartcampus.dto.UpdateProfileRequest;
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
import java.util.Objects;
import java.util.Optional;
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
            SessionUser sessionUser = resolveSessionUser(session);
            if (sessionUser != null) {
                log.info("[Get User] Returning session user: {} with role: {}", sessionUser.getEmail(), sessionUser.getRole());
                response.put("authenticated", true);
                response.put("id", sessionUser.getId());
                response.put("name", sessionUser.getName());
                response.put("email", sessionUser.getEmail());
                response.put("role",
                        sessionUser.getRole() != null ? sessionUser.getRole().name() : Role.STUDENT.name());
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
        
        // Fetch user from DB to get the ID for OAuth2 users
        String email = principal.getAttribute("email");
        if (email != null) {
            User user = userService.findOrCreateUser(email, (String) principal.getAttribute("name"), "google");
            response.put("id", user.getId());
        }

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
            session.setAttribute("user", SessionUser.fromEntity(user));
            session.setAttribute("authenticated", true);
            
            log.info("[Login] Session created with ID: {}", session.getId());

            // Plain Map avoids Jackson + Lombok @Builder edge cases that can yield HTTP 500 on write
            return ResponseEntity.ok(authSuccessBody(user, "Login successful"));
        } catch (Exception e) {
            String emailForLog = "unknown";
            try {
                if (loginRequest != null) {
                    emailForLog = loginRequest.getEmail();
                }
            } catch (RuntimeException ignored) {
                // avoid secondary failures while building error response
            }
            log.error("[Login] Login failed for email: {}", emailForLog, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid credentials");
            error.put("message", e.getMessage() != null ? e.getMessage() : "Invalid email or password");
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
            session.setAttribute("user", SessionUser.fromEntity(user));
            session.setAttribute("authenticated", true);

            return ResponseEntity.ok(authSuccessBody(user, "Registration successful"));
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

    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileRequest updateProfileRequest,
            BindingResult bindingResult,
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = bindingResult.getFieldErrors().stream()
                    .collect(Collectors.toMap(
                            error -> error.getField(),
                            error -> error.getDefaultMessage(),
                            (first, second) -> first
                    ));
            return ResponseEntity.badRequest().body(errors);
        }

        HttpSession session = request.getSession(false);
        SessionUser sessionUser = session != null ? resolveSessionUser(session) : null;
        String email = Optional.ofNullable(sessionUser)
                .map(SessionUser::getEmail)
                .orElseGet(() -> principal != null ? principal.getAttribute("email") : null);

        if (email == null || email.isBlank()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Unauthorized");
            error.put("message", "User is not authenticated");
            return ResponseEntity.status(401).body(error);
        }

        User updatedUser = userService.updateCurrentUserName(email, updateProfileRequest.getName());
        if (session != null) {
            session.setAttribute("user", SessionUser.fromEntity(updatedUser));
        }

        return ResponseEntity.ok(authSuccessBody(updatedUser, "Profile updated successfully"));
    }

    private static Map<String, Object> authSuccessBody(User user, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("id", user.getId());
        body.put("email", Objects.toString(user.getEmail(), ""));
        body.put("name", Objects.toString(user.getName(), ""));
        Role role = user.getRole();
        body.put("role", role != null ? role.name() : Role.STUDENT.name());
        body.put("message", message);
        return body;
    }

    /** Normalize session attribute (supports legacy JPA {@link User} from older sessions). */
    private static SessionUser resolveSessionUser(HttpSession session) {
        Object attr = session.getAttribute("user");
        if (attr instanceof SessionUser su) {
            return su;
        }
        if (attr instanceof User legacy) {
            SessionUser migrated = SessionUser.fromEntity(legacy);
            session.setAttribute("user", migrated);
            return migrated;
        }
        return null;
    }
}
