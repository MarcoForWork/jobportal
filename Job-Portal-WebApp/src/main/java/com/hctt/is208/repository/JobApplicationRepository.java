package com.hctt.is208.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hctt.is208.DTO.JobApplicationDTO;
import com.hctt.is208.model.JobApplication;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Integer> {
    @Query(
        value = "SELECT new com.hctt.is208.DTO.JobApplicationDTO(ja.id, ja.applyDate, ja.state, jp, u) "
            + "FROM JobApplication ja "
            + "JOIN ja.jobPosting jp "
            + "JOIN ja.user u "
            + "WHERE ja.id = :jobApplicationId "
    )
    Optional<JobApplicationDTO> findByJobApplicationId(@Param("jobApplicationId") int jobApplicationId);

    @Query(
        value = "SELECT new com.hctt.is208.DTO.JobApplicationDTO(ja.id, ja.applyDate, ja.state, jp, u) "
            + "FROM JobApplication ja "
            + "JOIN ja.jobPosting jp "
            + "JOIN ja.user u "
            + "WHERE ja.user.id = :userId "
    )
    List<JobApplicationDTO> findByUserId(@Param("userId") String userId);

    @Query(
        value = "SELECT new com.hctt.is208.DTO.JobApplicationDTO(ja.id, ja.applyDate, ja.state, jp, u) "
            + "FROM JobApplication ja "
            + "JOIN ja.jobPosting jp "
            + "JOIN ja.user u "
            + "WHERE ja.jobPosting.jobId = :jobId AND ja.user.id = :userId "
    )    
    Optional<JobApplicationDTO> findByUserAndJobPostId(@Param("userId") String userId,@Param("jobId") long jobId);

    @Query(
        value = "SELECT new com.hctt.is208.DTO.JobApplicationDTO(ja.id, ja.applyDate, ja.state, jp, u) "
            + "FROM JobApplication ja "
            + "JOIN ja.jobPosting jp "
            + "JOIN ja.user u "
            + "WHERE ja.jobPosting.jobId = :jobId "
    ) 
    List<JobApplicationDTO> findByJobId(@Param("jobId") long jobId);
}
