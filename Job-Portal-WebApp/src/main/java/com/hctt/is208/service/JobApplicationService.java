package com.hctt.is208.service;

import java.util.List;

import com.hctt.is208.DTO.JobApplicationDTO;

public interface JobApplicationService {
    public void applyToJob(String userId, int jobId);
    public void removeJobApplication(String userId, int applicationId);
    public List<JobApplicationDTO> listCandidateApplications(String userId);
    public List<JobApplicationDTO> listCandidateOfJob(int jobId);
    public void updateCandidateState(int applicationId, String state);
}
