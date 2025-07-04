package com.hctt.is208.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileDTO {
    private String fileName;
    private String filePath;
    private String userId;
}
