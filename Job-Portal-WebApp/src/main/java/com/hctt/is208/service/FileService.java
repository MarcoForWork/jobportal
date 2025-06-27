package com.hctt.is208.service;

import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import com.hctt.is208.DTO.FileDTO;


public interface FileService {
    FileDTO getFileByUserId(String userId);
    String storeFile(MultipartFile file, String userId) throws IOException;
    Resource loadFileAsResource(String filePath);
}
