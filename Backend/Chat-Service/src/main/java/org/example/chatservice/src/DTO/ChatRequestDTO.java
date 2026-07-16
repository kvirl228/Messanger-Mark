package org.example.chatservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatRequestDTO {

    String title;
    Long userId;
    Long chatId;

}
