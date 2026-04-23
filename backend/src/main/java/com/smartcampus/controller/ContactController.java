package com.smartcampus.controller;

import com.smartcampus.dto.ContactMessageRequest;
import com.smartcampus.dto.SessionUser;
import com.smartcampus.security.Role;
import com.smartcampus.service.ContactMessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactMessageService contactMessageService;

    @PostMapping("/messages")
    public ResponseEntity<Map<String, Object>> createMessage(
            @Valid @RequestBody ContactMessageRequest request,
            HttpServletRequest httpRequest) {
        SessionUser sessionUser = resolveSessionUser(httpRequest);

        Map<String, Object> saved = contactMessageService.saveContactMessage(request, sessionUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Contact message saved successfully",
                "id", saved.get("_id")
        ));
    }

    @GetMapping("/messages")
    public ResponseEntity<?> getMessages(HttpServletRequest httpRequest) {
        SessionUser sessionUser = resolveSessionUser(httpRequest);
        ResponseEntity<Map<String, String>> forbidden = ensureAdmin(sessionUser);
        if (forbidden != null) return forbidden;
        List<Map<String, Object>> items = contactMessageService.getLatestMessages(30);
        return ResponseEntity.ok(items);
    }

    @PatchMapping("/messages/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id, HttpServletRequest httpRequest) {
        SessionUser sessionUser = resolveSessionUser(httpRequest);
        ResponseEntity<Map<String, String>> forbidden = ensureAdmin(sessionUser);
        if (forbidden != null) return forbidden;
        boolean updated = contactMessageService.markMessageAsRead(id);
        if (!updated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Not Found",
                    "message", "Contact message not found"
            ));
        }
        return ResponseEntity.ok(Map.of("message", "Message marked as read"));
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable String id, HttpServletRequest httpRequest) {
        SessionUser sessionUser = resolveSessionUser(httpRequest);
        ResponseEntity<Map<String, String>> forbidden = ensureAdmin(sessionUser);
        if (forbidden != null) return forbidden;
        boolean deleted = contactMessageService.deleteMessage(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Not Found",
                    "message", "Contact message not found"
            ));
        }
        return ResponseEntity.ok(Map.of("message", "Message deleted"));
    }

    private ResponseEntity<Map<String, String>> ensureAdmin(SessionUser sessionUser) {
        if (sessionUser == null || sessionUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "Forbidden",
                    "message", "Only administrators can view contact messages"
            ));
        }
        return null;
    }

    private SessionUser resolveSessionUser(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null) {
            return null;
        }
        Object user = session.getAttribute("user");
        if (user instanceof SessionUser) {
            return (SessionUser) user;
        }
        return null;
    }
}
