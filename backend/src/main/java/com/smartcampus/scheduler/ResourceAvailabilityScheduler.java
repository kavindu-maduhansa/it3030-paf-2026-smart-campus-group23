package com.smartcampus.scheduler;

import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.websocket.ResourceEvent;
import com.smartcampus.websocket.ResourceWebSocketHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;

/**
 * Automatic Resource Availability Scheduler
 * Runs every minute to update resource status based on availability windows
 * If current time is within availabilityStart and availabilityEnd, status = ACTIVE
 * Otherwise, status = OUT_OF_SERVICE
 */
@Component
@Slf4j
public class ResourceAvailabilityScheduler {

    @Autowired
    private ResourceRepository resourceRepository;

    /**
     * Check and update resource availability status every 10 seconds (for testing)
     * Change fixedRate to 60000 (60 seconds) in production
     * Scheduled to run at fixed intervals
     */
    @Scheduled(fixedRate = 10000) // 10 seconds for testing, change to 60000 for production
    @Transactional
    public void updateResourceAvailability() {
        try {
            LocalTime currentTime = LocalTime.now();
            List<Resource> allResources = resourceRepository.findAll();
            
            log.info("========== [SCHEDULER] CHECKING {} RESOURCES at {} ==========", 
                     allResources.size(), currentTime);
            
            int changedCount = 0;
            
            for (Resource resource : allResources) {
                // Skip if availability times are not set
                if (resource.getAvailabilityStart() == null || resource.getAvailabilityEnd() == null) {
                    log.debug("[SCHEDULER] Skipping '{}' - no availability times set", resource.getName());
                    continue;
                }
                
                boolean isWithinAvailabilityWindow = isTimeWithinWindow(
                    currentTime,
                    resource.getAvailabilityStart(),
                    resource.getAvailabilityEnd()
                );
                
                // Determine expected status
                Resource.ResourceStatus expectedStatus = isWithinAvailabilityWindow 
                    ? Resource.ResourceStatus.ACTIVE 
                    : Resource.ResourceStatus.OUT_OF_SERVICE;
                
                log.info("[SCHEDULER] '{}': Current={}, Start={}, End={}, WithinWindow={}, Status={}", 
                         resource.getName(), currentTime, 
                         resource.getAvailabilityStart(), resource.getAvailabilityEnd(),
                         isWithinAvailabilityWindow, expectedStatus);
                
                // Update if status changed
                if (resource.getStatus() != expectedStatus) {
                    String oldStatus = resource.getStatus().toString();
                    resource.setStatus(expectedStatus);
                    resourceRepository.save(resource);
                    changedCount++;
                    
                    log.warn("[SCHEDULER] ⚠️ UPDATED: '{}' {} ➜ {} (Time: {})", 
                             resource.getName(), oldStatus, expectedStatus, currentTime);
                    
                    // Broadcast update to all connected WebSocket clients
                    ResourceEvent event = ResourceEvent.updated(
                        resource.getId(),
                        resource.getName(),
                        resource.getType(),
                        resource.getLocation(),
                        expectedStatus.toString()
                    );
                    ResourceWebSocketHandler.broadcastResourceUpdate(event);
                }
            }
            
            log.info("========== [SCHEDULER] COMPLETED: {} changes ==========", changedCount);
            
        } catch (Exception e) {
            log.error("[SCHEDULER] ERROR updating resource availability", e);
            e.printStackTrace();
        }
    }

    /**
     * Check if current time is within the availability window
     * Handles cases where availability spans midnight (e.g., 22:00 to 06:00)
     */
    private boolean isTimeWithinWindow(LocalTime currentTime, LocalTime startTime, LocalTime endTime) {
        if (startTime.isBefore(endTime)) {
            // Normal case: e.g., 09:00 - 18:00
            return !currentTime.isBefore(startTime) && currentTime.isBefore(endTime);
        } else {
            // Spans midnight: e.g., 22:00 - 06:00
            return !currentTime.isBefore(startTime) || currentTime.isBefore(endTime);
        }
    }
}
