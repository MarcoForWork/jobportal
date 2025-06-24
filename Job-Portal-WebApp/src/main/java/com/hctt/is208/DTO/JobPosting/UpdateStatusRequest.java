package com.hctt.is208.DTO.JobPosting;

import com.hctt.is208.model.JobPostingStatus;

public class UpdateStatusRequest {
    private JobPostingStatus status;

    // Getters and Setters
    public JobPostingStatus getStatus() {
        return status;
    }

    public void setStatus(JobPostingStatus status) {
        this.status = status;
    }
}
