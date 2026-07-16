package org.example.authservice.src.Controllers;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.example.authservice.src.Dto.UserRequestName;
import org.example.authservice.src.Dto.UserRequestSignUp;
import org.example.authservice.src.Entities.UserAuth;
import org.example.authservice.src.Entities.UserDetailsImpl;
import org.example.authservice.src.Jwt.JwtCore;
import org.example.authservice.src.Services.Impl.UserAuthServiceIntrImpl;
import org.example.authservice.src.Services.Impl.UserDetailsServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthController {

//    private UserAuthRepository userRepository;

    private UserAuthServiceIntrImpl userAuthServiceImpl;

    private UserDetailsServiceImpl userDetailsService;

    private final RestClient restClient;

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

            UserAuth userAuth =  new UserAuth();
            userAuth.setEmail(userRequestSignUp.getEmail());
            userAuth.setPassword(passwordEncoder.encode(userRequestSignUp.getPassword()));

            ResponseEntity<Long> response = restClient.post()
                    .uri("http://localhost:8031/api/users/create")
                    .body(userRequestName)
                    .retrieve()
                    .toEntity(Long.class);

            Long id = response.getBody();
            userAuth.setUserId(id);
            System.out.println(userAuth.getPassword());
            userAuthServiceImpl.save(userAuth);

            return ResponseEntity.status(response.getStatusCode())
                    .body(response.getBody());

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Пользователь уже существует");

        }

    }

    //Авторизация
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody UserRequestSignUp userRequest, HttpServletResponse response){
        Authentication authentication = null;
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


}
