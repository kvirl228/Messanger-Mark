package org.example.chatservice.src.Services.Impl;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.apache.catalina.User;
import org.example.chatservice.src.DTO.UserDTO;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@AllArgsConstructor

public class UserServiceClient {

    private final RestTemplate restTemplate;

    public UserDTO getUser(Long userId, String authorization) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authorization);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<UserDTO> response = restTemplate.exchange(
                "http://localhost:8031/api/users/usernameForId/" + userId,
                HttpMethod.GET,
                entity,
                UserDTO.class
        );
        return response.getBody();
    }
}
