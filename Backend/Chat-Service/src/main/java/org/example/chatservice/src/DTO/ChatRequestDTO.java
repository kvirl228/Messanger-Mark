package org.example.chatservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatRequestDTO {

    String title;
    List<Long> userId;
    Long chatId;
    String type;
    String bio;
    String issend;
    String avatar;
    String lastMessage;
    LocalDateTime sendtime;
    LocalDate lastMessageSend;
    int counter;

}
