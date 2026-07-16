package org.example.chatservice.src.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.example.chatservice.src.Entities.Chat;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat,Long> {
    // писк чатов определённого типа
    List<Chat> findChatByType(String type);
    List<Chat> findChatByIdAndType(Long chatid, String type);
}
