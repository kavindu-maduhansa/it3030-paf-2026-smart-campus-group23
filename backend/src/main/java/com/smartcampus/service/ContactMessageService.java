package com.smartcampus.service;

import com.smartcampus.dto.ContactMessageRequest;
import com.smartcampus.dto.SessionUser;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final MongoTemplate mongoTemplate;

    public Map<String, Object> saveContactMessage(ContactMessageRequest request, SessionUser sessionUser) {
        Map<String, Object> doc = new LinkedHashMap<>();
        doc.put("name", request.getName().trim());
        doc.put("email", request.getEmail().trim().toLowerCase());
        doc.put("subject", request.getSubject().trim());
        doc.put("message", request.getMessage().trim());
        doc.put("createdAt", Instant.now().toString());
        doc.put("read", false);
        doc.put("readAt", null);
        doc.put("source", "CONTACT_PAGE");
        doc.put("authenticated", sessionUser != null);
        doc.put("role", sessionUser != null && sessionUser.getRole() != null ? sessionUser.getRole().name() : "GUEST");
        doc.put("userId", sessionUser != null ? sessionUser.getId() : null);

        return mongoTemplate.insert(doc, "contact_messages");
    }

    public List<Map<String, Object>> getLatestMessages(int limit) {
        Query query = new Query()
                .limit(Math.max(1, Math.min(limit, 100)))
                .with(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        List<Map> rows = mongoTemplate.find(query, Map.class, "contact_messages");
        List<Map<String, Object>> normalized = new ArrayList<>();
        for (Map row : rows) {
            Map<String, Object> copy = new LinkedHashMap<>();
            copy.putAll(row);
            Object rawId = row.get("_id");
            copy.put("id", rawId != null ? String.valueOf(rawId) : "");
            normalized.add(copy);
        }
        return normalized;
    }

    public boolean markMessageAsRead(String id) {
        Query query = byIdQuery(id);
        Update update = new Update()
                .set("read", true)
                .set("readAt", Instant.now().toString());
        return mongoTemplate.updateFirst(query, update, "contact_messages").getModifiedCount() > 0;
    }

    public boolean deleteMessage(String id) {
        Query query = byIdQuery(id);
        return mongoTemplate.remove(query, "contact_messages").getDeletedCount() > 0;
    }

    private Query byIdQuery(String id) {
        if (ObjectId.isValid(id)) {
            return Query.query(Criteria.where("_id").is(new ObjectId(id)));
        }
        return Query.query(Criteria.where("_id").is(id));
    }
}
