package org.example.messageservice.src.Services.Impl;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.DTO.CreatePrivateChatRequest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceClient {

    private final RestClient restClient;

    private String getJwt() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return (String) authentication.getCredentials();
    }

    public Long getOrCreatePrivateChat(Long senderId,Long recipientId) {

        CreatePrivateChatRequest request =
                new CreatePrivateChatRequest(senderId, recipientId);

        return restClient.post()
                .uri("http://localhost:8032/api/chats/private")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + getJwt())
                .body(request)
                .retrieve()
                .body(Long.class);
    }

    public List<Long> getMembers(Long chatId) {

        return restClient.get()
                .uri("http://localhost:8032/api/chats/{id}/members", chatId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + getJwt())
                .retrieve()
                .body(new ParameterizedTypeReference<List<Long>>() {});
    }

    public Boolean isMember(Long chatId, Long userId) {

        return restClient.get()
                .uri("http://localhost:8032/api/chats/{chatId}/member/{userId}",chatId, userId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + getJwt())
                .retrieve()
                .body(Boolean.class);
    }

}
