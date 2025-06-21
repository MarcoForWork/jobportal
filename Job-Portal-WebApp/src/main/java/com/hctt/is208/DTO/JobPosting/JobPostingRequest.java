package com.hctt.is208.DTO.JobPosting;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class JobPostingRequest {
    @NotNull(message = "Company ID is mandatory")
    private Long companyId; // ID của công ty sở hữu bài đăng này

    @NotBlank(message = "Job title is mandatory")
    @Size(max = 255, message = "Job title cannot exceed 255 characters")
    private String jobTitle;

    private Boolean salaryNegotiable = true; // Mặc định là true

    @Size(max = 255, message = "Location cannot exceed 255 characters")
    private String location;

    private String skills; // Chuỗi JSON của mảng kỹ năng, ví dụ: "[\"SQL\", \"ERP\"]"

    private Boolean isActive = true; // Mặc định là true
}
