package com.hctt.is208.service.Implementation;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.hctt.is208.DTO.JobApplicationDTO;
import com.hctt.is208.model.JobApplication;
import com.hctt.is208.model.JobPosting;
import com.hctt.is208.model.User;
import com.hctt.is208.repository.JobApplicationRepository;
import com.hctt.is208.repository.JobPostingRepository;
import com.hctt.is208.repository.UserRepository;
import com.hctt.is208.service.JobApplicationService;

import jakarta.transaction.Transactional;

@Service
public class JobApplicationServiceImpl implements JobApplicationService{
    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Override
    public void applyToJob(String userId, int jobId) {
        Optional<JobApplicationDTO> existing = jobApplicationRepository.findByUserAndJobPostId(userId, jobId);
        if (existing.isPresent()) {
            throw new RuntimeException("User already applied to this job");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found!"));

        JobPosting jobPosting = jobPostingRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found!"));

        JobApplication newApplication = new JobApplication();
        newApplication.setApplyDate(LocalDateTime.now());
        newApplication.setState(JobApplication.State.Pending);
        newApplication.setUser(user);
        newApplication.setJobPosting(jobPosting);

        jobApplicationRepository.save(newApplication);
    }

    @Override
    public void removeJobApplication(String userId, int applicationId) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Candidate's application not found"));
        
        if(!application.getUser().getId().equals(userId)) {
            throw new RuntimeException("user missmatch");
        }

        jobApplicationRepository.delete(application);
    }

    @Override
    public List<JobApplicationDTO> listCandidateApplications(String userId) {
        return jobApplicationRepository.findByUserId(userId);
    }

    @Override
    public List<JobApplicationDTO> listCandidateOfJob(int jobId) {
        return jobApplicationRepository.findByJobId(jobId);
    }

    @Override
    @Transactional
    public void updateCandidateState(int applicationId, String state) {
        JobApplication application = jobApplicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Job application not found"));
        
        try {
            JobApplication.State newState = JobApplication.State.valueOf(state);
            application.setState(newState);
        } catch (Exception e) {
            throw new RuntimeException("Invalid state");
        }
    }
    
}
