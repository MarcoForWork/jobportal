package com.hctt.is208.controller;

import com.hctt.is208.DTO.JobPosting.JobPostingDetailRequest;
import com.hctt.is208.model.JobPostingDetail;
import com.hctt.is208.service.JobPostingDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/jobpostings/{jobId}/details")
public class JobPostingDetailController {
    private final JobPostingDetailService jobPostingDetailService;

    @Autowired
    public JobPostingDetailController(JobPostingDetailService jobPostingDetailService) {
        this.jobPostingDetailService = jobPostingDetailService;
    }

    /**
     * Endpoint để LẤY chi tiết của một tin tuyển dụng.
     * Sẽ trả về 200 OK với dữ liệu nếu tìm thấy, hoặc 404 Not Found nếu không.
     */
    @GetMapping
    public ResponseEntity<JobPostingDetail> getJobPostingDetails(@PathVariable int jobId) {
        Optional<JobPostingDetail> details = jobPostingDetailService.findDetailsById(jobId);
        return details.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Endpoint để TẠO MỚI hoặc CẬP NHẬT chi tiết của một tin tuyển dụng.
     * Sử dụng phương thức PUT vì nó mang ý nghĩa "đặt hoặc thay thế" toàn bộ tài nguyên.
     */
    @PutMapping
    public ResponseEntity<JobPostingDetail> upsertJobPostingDetails(
            @PathVariable int jobId,
            @RequestBody JobPostingDetailRequest request) {
        try {
            JobPostingDetail savedDetails = jobPostingDetailService.saveOrUpdateDetails(jobId, request);
            return ResponseEntity.ok(savedDetails);
        } catch (RuntimeException e) {
            // Lỗi này chủ yếu xảy ra khi không tìm thấy JobPosting cha với `jobId` tương ứng.
            // Trả về lỗi 404 để thông báo rằng "tin tuyển dụng cha không tồn tại".
            return ResponseEntity.notFound().build();
        }
    }
}
