package com.hctt.is208.DTO.JobPosting;

import com.hctt.is208.model.JobPostingStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobPostingResponse {
    private Long jobId;
    private Long companyId; // Chỉ gửi ID của công ty, không gửi toàn bộ object Company
    private String companyName; // Tên công ty để tiện hiển thị
    private String jobTitle;
    private Boolean salaryNegotiable;
    private String location;
    private String skills;
    private JobPostingStatus status;
    private LocalDateTime postedDate;
    private LocalDateTime updatedAt;
    private Boolean isActive;
}
