package com.hctt.is208.authentication.DTO;

import lombok.Data;

@Data
public class SignUpDTO {
    private String username;
    private String password;
    private String name;
    private String email;
}
