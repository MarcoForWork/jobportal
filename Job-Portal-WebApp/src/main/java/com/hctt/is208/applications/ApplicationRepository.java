package com.hctt.is208.applications;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Integer> {
    List<Application> findByCandidateId(Integer candidateId);
    void deleteByCandidateId(Integer candidateId);
    List<Application> findByJobPostId(Integer jobPostId);
}
