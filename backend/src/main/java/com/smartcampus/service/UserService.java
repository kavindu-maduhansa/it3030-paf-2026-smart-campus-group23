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

    @Transactional
    public User findOrCreateUser(String email, String name, String provider) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("Creating new user with email: {}", email);
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .provider(provider)
                            .role(Role.STUDENT)
                            .build();
                    return userRepository.save(newUser);
                });
    }

    @Transactional
    public User authenticateUser(String email, String password) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        String submittedPassword = password == null ? "" : password;

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));
        
        if (user.getPassword() == null) {
            throw new ResourceNotFoundException("Please use Google Sign-In for this account");
        }

        String storedPassword = user.getPassword();
        boolean authenticated = false;

        // Support legacy plain-text values while migrating to BCrypt on successful login.
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            try {
                authenticated = passwordEncoder.matches(submittedPassword, storedPassword);
            } catch (IllegalArgumentException ex) {
                log.warn("Password hash invalid for user {}: {}", normalizedEmail, ex.getMessage());
            }
        } else {
            authenticated = storedPassword.equals(submittedPassword);
            if (authenticated) {
                user.setPassword(passwordEncoder.encode(submittedPassword));
                userRepository.save(user);
                log.info("Migrated legacy password format for user: {}", normalizedEmail);
            }
        }

        if (!authenticated) {
            throw new ResourceNotFoundException("Invalid email or password");
        }
        
        log.info("User authenticated successfully: {}", normalizedEmail);
        return user;
    }

    @Transactional
    public User createUserWithPassword(String email, String name, String password, Role role) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("User with this email already exists");
        }
        
        User newUser = User.builder()
                .email(normalizedEmail)
                .name(name)
                .password(passwordEncoder.encode(password))
                .provider("local")
                .role(role != null ? role : Role.STUDENT)
                .build();
        
        log.info("Creating new local user: {}", normalizedEmail);
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
    public User updateCurrentUserName(String email, String name) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + email));
        user.setName(name.trim());
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
