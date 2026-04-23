package com.smartcampus.dto;

import com.smartcampus.entity.User;
import com.smartcampus.security.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Serializable snapshot for HTTP session — avoids storing JPA entities in the session.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionUser implements Serializable {

    private static final long serialVersionUID = 2L;

    private Long id;
    private String email;
    private String name;
    private Role role;
    private String picture;

    public static SessionUser fromEntity(User user) {
        return new SessionUser(user.getId(), user.getEmail(), user.getName(), user.getRole(), user.getPicture());
    }
}
