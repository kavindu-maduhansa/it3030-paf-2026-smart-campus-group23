package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.dto.NotificationStatsDTO;
import com.smartcampus.dto.SessionUser;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.model.Notification;
import com.smartcampus.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Optional;

/**
 * Admin Notification Controller
 * Provides endpoints for managing notifications
 */
@RestController
@RequestMapping("/api/admin/notifications")
@Slf4j
public class AdminNotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentAdmin(@AuthenticationPrincipal OAuth2User principal, HttpServletRequest request) {
        // Try to get from session first
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object userAttr = session.getAttribute("user");
            if (userAttr instanceof SessionUser) {
                SessionUser sessionUser = (SessionUser) userAttr;
                Optional<User> userOptional = userRepository.findByEmail(sessionUser.getEmail());
                if (userOptional.isPresent()) {
                    return userOptional.get();
                }
            }
        }

        // Fall back to OAuth2 principal
        if (principal != null) {
            String email = principal.getAttribute("email");
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                return userOptional.get();
            }
        }

        return null;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        try {
            User admin = getCurrentAdmin(principal, request);
            if (admin == null) {
                log.warn("[Notifications] No authenticated user found");
                return ResponseEntity.status(401).build();
            }

            log.info("[Notifications] Fetching notifications for admin: {}", admin.getEmail());
            List<NotificationDTO> notifications = notificationService.getNotificationsByAdmin(admin.getId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("[Notifications] Error fetching notifications", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<NotificationStatsDTO> getNotificationStats(
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        try {
            User admin = getCurrentAdmin(principal, request);
            if (admin == null) {
                log.warn("[Notifications Stats] No authenticated user found");
                return ResponseEntity.status(401).build();
            }

            log.info("[Notifications Stats] Fetching stats for admin: {}", admin.getEmail());
            NotificationStatsDTO stats = notificationService.getNotificationStats(admin.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("[Notifications Stats] Error fetching stats", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        try {
            User admin = getCurrentAdmin(principal, request);
            if (admin == null) {
                log.warn("[Unread Notifications] No authenticated user found");
                return ResponseEntity.status(401).build();
            }

            log.info("[Unread Notifications] Fetching unread for admin: {}", admin.getEmail());
            List<NotificationDTO> notifications = notificationService.getUnreadNotificationsByAdmin(admin.getId());
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("[Unread Notifications] Error fetching", e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByType(
            @PathVariable String type,
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        try {
            User admin = getCurrentAdmin(principal, request);
            if (admin == null) {
                log.warn("[Notifications By Type] No authenticated user found");
                return ResponseEntity.status(401).build();
            }

            try {
                Notification.NotificationType notificationType = 
                    Notification.NotificationType.valueOf(type.toUpperCase());
                log.info("[Notifications By Type] Fetching {} for admin: {}", type, admin.getEmail());
                List<NotificationDTO> notifications = 
                    notificationService.getNotificationsByAdminAndType(admin.getId(), notificationType);
                return ResponseEntity.ok(notifications);
            } catch (IllegalArgumentException e) {
                log.warn("[Notifications By Type] Invalid type: {}", type);
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            log.error("[Notifications By Type] Error fetching", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        try {
            User admin = getCurrentAdmin(principal, request);
            if (admin == null) {
                log.warn("[Mark Read] No authenticated user found");
                return ResponseEntity.status(401).build();
            }

            log.info("[Mark Read] Marking notification {} as read for admin: {}", id, admin.getEmail());
            notificationService.markAsRead(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("[Mark Read] Error marking notification", e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        try {
            User admin = getCurrentAdmin(principal, request);
            if (admin == null) {
                log.warn("[Delete Notification] No authenticated user found");
                return ResponseEntity.status(401).build();
            }

            log.info("[Delete Notification] Deleting notification {} for admin: {}", id, admin.getEmail());
            notificationService.deleteNotification(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("[Delete Notification] Error deleting", e);
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> clearNotifications(
            @RequestParam(required = false) String type,
            @AuthenticationPrincipal OAuth2User principal,
            HttpServletRequest request) {
        try {
            User admin = getCurrentAdmin(principal, request);
            if (admin == null) {
                log.warn("[Clear Notifications] No authenticated user found");
                return ResponseEntity.status(401).build();
            }

            if (type != null && !type.isEmpty()) {
                try {
                    Notification.NotificationType notificationType = 
                        Notification.NotificationType.valueOf(type.toUpperCase());
                    log.info("[Clear Notifications] Clearing {} for admin: {}", type, admin.getEmail());
                    notificationService.deleteNotificationsByAdminAndType(admin.getId(), notificationType);
                } catch (IllegalArgumentException e) {
                    log.warn("[Clear Notifications] Invalid type: {}", type);
                    return ResponseEntity.badRequest().build();
                }
            } else {
                log.info("[Clear Notifications] Clearing all for admin: {}", admin.getEmail());
                notificationService.deleteAllNotificationsByAdmin(admin.getId());
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("[Clear Notifications] Error clearing", e);
            return ResponseEntity.status(500).build();
        }
    }
}
