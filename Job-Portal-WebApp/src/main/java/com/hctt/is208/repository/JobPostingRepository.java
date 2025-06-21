package com.hctt.is208.repository;

import com.hctt.is208.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByCompanyCompanyId(Long companyId);
    List<JobPosting> findByIsActiveTrue(); // Lấy các bài đăng đang hoạt động
    List<JobPosting> findByLocationContainingIgnoreCase(String location); // Tìm theo địa điểm
    List<JobPosting> findByJobTitleContainingIgnoreCase(String jobTitle); // Tìm theo tiêu đề công việc
}
