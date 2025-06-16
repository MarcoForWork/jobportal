package com.hctt.is208.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<users, Integer>{
    users findByUsername(String username);
    users findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}