package org.example.messageservice.src.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.Entities.Message;
import org.example.messageservice.src.Services.Impl.MessageServiceImpl;
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

    @GetMapping("/all/{id}")
    public ResponseEntity<?> getAllMessageById(@PathVariable Long id){
        List<Message> messages = messageService.findAllByChatid(id);
        return ResponseEntity.ok().body(messages);
    }

    @DeleteMapping("/delete/all/{chatId}")
    public ResponseEntity<?> deleteAllMessagesById(@PathVariable Long chatId){
        messageService.deleteAllByChatid(chatId);
        return ResponseEntity.ok().build();
    }

}
