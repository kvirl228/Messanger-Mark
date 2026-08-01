package org.example.chatservice.src.Services.Impl;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@AllArgsConstructor
public class MessageServiceClient {

    private final RestTemplate restTemplate;

    public void deleteMessages(Long chatId, String authorization) {

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authorization);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        restTemplate.exchange(
                "http://localhost:8033/api/messages/delete/all/" + chatId,
                HttpMethod.DELETE,
                entity,
                Void.class
        );
    }
}
