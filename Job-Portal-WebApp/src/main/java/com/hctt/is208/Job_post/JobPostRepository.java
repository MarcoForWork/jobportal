package com.hctt.is208.Job_post;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface JobPostRepository extends JpaRepository<JobPost, Integer> {
    @Query("SELECT j FROM JobPost j WHERE " +
        "LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<JobPost> searchByKeyword(@Param("keyword") String keyword);
}