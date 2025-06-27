package com.hctt.is208.controller;

import java.io.IOException;
import java.util.Optional;

import org.springframework.http.HttpHeaders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.hctt.is208.DTO.FileDTO;
import com.hctt.is208.model.File;
import com.hctt.is208.model.User;
import com.hctt.is208.repository.FileRepository;
import com.hctt.is208.repository.UserRepository;
import com.hctt.is208.service.FileService;

@RestController
@RequestMapping("/api/files")
public class FileController {
    
    @Autowired
    private FileService fileService;

    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private UserRepository userRepository;

    // Get file info
    @GetMapping("/{userId}")
    public ResponseEntity<FileDTO> getFileInfo(@PathVariable String userId) {
        FileDTO fileDTO = fileService.getFileByUserId(userId);
        return ResponseEntity.ok(fileDTO);
    }   


    // Upload file
    @PostMapping("/upload/{userId}")
    public ResponseEntity<String> uploadFile (
            @RequestParam("file") MultipartFile file,
            @PathVariable String userId
    ) throws IOException {
        // Kiểm tra user tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User does not exists"));

        // Lưu file
        String filePath = fileService.storeFile(file, userId);

        // Kiểm tra user đã có cv chưa
        Optional<File> existingFile = fileRepository.findByUserId(userId);

        // Lưu bản ghi
        if (existingFile.isPresent()){
            // Update bản ghi cũ nếu user đã có cv
            File updateFile = existingFile.get();
            updateFile.setFileName(file.getOriginalFilename());
            updateFile.setFilePath(filePath);
            fileRepository.save(updateFile);
        } else {
            // Tạo mới nếu ứng viên lần đầu upload cv
            File newfile = new File();
            newfile.setFileName(userId);
            newfile.setFilePath(filePath);
            newfile.setUser(user);
            fileRepository.save(newfile);
        }

        return ResponseEntity.ok("Save resume successfully");
    }

    // Download file
    @GetMapping("/download/{userId}")
    public ResponseEntity<Resource> downloadUserFile(@PathVariable String userId) {
        File fileEntity = fileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User chưa có file"));

        Resource resource = fileService.loadFileAsResource(fileEntity.getFilePath());

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileEntity.getFileName() + "\"")
                .body(resource);
    }

}
