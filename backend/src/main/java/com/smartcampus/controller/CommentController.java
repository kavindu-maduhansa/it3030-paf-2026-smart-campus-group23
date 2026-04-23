package com.smartcampus.controller;

import com.smartcampus.dto.CommentRequestDTO;
import com.smartcampus.dto.CommentResponseDTO;
import com.smartcampus.dto.SessionUser;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    @PostMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody CommentRequestDTO dto,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(ticketId, dto, currentUser));
    }

    @GetMapping("/tickets/{ticketId}/comments")
    public ResponseEntity<List<CommentResponseDTO>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicketId(ticketId));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<CommentResponseDTO> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentRequestDTO dto,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        return ResponseEntity.ok(commentService.updateComment(id, dto, currentUser));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        commentService.deleteComment(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    private User resolveUser(OAuth2User oauth2User, HttpServletRequest request) {
        String email = null;
        if (oauth2User != null) {
            email = oauth2User.getAttribute("email");
        }
        if (email == null) {
            HttpSession session = request.getSession(false);
            if (session != null && session.getAttribute("user") != null) {
                SessionUser sessionUser = (SessionUser) session.getAttribute("user");
                email = sessionUser.getEmail();
            }
        }
        if (email == null) {
            throw new ResourceNotFoundException("No authenticated user found");
        }
        final String finalEmail = email;
        return userRepository.findByEmail(finalEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + finalEmail));
    }
}
