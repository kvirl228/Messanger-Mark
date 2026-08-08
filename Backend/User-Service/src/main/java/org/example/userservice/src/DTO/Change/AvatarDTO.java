package org.example.userservice.src.DTO.Change;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AvatarDTO {
    Long userId;
    String avatar;;
}
