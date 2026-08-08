package org.example.messageservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StartPrivateChatDTO {

    private Long recipientId;

    private String text;

    private String type;

}