package com.hctt.is208.DTO;

import java.time.LocalDateTime;

import com.hctt.is208.model.JobApplication;
import com.hctt.is208.model.JobPosting;
import com.hctt.is208.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationDTO {
    private int id;
    private LocalDateTime applyDate;
    private JobApplication.State state;
    private JobPosting jobPosting;
    private User user;

    private String jobTitle;
    private String companyName;

    // Constructor dùng trong JPQL: cần đúng thứ tự tham số như trong query
    public JobApplicationDTO(int id, String jobTitle, String companyName, LocalDateTime applyDate, JobApplication.State state) {
        this.id = id;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
        this.applyDate = applyDate;
        this.state = state;
    }

    // Optional: các constructor còn lại nếu bạn vẫn cần
    public JobApplicationDTO(int id, LocalDateTime applyDate,
                         JobApplication.State state, String jobTitle, String companyName) {
        this.id = id;
        this.applyDate = applyDate;
        this.state = state;
        this.jobTitle = jobTitle;
        this.companyName = companyName;
    }

    public JobApplicationDTO(int id, LocalDateTime applyDate, JobApplication.State state, JobPosting jobPosting, User user) {
        this.id = id;
        this.applyDate = applyDate;
        this.state = state;
        this.jobPosting = jobPosting;
        this.user = user;
    }
}
