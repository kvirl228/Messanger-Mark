package org.example.authservice.src.Services.Impl;

import lombok.AllArgsConstructor;
import org.example.authservice.src.Entities.UserAuth;
import org.example.authservice.src.Repositories.UserAuthRepository;
import org.example.authservice.src.Services.UserAuthServiceIntr;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class UserAuthServiceIntrImpl implements UserAuthServiceIntr {

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
    public void updatePassword(Long id, String newPassword) {
        UserAuth userAuth = findByID(id).orElseThrow();
        userAuth.setPassword(newPassword);
        userAuthRepository.save(userAuth);
    }

    public void forgotPassword(String email, String password){
        UserAuth user = userAuthRepository.findByEmail(email).orElseThrow();
        if(user.getVerificationcode()==null){
            user.setPassword(password);
            userAuthRepository.save(user);
        }

    }

    @Override
    public void deleteByID(Long id) {
        userAuthRepository.deleteById(id);
    }
}
