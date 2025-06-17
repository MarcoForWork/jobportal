package com.hctt.is208.DTO;

import lombok.experimental.FieldDefaults;


public class IntrospectRequest {
    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
