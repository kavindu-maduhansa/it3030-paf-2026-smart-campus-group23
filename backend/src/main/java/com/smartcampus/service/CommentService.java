package com.smartcampus.service;

import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Comment;
import com.smartcampus.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;

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
