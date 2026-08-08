package org.example.chatservice.src.Services.Impl;

import lombok.AllArgsConstructor;
import org.example.chatservice.src.Entities.Chat;
import org.springframework.stereotype.Service;
import org.example.chatservice.src.Entities.ChatMembers;
import org.example.chatservice.src.Repositories.ChatMembersRepository;
import org.example.chatservice.src.Services.ChatMembersServiceIntr;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ChatMembersServiceImpl implements ChatMembersServiceIntr {

    private ChatMembersRepository chatMembersRepository;

    private ChatServiceImpl chatServiceImpl;

    @Override
    public List<ChatMembers> findChatMembersByUserid(Long userid) {
        return chatMembersRepository.findChatMembersByUserid(userid);
    }

    @Override
    public List<ChatMembers> findChatMembersByChatid(Long chatid) {
        return chatMembersRepository.findChatMembersByChatid(chatid);
    }

    @Override
    public void deleteChatMembersByChatid(Long chatid) {
        List<ChatMembers> list = chatMembersRepository.findChatMembersByChatid(chatid);
        if (list.isEmpty()) {
            return;
        }
        List<Long> ids = new ArrayList<>();
        for (ChatMembers chatMembers : list) {
            ids.add(chatMembers.getChatid());
        }
        for (Long id : ids) {
            chatMembersRepository.deleteById(id);
        }
    }

    public void deleteChatMemberByUserId(Long id){
        chatMembersRepository.deleteById(id);
    }

    public void deleteGroupMember(Long groupId, Long userId){
        List<ChatMembers> members = chatMembersRepository.findChatMembersByChatid(groupId);
        ChatMembers member = new ChatMembers();
        for(ChatMembers c : members){
            if(c.getUserid().equals(userId)){
                member = c;
            }
        }
        chatMembersRepository.delete(member);
    }

    @Override
    public void save(Long chatId, String role, Long userId) {
        ChatMembers chatMembers = new ChatMembers();
        chatMembers.setChatid(chatId);
        chatMembers.setRole(role);
        chatMembers.setUserid(userId);
        chatMembersRepository.save(chatMembers);
    }

    @Override
    public Long findChatBetweenUsers(Long userid, Long senderId) {
        List<ChatMembers> user1 = chatMembersRepository.findChatMembersByUserid(userid);
        List<ChatMembers> user2 = chatMembersRepository.findChatMembersByUserid(senderId);

        Long chatId = null;
        for  (ChatMembers chatMembers : user1) {
            for(ChatMembers chatMembers1 : user2) {
                if(chatMembers.getChatid().equals(chatMembers1.getChatid())) {
                    chatId = chatMembers1.getChatid();
                    break;
                }
            }
        }

        if (chatId == null ) {
            System.out.println("Чат не найден. Создаём новый...");
            Chat  chat = new Chat();
            chat.setType("PRIVATE");
            Long id = chatServiceImpl.savePrivateChat(chat);
            System.out.println(id);
            ChatMembers chatMembers = new ChatMembers();
            chatMembers.setUserid(userid);
            chatMembers.setRole("USER");
            chatMembers.setChatid(id);

            ChatMembers chatMembers2 = new ChatMembers();
            chatMembers2.setUserid(senderId);
            chatMembers2.setRole("USER");
            chatMembers2.setChatid(id);
            chatMembersRepository.save(chatMembers);
            chatMembersRepository.save(chatMembers2);
            return id;
        }else{
            Chat chat1 = chatServiceImpl.findChatByChatid(chatId).orElseThrow();
            if(chat1.getType().equals("GROUP")){
                Chat chat = new Chat();
                chat.setType("PRIVATE");
                Long id = chatServiceImpl.savePrivateChat(chat);
                System.out.println(id);
                ChatMembers chatMembers = new ChatMembers();
                chatMembers.setUserid(userid);
                chatMembers.setRole("USER");
                chatMembers.setChatid(id);

                ChatMembers chatMembers2 = new ChatMembers();
                chatMembers2.setUserid(senderId);
                chatMembers2.setRole("USER");
                chatMembers2.setChatid(id);
                chatMembersRepository.save(chatMembers);
                chatMembersRepository.save(chatMembers2);
                return id;
            }
            else{
                return chatId;
            }
        }
//        return chatId;
    }
}
