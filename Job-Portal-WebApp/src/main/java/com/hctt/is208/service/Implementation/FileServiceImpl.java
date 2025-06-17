package com.hctt.is208.service.Implementation;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import javax.management.RuntimeErrorException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.hctt.is208.repository.UserRepository;
import com.hctt.is208.service.FileService;

@Service
public class FileServiceImpl implements FileService {
    @Autowired
    private UserRepository userRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public String storeFile(MultipartFile file, String userId) throws IOException {

        // Kiểm tra có phải file .pdf không
        if (!isPdf(file)) {
            throw new IllegalArgumentException("Only accept PDF file!");
        }

        // Tạo thư mục user nếu chưa có
        Path userDir = Paths.get(uploadDir, userId).toAbsolutePath().normalize();
        Files.createDirectories(userDir);

        // Tạo tên file duy nhất
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        } else {
            extension = ".pdf"; // Fall back nếu không có đuôi
        }
        String fileName = userId + "_" + extension;

        // Path của file
        Path targetLocation = userDir.resolve(fileName);

        // Lưu file
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Trả về path tương đối để lưu vào DB
        return Paths.get(userId, fileName).toString();
    }

    @Override
    public Resource loadFileAsResource(String filePath) {
        try {
                Path file = Paths.get(uploadDir).resolve(filePath).normalize();
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not exists " + filePath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error while loading file: " + e.getMessage(), e);
        }
    }

    boolean isPdf(MultipartFile file) {
            // Kiểm tra loại nội dung file
            boolean contentTypeValid = file.getContentType() != null
                                    && file.getContentType().equals("application/pdf");

            // Check đuôi file
            String originalFilename = file.getOriginalFilename();
            boolean extensionValid = originalFilename != null
                                    && originalFilename.toLowerCase().endsWith(".pdf");

            return contentTypeValid && extensionValid;
    }
}
