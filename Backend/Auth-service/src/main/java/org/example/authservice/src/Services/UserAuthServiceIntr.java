package org.example.authservice.src.Services;

import org.example.authservice.src.Entities.UserAuth;

import java.util.Optional;

public interface UserAuthServiceIntr {
    Optional<UserAuth> findByEmail(String email);
    Optional<UserAuth> findByID(Long id);
    void save(UserAuth user);
    void updatePassword(Long id, String newPassword);
    void deleteByID(Long id);
}
