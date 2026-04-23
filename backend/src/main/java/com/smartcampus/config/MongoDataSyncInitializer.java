package com.smartcampus.config;

import com.smartcampus.entity.User;
import com.smartcampus.model.Attachment;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.Ticket;
import com.smartcampus.repository.AttachmentRepository;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class MongoDataSyncInitializer implements ApplicationRunner {

    private final MongoTemplate mongoTemplate;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final AttachmentRepository attachmentRepository;

    @Value("${spring.data.mongodb.uri:}")
    private String mongoUri;

    @Value("${smartcampus.mongodb.auto-sync:true}")
    private boolean autoSyncEnabled;

    @Override
    @Transactional(readOnly = true)
    public void run(ApplicationArguments args) {
        if (!autoSyncEnabled) {
            log.info("MongoDB auto-sync disabled by property.");
            return;
        }
        if (mongoUri == null || mongoUri.isBlank()) {
            log.info("MongoDB URI is empty. Skipping SQL to MongoDB sync.");
            return;
        }

        try {
            syncCollection("users", buildUserDocuments(userRepository.findAll()));
            syncCollection("resources", buildResourceDocuments(resourceRepository.findAll()));
            syncCollection("bookings", buildBookingDocuments(bookingRepository.findAll()));
            syncCollection("tickets", buildTicketDocuments(ticketRepository.findAll()));
            syncCollection("attachments", buildAttachmentDocuments(attachmentRepository.findAll()));
            log.info("MongoDB sync completed successfully.");
        } catch (Exception e) {
            log.error("MongoDB sync failed: {}", e.getMessage(), e);
        }
    }

    private void syncCollection(String collectionName, List<Document> documents) {
        if (!mongoTemplate.collectionExists(collectionName)) {
            mongoTemplate.createCollection(collectionName);
        }
        mongoTemplate.dropCollection(collectionName);
        mongoTemplate.createCollection(collectionName);

        if (!documents.isEmpty()) {
            mongoTemplate.getCollection(collectionName).insertMany(documents);
        }
        log.info("Synced Mongo collection {} with {} records", collectionName, documents.size());
    }

    private List<Document> buildUserDocuments(List<User> users) {
        List<Document> docs = new ArrayList<>();
        for (User user : users) {
            Document doc = new Document();
            doc.put("_id", String.valueOf(user.getId()));
            doc.put("sqlId", user.getId());
            doc.put("name", user.getName());
            doc.put("email", user.getEmail());
            doc.put("role", user.getRole() != null ? user.getRole().name() : null);
            doc.put("provider", user.getProvider());
            doc.put("createdAt", user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
            docs.add(doc);
        }
        return docs;
    }

    private List<Document> buildResourceDocuments(List<Resource> resources) {
        List<Document> docs = new ArrayList<>();
        for (Resource resource : resources) {
            Document doc = new Document();
            doc.put("_id", String.valueOf(resource.getId()));
            doc.put("sqlId", resource.getId());
            doc.put("name", resource.getName());
            doc.put("description", resource.getDescription());
            doc.put("type", resource.getType());
            doc.put("location", resource.getLocation());
            doc.put("status", resource.getStatus() != null ? resource.getStatus().name() : null);
            doc.put("capacity", resource.getCapacity());
            doc.put("availabilityStart", resource.getAvailabilityStart() != null ? resource.getAvailabilityStart().toString() : null);
            doc.put("availabilityEnd", resource.getAvailabilityEnd() != null ? resource.getAvailabilityEnd().toString() : null);
            doc.put("createdBy", resource.getCreatedBy());
            doc.put("createdAt", resource.getCreatedAt() != null ? resource.getCreatedAt().toString() : null);
            doc.put("updatedAt", resource.getUpdatedAt() != null ? resource.getUpdatedAt().toString() : null);
            docs.add(doc);
        }
        return docs;
    }

    private List<Document> buildBookingDocuments(List<Booking> bookings) {
        List<Document> docs = new ArrayList<>();
        for (Booking booking : bookings) {
            Document doc = new Document();
            doc.put("_id", String.valueOf(booking.getId()));
            doc.put("sqlId", booking.getId());
            doc.put("resourceId", booking.getResource() != null ? booking.getResource().getId() : null);
            doc.put("userId", booking.getUser() != null ? booking.getUser().getId() : null);
            doc.put("reviewedBy", booking.getReviewedBy() != null ? booking.getReviewedBy().getId() : null);
            doc.put("bookingDate", booking.getBookingDate() != null ? booking.getBookingDate().toString() : null);
            doc.put("startTime", booking.getStartTime() != null ? booking.getStartTime().toString() : null);
            doc.put("endTime", booking.getEndTime() != null ? booking.getEndTime().toString() : null);
            doc.put("purpose", booking.getPurpose());
            doc.put("expectedAttendees", booking.getExpectedAttendees());
            doc.put("status", booking.getStatus());
            doc.put("adminComment", booking.getAdminComment());
            doc.put("reviewedAt", booking.getReviewedAt() != null ? booking.getReviewedAt().toString() : null);
            doc.put("createdAt", booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null);
            doc.put("updatedAt", booking.getUpdatedAt() != null ? booking.getUpdatedAt().toString() : null);
            docs.add(doc);
        }
        return docs;
    }

    private List<Document> buildTicketDocuments(List<Ticket> tickets) {
        List<Document> docs = new ArrayList<>();
        for (Ticket ticket : tickets) {
            Document doc = new Document();
            doc.put("_id", String.valueOf(ticket.getId()));
            doc.put("sqlId", ticket.getId());
            doc.put("resourceId", ticket.getResource() != null ? ticket.getResource().getId() : null);
            doc.put("userId", ticket.getUser() != null ? ticket.getUser().getId() : null);
            doc.put("assignedTo", ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null);
            doc.put("title", ticket.getTitle());
            doc.put("description", ticket.getDescription());
            doc.put("category", ticket.getCategory());
            doc.put("location", ticket.getLocation());
            doc.put("priority", ticket.getPriority() != null ? ticket.getPriority().name() : null);
            doc.put("status", ticket.getStatus() != null ? ticket.getStatus().name() : null);
            doc.put("resolutionNotes", ticket.getResolutionNotes());
            doc.put("contactDetails", ticket.getContactDetails());
            doc.put("resolvedAt", ticket.getResolvedAt() != null ? ticket.getResolvedAt().toString() : null);
            doc.put("closedAt", ticket.getClosedAt() != null ? ticket.getClosedAt().toString() : null);
            doc.put("createdAt", ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : null);
            doc.put("updatedAt", ticket.getUpdatedAt() != null ? ticket.getUpdatedAt().toString() : null);
            docs.add(doc);
        }
        return docs;
    }


    private List<Document> buildAttachmentDocuments(List<Attachment> attachments) {
        List<Document> docs = new ArrayList<>();
        for (Attachment attachment : attachments) {
            Document doc = new Document();
            doc.put("_id", String.valueOf(attachment.getId()));
            doc.put("sqlId", attachment.getId());
            doc.put("ticketId", attachment.getTicket() != null ? attachment.getTicket().getId() : null);
            doc.put("fileName", attachment.getFileName());
            doc.put("filePath", attachment.getFilePath());
            doc.put("fileType", attachment.getFileType());
            doc.put("fileSize", attachment.getFileSize());
            doc.put("uploadedAt", attachment.getUploadedAt() != null ? attachment.getUploadedAt().toString() : null);
            docs.add(doc);
        }
        return docs;
    }
}
