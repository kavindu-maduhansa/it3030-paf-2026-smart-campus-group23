package com.smartcampus.service;

import com.smartcampus.dto.BookingListItemDTO;
import com.smartcampus.entity.User;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
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
    private JdbcTemplate jdbcTemplate;

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

    /**
     * Lists bookings via JDBC so Hibernate 6 / MySQL 5.5 quirks (join fetch, time mapping) cannot 500 the UI.
     */
    @Transactional(readOnly = true)
    public List<BookingListItemDTO> listBookingsForUser(Long userId) {
        final String sql = """
                SELECT b.id,
                       b.resource_id,
                       r.name AS res_name,
                       r.location AS res_location,
                       b.user_id,
                       u.name AS user_name,
                       u.email AS user_email,
                       b.booking_date,
                       b.start_time,
                       b.end_time,
                       b.purpose,
                       b.expected_attendees,
                       b.status,
                       b.admin_comment,
                       b.created_at
                FROM bookings b
                LEFT JOIN resources r ON r.id = b.resource_id
                LEFT JOIN users u ON u.id = b.user_id
                WHERE b.user_id = ?
                ORDER BY b.booking_date DESC, b.start_time DESC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> BookingListItemDTO.fromJoinedRow(rs), userId);
    }

    @Transactional(readOnly = true)
    public List<BookingListItemDTO> listAllBookings() {
        final String sql = """
                SELECT b.id,
                       b.resource_id,
                       r.name AS res_name,
                       r.location AS res_location,
                       b.user_id,
                       u.name AS user_name,
                       u.email AS user_email,
                       b.booking_date,
                       b.start_time,
                       b.end_time,
                       b.purpose,
                       b.expected_attendees,
                       b.status,
                       b.admin_comment,
                       b.created_at
                FROM bookings b
                LEFT JOIN resources r ON r.id = b.resource_id
                LEFT JOIN users u ON u.id = b.user_id
                ORDER BY b.booking_date DESC, b.start_time DESC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> BookingListItemDTO.fromJoinedRow(rs));
    }

    @Transactional(readOnly = true)
    public BookingListItemDTO getBookingListItem(Long bookingId) {
        final String sql = """
                SELECT b.id,
                       b.resource_id,
                       r.name AS res_name,
                       r.location AS res_location,
                       b.user_id,
                       u.name AS user_name,
                       u.email AS user_email,
                       b.booking_date,
                       b.start_time,
                       b.end_time,
                       b.purpose,
                       b.expected_attendees,
                       b.status,
                       b.admin_comment,
                       b.created_at
                FROM bookings b
                LEFT JOIN resources r ON r.id = b.resource_id
                LEFT JOIN users u ON u.id = b.user_id
                WHERE b.id = ?
                """;
        List<BookingListItemDTO> rows =
                jdbcTemplate.query(sql, (rs, rowNum) -> BookingListItemDTO.fromJoinedRow(rs), bookingId);
        return rows.isEmpty() ? null : rows.get(0);
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
