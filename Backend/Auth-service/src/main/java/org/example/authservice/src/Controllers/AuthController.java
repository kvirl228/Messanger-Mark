package org.example.authservice.src.Controllers;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.example.authservice.src.Dto.*;
import org.example.authservice.src.Entities.UserAuth;
import org.example.authservice.src.Entities.UserDetailsImpl;
import org.example.authservice.src.Jwt.JwtCore;
import org.example.authservice.src.Services.Impl.EmailService;
import org.example.authservice.src.Services.Impl.UserAuthServiceIntrImpl;
import org.example.authservice.src.Services.Impl.UserDetailsServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.Random;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

//    private UserAuthRepository userRepository;

    private UserAuthServiceIntrImpl userAuthServiceImpl;

    private UserDetailsServiceImpl userDetailsService;

    private final RestClient restClient;

    private EmailService emailService;

    private PasswordEncoder passwordEncoder;

    private AuthenticationManager authenticationManager;

    private JwtCore jwtCore;




    //регистрация
    @PostMapping("/signup")
    ResponseEntity<?> signup(@RequestBody UserRequestSignUp userRequestSignUp){
        String pat = "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9!?]).{8,}";
        if (userRequestSignUp.getPassword().length() < 8 || userRequestSignUp.getUsername().length() < 3 || !userRequestSignUp.getPassword().matches(pat)){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        if (userAuthServiceImpl.findByEmail(userRequestSignUp.getEmail()).isPresent()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        try {

            UserRequestName userRequestName = new UserRequestName();
            userRequestName.setUsername(userRequestSignUp.getUsername());
            userRequestName.setBio(userRequestSignUp.getBio());

            UserAuth userAuth =  new UserAuth();
            userAuth.setEmail(userRequestSignUp.getEmail());
            userAuth.setPassword(passwordEncoder.encode(userRequestSignUp.getPassword()));

            String code = String.valueOf(100000 + new Random().nextInt(900000));
            userAuth.setVerificationcode(code);
            userAuth.setEnabled(false);
            userAuth.setCodeExpiration(LocalDateTime.now().plusMinutes(5));

            emailService.sendVerificationCode(userRequestSignUp.getEmail(), code);

            ResponseEntity<Long> response = restClient.post() .uri(
                    "http://localhost:8031/api/users/create")
                    .body(userRequestName) .retrieve()
                    .toEntity(Long.class);
            Long id = response.getBody();
            userAuth.setUserId(id);


            userAuthServiceImpl.save(userAuth);

            return ResponseEntity.ok().build();

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Пользователь уже существует");

        }

    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody VerifyEmailDTO emailDTO){

        UserAuth userAuth = userAuthServiceImpl.findByEmail(emailDTO.getEmail()).orElseThrow();

        if(!userAuth.getVerificationcode().equals(emailDTO.getCode())){
            return ResponseEntity.badRequest().build();
        }

        if(userAuth.getCodeExpiration().isBefore(LocalDateTime.now())){
            return ResponseEntity.badRequest().build();
        }

        userAuth.setEnabled(true);
        userAuth.setVerificationcode(null);
        userAuth.setCodeExpiration(null);

        userAuthServiceImpl.save(userAuth);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/codeForReset")
    public ResponseEntity<?> sendCodeFroReset(@RequestBody VerifyEmailDTO dto){

        UserAuth user = userAuthServiceImpl.findByEmail(dto.getEmail()).orElseThrow();

        if(user.getVerificationcode()!=null){
            return ResponseEntity.badRequest().build();
        }

        String code = String.valueOf(100000 + new Random().nextInt(900000));
        user.setVerificationcode(code);
        userAuthServiceImpl.save(user);
        emailService.sendCheckCode(dto.getEmail(), code);

        return ResponseEntity.ok().build();

    }

    @PostMapping("/checkCode")
    public ResponseEntity<?> checkCode(@RequestBody VerifyEmailDTO dto){

        UserAuth user = userAuthServiceImpl.findByEmail(dto.getEmail()).orElseThrow();
        if(user.getVerificationcode()!=null &&  user.getVerificationcode().equals(dto.getCode())){
            user.setVerificationcode(null);
            userAuthServiceImpl.save(user);
            return ResponseEntity.ok().build();
        }else{
            return ResponseEntity.badRequest().build();
        }
    }

    @PatchMapping("/refresh/password")
    public ResponseEntity<?> refreshPassword(@RequestBody ForgotPasswordDTO dto){
        if(dto.getNewPassword().isEmpty()){
            return ResponseEntity.badRequest().build();
        }
        UserAuth user = userAuthServiceImpl.findByEmail(dto.getEmail()).orElseThrow();
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userAuthServiceImpl.save(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resend(@RequestBody ResendDTO dto){
        try{
            UserAuth userAuth = userAuthServiceImpl.findByEmail(dto.getEmail()).orElseThrow();
            String code = String.valueOf(100000 + new Random().nextInt(900000));
            if (!userAuth.getCodeExpiration().isBefore(LocalDateTime.now())){
                return ResponseEntity.badRequest().build();
            }
            userAuth.setCodeExpiration(LocalDateTime.now().plusMinutes(2));
            userAuth.setVerificationcode(code);
            emailService.sendVerificationCode(dto.getEmail(), code);
            userAuthServiceImpl.save(userAuth);
            return ResponseEntity.ok().build();
        }catch (Exception e){
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }

    }

    //Авторизация
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody UserRequestSignUp userRequest, HttpServletResponse response){
        Authentication authentication = null;

        UserAuth userAuth = userAuthServiceImpl.findByEmail(userRequest.getEmail()).orElseThrow();
        if (!userAuth.isEnabled()){
            return ResponseEntity.badRequest().build();
        }

        try{
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userRequest.getEmail(), userRequest.getPassword())
            );

            //UserAuth user = userAuthServiceImpl.findByEmail(userRequest.getEmail()).orElseThrow(() -> new UsernameNotFoundException("User not found"));
            //При введиние верных логинов
//            authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(userRequest.getUsername(), userRequest.getPassword()));
        }catch (BadCredentialsException e){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        };


        //создание jwt token
        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String accessToken = jwtCore.generateAccessToken(userDetails);
        String refreshToken = jwtCore.generateRefreshToken(userDetails);

        // Добавляем Refresh Token в HttpOnly Cookie
        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/auth/refresh");
        refreshCookie.setMaxAge(30 * 24 * 60 * 60);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok().body(accessToken);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request){
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No cookies found");
        }
        String refreshToken = null;
        for (Cookie c : cookies) {
            if ("refreshToken".equals(c.getName())) {
                refreshToken = c.getValue();
            }
        }
        if (refreshToken == null || !jwtCore.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
        }

        String username = jwtCore.getNameJwt(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        String newAccessToken = jwtCore.generateAccessToken((UserDetailsImpl) userDetails);

        return ResponseEntity.ok().body(newAccessToken);
    }

    @PatchMapping("/change/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO){
            UserAuth userAuth = userAuthServiceImpl.findByID(Long.valueOf(changePasswordDTO.getId())).orElseThrow();
            System.out.println(passwordEncoder.encode(changePasswordDTO.getOldPassword()));
            System.out.println(userAuth.getPassword());
            if (passwordEncoder.matches(changePasswordDTO.getOldPassword(), userAuth.getPassword())) {
                userAuthServiceImpl.updatePassword(Long.valueOf(changePasswordDTO.getId()), passwordEncoder.encode(changePasswordDTO.getNewPassword()));
                return  ResponseEntity.ok().build();
            }
            else  {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {

        Cookie cookie = new Cookie("refreshToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/auth/refresh");
        cookie.setMaxAge(0);

        response.addCookie(cookie);

        return ResponseEntity.ok().build();
    }

//    @PostMapping("/send/mail")
//    public ResponseEntity<?> sendMail(@RequestBody VerifyEmailDTO verifyEmailDTO){
//
//
//
//    }
//
//    @PostMapping("/check/mail")
//    public ResponseEntity<?> checkMail(@RequestBody )
//
//    @DeleteMapping("/delete/{id}")
//    public ResponseEntity<?> delete(@PathVariable Long id, @RequestBody UserRequestSignUp userRequest){
//        UserAuth user =  userAuthServiceImpl.findByID(Long.valueOf(id)).orElseThrow();
//        if (!passwordEncoder.matches(user.getPassword(), userRequest.getPassword())){
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//
//
//    }


}
