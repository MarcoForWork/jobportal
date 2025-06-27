package com.hctt.is208.service;

import java.util.List;

import com.hctt.is208.DTO.JobApplicationDTO;
import com.hctt.is208.model.JobApplication;

public interface JobApplicationService {
    public void applyToJob(String userId, int jobId);
    public void removeJobApplication(String userId, int applicationId);
    public List<JobApplicationDTO> listApplicationsByUser(String userId);
    public List<JobApplicationDTO> listApplicationsByUserAndState(String userId, JobApplication.State state);
    public List<JobApplicationDTO> listCandidateOfJob(int jobId);
    public void updateCandidateState(int applicationId, String state);
}
