package com.hctt.is208.DTO.JobPosting;

import lombok.Data;

@Data
public class JobPostingDetailResponse {
    private int id;
    private String salaryDescription;
    private String jobLevel;
    private String workFormat;
    private String contractType;
    private String responsibilities;
    private String requiredSkills;
    private String benefits;
    private String jobTitle;
    private String companyName;
}
