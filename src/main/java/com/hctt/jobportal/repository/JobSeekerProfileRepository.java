package com.hctt.jobportal.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hctt.jobportal.entity.JobSeekerProfile;

public interface JobSeekerProfileRepository extends JpaRepository<JobSeekerProfile, Integer> {
}
