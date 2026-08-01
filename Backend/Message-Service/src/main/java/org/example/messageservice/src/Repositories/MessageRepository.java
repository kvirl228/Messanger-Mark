package org.example.messageservice.src.Repositories;

import org.example.messageservice.src.Entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message,Long> {
    List<Message> findAllByChatidOrderByIdAsc(Long chatid);
    void deleteAllByChatid(Long chatid);
}
