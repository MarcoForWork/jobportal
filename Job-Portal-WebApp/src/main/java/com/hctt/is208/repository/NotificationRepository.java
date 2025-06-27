package com.hctt.is208.repository;

import com.hctt.is208.model.Notification;
import com.hctt.is208.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // Tìm tất cả thông báo cho một người dùng, sắp xếp theo thời gian mới nhất
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
}