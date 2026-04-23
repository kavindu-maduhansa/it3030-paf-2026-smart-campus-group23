package com.smartcampus.service;

import com.smartcampus.entity.User;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Booking Service
 * Handles business logic for booking management
 */
@Service
@Transactional
@Slf4j
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public Booking createBooking(Booking booking) {
        Booking savedBooking = bookingRepository.save(booking);
        
        // Create notification for all admins
        notifyAdminsAboutBooking(savedBooking);
        
        return savedBooking;
    }

    private void notifyAdminsAboutBooking(Booking booking) {
        try {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            for (User admin : admins) {
                String title = "New Booking Request from " + (booking.getUser() != null ? booking.getUser().getName() : "Unknown");
                String resourceName = booking.getResource() != null ? booking.getResource().getName() : "Unknown Resource";
                String bookingDate = booking.getBookingDate() != null ? booking.getBookingDate().toString() : "TBD";
                String description = "Booking for " + resourceName + " on " + bookingDate;
                
                notificationService.createNotification(
                    admin,
                    title,
                    description,
                    Notification.NotificationType.BOOKING,
                    Notification.NotificationSeverity.INFO
                );
            }
            log.info("Created booking notifications for {} admins", admins.size());
        } catch (Exception e) {
            log.error("Error creating booking notification", e);
        }
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByResource(Long resourceId) {
        return bookingRepository.findByResourceId(resourceId);
    }

    public List<Booking> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getBookingsByStatus(String status) {
        return bookingRepository.findByStatus(status);
    }

    public List<Booking> getBookingsByDateRange(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findByBookingDateBetween(startDate, endDate);
    }

    public Booking updateBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    public void deleteBooking(Long id) {
        bookingRepository.deleteById(id);
    }

    public boolean approveBooking(Long id, String adminComment) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking != null) {
            booking.setStatus("APPROVED");
            booking.setAdminComment(adminComment);
            bookingRepository.save(booking);
            return true;
        }
        return false;
    }

    public boolean rejectBooking(Long id, String adminComment) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking != null) {
            booking.setStatus("REJECTED");
            booking.setAdminComment(adminComment);
            bookingRepository.save(booking);
            return true;
        }
        return false;
    }
}
