package org.example.userservice.src.Servicies.Impl;

import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.example.userservice.src.Entities.User;
import org.example.userservice.src.Repositories.UserRepository;
import org.example.userservice.src.Servicies.UserServiceIntr;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserServiceImpl implements UserServiceIntr {

    private UserRepository userRepository;

    @Override
    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public Optional<User> findUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public void createUser(User user) {
        userRepository.save(user);
    }

    @Override
    public void changeUsername(Long id, String username) {
        User user = userRepository.findById(Long.valueOf(id)).orElseThrow();
        user.setUsername(username);
        userRepository.save(user);
    }

    @Override
    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }
}
