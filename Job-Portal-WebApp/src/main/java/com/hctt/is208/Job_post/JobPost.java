package com.hctt.is208.Job_post;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.hctt.is208.recruiter.recruiters;

import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;

@Entity
@Table(name = "job_posts")
public class JobPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "recruiter_id")
    private recruiters recruiter;

    private String title;
    private String description;
    private String location;
    private String salary;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    private LocalDate deadline;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSalary() {
        return salary;
    }

    public void setSalary(String salary) {
        this.salary = salary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public recruiters getRecruiter() {
        return recruiter;
    }

    public void setRecruiter(recruiters recruiter) {
        this.recruiter = recruiter;
    }

}