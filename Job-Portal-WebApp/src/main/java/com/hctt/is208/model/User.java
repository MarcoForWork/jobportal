package com.hctt.is208.model;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "email", nullable = false)
    private String email;

    @Column (name = "password", nullable = false)
    private String password;

    @Column (name = "phone", nullable = false)
    private String phone;

    @Column (name = "dob", nullable = true)
    private Date dob;

    @Column(name = "role", nullable = false)
    private String role;
}
