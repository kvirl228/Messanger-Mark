package org.example.chatservice.src.Services.Impl;

import lombok.AllArgsConstructor;
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
}
