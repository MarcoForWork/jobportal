package com.hctt.is208.repository;

import com.hctt.is208.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
	
}
