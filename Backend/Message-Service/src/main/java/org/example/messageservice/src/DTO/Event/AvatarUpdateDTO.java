package org.example.messageservice.src.DTO.Event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvatarUpdateDTO {

    private Long userId;
    private String avatar;

}
