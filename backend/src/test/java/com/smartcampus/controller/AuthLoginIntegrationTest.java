package com.smartcampus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.dto.LoginRequest;
import com.smartcampus.entity.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthLoginIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        User user = User.builder()
                .email("local@test.edu")
                .name("Local User")
                .password(encoder.encode("secret12"))
                .provider("local")
                .role(Role.STUDENT)
                .build();
        userRepository.save(user);
    }

    @Test
    void loginSucceedsAndReturnsPayload() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("local@test.edu");
        req.setPassword("secret12");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("local@test.edu"))
                .andExpect(jsonPath("$.message").value("Login successful"));
    }

    @Test
    void loginFailsWith401WhenPasswordWrong() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("local@test.edu");
        req.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }
}
