package org.example.messageservice.src.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.Entities.Message;
import org.example.messageservice.src.Services.Impl.MessageServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageServiceImpl messageService;

    @GetMapping("/all/{id}")
    public ResponseEntity<?> getAllMessageById(@PathVariable Long id){
        System.out.println();
        List<Message> messages = messageService.findAllByChatid(id);
        return ResponseEntity.ok().body(messages);
    }

}
