package org.example.messageservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.Timestamp;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponseDTO {
    private Long id;

    private Long chatId;

    private Long senderId;

    private String text;

    private Timestamp sendTime;
}