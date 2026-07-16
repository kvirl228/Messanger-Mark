package org.example.chatservice.src.Repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.example.chatservice.src.Entities.ChatMembers;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMembersRepository extends JpaRepository<ChatMembers,Long> {
    Optional<ChatMembers> findChatMembersById(Long id);
    // поиск участников чата по chatid
    List<ChatMembers> findChatMembersByChatid(Long chatid);
    // Поиск чатов в которых состоит юзер по userid
    List<ChatMembers> findChatMembersByUserid(Long userid);
}
