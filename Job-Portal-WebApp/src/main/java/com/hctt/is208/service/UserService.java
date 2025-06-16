package com.hctt.is208.service;

import com.hctt.is208.DTO.UserDTO;
import com.hctt.is208.model.User;

public interface UserService {
    User createUser(UserDTO userDTO);
    void deleteUser(String id);
}