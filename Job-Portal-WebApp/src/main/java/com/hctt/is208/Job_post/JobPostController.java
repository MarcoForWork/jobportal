package com.hctt.is208.Job_post;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/jobposts")
public class JobPostController {

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private JobPostService jobPostService;

    @PostMapping
    public JobPost createJobPost(@RequestBody JobPost jobPost) {
        jobPost.setCreatedAt(LocalDateTime.now());
        return jobPostRepository.save(jobPost);
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobPost>> searchJobs(@RequestParam("keyword") String keyword) {
        List<JobPost> results = jobPostService.searchJobs(keyword);
        return ResponseEntity.ok(results);
    }
}
