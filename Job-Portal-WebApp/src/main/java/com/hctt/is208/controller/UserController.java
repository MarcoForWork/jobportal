package com.hctt.is208.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hctt.is208.DTO.UserDTO;
import com.hctt.is208.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO request) {
        userService.createUser(request);
        return ResponseEntity.ok(request);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deletUser(@PathVariable String id, @RequestBody UserDTO request) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
}
