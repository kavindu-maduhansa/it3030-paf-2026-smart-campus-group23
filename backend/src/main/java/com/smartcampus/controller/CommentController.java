package com.smartcampus.controller;

import com.smartcampus.dto.SessionUser;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Slf4j
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        commentService.deleteComment(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * Resolves the User entity from the current authentication context (OAuth2 or Session)
     * Duplicate of resolveUser in TicketController - consider a BaseController or Utility
     */
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
            throw new ResourceNotFoundException("No authenticated user found in context");
        }
        
        final String finalEmail = email;
        return userRepository.findByEmail(finalEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + finalEmail));
    }
}
