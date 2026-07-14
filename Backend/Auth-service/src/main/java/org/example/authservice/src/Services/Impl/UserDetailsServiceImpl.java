package org.example.authservice.src.Services.Impl;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.authservice.src.Entities.UserAuth;
import org.example.authservice.src.Entities.UserDetailsImpl;
import org.example.authservice.src.Repositories.UserAuthRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Data
public class UserDetailsServiceImpl implements UserDetailsService {

    private UserAuthRepository userAuthRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAuth user = userAuthRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException(username));
        return UserDetailsImpl.build(user);
    }
}
