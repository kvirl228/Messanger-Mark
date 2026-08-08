package org.example.messageservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatRequestDTO {

    String title;
    Long userId;
    Long chatId;
    String responseType;
    String bio;
    String issend;
    String lastMessage;
    LocalDate lastMessageSend;

}
