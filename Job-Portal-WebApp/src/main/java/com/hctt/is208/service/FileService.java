package com.hctt.is208.service;

import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;


public interface FileService {
    String storeFile(MultipartFile file, String userId) throws IOException;
    Resource loadFileAsResource(String filePath);
}
