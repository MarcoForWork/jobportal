package com.hctt.is208.model;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "companies")
@Data
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "companyId")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long companyId;

    @OneToOne(fetch = FetchType.LAZY) // Có thể đổi thành EAGER nếu bạn luôn muốn tải thông tin owner cùng Company
    @JoinColumn(name = "owner_user_id", referencedColumnName = "id", nullable = false, unique = true)
    private User owner;

    @Column(name = "company_name", nullable = false, unique = true)
    String companyName;

    @Column(name = "industry")
    String industry;

    @Column(name = "website")
    String website;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    // Mối quan hệ One-to-Many với JobPosting
    // mappedBy chỉ ra tên trường trong lớp JobPosting sở hữu mối quan hệ này (company)
    // CascadeType.ALL: Tất cả các thao tác (PERSIST, MERGE, REMOVE, REFRESH, DETACH) sẽ được cascade
    // orphanRemoval = true: Các JobPosting không còn được liên kết với Company này sẽ bị xóa
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JobPosting> jobPostings; // Sử dụng Set để tránh trùng lặp và cải thiện hiệu suất tìm kiếm

    // Constructors
    public Company() {
        this.createdAt = LocalDateTime.now(); // Set current time on creation
    }

    @Override
    public String toString() {
        return "Company{" +
                "companyId=" + companyId +
                ", companyName='" + companyName + '\'' +
                ", industry='" + industry + '\'' +
                ", website='" + website + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
