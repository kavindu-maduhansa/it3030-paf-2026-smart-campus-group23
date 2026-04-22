package com.smartcampus.service;

import com.smartcampus.model.Ticket;
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
public class MongoTicketSyncService {

    private final MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.uri:}")
    private String mongoUri;

    @Value("${smartcampus.mongodb.auto-sync:true}")
    private boolean autoSyncEnabled;

    public void upsertTicket(Ticket ticket) {
        if (!autoSyncEnabled || mongoUri == null || mongoUri.isBlank() || ticket == null || ticket.getId() == null) {
            return;
        }

        try {
            Query query = Query.query(Criteria.where("_id").is(String.valueOf(ticket.getId())));
            Update update = new Update()
                    .set("sqlId", ticket.getId())
                    .set("resourceId", ticket.getResource() != null ? ticket.getResource().getId() : null)
                    .set("userId", ticket.getUser() != null ? ticket.getUser().getId() : null)
                    .set("assignedTo", ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                    .set("title", ticket.getTitle())
                    .set("description", ticket.getDescription())
                    .set("category", ticket.getCategory())
                    .set("location", ticket.getLocation())
                    .set("priority", ticket.getPriority() != null ? ticket.getPriority().name() : null)
                    .set("status", ticket.getStatus() != null ? ticket.getStatus().name() : null)
                    .set("resolutionNotes", ticket.getResolutionNotes())
                    .set("contactDetails", ticket.getContactDetails())
                    .set("resolvedAt", ticket.getResolvedAt() != null ? ticket.getResolvedAt().toString() : null)
                    .set("closedAt", ticket.getClosedAt() != null ? ticket.getClosedAt().toString() : null)
                    .set("createdAt", ticket.getCreatedAt() != null ? ticket.getCreatedAt().toString() : null)
                    .set("updatedAt", ticket.getUpdatedAt() != null ? ticket.getUpdatedAt().toString() : null);

            mongoTemplate.upsert(query, update, "tickets");
        } catch (Exception ex) {
            log.warn("Mongo upsert failed for ticket {}: {}", ticket.getId(), ex.getMessage());
        }
    }

    public void deleteTicket(Long id) {
        if (!autoSyncEnabled || mongoUri == null || mongoUri.isBlank() || id == null) {
            return;
        }

        try {
            Query query = Query.query(Criteria.where("_id").is(String.valueOf(id)));
            mongoTemplate.remove(query, "tickets");
        } catch (Exception ex) {
            log.warn("Mongo delete failed for ticket {}: {}", id, ex.getMessage());
        }
    }
}
