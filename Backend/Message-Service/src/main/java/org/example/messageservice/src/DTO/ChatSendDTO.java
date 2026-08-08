package org.example.messageservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatSendDTO {

    Long chatId;
    String responseType;
    LocalDateTime sendtime;
    String lastMessage;

}
