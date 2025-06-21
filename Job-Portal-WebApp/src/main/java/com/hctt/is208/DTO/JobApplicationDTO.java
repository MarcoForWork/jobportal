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

}
