package com.smartcampus.service;

import com.smartcampus.dto.CommentRequestDTO;
import com.smartcampus.dto.CommentResponseDTO;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Comment;
import com.smartcampus.model.Ticket;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;

    @Transactional
    public CommentResponseDTO addComment(Long ticketId, CommentRequestDTO dto, User user) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        // Check if user has permission to comment
        boolean isOwner = ticket.getUser().getId().equals(user.getId());
        boolean isAssignedTech = ticket.getAssignedTo() != null && ticket.getAssignedTo().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == com.smartcampus.security.Role.ADMIN;

        if (!isOwner && !isAssignedTech && !isAdmin) {
            log.warn("User {} attempted to comment on ticket {} without permission", user.getEmail(), ticketId);
            throw new AccessDeniedException("Only the ticket owner, assigned technician, or Admin can comment on this ticket");
        }

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setContent(dto.getContent());

        Comment savedComment = commentRepository.save(comment);

        // Rule A: Update first_reply_at if it's the first response from a technician/admin
        if (ticket.getFirstReplyAt() == null && (user.getRole() == com.smartcampus.security.Role.TECHNICIAN || user.getRole() == com.smartcampus.security.Role.ADMIN)) {
            ticket.setFirstReplyAt(java.time.LocalDateTime.now());
            ticketRepository.save(ticket);
            log.info("SLA Trigger: first_reply_at set for ticket {}", ticketId);
        }

        log.info("New comment added to ticket {} by user {}", ticketId, user.getEmail());
        return convertToResponseDTO(savedComment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtDesc(ticketId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponseDTO updateComment(Long commentId, CommentRequestDTO dto, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        // Ownership check
        if (!comment.getUser().getId().equals(user.getId()) && user.getRole() != com.smartcampus.security.Role.ADMIN) {
            throw new AccessDeniedException("You do not have permission to edit this comment");
        }

        comment.setContent(dto.getContent());
        Comment updatedComment = commentRepository.save(comment);
        log.info("Comment {} updated by user {}", commentId, user.getEmail());
        return convertToResponseDTO(updatedComment);
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        // Ownership check: Only author or admin can delete
        if (!comment.getUser().getId().equals(user.getId()) && user.getRole() != com.smartcampus.security.Role.ADMIN) {
            throw new AccessDeniedException("You do not have permission to delete this comment");
        }

        commentRepository.delete(comment);
        log.info("Comment {} deleted by user {}", commentId, user.getEmail());
    }

    private CommentResponseDTO convertToResponseDTO(Comment comment) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .ticketId(comment.getTicket().getId())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
