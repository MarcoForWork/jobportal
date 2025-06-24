package com.hctt.is208.controller;

import com.hctt.is208.DTO.Login.*;
import com.hctt.is208.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
@RestController
@RequestMapping("/user")
@CrossOrigin("http://127.0.0.1:5501")
public class AuthenticationController {
    @Autowired
    private AuthenticationService authenticationService;
    //@Autowired
    //private AuthenticationResponse response; //chưa khai báo mặc định là biến
    @PostMapping("/auths")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request){
        var result = authenticationService.authenticate(request);
        if(result.isAuthenticated()){
            return new ApiResponse<>(1000, "Thanh cong", result);
        }else {
            return new ApiResponse<>(4001, "Sai thong tin dang nhap", null);
        }
    }

    @PostMapping("/tokens")
    ApiResponse<IntrospectResponse> authenticate_Token(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        var result = authenticationService.authenticateToken(request);
        if(result.isValid()){
            return new ApiResponse<>( 1000, "Thanh Cong", result);
        }else {
            return new ApiResponse<>(4001, "Khong nhan dang duoc token", null);
        }
    }
}
