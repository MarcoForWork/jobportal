package com.hctt.is208.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hctt.is208.DTO.JobApplicationDTO;
import com.hctt.is208.service.JobApplicationService;

@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationService jobApplicationService;

    // Candidate
    @GetMapping("/{userId}")
    public ResponseEntity<List<JobApplicationDTO>> listUserJobApplications (
        @PathVariable String userId
    ) {
        List<JobApplicationDTO> userApplications = jobApplicationService.listCandidateApplications(userId);
        return ResponseEntity.ok(userApplications);
    }

    @PostMapping("/apply/{userId}/{jobId}")
    public ResponseEntity<String> applyJob (
        @PathVariable String userId,
        @PathVariable Long jobId
    ) {
        jobApplicationService.applyToJob(userId, jobId);
        return ResponseEntity.ok("Application submitted");
    }

    @DeleteMapping("/remove/{userId}/{applicationId}")
    public ResponseEntity<String> removeJobApplication (
        @PathVariable String userId,
        @PathVariable int applicationId
    ){
        jobApplicationService.removeJobApplication(userId, applicationId);
        return ResponseEntity.ok("Application removed!");
    }

    // Recruiter
    @GetMapping("/jobs/{jobId}/candidates")
    public ResponseEntity<List<JobApplicationDTO>> getCandidateByJobId (
        @PathVariable long jobId
    ) {
        List<JobApplicationDTO> candidates = jobApplicationService.listCandidateOfJob(jobId);
        return ResponseEntity.ok(candidates);
    }

    @PutMapping("/{applicationId}/state")
    public ResponseEntity<String> updateCandidateState (
        @PathVariable int applicationId,
        @RequestParam ("state") String state
    ) {
        jobApplicationService.updateCandidateState(applicationId, state);
        return ResponseEntity.ok("Candidate state updated!");
    }
}
