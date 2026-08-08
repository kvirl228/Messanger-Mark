package org.example.userservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRequestChatDTO {

    String username;
    String bio;
    String avatar;
    String issend;


}
