package com.smartcampus.config;

import com.smartcampus.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - auth status check, login, and registration
                .requestMatchers("/api/auth/**").permitAll()
                
                // Resource endpoints - allow all authenticated users to view, restrict write operations
                .requestMatchers("/api/resources/**").permitAll()
                
                // Admin endpoints - ADMIN only
                .requestMatchers("/admin/**").hasRole("ADMIN")
                
                // Tickets endpoints - ADMIN or TECHNICIAN
                .requestMatchers("/tickets/**").hasAnyRole("ADMIN", "TECHNICIAN")
                
                // Bookings endpoints - STUDENT or LECTURER
                .requestMatchers("/bookings/**").hasAnyRole("STUDENT", "LECTURER")
                
                // WebSocket connections - allow all authenticated
                .requestMatchers("/ws/**").permitAll()
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .defaultSuccessUrl("http://localhost:5173/dashboard", true)
                .failureUrl("http://localhost:5173/login?error=true")
            )
            .logout(logout -> logout
                .logoutSuccessUrl("http://localhost:5173")
                .permitAll()
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    // Return 401 for API requests instead of redirecting
                    if (request.getRequestURI().startsWith("/api/")) {
                        response.setStatus(401);
                        response.setContentType("application/json");
                        response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}");
                    } else {
                        response.sendRedirect("/oauth2/authorization/google");
                    }
                })
            );
        
        return http.build();
    }
}
