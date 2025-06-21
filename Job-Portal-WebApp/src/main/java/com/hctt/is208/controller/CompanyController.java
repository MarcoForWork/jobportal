package com.hctt.is208.controller;

import com.hctt.is208.DTO.Company.CompanyRequest;
import com.hctt.is208.DTO.Company.CompanyResponse;
import com.hctt.is208.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {
    private final CompanyService companyService;

    @Autowired
    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> createCompany(@Valid @RequestBody CompanyRequest companyRequest) {
        try {
            CompanyResponse response = companyService.createCompany(companyRequest);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // Bao gồm các lỗi như "Company already exists" hoặc "User is not RECRUITER"
            // Hoặc "User already owns a company"
            return new ResponseEntity<>(null, HttpStatus.CONFLICT); // 409 Conflict
        } catch (RuntimeException e) { // Catching more general RuntimeException for User not found
            if (e.getMessage().contains("User not found")) {
                return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST); // 400 Bad Request
            }
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getCompanyById(@PathVariable Long id) {
        return companyService.getCompanyById(id)
                .map(company -> new ResponseEntity<>(company, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAllCompanies() {
        List<CompanyResponse> companies = companyService.getAllCompanies();
        return new ResponseEntity<>(companies, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> updateCompany(@PathVariable Long id, @Valid @RequestBody CompanyRequest companyRequest) {
        try {
            CompanyResponse response = companyService.updateCompany(id, companyRequest);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (RuntimeException e) { // Refine with custom exceptions
            if (e.getMessage().contains("not found")) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            } else if (e.getMessage().contains("already exists") || e.getMessage().contains("is not a RECRUITER") || e.getMessage().contains("already owns another company")) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            } else if (e.getMessage().contains("User not found")) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        try {
            companyService.deleteCompany(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
