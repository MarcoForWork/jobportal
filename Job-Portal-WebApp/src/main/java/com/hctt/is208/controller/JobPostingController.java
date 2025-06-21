package com.hctt.is208.controller;

import com.hctt.is208.DTO.JobPosting.JobPostingRequest;
import com.hctt.is208.DTO.JobPosting.JobPostingResponse;
import com.hctt.is208.service.JobPostingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobpostings")
public class JobPostingController {
    private final JobPostingService jobPostingService;

    @Autowired
    public JobPostingController(JobPostingService jobPostingService) {
        this.jobPostingService = jobPostingService;
    }

    @PostMapping
    public ResponseEntity<JobPostingResponse> createJobPosting(@Valid @RequestBody JobPostingRequest jobPostingRequest) {
        try {
            JobPostingResponse response = jobPostingService.createJobPosting(jobPostingRequest);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) { // Catching more general RuntimeException for now
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST); // e.g., Company not found
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostingResponse> getJobPostingById(@PathVariable Long id) {
        return jobPostingService.getJobPostingById(id)
                .map(jobPosting -> new ResponseEntity<>(jobPosting, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<JobPostingResponse>> getAllJobPostings() {
        List<JobPostingResponse> jobPostings = jobPostingService.getAllJobPostings();
        return new ResponseEntity<>(jobPostings, HttpStatus.OK);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobPostingResponse>> getJobPostingsByCompany(@PathVariable Long companyId) {
        List<JobPostingResponse> jobPostings = jobPostingService.getJobPostingsByCompanyId(companyId);
        if (jobPostings.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content if no postings found for company
        }
        return new ResponseEntity<>(jobPostings, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobPostingResponse> updateJobPosting(@PathVariable Long id, @Valid @RequestBody JobPostingRequest jobPostingRequest) {
        try {
            JobPostingResponse response = jobPostingService.updateJobPosting(id, jobPostingRequest);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (RuntimeException e) { // Catching more general RuntimeException for now
            if (e.getMessage().contains("not found")) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // e.g., Company not found
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPosting(@PathVariable Long id) {
        try {
            jobPostingService.deleteJobPosting(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) { // Catching more general RuntimeException for now
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
