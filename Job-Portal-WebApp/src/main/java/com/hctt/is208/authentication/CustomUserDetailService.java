package com.hctt.is208.authentication;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.hctt.is208.user.UserRepository;
import com.hctt.is208.user.users;

@Service
public class CustomUserDetailService implements UserDetailsService{
    
    @Autowired
    private UserRepository usersRepository;

    public CustomUserDetailService(UserRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        users user = usersRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with login name: " + username);
        }
        
        Set<GrantedAuthority> authorities = user
            .getRoles()
            .stream()
            .map((roles) -> new SimpleGrantedAuthority(roles.getName().toString())).collect(Collectors.toSet());

        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            authorities);
    }
}
