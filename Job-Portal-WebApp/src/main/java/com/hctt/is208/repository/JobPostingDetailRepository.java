package com.hctt.is208.repository;

import com.hctt.is208.model.JobPosting;
import com.hctt.is208.model.JobPostingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobPostingDetailRepository extends JpaRepository<JobPostingDetail, Integer> {
    @Query("SELECT jp FROM JobPostingDetail jp WHERE jp.jobPosting.id = :id")
    Optional<JobPostingDetail> findByid(@Param("id") int jobId);
}
