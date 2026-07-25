package org.example.chatservice.src.Services.Impl;

import lombok.AllArgsConstructor;
import org.example.chatservice.src.Entities.Chat;
import org.springframework.stereotype.Service;
import org.example.chatservice.src.Entities.ChatMembers;
import org.example.chatservice.src.Repositories.ChatMembersRepository;
import org.example.chatservice.src.Services.ChatMembersServiceIntr;

import java.util.ArrayList;
import java.util.List;

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

    @Override
    public void save(ChatMembers chatMembers) {
//        if (!chatMembersRepository.findChatMembersByUserid(chatMembers.getUserid()).isEmpty()) {
//            if (!chatMembersRepository.findChatMembersByChatid(chatMembers.getChatid()).isEmpty()) {
//                return;
//            }
//        }

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

        if (chatId == null) {
            Chat  chat = new Chat();
            chat.setType("PRIVATE");
            Chat chat1 = chatServiceImpl.savePrivateChat(chat, userid, senderId);
            return chat1.getId();
        }
        return chatId;
    }
}
