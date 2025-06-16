package com.hctt.is208.user;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.hctt.is208.role.RoleRepository;

public class UserService {
    private UserRepository userRepository;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
    }

    public List<users> findAllUsers() {
        List<users> usersList = userRepository.findAll();
        return usersList.stream()
                    .collect(Collectors.toList());
    }

}
