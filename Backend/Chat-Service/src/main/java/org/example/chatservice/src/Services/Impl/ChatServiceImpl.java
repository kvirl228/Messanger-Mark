package org.example.chatservice.src.Services.Impl;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.example.chatservice.src.Entities.Chat;
import org.example.chatservice.src.Entities.ChatMembers;
import org.example.chatservice.src.Repositories.ChatRepository;
import org.example.chatservice.src.Services.ChatServiceIntr;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ChatServiceImpl implements ChatServiceIntr {

    private ChatRepository chatRepository;

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
    public Long savePrivateChat(Chat chat) {
        return chatRepository.save(chat).getId();
    }

    @Override
    public Long SaveGroupChat(Chat chat) {
        return chatRepository.save(chat).getId();
    }

    @Override
    public void deleteChatByChatid(Long chatid) {
        chatRepository.deleteById(chatid);
    }

    public void updateGroupInfo(String title, String bio, Long id){
        Chat chat = chatRepository.findById(id).orElseThrow();
        chat.setTitle(title);
        chat.setGroupbio(bio);
        chatRepository.save(chat);
    }



}
