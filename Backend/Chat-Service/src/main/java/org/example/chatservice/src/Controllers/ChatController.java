package org.example.chatservice.src.Controllers;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.chatservice.src.DTO.ChatCreateDTO;
import org.example.chatservice.src.DTO.ChatRequestDTO;
import org.example.chatservice.src.DTO.GroupCreateDTO;
import org.example.chatservice.src.Entities.Chat;
import org.example.chatservice.src.Entities.ChatMembers;
import org.example.chatservice.src.Services.Impl.ChatMembersServiceImpl;
import org.example.chatservice.src.Services.Impl.ChatServiceImpl;
import org.example.chatservice.src.Services.Impl.UserServiceClient;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/chats")
@AllArgsConstructor

public class ChatController {

    private ChatServiceImpl chatServiceImpl;
    private ChatMembersServiceImpl chatMembersServiceImpl;
    private UserServiceClient userServiceClient;

    @PostMapping("/private/create")
    public ResponseEntity<?> createChat(@RequestBody ChatCreateDTO chatCreateDTO) {

        Chat chat = new Chat();
        chat.setType("PRIVATE");

        if (chatCreateDTO.getUser_id()==null ||  chatCreateDTO.getUser2_id()==null) {
            return ResponseEntity.badRequest().build();
        }

        chatServiceImpl.savePrivateChat(chat, chatCreateDTO.getUser_id(), chatCreateDTO.getUser2_id());
        return ResponseEntity.ok().build();

    }

    @PostMapping("/group/create")
    public ResponseEntity<?> createGroup(@RequestBody GroupCreateDTO groupCreateDTO) {

        Chat chat = new Chat();
        chat.setType("GROUP");

        if (groupCreateDTO.getMemberIds().isEmpty() || groupCreateDTO.getOwnerId()==null){
            return ResponseEntity.badRequest().build();
        }

        chatServiceImpl.SaveGroupChat(chat, groupCreateDTO.getOwnerId(), groupCreateDTO.getMemberIds());
        return ResponseEntity.ok().build();

    }

    @GetMapping("/all/{id}")
    public ResponseEntity<List<ChatRequestDTO>> findAllChats(@PathVariable String id, @RequestHeader("Authorization") String jwt) {
        List<ChatMembers> chatMembers = chatMembersServiceImpl.findChatMembersByUserid(Long.valueOf(id));

        if  (chatMembers.isEmpty()){
            return ResponseEntity.notFound().build();
        }

        List<Long>  chatIds = new ArrayList<>();
        for (ChatMembers members : chatMembers) {
            if (chatServiceImpl.findChatByChatid(members.getChatid()).get().getType().equals("PRIVATE")) {
                chatIds.add(members.getChatid());
            }
        }

        List<ChatMembers> finalListMembers = new ArrayList<>();
        for (Long chatid : chatIds) {
            List<ChatMembers> members = chatMembersServiceImpl.findChatMembersByChatid(chatid);
            for  (ChatMembers member : members) {
                if (!member.getUserid().equals(Long.valueOf(id))) {
                    finalListMembers.add(member);
                }
            }
        }

        List<ChatRequestDTO> chats = new ArrayList<>();
        for (ChatMembers chatMembers1 : finalListMembers) {
            ChatRequestDTO chatRequestDTO = new ChatRequestDTO();
            chatRequestDTO.setChatId(chatMembers1.getChatid());
            chatRequestDTO.setUserId(chatMembers1.getUserid());
            String username = userServiceClient.getUsername(
                    chatMembers1.getUserid(),
                    jwt
            );
            chatRequestDTO.setTitle(username);
            chats.add(chatRequestDTO);
        }

        return ResponseEntity.ok().body(chats);

    }



}
