package com.hctt.is208.repository;

import com.hctt.is208.DTO.NotificationDTO;
import com.hctt.is208.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT new com.hctt.is208.DTO.NotificationDTO(n.id, n.message, n.isRead, n.createdAt, n.link) " +
            "FROM Notification n JOIN n.user u " +
            "WHERE u.id = :userId " +
            "ORDER BY n.createdAt DESC")
    List<NotificationDTO> findNotificationsByUserId(@Param("userId") String userId);
}
