package com.hctt.jobportal.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hctt.jobportal.entity.RecruiterProfile;

public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, Integer> {
}
