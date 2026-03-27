package com.smartcampus.repository;

import com.smartcampus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email (OAuth identifier)
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by OAuth provider and OAuth ID
     */
    Optional<User> findByOauthProviderAndOauthId(String provider, String oauthId);

    /**
     * Check if user exists by email
     */
    boolean existsByEmail(String email);
}
