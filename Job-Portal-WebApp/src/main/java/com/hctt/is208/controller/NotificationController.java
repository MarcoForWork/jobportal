package com.hctt.is208.controller;

import com.hctt.is208.model.Notification;
import com.hctt.is208.model.User;
import com.hctt.is208.repository.NotificationRepository;
import com.hctt.is208.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository; // Đảm bảo rằng bạn đã có UserRepository


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        // Tìm người dùng dựa trên ID
        User user = userRepository.findById(userId)
                .orElse(null);

        // Nếu không tìm thấy người dùng, trả về một danh sách rỗng
        if (user == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Nếu tìm thấy, lấy tất cả thông báo của người dùng đó và trả về
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(notifications);
    }
}