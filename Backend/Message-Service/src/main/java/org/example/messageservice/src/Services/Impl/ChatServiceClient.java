package org.example.messageservice.src.Services.Impl;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.DTO.CreatePrivateChatRequest;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceClient {

    private final RestClient restClient;

    public Long getOrCreatePrivateChat(Long senderId, Long recipientId, String jwt) {

        CreatePrivateChatRequest request = new CreatePrivateChatRequest(senderId, recipientId);
        try {
            return restClient.post()
                    .uri("http://localhost:8032/api/chats/private")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt)
                    .body(request)
                    .retrieve()
                    .body(Long.class);
        } catch (Exception e) {
            System.out.println("error");
            throw new RuntimeException(e);
        }

    }

    public List<Long> getMembers(Long chatId,
                                 String jwt) {

        return restClient.get()
                .uri("http://localhost:8032/api/chats/{id}/members", chatId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Long>>() {});
    }

    public Boolean isMember(Long chatId,
                            Long userId,
                            String jwt) {

        return restClient.get()
                .uri("http://localhost:8032/api/chats/{chatId}/member/{userId}",
                        chatId,
                        userId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt)
                .retrieve()
                .body(Boolean.class);
    }

    public void deleteAll(Long chatId, String jwt){
        restClient.delete()
                .uri("http://localhost:8032/api/chats/delete/{chatId}", chatId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwt)
                .retrieve()
                .toBodilessEntity();
    }
}