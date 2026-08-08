package org.example.messageservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatLastMessageDTO {
    String lastMessage;
    String type;
    LocalDateTime sendtime;
}
