package com.hctt.is208.model;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_postings")
@AllArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    @ManyToOne(fetch = FetchType.LAZY) // Mối quan hệ Many-to-One với Company
    @JoinColumn(name = "company_id", nullable = false) // Tên cột khóa ngoại trong bảng job_postings
    private Company company;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "salary_negotiable")
    private Boolean salaryNegotiable;

    @Column(name = "location")
    private String location;

    @Column(name = "skills", columnDefinition = "JSON") // MySQL JSON type
    private String skills; // Lưu dưới dạng chuỗi JSON, ví dụ: "[\"SQL\", \"ERP\"]"

    @Column(name = "posted_date", nullable = false, updatable = false)
    private LocalDateTime postedDate;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    private Boolean isActive;

    // Constructors
    public JobPosting() {
        this.postedDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
    }
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "JobPosting{" +
                "jobId=" + jobId +
                ", companyId=" + (company != null ? company.getCompanyId() : "null") +
                ", jobTitle='" + jobTitle + '\'' +
                ", salaryNegotiable=" + salaryNegotiable +
                ", location='" + location + '\'' +
                ", skills='" + skills + '\'' +
                ", postedDate=" + postedDate +
                ", updatedAt=" + updatedAt +
                ", isActive=" + isActive +
                '}';
    }

}
