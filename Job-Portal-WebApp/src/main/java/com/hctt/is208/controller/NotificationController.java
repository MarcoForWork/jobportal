package com.hctt.is208.controller;

import com.hctt.is208.DTO.NotificationDTO;
import com.hctt.is208.repository.NotificationRepository;
import com.hctt.is208.service.NotificationService; // Import service mới
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // Tiêm service mới vào
    @Autowired
    private NotificationService notificationService;

    // API cũ để lấy danh sách thông báo
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable String userId) {
        List<NotificationDTO> notifications = notificationRepository.findNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build(); // Trả về 200 OK và không có body
    }
}