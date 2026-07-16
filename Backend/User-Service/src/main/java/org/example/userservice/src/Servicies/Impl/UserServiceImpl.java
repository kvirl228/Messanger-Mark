package org.example.userservice.src.Servicies.Impl;

import lombok.AllArgsConstructor;
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
    public boolean updateUser(User user) {
        User oldUser = userRepository.findById(user.getId()).get();
        if (oldUser.getUsername().equals(user.getUsername())){
            return false;
        }
        oldUser.setUsername(user.getUsername());
        userRepository.save(oldUser);
        return true;
    }

    @Override
    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }
}
