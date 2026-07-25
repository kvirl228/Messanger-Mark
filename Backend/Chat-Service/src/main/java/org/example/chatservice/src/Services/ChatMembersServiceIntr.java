package org.example.chatservice.src.Services;

import org.example.chatservice.src.Entities.ChatMembers;

import java.util.List;

public interface ChatMembersServiceIntr {
    List<ChatMembers> findChatMembersByUserid(Long userid);
    List<ChatMembers> findChatMembersByChatid(Long chatid);
    void deleteChatMembersByChatid(Long chatid);
    void save(ChatMembers chatMembers);
    Long findChatBetweenUsers(Long userid, Long senderId);
}
