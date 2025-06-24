package com.hctt.is208.service;
import com.hctt.is208.DTO.JobPosting.JobPostingDetailRequest;
import com.hctt.is208.model.JobPosting;
import com.hctt.is208.model.JobPostingDetail;
import com.hctt.is208.repository.JobPostingDetailRepository;
import com.hctt.is208.repository.JobPostingRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class JobPostingDetailService {
    private final JobPostingRepository jobPostingRepository;
    private final JobPostingDetailRepository jobPostingDetailRepository;

    @Autowired
    public JobPostingDetailService(JobPostingRepository jobPostingRepository, JobPostingDetailRepository jobPostingDetailRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobPostingDetailRepository = jobPostingDetailRepository;
    }

    /**
     * Lấy thông tin chi tiết của một tin tuyển dụng.
     * @param jobPostingId ID của tin tuyển dụng.
     * @return một Optional chứa JobPostingDetail nếu tìm thấy.
     */
    public Optional<JobPostingDetail> findDetailsById(Long jobPostingId) {
        // findById hoạt động vì ID của JobPostingDetail chính là ID của JobPosting
        return jobPostingDetailRepository.findById(jobPostingId);
    }

    /**
     * Tạo mới hoặc cập nhật thông tin chi tiết cho một tin tuyển dụng đã tồn tại.
     * @param jobPostingId ID của tin tuyển dụng cha.
     * @param request Dữ liệu chi tiết từ frontend.
     * @return Đối tượng JobPostingDetail đã được lưu.
     */
    @Transactional
    public JobPostingDetail saveOrUpdateDetails(Long jobPostingId, JobPostingDetailRequest request) {
        // Bước 1: Tìm JobPosting cha. Nếu không có, không thể thêm chi tiết.
        JobPosting jobPosting = jobPostingRepository.findById(jobPostingId)
                .orElseThrow(() -> new RuntimeException("JobPosting not found with id: " + jobPostingId));

        // Bước 2: Tìm chi tiết hiện có hoặc tạo mới nếu chưa có.
        JobPostingDetail detail = jobPostingDetailRepository.findById(jobPostingId)
                .orElse(new JobPostingDetail());

        // Bước 3: Nếu là bản ghi mới, thiết lập ID và mối quan hệ
        if (detail.getId() == null) {
            detail.setId(jobPostingId);
            detail.setJobPosting(jobPosting);
        }

        // Bước 4: Ánh xạ dữ liệu từ request DTO vào entity 'detail'
        detail.setSalaryDescription(request.getSalaryDescription());
        detail.setJobLevel(request.getJobLevel());
        detail.setWorkFormat(request.getWorkFormat());
        detail.setContractType(request.getContractType());
        detail.setResponsibilities(request.getResponsibilities());
        detail.setRequiredSkills(request.getRequiredSkills());
        detail.setBenefits(request.getBenefits());

        // Bước 5: Lưu vào database. JPA sẽ tự động quyết định là INSERT hay UPDATE.
        return jobPostingDetailRepository.save(detail);
    }
}
