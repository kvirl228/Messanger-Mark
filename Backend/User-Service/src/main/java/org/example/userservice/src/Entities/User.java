package org.example.userservice.src.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Table(name = "users", schema = "app_schema")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Long id;

    @Column(name = "c_username")
    String username;

    @Column(name = "c_contacts")
    List<Long> contacts;

    @Column(name = "c_bio")
    String bio;

    @Column(name = "c_is_online")
    boolean is_online;

    @Column(name = "c_avatar")
    String avatar;

    @Column(name = "c_issend")
    String issend;

    @Column(name = "c_isadd")
    String isadd;

    @Column(name = "c_isview")
    String isview;
}