package org.example.messageservice.src.Services;

import org.example.messageservice.src.Entities.Message;

import java.util.List;

public interface MessageServiceIntr {
    List<Message> findAllByChatid(Long chatid);
    void deleteAllByChatid(Long chatid);
    void deleteById(Long id);
    void save(Message message);
}
