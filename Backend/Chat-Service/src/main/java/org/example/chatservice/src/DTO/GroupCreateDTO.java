package org.example.chatservice.src.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupCreateDTO {

    String title;
    String bio;
    Long ownerId;
    List<Long> memberIds;
    String avatar;

}
