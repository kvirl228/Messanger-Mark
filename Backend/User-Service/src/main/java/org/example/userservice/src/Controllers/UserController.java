package org.example.userservice.src.Controllers;

import lombok.AllArgsConstructor;
import org.example.userservice.src.DTO.UserRequestDto;
import org.example.userservice.src.DTO.UserRequestNameDTO;
import org.example.userservice.src.Servicies.Impl.UserServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
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

    @GetMapping("/username/{username}")
    public ResponseEntity<?> findUserByUsername(@PathVariable String username){
        UserRequestDto userRequestDto = new UserRequestDto();
        User user = userService.findUserByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
        userRequestDto.setUsername(user.getUsername());
        userRequestDto.setBio(user.getBio());
        return ResponseEntity.status(HttpStatus.OK).body(userRequestDto);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<?> findUserById(@PathVariable String id){
        UserRequestDto userRequestDto = new UserRequestDto();
        User user = userService.findUserById(Long.valueOf(id)).orElseThrow(() -> new UsernameNotFoundException(id));
        userRequestDto.setUsername(user.getUsername());
        userRequestDto.setBio(user.getBio());
        return ResponseEntity.status(HttpStatus.OK).body(userRequestDto);
    }

    @GetMapping("/usernameForId/{id}")
    public ResponseEntity<?> findUserByUsernameForId(@PathVariable String id){
        User user = userService.findUserById(Long.valueOf(id)).orElseThrow(() -> new UsernameNotFoundException(id));
        return ResponseEntity.status(HttpStatus.OK).body(new UserRequestNameDTO(user.getUsername()));
    }


}
