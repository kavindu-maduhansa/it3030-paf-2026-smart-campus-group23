package com.smartcampus.service;

import com.smartcampus.model.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MongoBookingSyncService {

    private final MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.uri:}")
    private String mongoUri;

    @Value("${smartcampus.mongodb.auto-sync:true}")
    private boolean autoSyncEnabled;

    public void upsertBooking(Booking booking) {
        if (!autoSyncEnabled || mongoUri == null || mongoUri.isBlank() || booking == null || booking.getId() == null) {
            return;
        }

        try {
            Query query = Query.query(Criteria.where("_id").is(String.valueOf(booking.getId())));
            Update update = new Update()
                    .set("sqlId", booking.getId())
                    .set("resourceId", booking.getResource() != null ? booking.getResource().getId() : null)
                    .set("userId", booking.getUser() != null ? booking.getUser().getId() : null)
                    .set("reviewedBy", booking.getReviewedBy() != null ? booking.getReviewedBy().getId() : null)
                    .set("bookingDate", booking.getBookingDate() != null ? booking.getBookingDate().toString() : null)
                    .set("startTime", booking.getStartTime() != null ? booking.getStartTime().toString() : null)
                    .set("endTime", booking.getEndTime() != null ? booking.getEndTime().toString() : null)
                    .set("purpose", booking.getPurpose())
                    .set("expectedAttendees", booking.getExpectedAttendees())
                    .set("status", booking.getStatus())
                    .set("adminComment", booking.getAdminComment())
                    .set("reviewedAt", booking.getReviewedAt() != null ? booking.getReviewedAt().toString() : null)
                    .set("createdAt", booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null)
                    .set("updatedAt", booking.getUpdatedAt() != null ? booking.getUpdatedAt().toString() : null);

            mongoTemplate.upsert(query, update, "bookings");
        } catch (Exception ex) {
            log.warn("Mongo upsert failed for booking {}: {}", booking.getId(), ex.getMessage());
        }
    }

    public void deleteBooking(Long bookingId) {
        if (!autoSyncEnabled || mongoUri == null || mongoUri.isBlank() || bookingId == null) {
            return;
        }

        try {
            Query query = Query.query(Criteria.where("_id").is(String.valueOf(bookingId)));
            mongoTemplate.remove(query, "bookings");
        } catch (Exception ex) {
            log.warn("Mongo delete failed for booking {}: {}", bookingId, ex.getMessage());
        }
    }
}
