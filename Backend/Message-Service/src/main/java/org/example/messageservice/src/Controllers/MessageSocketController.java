package org.example.messageservice.src.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.DTO.DeleteMessageDTO;
import org.example.messageservice.src.DTO.EditMessageDTO;
import org.example.messageservice.src.DTO.SendMessageDTO;
import org.example.messageservice.src.DTO.StartPrivateChatDTO;
import org.example.messageservice.src.JWT.JwtUser;
import org.example.messageservice.src.Services.Impl.MessageServiceImpl;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class MessageSocketController {

    private final MessageServiceImpl messageService;

    @MessageMapping("/chat.send")
    public void sendMessage(SendMessageDTO dto, Principal principal) {
        System.out.println(principal.getName());
        Authentication authentication = (Authentication) principal;

        Long senderId = Long.valueOf(authentication.getName());

        String jwt = authentication.getCredentials().toString();

        messageService.sendMessage(dto, senderId, jwt);
    }

    @MessageMapping("/chat.start")
    public void startPrivateChat(StartPrivateChatDTO dto, Principal principal) {
        Authentication authentication = (Authentication) principal;
        Long senderId = Long.valueOf(authentication.getName());
        String jwt = authentication.getCredentials().toString();
        messageService.startPrivateChat(dto, senderId, jwt);
    }

    @MessageMapping("/chat.edit")
    public void edit(@RequestBody EditMessageDTO dto, Principal principal){
        Authentication authentication = (Authentication) principal;
        Long senderId = Long.valueOf(authentication.getName());
        String jwt = authentication.getCredentials().toString();
        messageService.editMessage(dto.getMessageId(),dto.getNewText(),senderId,jwt);
    }

    @MessageMapping("/chat.delete")
    public void delete(@RequestBody DeleteMessageDTO dto, Principal principal){
        Authentication authentication = (Authentication) principal;
        Long senderId = Long.valueOf(authentication.getName());
        String jwt = authentication.getCredentials().toString();
        messageService.deleteMessage(dto.getMessageId(),senderId,jwt);
    }





}
