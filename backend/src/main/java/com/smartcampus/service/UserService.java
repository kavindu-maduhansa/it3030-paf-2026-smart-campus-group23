package com.smartcampus.service;

import com.smartcampus.dto.UserResponseDTO;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));
        
        if (user.getPassword() == null) {
            throw new ResourceNotFoundException("Please use Google Sign-In for this account");
        }
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
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
