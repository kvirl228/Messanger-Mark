package org.example.chatservice.src.Services;

import org.example.chatservice.src.Entities.Chat;

import java.util.List;
import java.util.Optional;

public interface ChatServiceIntr {
    Optional<Chat> findChatByChatid(Long chatid);
    List<Chat> findChatByType(String type);
    List<Chat> findChatByChatidAndType(Long chatid, String type);
    Long savePrivateChat(Chat chat);
    Long SaveGroupChat(Chat chat);
    void deleteChatByChatid(Long chatid);
}
