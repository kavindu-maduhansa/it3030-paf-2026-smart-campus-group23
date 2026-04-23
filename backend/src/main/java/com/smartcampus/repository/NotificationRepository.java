package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByAdminIdOrderByCreatedAtDesc(Long adminId);

    List<Notification> findByAdminIdAndIsReadFalseOrderByCreatedAtDesc(Long adminId);

    List<Notification> findByAdminIdAndTypeOrderByCreatedAtDesc(Long adminId, Notification.NotificationType type);

    List<Notification> findByAdminIdAndSeverityOrderByCreatedAtDesc(Long adminId, Notification.NotificationSeverity severity);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.admin.id = :adminId AND n.type = :type AND n.isRead = false")
    long countUnreadByAdminAndType(@Param("adminId") Long adminId, @Param("type") Notification.NotificationType type);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.admin.id = :adminId AND n.isRead = false")
    long countUnreadByAdmin(@Param("adminId") Long adminId);

    @Query("SELECT n.type, COUNT(n) FROM Notification n WHERE n.admin.id = :adminId AND n.isRead = false GROUP BY n.type")
    List<Object[]> countUnreadGroupByType(@Param("adminId") Long adminId);
}
