package com.hctt.is208.repository;

import com.hctt.is208.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCompanyName(String companyName);
    boolean existsByCompanyName(String companyName);
    boolean existsByOwnerId(String ownerId); // THAY ĐỔI TẠI ĐÂY: Thêm phương thức này

}
