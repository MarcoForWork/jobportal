package com.hctt.is208.applications;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.hctt.is208.Job_post.JobPostInfoDTO;
import com.hctt.is208.candidate.CandidatesDTO;

import java.util.stream.Collectors;

import java.util.List;

@RestController
@RequestMapping("/api/applications")

public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService)
    {
        this.applicationService = applicationService;
    }

    @GetMapping("/job/{jobPostId}/candidates/{candidateId}")
    public List<Application> getAppliedJobs(@PathVariable Integer candidateId)
    {
        return applicationService.getApplicationsByCandidate(candidateId);
    }

    @DeleteMapping("/{candidateId}/{applicationId}")
    public void cancelApplication(@PathVariable Integer candidateId, @PathVariable Integer applicationId) {
        applicationService.cancelApplication(applicationId, candidateId);
    }

    @GetMapping("/job/{jobPostId}/candidates")
    public List<CandidatesDTO> getCandidatesByJobPost(@PathVariable Integer jobPostId) {
        List<Application> applications = applicationService.getApplicationsByJobPost(jobPostId);
        return applications.stream()
                .map(app -> new CandidatesDTO(
                        app.getCandidate().getId(),
                        app.getCandidate().getName(),
                        app.getCandidate().getEmail()
                ))
                .collect(Collectors.toList());
    }

    @PostMapping
    public Application apply(@RequestBody Application application) {
        return applicationService.apply(application);
    }

    @GetMapping("/candidates/{candidateId}/jobs")
    public List<JobPostInfoDTO> getAppliedJobPosts(@PathVariable Integer candidateId) {
        return applicationService.getAppliedJobPostsByCandidate(candidateId)
                .stream()
                .map(jobPost -> new JobPostInfoDTO(
                        jobPost.getId(),
                        jobPost.getTitle(),
                        jobPost.getDescription(),
                        jobPost.getLocation(),
                        jobPost.getSalary(),
                        jobPost.getDeadline().toString()
                ))
                .collect(Collectors.toList());
    }
}
