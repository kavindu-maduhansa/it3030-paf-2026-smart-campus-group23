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

    @Transactional(readOnly = true)
    public List<CommentResponseDTO> getCommentsByTicketId(Long ticketId, User currentUser) {
        log.info("Fetching comments for ticket {} by user {}", ticketId, currentUser.getEmail());
        
        return commentRepository.findByTicketId(ticketId).stream()
                .map(comment -> mapToResponseDTO(comment, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponseDTO addComment(Long ticketId, CommentRequestDTO requestDTO, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        log.info("Adding comment to ticket {} by user {}", ticketId, currentUser.getEmail());

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setUser(currentUser);
        comment.setContent(requestDTO.getContent());

        Comment savedComment = commentRepository.save(comment);
        return mapToResponseDTO(savedComment, currentUser);
    }

    private CommentResponseDTO mapToResponseDTO(Comment comment, User currentUser) {
        return CommentResponseDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorName(comment.getUser().getName())
                .authorRole(comment.getUser().getRole().name())
                .createdAt(comment.getCreatedAt())
                .isMe(comment.getUser().getId().equals(currentUser.getId()))
                .build();
    }

    @Transactional
    public void deleteComment(Long id, User currentUser) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));

        log.info("Attempting to delete comment {} by user {}", id, currentUser.getEmail());

        // Logic to ensure only the comment owner can delete it
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            log.warn("User {} attempted to delete comment {} owned by user {}",
                    currentUser.getId(), id, comment.getUser().getId());
            throw new AccessDeniedException("You are not the owner of this comment");
        }

        commentRepository.delete(comment);
        log.info("Comment {} deleted successfully", id);
    }
}
