package org.example.userservice.src.Controllers;

import lombok.AllArgsConstructor;
import org.example.userservice.src.Servicies.Impl.UserServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.example.userservice.src.DTO.UserCreateDto;
import org.example.userservice.src.Entities.User;
import org.example.userservice.src.Servicies.UserServiceIntr;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private UserServiceImpl userService;

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody UserCreateDto userDto){
        User user = new User();
        user.setUsername(userDto.getUsername());
        if (userService.findUserByUsername(user.getUsername()).isPresent()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(user.getId());
    }



}
