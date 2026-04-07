package com.smartcampus.security;

import com.smartcampus.dto.SessionUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filter to integrate session-based authentication with Spring Security
 */
@Component
@Slf4j
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Skip if already authenticated via OAuth2
        if (SecurityContextHolder.getContext().getAuthentication() != null 
                && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Check for session-based authentication
        HttpSession session = request.getSession(false);
        if (session != null) {
            SessionUser sessionUser = (SessionUser) session.getAttribute("user");
            
            if (sessionUser != null && sessionUser.getRole() != null) {
                log.debug("[SessionAuthFilter] Found session user: {} with role: {}", 
                    sessionUser.getEmail(), sessionUser.getRole());
                
                // Create Spring Security authentication token
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        sessionUser,
                        null,
                        Collections.singleton(new SimpleGrantedAuthority("ROLE_" + sessionUser.getRole().name()))
                    );
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                log.debug("[SessionAuthFilter] Set Spring Security context for user: {} with authorities: {}", 
                    sessionUser.getEmail(), authentication.getAuthorities());
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
