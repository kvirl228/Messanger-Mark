package org.example.chatservice.src.Controllers;

import lombok.AllArgsConstructor;
import org.example.chatservice.src.DTO.*;
import org.example.chatservice.src.Services.Impl.MessageServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.chatservice.src.Entities.Chat;
import org.example.chatservice.src.Entities.ChatMembers;
import org.example.chatservice.src.Services.Impl.ChatMembersServiceImpl;
import org.example.chatservice.src.Services.Impl.ChatServiceImpl;
import org.example.chatservice.src.Services.Impl.UserServiceClient;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/chats")
@AllArgsConstructor

public class ChatController {

    private ChatServiceImpl chatServiceImpl;
    private ChatMembersServiceImpl chatMembersServiceImpl;
    private UserServiceClient userServiceClient;
    private final MessageServiceClient messageServiceClient;

    @PostMapping("/private/create")
    public ResponseEntity<?> createChat(@RequestBody ChatCreateDTO chatCreateDTO) {
        Chat chat = new Chat();
        chat.setType("PRIVATE");
        if (chatCreateDTO.getSenderId()==null ||  chatCreateDTO.getRecipientId()==null) {
            return ResponseEntity.badRequest().build();
        }
        Long chatId = chatServiceImpl.savePrivateChat(chat);
        chatMembersServiceImpl.save(chatId, "USER", chatCreateDTO.getSenderId());
        chatMembersServiceImpl.save(chatId, "USER", chatCreateDTO.getRecipientId());
        return ResponseEntity.ok().body(chatId);

    }

    @PostMapping("/group/create")
    public ResponseEntity<?> createGroup(@RequestBody GroupCreateDTO groupCreateDTO) {

        Chat chat = new Chat();
        chat.setType("GROUP");
        chat.setGroupbio(groupCreateDTO.getBio());
        chat.setTitle(groupCreateDTO.getTitle());

        if (groupCreateDTO.getMemberIds().isEmpty() || groupCreateDTO.getOwnerId()==null){
            return ResponseEntity.badRequest().build();
        }

        Long groupId = chatServiceImpl.SaveGroupChat(chat);
        chatMembersServiceImpl.save(groupId, "OWNER", groupCreateDTO.getOwnerId());
        for (Long id : groupCreateDTO.getMemberIds()){
            chatMembersServiceImpl.save(groupId, "USER", id);
        }
        return ResponseEntity.ok().build();

    }

    @GetMapping("/all/{id}")
    public ResponseEntity<List<ChatRequestDTO>> findAllChats(@PathVariable String id, @RequestHeader("Authorization") String jwt) {
        try {
            List<ChatMembers> chatMembers = chatMembersServiceImpl.findChatMembersByUserid(Long.valueOf(id));
            System.out.println("gogog");
            if  (chatMembers.isEmpty()){
                return ResponseEntity.notFound().build();
            }

            List<Long>  chatIds = new ArrayList<>();
            List<ChatRequestDTO> chats = new ArrayList<>();
            for (ChatMembers members : chatMembers) {
                Chat c = chatServiceImpl.findChatByChatid(members.getChatid()).get();
                if (c.getType().equals("PRIVATE")) {
                    chatIds.add(members.getChatid());
                }
                else{
                    ChatRequestDTO c1 =  new ChatRequestDTO();
                    c1.setChatId(c.getId());
                    c1.setTitle(c.getTitle());
                    List<ChatMembers> memberIds = chatMembersServiceImpl.findChatMembersByChatid(c.getId());
                    List<Long>  userIds = new ArrayList<>();
                    for (ChatMembers memberId : memberIds) {
                        userIds.add(memberId.getUserid());
                    }
                    c1.setUserId(userIds);
                    c1.setTitle(c.getTitle());
                    c1.setBio(c.getGroupbio());
                    c1.setType(c.getType());
                    System.out.println(c1);
                    chats.add(c1);
                }
            }

            List<ChatMembers> privateListMembers = new ArrayList<>();
            for (Long chatid : chatIds) {
                List<ChatMembers> members = chatMembersServiceImpl.findChatMembersByChatid(chatid);
                for  (ChatMembers member : members) {
                    if (!member.getUserid().equals(Long.valueOf(id))) {
                        privateListMembers.add(member);
                    }
                }
            }
//            List<ChatRequestDTO> chats = new ArrayList<>();
            for (ChatMembers chatMembers1 : privateListMembers) {
                ChatRequestDTO chatRequestDTO = new ChatRequestDTO();
                chatRequestDTO.setChatId(chatMembers1.getChatid());
                chatRequestDTO.setUserId(Collections.singletonList(chatMembers1.getUserid()));
                UserDTO userDTO = userServiceClient.getUser(
                        chatMembers1.getUserid(),
                        jwt
                );

                chatRequestDTO.setTitle(userDTO.getUsername());
                chatRequestDTO.setBio(userDTO.getBio());
                chatRequestDTO.setType("PRIVATE");
                chats.add(chatRequestDTO);
            }



            return ResponseEntity.ok().body(chats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }


    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<Long>> getMembers(@PathVariable String id) {
        List<ChatMembers> userIds = chatMembersServiceImpl.findChatMembersByChatid(Long.valueOf(id));
        List<Long>  userIds2 = new ArrayList<>();
        for (ChatMembers members : userIds) {
            userIds2.add(members.getUserid());
        }
        return ResponseEntity.ok().body(userIds2);
    }

    @GetMapping("/{chatId}/member/{userId}")
    public ResponseEntity<Boolean> isMember(@PathVariable Long chatId, @PathVariable Long userId) {
        Chat chat = chatServiceImpl.findChatByChatid(chatId).orElse(null);
        if (chat == null) {
            return ResponseEntity.notFound().build();
        }
        List<ChatMembers> members = chatMembersServiceImpl.findChatMembersByChatid(chatId);
        boolean ismember = false;
        for (ChatMembers member : members) {
            if (member.getUserid().equals(userId)) {
                ismember = true;
                break;
            }
        }
        return ResponseEntity.ok(ismember);
    }

    @GetMapping("/owner/{groupId}")
    public ResponseEntity<?> getOwnerId(@PathVariable Long groupId){
        List<ChatMembers> chatMembers = chatMembersServiceImpl.findChatMembersByChatid(groupId);
        ChatLongDTO dto = new ChatLongDTO();
        for (ChatMembers member : chatMembers) {
            if (member.getRole().equals("OWNER")) {
                dto.setOwnerId(member.getUserid());
                break;
            }
        }
        return ResponseEntity.ok().body(dto);
    }

    @GetMapping("/{userId}/between/{user2Id}")
    public ResponseEntity<Long> chatBetweenTwoUsers(@PathVariable Long userId, @PathVariable Long user2Id){
        Long chatId = chatMembersServiceImpl.findChatBetweenUsers(userId, user2Id);
        return ResponseEntity.ok().body(chatId);
    }

    @DeleteMapping("/delete/{chatId}")
    public ResponseEntity<?> deleteChatById(@PathVariable Long chatId, @RequestHeader("Authorization") String jwt){
        messageServiceClient.deleteMessages(chatId, jwt);
        chatMembersServiceImpl.deleteChatMembersByChatid(chatId);
        chatServiceImpl.deleteChatByChatid(chatId);
        return ResponseEntity.ok().build();
    }



    @PostMapping("/private")
    public ResponseEntity<Long> getOrCreatePrivateChat(@RequestBody ChatCreateDTO chatCreateDTO) {
        Long chatId = chatMembersServiceImpl.findChatBetweenUsers(chatCreateDTO.getRecipientId(), chatCreateDTO.getSenderId());
        return ResponseEntity.ok().body(chatId);
    }


}
