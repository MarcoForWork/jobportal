package com.hctt.is208.repository;

import com.hctt.is208.model.JobPosting;
import com.hctt.is208.model.JobPostingDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobPostingDetailRepository extends JpaRepository<JobPostingDetail, Long> {


}
