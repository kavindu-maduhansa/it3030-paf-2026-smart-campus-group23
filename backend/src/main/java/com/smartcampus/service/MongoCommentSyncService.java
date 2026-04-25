package com.smartcampus.service;

import com.smartcampus.model.Comment;
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
public class MongoCommentSyncService {

    private final MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.uri:}")
    private String mongoUri;

    @Value("${smartcampus.mongodb.auto-sync:true}")
    private boolean autoSyncEnabled;

    public void upsertComment(Comment comment) {
        if (!autoSyncEnabled || mongoUri == null || mongoUri.isBlank() || comment == null || comment.getId() == null) {
            return;
        }

        try {
            Query query = Query.query(Criteria.where("_id").is(String.valueOf(comment.getId())));
            Update update = new Update()
                    .set("sqlId", comment.getId())
                    .set("ticketId", comment.getTicket() != null ? comment.getTicket().getId() : null)
                    .set("userId", comment.getUser() != null ? comment.getUser().getId() : null)
                    .set("userName", comment.getUser() != null ? comment.getUser().getName() : null)
                    .set("content", comment.getContent())
                    .set("createdAt", comment.getCreatedAt() != null ? comment.getCreatedAt().toString() : null)
                    .set("updatedAt", comment.getUpdatedAt() != null ? comment.getUpdatedAt().toString() : null);

            mongoTemplate.upsert(query, update, "comments");
        } catch (Exception ex) {
            log.warn("Mongo upsert failed for comment {}: {}", comment.getId(), ex.getMessage());
        }
    }

    public void deleteComment(Long id) {
        if (!autoSyncEnabled || mongoUri == null || mongoUri.isBlank() || id == null) {
            return;
        }

        try {
            Query query = Query.query(Criteria.where("_id").is(String.valueOf(id)));
            mongoTemplate.remove(query, "comments");
        } catch (Exception ex) {
            log.warn("Mongo delete failed for comment {}: {}", id, ex.getMessage());
        }
    }
}
