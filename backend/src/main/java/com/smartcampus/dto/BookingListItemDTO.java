package com.smartcampus.dto;

import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Serializable booking row for REST (avoids lazy-load / Hibernate join quirks on older MySQL).
 */
@Data
@NoArgsConstructor
public class BookingListItemDTO {

    private Long id;
    private Long resourceId;
    private String resourceName;
    private String resourceLocation;
    private String bookingDate;
    private String startTime;
    private String endTime;
    private String purpose;
    private Integer expectedAttendees;
    private String status;
    private Long userId;
    private String userName;
    private String userEmail;
    private String adminComment;
    /** ISO-8601 string for JSON stability across clients */
    private String createdAt;

    public BookingListItemDTO(
            Long id,
            Long resourceId,
            String resourceName,
            String resourceLocation,
            LocalDate bookingDate,
            LocalTime startTime,
            LocalTime endTime,
            String purpose,
            Integer expectedAttendees,
            String status,
            Long userId,
            String userName,
            String userEmail,
            String adminComment,
            LocalDateTime createdAt) {
        this.id = id;
        this.resourceId = resourceId;
        this.resourceName = resourceName != null ? resourceName : "-";
        this.resourceLocation = resourceLocation != null ? resourceLocation : "-";
        this.bookingDate = bookingDate != null ? bookingDate.toString() : "";
        this.startTime = startTime != null ? startTime.toString() : "";
        this.endTime = endTime != null ? endTime.toString() : "";
        this.purpose = purpose;
        this.expectedAttendees = expectedAttendees;
        this.status = status;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.adminComment = adminComment;
        this.createdAt = createdAt != null ? createdAt.toString() : null;
    }

    public static BookingListItemDTO fromBooking(Booking booking) {
        Resource resource = booking.getResource();
        return new BookingListItemDTO(
                booking.getId(),
                resource != null ? resource.getId() : null,
                resource != null ? resource.getName() : null,
                resource != null ? resource.getLocation() : null,
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getExpectedAttendees(),
                booking.getStatus(),
                booking.getUser() != null ? booking.getUser().getId() : null,
                booking.getUser() != null ? booking.getUser().getName() : null,
                booking.getUser() != null ? booking.getUser().getEmail() : null,
                booking.getAdminComment(),
                booking.getCreatedAt());
    }

    /**
     * Maps one row from {@code bookings} LEFT JOIN {@code resources} (snake_case columns).
     */
    public static BookingListItemDTO fromJoinedRow(ResultSet rs) throws SQLException {
        BookingListItemDTO dto = new BookingListItemDTO();
        dto.setId(rs.getLong("id"));
        Long rid = rs.getObject("resource_id") != null ? rs.getLong("resource_id") : null;
        dto.setResourceId(rid);
        String rn = rs.getString("res_name");
        dto.setResourceName(rn != null ? rn : "-");
        String loc = rs.getString("res_location");
        dto.setResourceLocation(loc != null ? loc : "-");

        // Read date/time as SQL strings to avoid driver timezone shifts on MySQL 5.5.
        String bd = rs.getString("booking_date");
        dto.setBookingDate(bd != null ? bd : "");
        String st = rs.getString("start_time");
        dto.setStartTime(st != null ? st : "");
        String et = rs.getString("end_time");
        dto.setEndTime(et != null ? et : "");

        dto.setPurpose(rs.getString("purpose"));
        dto.setExpectedAttendees((Integer) rs.getObject("expected_attendees"));
        dto.setStatus(rs.getString("status"));
        Long uid = rs.getObject("user_id") != null ? rs.getLong("user_id") : null;
        dto.setUserId(uid);
        dto.setUserName(rs.getString("user_name"));
        dto.setUserEmail(rs.getString("user_email"));
        dto.setAdminComment(rs.getString("admin_comment"));

        LocalDateTime cat = rs.getObject("created_at", LocalDateTime.class);
        if (cat == null) {
            Timestamp ts = rs.getTimestamp("created_at");
            if (ts != null) {
                cat = ts.toLocalDateTime();
            }
        }
        dto.setCreatedAt(cat != null ? cat.toString() : null);
        return dto;
    }
}
