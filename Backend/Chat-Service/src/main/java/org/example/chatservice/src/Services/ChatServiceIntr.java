package org.example.chatservice.src.Services;

import org.example.chatservice.src.Entities.Chat;

import java.util.List;
import java.util.Optional;

public interface ChatServiceIntr {
    Optional<Chat> findChatByChatid(Long chatid);
    List<Chat> findChatByType(String type);
    List<Chat> findChatByChatidAndType(Long chatid, String type);
    Chat savePrivateChat(Chat chat, Long ownerId, Long uerId);
    void SaveGroupChat(Chat chat, Long ownerId, List<Long> usersId);
    void deleteChatByChatid(Long chatid);
}
