package org.example.userservice.src.Servicies;

import org.example.userservice.src.Entities.User;

import java.util.List;
import java.util.Optional;

public interface UserServiceIntr {
    List<User> findAllUsers();
    Optional<User> findUserById(Long id);
    Optional<User> findUserByUsername(String username);
    void createUser(User user);
    void changeUsername(Long id, String username);
    void deleteUserById(Long id);
}
