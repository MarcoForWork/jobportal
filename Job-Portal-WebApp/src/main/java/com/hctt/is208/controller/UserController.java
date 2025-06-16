package com.hctt.is208.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hctt.is208.DTO.UserDTO;
import com.hctt.is208.model.User;
import com.hctt.is208.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public User createUser(@RequestBody UserDTO request) {
        return userService.createUser(request);
    }

    @DeleteMapping("/delete/{id}")
    public void deletUser(@PathVariable String id, @RequestBody UserDTO request) {
        userService.deleteUser(id);
    }
    
}
