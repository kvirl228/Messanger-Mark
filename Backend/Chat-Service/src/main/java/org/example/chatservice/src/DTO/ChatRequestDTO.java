package org.example.chatservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatRequestDTO {

    String title;
    List<Long> userId;
    Long chatId;
    String type;

}
