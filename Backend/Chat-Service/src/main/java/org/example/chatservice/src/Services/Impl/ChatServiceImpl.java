package org.example.chatservice.src.Services.Impl;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.example.chatservice.src.Entities.Chat;
import org.example.chatservice.src.Entities.ChatMembers;
import org.example.chatservice.src.Repositories.ChatRepository;
import org.example.chatservice.src.Services.ChatServiceIntr;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ChatServiceImpl implements ChatServiceIntr {

    private ChatRepository chatRepository;

    private ChatMembersServiceImpl chatMembersServiceImpl;

    @Override
    public Optional<Chat> findChatByChatid(Long chatid) {
        return chatRepository.findById(chatid);
    }

    @Override
    public List<Chat> findChatByType(String type) {
        return chatRepository.findChatByType(type);
    }

    @Override
    public List<Chat> findChatByChatidAndType(Long chatid, String type) {
        return chatRepository.findChatByIdAndType(chatid, type);
    }

    @Override
    public void savePrivateChat(Chat chat, Long ownerId, Long userId) {

        Chat chat1 = chatRepository.save(chat);

        ChatMembers  chatMembers = new ChatMembers();
        chatMembers.setChatid(chat1.getId());
        chatMembers.setUserid(userId);
        chatMembers.setRole("USER");

        ChatMembers chatMembers1 = new ChatMembers();
        chatMembers1.setChatid(chat1.getId());
        chatMembers1.setUserid(ownerId);
        chatMembers1.setRole("USER");

        List<ChatMembers> chatMembersList = chatMembersServiceImpl.findChatMembersByUserid(ownerId);
        List<ChatMembers> chatMembersList1 = chatMembersServiceImpl.findChatMembersByUserid(userId);

        boolean isChat = true;

        for (ChatMembers c : chatMembersList) {
            for (ChatMembers c1 : chatMembersList1) {
                if (c.getChatid().equals(c1.getChatid())) {
                    isChat = false;
                }
            }
        }

        if (isChat) {
            chatMembersServiceImpl.save(chatMembers);
            chatMembersServiceImpl.save(chatMembers1);
        }
        else{
            chatRepository.deleteById(chat1.getId());
        }


    }

    @Override
    public void SaveGroupChat(Chat chat, Long ownerId, List<Long> usersId) {
        ChatMembers  chatMembers = new ChatMembers();
        chatMembers.setChatid(chat.getId());
        chatMembers.setUserid(ownerId);
        chatMembers.setRole("OWNER");
        chatMembersServiceImpl.save(chatMembers);

        for (Long userId : usersId) {
            ChatMembers  chatMembers1 = new ChatMembers();
            chatMembers1.setChatid(chat.getId());
            chatMembers1.setUserid(userId);
            chatMembers1.setRole("USER");
            chatMembersServiceImpl.save(chatMembers1);
        }
        chatRepository.save(chat);
    }

    @Override
    public void deleteChatByChatid(Long chatid) {
        chatMembersServiceImpl.deleteChatMembersByChatid(chatid);
        chatRepository.deleteById(chatid);
    }
}
