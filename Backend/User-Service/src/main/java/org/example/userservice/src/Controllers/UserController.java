package org.example.userservice.src.Controllers;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.AllArgsConstructor;
import org.example.userservice.src.DTO.*;
import org.example.userservice.src.JWT.JwtCore;
import org.example.userservice.src.Servicies.Impl.UserServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import org.example.userservice.src.Entities.User;
import org.example.userservice.src.Servicies.UserServiceIntr;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
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
            user.setBio(userDto.getBio());
            user.setIsview("ALL");
            user.setIsadd("ALL");
            user.setIssend("ALL");
            if (userService.findUserByUsername(user.getUsername()).isPresent()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(user.getId());
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.internalServerError().build();
        }

    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> findUserByUsername(@PathVariable String username){
        try{
            UserRequestDto userRequestDto = new UserRequestDto();
            User user = userService.findUserByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
            if (user.getIsview()!=null && !user.getIsview().equals("ALL")){
                return ResponseEntity.badRequest().build();
            }else{
                userRequestDto.setId(user.getId());
                userRequestDto.setUsername(user.getUsername());
                userRequestDto.setBio(user.getBio());
                return ResponseEntity.status(HttpStatus.OK).body(userRequestDto);
            }
        } catch (UsernameNotFoundException e){
            return ResponseEntity.internalServerError().build();
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
            return ResponseEntity.internalServerError().build();
        }

    }

    @GetMapping("/usernameForId/{id}")
    public ResponseEntity<?> findUserByUsernameForId(@PathVariable String id){
        User user = userService.findUserById(Long.valueOf(id)).orElseThrow(() -> new UsernameNotFoundException(id));
        if (user.getIsview()!=null && !user.getIsview().equals("ALL")){
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        else{
            UserRequestChatDTO userDTO = new UserRequestChatDTO();
            userDTO.setBio(user.getBio());
            userDTO.setUsername(user.getUsername());
            userDTO.setIssend(user.getIssend());
            return ResponseEntity.status(HttpStatus.OK).body(userDTO);
        }
    }

    @GetMapping("/user/info/{jwt}")
    public ResponseEntity<?> getUserId(@PathVariable String jwt){
        try{
            Claims claims = jwtCore.getAllClaimsFromToken(jwt);
            String userId = claims.get("userId").toString();
            User user = userService.findUserById(Long.valueOf(userId)).orElseThrow();
            UserInfoDTO response = new UserInfoDTO();
            response.setUserId(Long.valueOf(userId));
            response.setContacts(user.getContacts());
            response.setUsername(user.getUsername());
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }

    }

    @GetMapping("/contacts/names/{jwt}")
    public ResponseEntity<?> getContactsNames(@PathVariable String jwt){
        try{
            Claims claims = jwtCore.getAllClaimsFromToken(jwt);
            String userId = claims.get("userId").toString();
            List<ContactResponseDTO> contacts = userService.findAllContactsByUser(Long.valueOf(userId));
            System.out.println(contacts);
            if(contacts==null){
                return ResponseEntity.badRequest().build();
            }
            else {
                return ResponseEntity.ok().body(contacts);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/all/ids")
    public ResponseEntity<?> getAllUsersByIds(@RequestHeader("Authorization") String authorization,@RequestBody UsersIdsDTO dto){
        String jwt = authorization.substring(7);
        Claims claims = jwtCore.getAllClaimsFromToken(jwt);
        String currentUserId = claims.get("userId").toString();
        List<UserInfoForGroup> users = new ArrayList<>();
        for (Long userId : dto.getIds()){
            if(String.valueOf(userId).equals(currentUserId)){
                continue;
            }else{
                User user = userService.findUserById(userId).orElseThrow();
                users.add(UserInfoForGroup.builder().id(user.getId()).username(user.getUsername()).bio(user.getBio()).build());
            }
        }
        return ResponseEntity.ok().body(users);
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

    @PatchMapping("/change/settings/{id}")
    public ResponseEntity<?> changeSettings(@PathVariable String id,@RequestBody SettingsDTO dto){
        try{
            userService.changeSettings(Long.valueOf(id), dto);
            return ResponseEntity.ok().build();
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/add/contact")
    public ResponseEntity<?> addContact(@RequestBody ContactDTO dto){
        try{
            userService.addContact(dto.getUserId(), dto.getContactId());
            return ResponseEntity.ok().build();
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/delete/contact")
    public ResponseEntity<?> deleteContact(@RequestBody ContactDTO dto){

        try{
            userService.deleteContact(dto.getUserId(), dto.getContactId());
            return ResponseEntity.ok().build();
        }catch (Exception e){
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id){
        userService.deleteUserById(Long.valueOf(id));
        return ResponseEntity.ok().build();
    }


}
