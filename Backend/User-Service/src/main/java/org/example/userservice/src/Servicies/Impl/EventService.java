package org.example.userservice.src.Servicies.Impl;

import lombok.RequiredArgsConstructor;
import org.example.userservice.src.DTO.Change.AvatarDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class EventService {

    private final RestClient restClient;

    @Value("${message.service.url}")
    private String messageService;

    public void avatarChanged(Long userId, String avatar) {

        AvatarDTO event = new AvatarDTO(userId, avatar);

        restClient.post()
                .uri(messageService + "/api/events/user/avatar")
                .body(event)
                .retrieve()
                .toBodilessEntity();
    }

}
