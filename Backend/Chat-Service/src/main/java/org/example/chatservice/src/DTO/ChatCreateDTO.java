package org.example.chatservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatCreateDTO {

    Long user_id;
    Long user2_id;
}
