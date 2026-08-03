package org.example.messageservice.src.Services.Impl;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.DTO.UserDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;


import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceClient {

    private final RestClient restClient;

    public UserDTO getUser(Long userId, String jwt) {
        return restClient.get()
                .uri("http://localhost:8031/api/users/usernameForId/{id}", userId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt)
                .retrieve()
                .body(UserDTO.class);
    }

}
