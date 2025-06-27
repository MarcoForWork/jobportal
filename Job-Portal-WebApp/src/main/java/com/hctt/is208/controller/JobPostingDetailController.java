package com.hctt.is208.controller;

import com.hctt.is208.DTO.JobPosting.JobPostingDetailRequest;
import com.hctt.is208.DTO.JobPosting.JobPostingDetailResponse;
import com.hctt.is208.model.JobPostingDetail;
import com.hctt.is208.service.JobPostingDetailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/jobpostings/{jobId}/details")
public class JobPostingDetailController {
    private final JobPostingDetailService jobPostingDetailService;

    public JobPostingDetailController(JobPostingDetailService jobPostingDetailService) {
        this.jobPostingDetailService = jobPostingDetailService;
    }

    @GetMapping
    public ResponseEntity<JobPostingDetailResponse> getJobPostingDetails(@PathVariable int jobId) {
        return jobPostingDetailService.findDetailsDtoById(jobId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<JobPostingDetailResponse> upsertJobPostingDetails(
            @PathVariable int jobId,
            @Valid @RequestBody JobPostingDetailRequest request) {

        try {
            JobPostingDetailResponse savedDetailsDto = jobPostingDetailService.saveOrUpdateDetails(jobId, request);
            return ResponseEntity.ok(savedDetailsDto);
        } catch (RuntimeException e) {
            // Có thể xử lý lỗi cụ thể hơn ở đây
            return ResponseEntity.notFound().build();
        }
    }
}
