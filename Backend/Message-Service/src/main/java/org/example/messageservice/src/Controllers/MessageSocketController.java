package org.example.messageservice.src.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.DTO.SendMessageDTO;
import org.example.messageservice.src.DTO.StartPrivateChatDTO;
import org.example.messageservice.src.JWT.JwtUser;
import org.example.messageservice.src.Services.Impl.MessageServiceImpl;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class MessageSocketController {

    private final MessageServiceImpl messageService;

    @MessageMapping("/chat/start")
    public void startPrivateChat(StartPrivateChatDTO dto,
                                 Authentication authentication) {

        JwtUser jwtUser = (JwtUser) authentication.getPrincipal();

        messageService.startPrivateChat(
                dto,
                Long.valueOf(jwtUser.getId())
        );
    }

    @MessageMapping("/chat/send")
    public void sendMessage(SendMessageDTO dto,
                            Authentication authentication) {

        JwtUser jwtUser = (JwtUser) authentication.getPrincipal();

        messageService.sendMessage(
                dto,
                Long.valueOf(jwtUser.getId())
        );
    }

}
