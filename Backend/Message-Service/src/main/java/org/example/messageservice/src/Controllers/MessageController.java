package org.example.messageservice.src.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.DTO.ChatLastMessageDTO;
import org.example.messageservice.src.Entities.Message;
import org.example.messageservice.src.Services.Impl.MessageServiceImpl;
import org.example.messageservice.src.Services.Impl.UsersOnlineStatusService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageServiceImpl messageService;

    private final UsersOnlineStatusService userService;

    @GetMapping("/all/{id}")
    public ResponseEntity<?> getAllMessageById(@PathVariable Long id){
        List<Message> messages = messageService.findAllByChatid(id);
        return ResponseEntity.ok().body(messages);
    }

    @GetMapping("/last/message/{chatId}")
    public ResponseEntity<?> getLastMessageById(@PathVariable Long chatId){
        try {
            Message lastMessage = messageService.findFirstByChatidOrderBySendtimeDesc(chatId).orElseThrow();
            ChatLastMessageDTO dto = new ChatLastMessageDTO();
            dto.setLastMessage(lastMessage.getText());
            dto.setType(lastMessage.getType());
            dto.setSendtime(lastMessage.getSendtime());
            return ResponseEntity.ok().body(dto);
        }catch (Exception e){
            return ResponseEntity.ok().body(null);
        }
    }

    @GetMapping("/online/{userId}")
    public ResponseEntity<?> getOnlineStatusOfUser(@PathVariable Long userId){
        System.out.println(userService.getOnlineUsers());
        if(userService.isOnline(userId)){
            return ResponseEntity.ok().build();
        }else{
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/all/{chatId}")
    public ResponseEntity<?> deleteAllMessagesById(@PathVariable Long chatId){
        messageService.deleteAllByChatid(chatId);
        return ResponseEntity.ok().build();
    }

}
