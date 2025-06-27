package com.hctt.is208.service.Implementation;

import com.hctt.is208.model.Notification;
import com.hctt.is208.repository.NotificationRepository;
import com.hctt.is208.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// <<< THAY ĐỔI QUAN TRỌNG 1 >>>: Import @Transactional từ gói của Spring
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    // <<< THAY ĐỔI QUAN TRỌNG 2 >>>: Sử dụng annotation của Spring
    @Transactional
    public void markAsRead(Long notificationId) {
        // Tìm thông báo trong database, nếu không thấy sẽ báo lỗi
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));

        // Đặt trạng thái đã đọc là true
        notification.setRead(true);

        // Lưu lại thay đổi. Nhờ có @Transactional, thay đổi này sẽ được commit vào DB.
        notificationRepository.save(notification);
    }
}