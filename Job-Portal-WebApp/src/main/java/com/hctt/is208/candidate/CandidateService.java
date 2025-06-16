package com.hctt.is208.candidate;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;

@Service
public class CandidateService {

    // Giữ nguyên đường dẫn lưu CV của bạn
    protected static final String CV_STORAGE_DIR = "D:\\QLDA\\Do_An\\QLDA_IS208\\cv_data";

    private final CandidateRepository candidateRepository;

    @Autowired
    public CandidateService(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    /**
     * Lưu file CV mới cho ứng viên và cập nhật vào database.
     * Nếu đã có file cũ, sẽ bị ghi đè.
     * @param candidateId ID của ứng viên
     * @param file File CV được tải lên
     * @return Tên file đã được lưu
     */
    @Transactional
    public String saveCvFile(Integer candidateId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Tìm ứng viên trong DB
        candidates candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        // Tạo tên file duy nhất để tránh trùng lặp, ví dụ: "cv_1_original_filename.pdf"
        String originalFileName = file.getOriginalFilename();
        String fileName = "cv_" + candidateId + "_" + originalFileName;

        File targetFile = new File(CV_STORAGE_DIR + File.separator + fileName);

        // Security check
        if (!targetFile.getParent().equals(CV_STORAGE_DIR)) {
            throw new SecurityException("Unsupported filename!");
        }

        try {
            // Lưu file vào thư mục
            Files.copy(file.getInputStream(), targetFile.toPath(), StandardCopyOption.REPLACE_EXISTING);

            // Cập nhật tên file CV vào database cho ứng viên
            candidate.setCvFilePath(fileName);
            candidateRepository.save(candidate);

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }
    }

    /**
     * Xóa file CV của ứng viên
     * @param candidateId ID của ứng viên
     */
    @Transactional
    public void deleteCvFile(Integer candidateId) {
        candidates candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found with id: " + candidateId));

        String fileName = candidate.getCvFilePath();
        if (fileName != null && !fileName.isEmpty()) {
            try {
                File fileToDelete = new File(CV_STORAGE_DIR + File.separator + fileName);
                if (fileToDelete.exists()) {
                    Files.delete(fileToDelete.toPath());
                }

                // Xóa đường dẫn file trong database
                candidate.setCvFilePath(null);
                candidateRepository.save(candidate);
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete CV file", e);
            }
        }
    }

    /**
     * Lấy file CV để tải xuống
     * @param fileName Tên file cần tải
     * @return Đối tượng File
     */
    public File getDownloadCV(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            throw new NullPointerException("File name cannot be null or empty");
        }

        var fileToDownload = new File(CV_STORAGE_DIR + File.separator + fileName);
        if (!Objects.equals(fileToDownload.getParent(), CV_STORAGE_DIR)) {
            throw new SecurityException("Unsupported filename!");
        }

        if(!fileToDownload.exists()) {
            throw new RuntimeException("File not found: " + fileName);
        }

        return fileToDownload;
    }

}

