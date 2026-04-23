package com.smartcampus.service;

import com.smartcampus.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserService userService;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        try {
            OAuth2User oAuth2User = super.loadUser(userRequest);
            
            String provider = userRequest.getClientRegistration().getRegistrationId();
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String picture = oAuth2User.getAttribute("picture");
            
            if (email == null) {
                log.error("OAuth2 Failed: Email attribute is missing from provider");
                throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
            }
            
            log.info("OAuth2 login attempt - Provider: {}, Email: {}", provider, email);
            
            User user = userService.findOrCreateUser(email, name, provider, picture);
            
            log.info("User authenticated - ID: {}, Role: {}", user.getId(), user.getRole());
            
            return new DefaultOAuth2User(
                    Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())),
                    oAuth2User.getAttributes(),
                    "email"
            );
        } catch (Exception e) {
            log.error("CRITICAL OAUTH2 ERROR: {}", e.getMessage(), e);
            throw new OAuth2AuthenticationException(e.getMessage());
        }
    }
}
