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
        "SELECT new com.hctt.is208.DTO.JobApplicationDTO(ja.id, ja.applyDate, ja.state, jp, u) " +
        "FROM JobApplication ja " +
        "JOIN ja.jobPosting jp " +
        "JOIN ja.user u " +
        "WHERE ja.id = :jobApplicationId"
    )
    Optional<JobApplicationDTO> findByJobApplicationId(@Param("jobApplicationId") int jobApplicationId);

    @Query(
        "SELECT new com.hctt.is208.DTO.JobApplicationDTO(" +
        "ja.id, jp.jobTitle, jp.company.companyName, ja.applyDate, ja.state, u.id, jp.jobId) " +
        "FROM JobApplication ja " +
        "JOIN ja.jobPosting jp " +
        "JOIN jp.company c " +
        "JOIN ja.user u " +
        "WHERE ja.user.id = :userId"
    )
    List<JobApplicationDTO> findByUserId(@Param("userId") String userId);

    @Query(
        "SELECT new com.hctt.is208.DTO.JobApplicationDTO(" +
        "ja.id, jp.jobTitle, jp.company.companyName, ja.applyDate, ja.state, u.id, jp.jobId) " +
        "FROM JobApplication ja " +
        "JOIN ja.jobPosting jp " +
        "JOIN jp.company c " +
        "JOIN ja.user u " +
        "WHERE ja.user.id = :userId AND ja.state = :state"
    )
    List<JobApplicationDTO> findByUserAndState(@Param("userId") String userId, @Param("state") JobApplication.State state);

    // Dùng constructor (id, applyDate, state, jobPosting, user)
    @Query(
        "SELECT new com.hctt.is208.DTO.JobApplicationDTO(ja.id, ja.applyDate, ja.state, jp, u) " +
        "FROM JobApplication ja " +
        "JOIN ja.jobPosting jp " +
        "JOIN ja.user u " +
        "WHERE ja.jobPosting.jobId = :jobId AND ja.user.id = :userId"
    )
    Optional<JobApplicationDTO> findByUserAndJobPostId(@Param("userId") String userId, @Param("jobId") long jobId);


    @Query(
        "SELECT new com.hctt.is208.DTO.JobApplicationDTO(" +
        "ja.id, jp.jobId, jp.jobTitle, jp.company.companyName, ja.applyDate, ja.state, u.id, u.firstName, u.lastName) " +
        "FROM JobApplication ja " +
        "JOIN ja.jobPosting jp " +
        "JOIN jp.company c " +
        "JOIN ja.user u " +
        "WHERE jp.jobId = :jobId"
    )
    List<JobApplicationDTO> findByJobId(@Param("jobId") long jobId);
}
