package com.smartcampus.config;

import com.smartcampus.security.SessionAuthenticationFilter;
import com.smartcampus.service.CustomOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
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
    private final SessionAuthenticationFilter sessionAuthenticationFilter;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5175",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174",
                "http://127.0.0.1:5175",
                "http://127.0.0.1:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
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
            // Add session authentication filter before OAuth2 processing
            .addFilterBefore(sessionAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Public endpoints - auth status check, login, and registration
                .requestMatchers("/api/auth/**").permitAll()
                
                // Dev endpoints - for testing only
                .requestMatchers("/api/dev/**").permitAll()
                
                // Resource endpoints - allow all authenticated users to view, restrict write operations
                .requestMatchers("/api/resources/**").permitAll()
                
                // Admin & Analytics endpoints - ADMIN only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Tickets endpoints - ADMIN or TECHNICIAN (DELETE is restricted to staff)
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/tickets/**").hasAnyRole("ADMIN", "TECHNICIAN")
                .requestMatchers("/api/tickets/**").authenticated()
                
                // Bookings endpoints - STUDENT or LECTURER
                .requestMatchers("/api/bookings/**").hasAnyRole("STUDENT", "LECTURER", "ADMIN")
                
                // WebSocket connections - allow all authenticated
                .requestMatchers("/ws/**").permitAll()
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService)
                )
                .defaultSuccessUrl(frontendUrl + "/dashboard", true)
                .failureUrl(frontendUrl + "/login?error=true")
            )
            .logout(logout -> logout
                .logoutSuccessUrl(frontendUrl)
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
