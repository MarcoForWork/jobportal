package com.hctt.is208.authentication.DTO;

import java.util.Collection;
import org.springframework.security.core.GrantedAuthority;

public class LoginResponseDTO {
    private int id;
    private String username;
    private Collection<? extends GrantedAuthority> roles;

    public LoginResponseDTO(int id, String username, Collection<? extends GrantedAuthority> roles) {
        this.id = id;
        this.username = username;
        this.roles = roles;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Collection<? extends GrantedAuthority> getRoles() {
        return roles;
    }

    public void setRoles(Collection<? extends GrantedAuthority> roles) {
        this.roles = roles;
    }
}