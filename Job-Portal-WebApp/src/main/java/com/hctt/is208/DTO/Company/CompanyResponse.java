package com.hctt.is208.DTO.Company;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompanyResponse {
     int companyId;
     String companyName;
     String ownerUserId;
     String industry;
     String website;
     LocalDateTime createdAt;

     public CompanyResponse(int companyId, String ownerUserId, String ownerUsername, String companyName, String industry, String website, LocalDateTime createdAt) {
          this.companyId = companyId;
          this.ownerUserId = ownerUserId;
          this.companyName = companyName;
          this.industry = industry;
          this.website = website;
          this.createdAt = createdAt;
     }
}
