package org.example.messageservice.src.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.DTO.SendMessageDTO;
import org.example.messageservice.src.DTO.StartPrivateChatDTO;
import org.example.messageservice.src.JWT.JwtUser;
import org.example.messageservice.src.Services.Impl.MessageServiceImpl;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class MessageSocketController {

    private final MessageServiceImpl messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(SendMessageDTO dto, Principal principal) {
        JwtUser jwtUser = (JwtUser) ((Authentication) principal).getPrincipal();
        Long senderId = Long.valueOf(jwtUser.getId());
        String jwt = ((Authentication) principal)
                .getCredentials()
                .toString();

        messageService.sendMessage(dto, senderId, jwt);
    }

    @MessageMapping("/chat.start")
    public void startPrivateChat(StartPrivateChatDTO dto, Principal principal) {
        JwtUser jwtUser = (JwtUser) ((Authentication) principal).getPrincipal();
        Long senderId = Long.valueOf(jwtUser.getId());
        String jwt = ((Authentication) principal)
                .getCredentials()
                .toString();
        messageService.startPrivateChat(dto, senderId, jwt);
    }



}
