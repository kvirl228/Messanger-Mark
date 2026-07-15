package org.example.authservice.src.Services;

import org.example.authservice.src.Dto.UserRequestSignUp;
import org.example.authservice.src.Entities.UserAuth;

import java.util.Optional;

public interface UserAuthService {
    Optional<UserAuth> findByEmail(String email);
    Optional<UserAuth> findByID(Long id);
    void save(UserAuth user);
    void deleteByID(Long id);
}
