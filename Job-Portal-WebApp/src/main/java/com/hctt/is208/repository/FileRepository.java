package com.hctt.is208.repository;

import java.util.Optional;

import com.hctt.is208.model.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileRepository extends JpaRepository<File, String> {
    Optional<File> findByUserId(String userId);
}
