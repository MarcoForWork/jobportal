package com.hctt.is208.Job_post;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobPostService {

    @Autowired
    private JobPostRepository jobPostRepository;

    public List<JobPost> searchJobs(String keyword) {
        return jobPostRepository.searchByKeyword(keyword);
    }
}
