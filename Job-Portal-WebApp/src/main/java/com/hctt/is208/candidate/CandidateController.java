package com.hctt.is208.candidate;

import java.io.File;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    @Autowired
    private CandidateService candidateService;

    @Autowired
    private CandidateRepository candidateRepository; // Thêm repo để lấy thông tin

    /**
     * Lấy thông tin chi tiết của một ứng viên, bao gồm cả tên file CV
     */
    @GetMapping("/{id}")
    public ResponseEntity<candidates> getCandidateDetails(@PathVariable int id) {
        return candidateRepository.findById(id).map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Tải lên hoặc thay thế CV cho một ứng viên
     */
    @PostMapping("/{id}/upload-cv")
    public ResponseEntity<String> uploadCv(@PathVariable int id, @RequestParam("file") MultipartFile file) {
        try {
            String savedFileName = candidateService.saveCvFile(id, file);
            return ResponseEntity.ok("CV uploaded successfully: " + savedFileName);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload CV: " + e.getMessage());
        }
    }

    /**
     * Tải xuống CV của một ứng viên
     */
    @GetMapping("/{id}/download-cv")
    public ResponseEntity<Resource> downloadCV(@PathVariable int id) {
        try {
            // Tìm ứng viên để lấy tên file CV
            candidates candidate = candidateRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Candidate not found"));

            String fileName = candidate.getCvFilePath();
            if (fileName == null) {
                return ResponseEntity.notFound().build();
            }

            File fileToDownload = candidateService.getDownloadCV(fileName);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileToDownload.getName() + "\"")
                    .contentLength(fileToDownload.length())
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(new FileSystemResource(fileToDownload));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * Xóa CV của một ứng viên
     */
    @DeleteMapping("/{id}/cv")
    public ResponseEntity<Void> deleteCv(@PathVariable int id) {
        try {
            candidateService.deleteCvFile(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}
