package com.smartcampus.service;

import com.smartcampus.dto.UserResponseDTO;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.CommentRepository;
import com.smartcampus.security.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @jakarta.annotation.PostConstruct
    public void ensurePictureColumnExists() {
        log.info("Checking for 'picture' column in 'users' table...");
        try {
            jdbcTemplate.execute("ALTER TABLE users ADD COLUMN picture VARCHAR(1024) DEFAULT NULL");
            log.info("Successfully added 'picture' column to 'users' table.");
        } catch (Exception e) {
            // Probably already exists, which is fine
            log.info("Note: 'picture' column check finished (it likely already exists).");
        }
    }

    @Transactional
    public User findOrCreateUser(String email, String name, String provider, String picture) {
        return userRepository.findByEmail(email)
                .map(user -> {
                    // Update picture if it changed
                    if (picture != null && !picture.equals(user.getPicture())) {
                        user.setPicture(picture);
                        return userRepository.save(user);
                    }
                    return user;
                })
                .orElseGet(() -> {
                    log.info("Creating new user with email: {}", email);
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .picture(picture)
                            .provider(provider)
                            .role(Role.STUDENT)
                            .build();
                    return userRepository.save(newUser);
                });
    }

    @Transactional
    public User authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));
        
        if (user.getPassword() == null) {
            throw new ResourceNotFoundException("Please use Google Sign-In for this account");
        }
        
        try {
            if (!passwordEncoder.matches(password, user.getPassword())) {
                throw new ResourceNotFoundException("Invalid email or password");
            }
        } catch (IllegalArgumentException ex) {
            // Corrupt or non-BCrypt hash in DB — treat as bad credentials, not 500
            log.warn("Password hash invalid for user {}: {}", email, ex.getMessage());
            throw new ResourceNotFoundException("Invalid email or password");
        }
        
        log.info("User authenticated successfully: {}", email);
        return user;
    }

    @Transactional
    public User createUserWithPassword(String email, String name, String password, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        
        User newUser = User.builder()
                .email(email)
                .name(name)
                .password(passwordEncoder.encode(password))
                .provider("local")
                .role(role != null ? role : Role.STUDENT)
                .build();
        
        log.info("Creating new local user: {}", email);
        return userRepository.save(newUser);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return convertToDTO(user);
    }

    @Transactional
    public UserResponseDTO updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        log.info("Updating user {} role from {} to {}", id, user.getRole(), role);
        user.setRole(role);
        User updatedUser = userRepository.save(user);
        
        return convertToDTO(updatedUser);
    }

    @Transactional
    public User updateProfile(Long id, String name, String picture) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (name != null && !name.isBlank()) {
            user.setName(name.trim());
        }
        if (picture != null) {
            user.setPicture(picture);
        }
        log.info("Profile updated for user {}", id);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        log.info("Deleting user and related data: {} ({})", user.getEmail(), user.getId());
        
        try {
            // Delete all related records first (cascade delete)
            // Delete comments by this user
            commentRepository.deleteAll(commentRepository.findByUserId(id));
            log.debug("Deleted comments for user: {}", id);
            
            // Delete tickets assigned to or created by this user
            ticketRepository.deleteAll(ticketRepository.findByAssignedToId(id));
            ticketRepository.deleteAll(ticketRepository.findByUserId(id));
            log.debug("Deleted tickets for user: {}", id);
            
            // Delete bookings by this user
            bookingRepository.deleteAll(bookingRepository.findByUserId(id));
            log.debug("Deleted bookings for user: {}", id);
            
            // Finally, delete the user
            userRepository.delete(user);
            log.info("User deleted successfully: {}", user.getEmail());
        } catch (Exception ex) {
            log.error("Error deleting user: {}", id, ex);
            throw new IllegalStateException("Failed to delete user. Please try again or contact support.", ex);
        }
    }

    private UserResponseDTO convertToDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .provider(user.getProvider())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
