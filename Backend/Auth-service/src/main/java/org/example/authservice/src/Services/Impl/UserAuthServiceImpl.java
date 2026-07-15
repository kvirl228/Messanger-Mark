package org.example.authservice.src.Services.Impl;

import lombok.AllArgsConstructor;
import org.apache.catalina.User;
import org.example.authservice.src.Dto.UserRequestSignUp;
import org.example.authservice.src.Entities.UserAuth;
import org.example.authservice.src.Repositories.UserAuthRepository;
import org.example.authservice.src.Services.UserAuthService;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class UserAuthServiceImpl implements UserAuthService {

    private UserAuthRepository userAuthRepository;

    @Override
    public Optional<UserAuth> findByEmail(String email) {
        return userAuthRepository.findByEmail(email);
    }

    @Override
    public Optional<UserAuth> findByID(Long id) {
        return userAuthRepository.findById(id);
    }

    @Override
    public void save(UserAuth user) {
        userAuthRepository.save(user);
    }

    @Override
    public void deleteByID(Long id) {
        userAuthRepository.deleteById(id);
    }
}
