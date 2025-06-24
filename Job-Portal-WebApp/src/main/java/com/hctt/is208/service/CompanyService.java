package com.hctt.is208.service;

import com.hctt.is208.DTO.Company.CompanyRequest;
import com.hctt.is208.DTO.Company.CompanyResponse;
import com.hctt.is208.model.Company;
import com.hctt.is208.model.User;
import com.hctt.is208.repository.CompanyRepository;
import com.hctt.is208.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository; // THAY ĐỔI TẠI ĐÂY: Inject UserRepository

    @Autowired
    public CompanyService(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository; // THAY ĐỔI TẠI ĐÂY: Khởi tạo userRepository
    }

    @Transactional
    public CompanyResponse createCompany(CompanyRequest companyRequest) {
        // THAY ĐỔI TẠI ĐÂY: Tìm User và kiểm tra vai trò
        User owner = userRepository.findById(companyRequest.getOwnerUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + companyRequest.getOwnerUserId()));

        if (!owner.getRole().equals("recruiter")) {
            throw new IllegalArgumentException("User with ID " + companyRequest.getOwnerUserId() + " is not a RECRUITER and cannot own a company.");
        }

        // Kiểm tra xem user này đã sở hữu công ty nào chưa (nếu owner_user_id là UNIQUE)
        // Dựa vào việc owner_user_id là UNIQUE trong DB, nếu có lỗi, nó sẽ là DuplicateKeyException từ JPA
        // Bạn có thể thêm một phương thức trong CompanyRepository để kiểm tra sự tồn tại của owner_user_id
        if (companyRepository.existsByOwnerId(companyRequest.getOwnerUserId())) {
            throw new IllegalArgumentException("User with ID " + companyRequest.getOwnerUserId() + " already owns a company.");
        }


        if (companyRepository.existsByCompanyName(companyRequest.getCompanyName())) {
            throw new IllegalArgumentException("Company with name '" + companyRequest.getCompanyName() + "' already exists.");
        }

        Company company = new Company();
        company.setOwner(owner); // THAY ĐỔI TẠI ĐÂY: Set đối tượng User
        company.setCompanyName(companyRequest.getCompanyName());
        company.setIndustry(companyRequest.getIndustry());
        company.setWebsite(companyRequest.getWebsite());

        Company savedCompany = companyRepository.save(company);
        return mapToCompanyResponse(savedCompany);
    }

    public Optional<CompanyResponse> getCompanyById(Long id) {
        return companyRepository.findById(id)
                .map(this::mapToCompanyResponse);
    }

    public List<CompanyResponse> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::mapToCompanyResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CompanyResponse updateCompany(Long id, CompanyRequest companyRequest) {
        Company existingCompany = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + id));

        // THAY ĐỔI TẠI ĐÂY: Kiểm tra và cập nhật owner nếu ownerUserId thay đổi
        if (!existingCompany.getOwner().getId().equals(companyRequest.getOwnerUserId())) {
            User newOwner = userRepository.findById(companyRequest.getOwnerUserId())
                    .orElseThrow(() -> new RuntimeException("New Owner User not found with ID: " + companyRequest.getOwnerUserId()));

            if (newOwner.getRole() != "RECRUITER") {
                throw new IllegalArgumentException("New Owner User with ID " + companyRequest.getOwnerUserId() + " is not a RECRUITER.");
            }
            // Kiểm tra xem newOwner đã sở hữu công ty nào khác chưa (nếu owner_user_id là UNIQUE)
            if (companyRepository.existsByOwnerId(companyRequest.getOwnerUserId()) && !companyRequest.getOwnerUserId().equals(existingCompany.getOwner().getId())) {
                throw new IllegalArgumentException("User with ID " + companyRequest.getOwnerUserId() + " already owns another company.");
            }
            existingCompany.setOwner(newOwner);
        }

        // Check if updating to an existing name by another company
        if (!existingCompany.getCompanyName().equals(companyRequest.getCompanyName()) &&
                companyRepository.existsByCompanyName(companyRequest.getCompanyName())) {
            throw new IllegalArgumentException("Company with name '" + companyRequest.getCompanyName() + "' already exists.");
        }

        existingCompany.setCompanyName(companyRequest.getCompanyName());
        existingCompany.setIndustry(companyRequest.getIndustry());
        existingCompany.setWebsite(companyRequest.getWebsite());

        Company updatedCompany = companyRepository.save(existingCompany);
        return mapToCompanyResponse(updatedCompany);
    }

    @Transactional
    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new RuntimeException("Company not found with id: " + id);
        }
        companyRepository.deleteById(id);
    }

    // Helper method to map Company entity to CompanyResponse DTO
    private CompanyResponse mapToCompanyResponse(Company company) {
        // Lombok sẽ tạo một constructor với thứ tự các trường được khai báo trong lớp DTO
        // companyId, companyName, ownerUserId, industry, website, createdAt
        return new CompanyResponse(
                company.getCompanyId(),
                company.getCompanyName(), // Sửa lại cho đúng
                company.getOwner() != null ? company.getOwner().getId() : null,
                company.getIndustry(),
                company.getWebsite(),
                company.getCreatedAt()
        );
}
}
