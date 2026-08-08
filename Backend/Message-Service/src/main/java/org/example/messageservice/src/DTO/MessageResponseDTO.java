package org.example.messageservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.Timestamp;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponseDTO {
    private Long id;

    private Long chatId;

    private Long senderid;

    private String type;

    private String text;

    private LocalDateTime sendtime;

    private String responseType;
}