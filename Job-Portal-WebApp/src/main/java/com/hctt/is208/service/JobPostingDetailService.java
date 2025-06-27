package com.hctt.is208.service;
import com.hctt.is208.DTO.JobPosting.JobPostingDetailRequest;
import com.hctt.is208.DTO.JobPosting.JobPostingDetailResponse;
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

    public JobPostingDetailService(JobPostingRepository jobPostingRepository, JobPostingDetailRepository jobPostingDetailRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobPostingDetailRepository = jobPostingDetailRepository;
    }

    @Transactional
    public JobPostingDetailResponse saveOrUpdateDetails(int jobId, JobPostingDetailRequest request) { // Sửa kiểu trả về
        JobPosting jobPosting = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("JobPosting not found with id: " + jobId));

        JobPostingDetail detailToSave = jobPostingDetailRepository.findById(jobId)
                .orElseGet(() -> {
                    JobPostingDetail newDetail = new JobPostingDetail();
                    newDetail.setJobPosting(jobPosting);
                    return newDetail;
                });

        // Map dữ liệu từ request vào entity
        detailToSave.setSalaryDescription(request.getSalaryDescription());
        detailToSave.setJobLevel(request.getJobLevel());
        detailToSave.setWorkFormat(request.getWorkFormat());
        detailToSave.setContractType(request.getContractType());
        detailToSave.setResponsibilities(request.getResponsibilities());
        detailToSave.setRequiredSkills(request.getRequiredSkills());
        detailToSave.setBenefits(request.getBenefits());

        // Lưu entity vào DB
        JobPostingDetail savedEntity = jobPostingDetailRepository.save(detailToSave);

        // Map entity đã lưu sang DTO và trả về
        return mapToDto(savedEntity);
    }

    // Tạo một phương thức private để tái sử dụng logic ánh xạ
    private JobPostingDetailResponse mapToDto(JobPostingDetail entity) {
        JobPostingDetailResponse dto = new JobPostingDetailResponse();
        dto.setId(entity.getId());
        dto.setSalaryDescription(entity.getSalaryDescription());
        dto.setJobLevel(entity.getJobLevel());
        dto.setWorkFormat(entity.getWorkFormat());
        dto.setContractType(entity.getContractType());
        dto.setResponsibilities(entity.getResponsibilities());
        dto.setRequiredSkills(entity.getRequiredSkills());
        dto.setBenefits(entity.getBenefits());

        // Truy cập an toàn các trường lazy-loaded vì đang ở trong transaction
        if (entity.getJobPosting() != null) {
            dto.setJobTitle(entity.getJobPosting().getJobTitle());
            if (entity.getJobPosting().getCompany() != null) {
                dto.setCompanyName(entity.getJobPosting().getCompany().getCompanyName());
            }
        }
        return dto;
    }

    // Bạn cũng nên cập nhật phương thức findDetailsById để trả về DTO
    public Optional<JobPostingDetailResponse> findDetailsDtoById(int jobId) {
        return jobPostingDetailRepository.findById(jobId)
                .map(this::mapToDto); // Tái sử dụng mapper
    }
}
