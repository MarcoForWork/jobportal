package com.hctt.is208.DTO.JobPosting;


import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobPostingDetailRequest {
    private String salaryDescription;
    private String jobLevel;
    private String workFormat;
    private String contractType;
    private String responsibilities;
    private String requiredSkills;
    private String benefits;

}
