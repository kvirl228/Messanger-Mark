package org.example.messageservice.src.Controllers;

import lombok.RequiredArgsConstructor;
import org.example.messageservice.src.DTO.Event.AvatarUpdateDTO;
import org.example.messageservice.src.DTO.Event.GroupUpdateDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventsController {

    private final SimpMessagingTemplate messagingTemplate;

    @PostMapping("/user/avatar")
    public ResponseEntity<Void> avatarChanged(@RequestBody AvatarUpdateDTO event) {

        messagingTemplate.convertAndSend("/topic/avatar", event);

        return ResponseEntity.ok().build();
    }

//    @PostMapping("/group/update")
//    public ResponseEntity<?> groupUpdate(@RequestBody GroupUpdateDTO dto){
//
//        messagingTemplate.convertAndSend("/topic/group", dto);
//
//        return ResponseEntity.ok().build();
//
//    }

}
