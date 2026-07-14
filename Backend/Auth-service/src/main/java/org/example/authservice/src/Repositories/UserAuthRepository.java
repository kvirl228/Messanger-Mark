package org.example.authservice.src.Repositories;

import org.example.authservice.src.Entities.UserAuth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserAuthRepository extends JpaRepository<UserAuth,Long> {
    Optional<UserAuth> findByEmail(String email);
}
