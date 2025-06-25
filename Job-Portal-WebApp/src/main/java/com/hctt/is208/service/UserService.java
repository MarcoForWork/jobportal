package com.hctt.is208.service;

import java.util.List;

import com.hctt.is208.DTO.UserDTO;
import com.hctt.is208.model.User;

public interface UserService {
    List<UserDTO> getAllUsers();
    User createUser(UserDTO userDTO);
    void deleteUser(String id);
}