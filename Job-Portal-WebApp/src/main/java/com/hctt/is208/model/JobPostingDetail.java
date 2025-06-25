package com.hctt.is208.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "job_posting_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIdentityInfo(
        generator = ObjectIdGenerators.PropertyGenerator.class,
        property = "id")
public class JobPostingDetail {
    @Id // Khóa chính
    private int id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "job_posting_id")
    private JobPosting jobPosting;

    @Column(name = "salary_description")
    private String salaryDescription;

    @Column(name = "job_level")
    private String jobLevel;

    @Column(name = "work_format")
    private String workFormat;

    @Column(name = "contract_type")
    private String contractType;

    @Lob // Dùng cho các trường văn bản dài
    @Column(name = "responsibilities", columnDefinition = "TEXT")
    private String responsibilities;

    @Lob
    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills;

    @Lob
    @Column(name = "benefits", columnDefinition = "TEXT")
    private String benefits;
}
