package org.example.userservice.src.Controllers;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.example.userservice.src.DTO.ChangeUsernameDTO;
import org.example.userservice.src.DTO.UserRequestDto;
import org.example.userservice.src.DTO.UserRequestNameDTO;
import org.example.userservice.src.JWT.JwtCore;
import org.example.userservice.src.Servicies.Impl.UserServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.example.userservice.src.DTO.UserCreateDto;
import org.example.userservice.src.Entities.User;
import org.example.userservice.src.Servicies.UserServiceIntr;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private final JwtCore jwtCore;
    private UserServiceImpl userService;

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody UserCreateDto userDto){
        try {
            User user = new User();
            user.setUsername(userDto.getUsername());
            if (userService.findUserByUsername(user.getUsername()).isPresent()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(user.getId());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> findUserByUsername(@PathVariable String username){
        try{
            UserRequestDto userRequestDto = new UserRequestDto();
            User user = userService.findUserByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
            userRequestDto.setUsername(user.getUsername());
            userRequestDto.setBio(user.getBio());
            return ResponseEntity.status(HttpStatus.OK).body(userRequestDto);
        } catch (UsernameNotFoundException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

    }

    @GetMapping("/id/{id}")
    public ResponseEntity<?> findUserById(@PathVariable String id){
        try{
            UserRequestDto userRequestDto = new UserRequestDto();
            User user = userService.findUserById(Long.valueOf(id)).orElseThrow(() -> new UsernameNotFoundException(id));
            userRequestDto.setUsername(user.getUsername());
            userRequestDto.setBio(user.getBio());
            return ResponseEntity.status(HttpStatus.OK).body(userRequestDto);
        } catch (UsernameNotFoundException e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

    }

    @GetMapping("/usernameForId/{id}")
    public ResponseEntity<?> findUserByUsernameForId(@PathVariable String id){
        User user = userService.findUserById(Long.valueOf(id)).orElseThrow(() -> new UsernameNotFoundException(id));
        return ResponseEntity.status(HttpStatus.OK).body(user.getUsername());
    }

    @GetMapping("/userid/{jwt}")
    public ResponseEntity<?> getUserId(@PathVariable String jwt){
        try{
            Claims claims = jwtCore.getAllClaimsFromToken(jwt);
            String userId = claims.get("userId").toString();
            return ResponseEntity.status(HttpStatus.OK).body(userId);
        } catch (Exception e){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

    }

    @PatchMapping("/change/username")
    public ResponseEntity<?> changeUsername(@RequestBody ChangeUsernameDTO changeUsernameDTO){
        String username = changeUsernameDTO.getUsername();

        if(username == null || username.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is empty");
        }

        if (userService.findUserByUsername(username).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already in use");
        }

        User user = userService.findUserById(Long.valueOf(changeUsernameDTO.getId())).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (user.getUsername().equals(username)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username is already in use");
        }

        userService.changeUsername(Long.valueOf(changeUsernameDTO.getId()), changeUsernameDTO.getUsername());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id){
        userService.deleteUserById(Long.valueOf(id));
        return ResponseEntity.ok().build();
    }


}
