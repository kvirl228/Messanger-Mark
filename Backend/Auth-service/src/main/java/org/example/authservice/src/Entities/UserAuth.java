package org.example.authservice.src.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Table(name = "users", schema = "app_schema")
public class UserAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Long id;

    @Column(name = "c_email")
    String email;

    @Column(name = "c_password")
    String password;

    @Column(name = "c_enabled")
    boolean enabled;

    @Column(name = "c_verificationcode")
    String verificationcode;

    @Column(name = "c_codeexpiration")
    LocalDateTime codeExpiration;

    @Column(name = "c_userid")
    Long userId;
}
