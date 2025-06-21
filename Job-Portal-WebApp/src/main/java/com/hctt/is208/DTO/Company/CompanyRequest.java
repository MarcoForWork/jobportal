package com.hctt.is208.DTO.Company;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompanyRequest {
    @NotBlank(message = "Owner User ID is mandatory")
    @Size(max = 255, message = "Owner User ID cannot exceed 255 characters")
    private String ownerUserId; // Kiểu String vì ID của User là VARCHAR(255)

    @NotBlank(message = "Company name is mandatory")
    @Size(max = 255, message = "Company name cannot exceed 255 characters")
    private String companyName;

    @Size(max = 255, message = "Industry cannot exceed 255 characters")
    private String industry;

    @Size(max = 255, message = "Website cannot exceed 255 characters")
    private String website;
}
