package com.hctt.is208.service;

import com.hctt.is208.DTO.JobPosting.JobPostingRequest;
import com.hctt.is208.DTO.JobPosting.JobPostingResponse;
import com.hctt.is208.model.Company;
import com.hctt.is208.model.JobPosting;
import com.hctt.is208.repository.CompanyRepository;
import com.hctt.is208.repository.JobPostingRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;
    private final CompanyRepository companyRepository; // Cần để tìm kiếm Company

    @Autowired
    public JobPostingService(JobPostingRepository jobPostingRepository, CompanyRepository companyRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.companyRepository = companyRepository;
    }

    @Transactional
    public JobPostingResponse createJobPosting(JobPostingRequest jobPostingRequest) {
        Company company = companyRepository.findById(jobPostingRequest.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + jobPostingRequest.getCompanyId()));

        JobPosting jobPosting = new JobPosting();
        jobPosting.setCompany(company); // Gán đối tượng Company
        jobPosting.setJobTitle(jobPostingRequest.getJobTitle());
        jobPosting.setSalaryNegotiable(jobPostingRequest.getSalaryNegotiable());
        jobPosting.setLocation(jobPostingRequest.getLocation());
        jobPosting.setSkills(jobPostingRequest.getSkills()); // Lưu JSON string
        jobPosting.setIsActive(jobPostingRequest.getIsActive());

        JobPosting savedJobPosting = jobPostingRepository.save(jobPosting);
        return mapToJobPostingResponse(savedJobPosting);
    }

    public Optional<JobPostingResponse> getJobPostingById(Long id) {
        return jobPostingRepository.findById(id)
                .map(this::mapToJobPostingResponse);
    }

    public List<JobPostingResponse> getAllJobPostings() {
        return jobPostingRepository.findAll().stream()
                .map(this::mapToJobPostingResponse)
                .collect(Collectors.toList());
    }

    public List<JobPostingResponse> getJobPostingsByCompanyId(Long companyId) {
        return jobPostingRepository.findByCompanyCompanyId(companyId).stream()
                .map(this::mapToJobPostingResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public JobPostingResponse updateJobPosting(Long id, JobPostingRequest jobPostingRequest) {
        JobPosting existingJobPosting = jobPostingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job Posting not found with id: " + id));

        Company company = companyRepository.findById(jobPostingRequest.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + jobPostingRequest.getCompanyId()));

        existingJobPosting.setCompany(company);
        existingJobPosting.setJobTitle(jobPostingRequest.getJobTitle());
        existingJobPosting.setSalaryNegotiable(jobPostingRequest.getSalaryNegotiable());
        existingJobPosting.setLocation(jobPostingRequest.getLocation());
        existingJobPosting.setSkills(jobPostingRequest.getSkills());
        existingJobPosting.setIsActive(jobPostingRequest.getIsActive());
        // 'updatedAt' will be set automatically by @PreUpdate

        JobPosting updatedJobPosting = jobPostingRepository.save(existingJobPosting);
        return mapToJobPostingResponse(updatedJobPosting);
    }

    @Transactional
    public void deleteJobPosting(Long id) {
        if (!jobPostingRepository.existsById(id)) {
            throw new RuntimeException("Job Posting not found with id: " + id);
        }
        jobPostingRepository.deleteById(id);
    }

    // Helper method to map JobPosting entity to JobPostingResponse DTO
    private JobPostingResponse mapToJobPostingResponse(JobPosting jobPosting) {
        return new JobPostingResponse(
                jobPosting.getJobId(),
                jobPosting.getCompany().getCompanyId(), // Lấy ID của công ty
                jobPosting.getCompany().getCompanyName(), // Lấy tên công ty
                jobPosting.getJobTitle(),
                jobPosting.getSalaryNegotiable(),
                jobPosting.getLocation(),
                jobPosting.getSkills(),
                jobPosting.getPostedDate(),
                jobPosting.getUpdatedAt(),
                jobPosting.getIsActive()
        );
    }
}
