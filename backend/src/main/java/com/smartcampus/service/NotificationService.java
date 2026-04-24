package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.dto.NotificationStatsDTO;
import com.smartcampus.model.Notification;
import com.smartcampus.entity.User;
import com.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public Notification createNotification(User admin, String title, String description, 
                                          Notification.NotificationType type, 
                                          Notification.NotificationSeverity severity) {
        log.info("Creating notification for admin {}: {}", admin.getEmail(), title);
        
        Notification notification = Notification.builder()
                .admin(admin)
                .title(title)
                .description(description)
                .type(type)
                .severity(severity)
                .isRead(false)
                .build();
        
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByAdmin(Long adminId) {
        log.debug("Fetching all notifications for admin: {}", adminId);
        return notificationRepository.findByAdminIdOrderByCreatedAtDesc(adminId)
                .stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotificationsByAdmin(Long adminId) {
        log.debug("Fetching unread notifications for admin: {}", adminId);
        return notificationRepository.findByAdminIdAndIsReadFalseOrderByCreatedAtDesc(adminId)
                .stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByAdminAndType(Long adminId, Notification.NotificationType type) {
        log.debug("Fetching {} notifications for admin: {}", type, adminId);
        return notificationRepository.findByAdminIdAndTypeOrderByCreatedAtDesc(adminId, type)
                .stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        log.debug("Marking notification {} as read", notificationId);
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        log.debug("Deleting notification: {}", notificationId);
        notificationRepository.deleteById(notificationId);
    }

    @Transactional
    public void deleteNotificationsByAdminAndType(Long adminId, Notification.NotificationType type) {
        log.info("Deleting {} notifications for admin: {}", type, adminId);
        List<Notification> notifications = notificationRepository.findByAdminIdAndTypeOrderByCreatedAtDesc(adminId, type);
        notificationRepository.deleteAll(notifications);
    }

    @Transactional
    public void deleteAllNotificationsByAdmin(Long adminId) {
        log.info("Deleting all notifications for admin: {}", adminId);
        List<Notification> notifications = notificationRepository.findByAdminIdOrderByCreatedAtDesc(adminId);
        notificationRepository.deleteAll(notifications);
    }

    @Transactional(readOnly = true)
    public NotificationStatsDTO getNotificationStats(Long adminId) {
        log.debug("Fetching notification stats for admin: {}", adminId);
        
        long resourceCount = notificationRepository.countUnreadByAdminAndType(adminId, Notification.NotificationType.RESOURCE);
        long facilityCount = notificationRepository.countUnreadByAdminAndType(adminId, Notification.NotificationType.FACILITY);
        long bookingCount = notificationRepository.countUnreadByAdminAndType(adminId, Notification.NotificationType.BOOKING);
        long maintenanceCount = notificationRepository.countUnreadByAdminAndType(adminId, Notification.NotificationType.MAINTENANCE);
        long ticketCount = notificationRepository.countUnreadByAdminAndType(adminId, Notification.NotificationType.TICKET);
        
        return NotificationStatsDTO.builder()
                .resourceCount(resourceCount)
                .facilityCount(facilityCount)
                .bookingCount(bookingCount)
                .maintenanceCount(maintenanceCount)
                .ticketCount(ticketCount)
                .build();
    }

    @Transactional(readOnly = true)
    public long countUnreadNotifications(Long adminId) {
        return notificationRepository.countUnreadByAdmin(adminId);
    }
}
