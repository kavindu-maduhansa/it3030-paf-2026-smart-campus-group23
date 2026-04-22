package com.smartcampus.service;

import com.smartcampus.model.Resource;
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
public class MongoResourceSyncService {

    private final MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.uri:}")
    private String mongoUri;

    @Value("${smartcampus.mongodb.auto-sync:true}")
    private boolean autoSyncEnabled;

    public void upsertResource(Resource resource) {
        if (!autoSyncEnabled || mongoUri == null || mongoUri.isBlank() || resource == null || resource.getId() == null) {
            return;
        }

        try {
            Query query = Query.query(Criteria.where("_id").is(String.valueOf(resource.getId())));
            Update update = new Update()
                    .set("sqlId", resource.getId())
                    .set("name", resource.getName())
                    .set("description", resource.getDescription())
                    .set("type", resource.getType())
                    .set("location", resource.getLocation())
                    .set("status", resource.getStatus() != null ? resource.getStatus().name() : null)
                    .set("capacity", resource.getCapacity())
                    .set("availabilityStart", resource.getAvailabilityStart() != null ? resource.getAvailabilityStart().toString() : null)
                    .set("availabilityEnd", resource.getAvailabilityEnd() != null ? resource.getAvailabilityEnd().toString() : null)
                    .set("createdBy", resource.getCreatedBy())
                    .set("createdAt", resource.getCreatedAt() != null ? resource.getCreatedAt().toString() : null)
                    .set("updatedAt", resource.getUpdatedAt() != null ? resource.getUpdatedAt().toString() : null);

            mongoTemplate.upsert(query, update, "resources");
        } catch (Exception ex) {
            log.warn("Mongo upsert failed for resource {}: {}", resource.getId(), ex.getMessage());
        }
    }

    public void deleteResource(Long resourceId) {
        if (!autoSyncEnabled || mongoUri == null || mongoUri.isBlank() || resourceId == null) {
            return;
        }

        try {
            Query query = Query.query(Criteria.where("_id").is(String.valueOf(resourceId)));
            mongoTemplate.remove(query, "resources");
        } catch (Exception ex) {
            log.warn("Mongo delete failed for resource {}: {}", resourceId, ex.getMessage());
        }
    }
}
