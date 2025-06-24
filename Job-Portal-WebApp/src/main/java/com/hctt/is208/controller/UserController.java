package com.hctt.is208.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hctt.is208.DTO.UserDTO;
import com.hctt.is208.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("http://127.0.0.1:5501")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO request) {
        userService.createUser(request);
        return ResponseEntity.ok(request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Delete user succesfully");
    }
    
}
