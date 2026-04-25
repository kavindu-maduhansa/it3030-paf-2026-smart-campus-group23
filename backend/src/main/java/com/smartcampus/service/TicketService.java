package com.smartcampus.service;

import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.Attachment;
import com.smartcampus.model.Notification;
import com.smartcampus.model.Ticket.TicketPriority;
import com.smartcampus.model.Ticket.TicketStatus;
import com.smartcampus.repository.AttachmentRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final ResourceRepository resourceRepository;
    private final AttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService;
    private final UserRepository userRepository;
    private final MongoTicketSyncService mongoTicketSyncService;
    private final NotificationService notificationService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @jakarta.annotation.PostConstruct
    public void ensureColumns() {
        try {
            log.info("Ensuring SLA columns exist in tickets table...");
            addColumnIfNotExists("first_reply_at", "DATETIME NULL");
            addColumnIfNotExists("sla_limit", "INT NULL");
            
            // Set default SLA for existing tickets
            int updatedRows = jdbcTemplate.update("UPDATE tickets SET sla_limit = 24 WHERE sla_limit IS NULL");
            if (updatedRows > 0) {
                log.info("Initialized SLA limit for {} existing tickets.", updatedRows);
            }

            // Initialize resolved_at for existing closed/resolved tickets so they don't look breached
            int updatedResolved = jdbcTemplate.update("UPDATE tickets SET resolved_at = updated_at WHERE status IN ('CLOSED', 'RESOLVED', 'REJECTED') AND resolved_at IS NULL");
            if (updatedResolved > 0) {
                log.info("Initialized resolved_at for {} existing completed tickets.", updatedResolved);
            }
            
            log.info("SLA columns checked/added successfully.");
        } catch (Exception e) {
            log.warn("Manual column check failed: {}", e.getMessage());
        }
    }

    private void addColumnIfNotExists(String columnName, String definition) {
        try {
            String checkSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tickets' AND COLUMN_NAME = ?";
            Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, columnName);
            if (count != null && count == 0) {
                log.info("Adding missing column: {}", columnName);
                jdbcTemplate.execute("ALTER TABLE tickets ADD COLUMN " + columnName + " " + definition);
            }
        } catch (Exception e) {
            log.warn("Error checking/adding column {}: {}", columnName, e.getMessage());
        }
    }

    @Transactional
    public TicketResponseDTO createTicket(TicketRequestDTO dto, User user, org.springframework.web.multipart.MultipartFile[] images) {
        log.info("Creating new ticket for user: {}", user.getEmail());
        
        // Day 3: Multi-image validation (Max 3)
        if (images != null && images.length > 3) {
            log.warn("User {} attempted to upload {} images (limit 3)", user.getEmail(), images.length);
            throw new IllegalArgumentException("Maximum 3 image attachments allowed per ticket");
        }

        Resource resource = null;
        if (dto.getResourceId() != null) {
            resource = resourceRepository.findById(dto.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + dto.getResourceId()));
        }

        User ticketOwner = user;
        if (dto.getOnBehalfOfUserId() != null && 
            (user.getRole() == com.smartcampus.security.Role.ADMIN || 
             user.getRole() == com.smartcampus.security.Role.TECHNICIAN)) {
            ticketOwner = userRepository.findById(dto.getOnBehalfOfUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target user for reporting not found with id: " + dto.getOnBehalfOfUserId()));
            log.info("Technician/Admin {} reporting on behalf of user {}", user.getEmail(), ticketOwner.getEmail());
        }

        // Safe enum mapping with fallbacks
        TicketPriority priority = TicketPriority.LOW;
        try {
            if (dto.getPriority() != null) {
                priority = TicketPriority.valueOf(dto.getPriority().trim().toUpperCase());
            }
        } catch (Exception e) {
            log.warn("Invalid priority provided: {}. Defaulting to LOW.", dto.getPriority());
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setCategory(dto.getCategory());
        ticket.setContactDetails(dto.getContactDetails());
        ticket.setPriority(priority);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setResource(resource);
        ticket.setUser(ticketOwner);

        // Set SLA limit based on priority
        int slaHours = switch (priority) {
            case URGENT -> 4;
            case HIGH -> 8;
            case MEDIUM -> 24;
            case LOW -> 48;
        };
        ticket.setSlaLimit(slaHours);
        
        if (resource != null) {
            ticket.setLocation(resource.getLocation());
        }

        // 1. Save to SQL Database first
        Ticket savedTicket;
        try {
            log.info("Persisting ticket to SQL database...");
            savedTicket = ticketRepository.save(ticket);
            ticketRepository.flush(); // Force database constraints check
            log.info("Ticket persisted successfully with ID: {}", savedTicket.getId());
        } catch (Exception e) {
            log.error("Failed to persist ticket to SQL: {}", e.getMessage(), e);
            throw e;
        }
        
        // 2. Handle attachments
        if (images != null && images.length > 0) {
            log.info("Processing {} attachments...", images.length);
            for (org.springframework.web.multipart.MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    try {
                        String fileName = fileStorageService.storeFile(image);
                        
                        Attachment attachment = new Attachment();
                        attachment.setTicket(savedTicket);
                        String originalName = image.getOriginalFilename();
                        attachment.setFileName(originalName != null ? originalName : "attachment_" + System.currentTimeMillis());
                        attachment.setFilePath(fileName);
                        attachment.setFileType(image.getContentType());
                        attachment.setFileSize(image.getSize());
                        
                        savedTicket.getAttachments().add(attachment);
                        attachmentRepository.save(attachment);
                        log.info("Attachment saved: {}", originalName);
                    } catch (Exception e) {
                        log.error("Failed to save attachment: {}", e.getMessage(), e);
                    }
                }
            }
            try {
                attachmentRepository.flush();
            } catch (Exception e) {
                log.error("Failed to flush attachments: {}", e.getMessage(), e);
                throw e;
            }
        }

        // 3. Perform secondary operations in try-catch to prevent rolling back the whole ticket
        try {
            mongoTicketSyncService.upsertTicket(savedTicket);
        } catch (Exception e) {
            log.error("Failed to sync ticket to MongoDB: {}", e.getMessage());
        }

        try {
            notifyAdminsAboutTicket(savedTicket);
        } catch (Exception e) {
            log.error("Failed to notify admins about new ticket: {}", e.getMessage());
        }

        return convertToResponseDTO(savedTicket);
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getAllTickets(TicketStatus status, TicketPriority priority) {
        List<Ticket> tickets;
        
        if (status != null && priority != null) {
            tickets = ticketRepository.findByStatusAndPriority(status, priority);
        } else if (status != null) {
            tickets = ticketRepository.findByStatus(status);
        } else if (priority != null) {
            tickets = ticketRepository.findByPriority(priority);
        } else {
            tickets = ticketRepository.findAll();
        }

        return tickets.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getMyTickets(User user) {
        log.info("Fetching tickets for owner: {}", user.getEmail());
        return ticketRepository.findByUserId(user.getId())
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getAssignedTickets(User technician) {
        log.info("Fetching tickets assigned to technician: {}", technician.getEmail());
        return ticketRepository.findByAssignedToId(technician.getId())
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketResponseDTO updateTicketStatus(Long id, TicketStatus status, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        log.info("User {} (Role: {}) update status for ticket {} to {}", 
                currentUser.getEmail(), currentUser.getRole(), id, status);
        
        // Day 4: Role-based status transition rules
        if (status == TicketStatus.IN_PROGRESS || status == TicketStatus.RESOLVED) {
            if (currentUser.getRole() != com.smartcampus.security.Role.TECHNICIAN && 
                currentUser.getRole() != com.smartcampus.security.Role.ADMIN) {
                throw new org.springframework.security.access.AccessDeniedException("Only technicians or admins can progress tickets");
            }
            
            // Auto-assign to reporter if they are a technician moving it to IN_PROGRESS
            if (status == TicketStatus.IN_PROGRESS && ticket.getAssignedTo() == null && 
                currentUser.getRole() == com.smartcampus.security.Role.TECHNICIAN) {
                ticket.setAssignedTo(currentUser);
            }
        }

        if (status == TicketStatus.CLOSED && 
            currentUser.getRole() != com.smartcampus.security.Role.ADMIN && 
            currentUser.getRole() != com.smartcampus.security.Role.TECHNICIAN &&
            !ticket.getUser().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Only admins, technicians, or the ticket owner can close a ticket");
        }

        if (status == TicketStatus.REJECTED && currentUser.getRole() != com.smartcampus.security.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Only admins can reject tickets");
        }

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(status);

        if (status == TicketStatus.RESOLVED && oldStatus != TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (status == TicketStatus.CLOSED && oldStatus != TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
            // User requirement: When ticket moves to Closed -> update resolved_at
            if (ticket.getResolvedAt() == null) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        mongoTicketSyncService.upsertTicket(updatedTicket);
        return convertToResponseDTO(updatedTicket);
    }

    @Transactional
    public TicketResponseDTO updateTicket(Long id, TicketRequestDTO dto, User currentUser, org.springframework.web.multipart.MultipartFile[] images) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        log.info("Update request for ticket {} by user {}", id, currentUser.getEmail());

        // Only admins, technicians, or the original reporter can edit tickets
        if (currentUser.getRole() != com.smartcampus.security.Role.ADMIN && 
            currentUser.getRole() != com.smartcampus.security.Role.TECHNICIAN) {
            
            if (!ticket.getUser().getId().equals(currentUser.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("You do not have permission to edit this ticket");
            }
            
            // New Requirement: User can't edit if a technician is assigned
            if (ticket.getAssignedTo() != null) {
                throw new org.springframework.security.access.AccessDeniedException("Cannot edit ticket once a technician has been assigned");
            }
        }

        if (dto.getTitle() != null) ticket.setTitle(dto.getTitle());
        if (dto.getDescription() != null) ticket.setDescription(dto.getDescription());
        if (dto.getCategory() != null) ticket.setCategory(dto.getCategory());
        if (dto.getContactDetails() != null) ticket.setContactDetails(dto.getContactDetails());
        if (dto.getResolutionNotes() != null) ticket.setResolutionNotes(dto.getResolutionNotes());
        
        // Priority and Status changes might be restricted or have special logic
        if (currentUser.getRole() == com.smartcampus.security.Role.ADMIN || 
            currentUser.getRole() == com.smartcampus.security.Role.TECHNICIAN) {
            
            if (dto.getPriority() != null) {
                ticket.setPriority(TicketPriority.valueOf(dto.getPriority().toUpperCase()));
            }

            if (dto.getStatus() != null) {
                TicketStatus newStatus = TicketStatus.valueOf(dto.getStatus().toUpperCase());
                if (ticket.getStatus() != newStatus) {
                    // We reuse the updateTicketStatus logic for timestamps and rules
                    updateTicketStatus(id, newStatus, currentUser);
                }
            }
        }

        // Handle Image Deletion
        if (dto.getRemovedAttachmentIds() != null && !dto.getRemovedAttachmentIds().isEmpty()) {
            for (Long attachmentId : dto.getRemovedAttachmentIds()) {
                Attachment attachment = attachmentRepository.findById(attachmentId)
                        .filter(a -> a.getTicket().getId().equals(id))
                        .orElse(null);
                
                if (attachment != null) {
                    fileStorageService.deleteFile(attachment.getFilePath());
                    ticket.getAttachments().remove(attachment);
                    attachmentRepository.delete(attachment);
                }
            }
        }

        // Handle Image Addition
        if (images != null && images.length > 0) {
            int currentCount = ticket.getAttachments().size();
            if (currentCount + images.length > 3) {
                throw new IllegalArgumentException("Total images cannot exceed 3. Currently have " + currentCount + ", trying to add " + images.length);
            }

            for (org.springframework.web.multipart.MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    String fileName = fileStorageService.storeFile(image);
                    
                    Attachment attachment = new Attachment();
                    attachment.setTicket(ticket);
                    attachment.setFileName(image.getOriginalFilename());
                    attachment.setFilePath(fileName);
                    attachment.setFileType(image.getContentType());
                    attachment.setFileSize(image.getSize());
                    
                    ticket.getAttachments().add(attachment);
                    attachmentRepository.save(attachment);
                }
            }
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        mongoTicketSyncService.upsertTicket(savedTicket);
        return convertToResponseDTO(savedTicket);
    }

    @Transactional
    public TicketResponseDTO assignTechnician(Long ticketId, Long technicianId, User currentUser) {
        if (currentUser.getRole() != com.smartcampus.security.Role.ADMIN && 
            currentUser.getRole() != com.smartcampus.security.Role.TECHNICIAN) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to assign technicians");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician not found with id: " + technicianId));

        if (technician.getRole() != com.smartcampus.security.Role.TECHNICIAN && 
            technician.getRole() != com.smartcampus.security.Role.ADMIN) {
            throw new IllegalArgumentException("User is not a technician");
        }

        ticket.setAssignedTo(technician);
        log.info("Ticket {} assigned to technician {}", ticketId, technician.getEmail());
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        mongoTicketSyncService.upsertTicket(updatedTicket);
        return convertToResponseDTO(updatedTicket);
    }

    @Transactional
    public TicketResponseDTO unassignTechnician(Long ticketId, User currentUser) {
        if (currentUser.getRole() != com.smartcampus.security.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Only admins can unassign tickets");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        ticket.setAssignedTo(null);
        log.info("Ticket {} unassigned by admin {}", ticketId, currentUser.getEmail());
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        mongoTicketSyncService.upsertTicket(updatedTicket);
        return convertToResponseDTO(updatedTicket);
    }

    @Transactional
    public void deleteTicket(Long id, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        log.info("Delete request for ticket {} by user {}", id, currentUser.getEmail());

        // Requirement: Only admins or technicians can delete tickets. Owners (STUDENT/LECTURER) CANNOT.
        if (currentUser.getRole() != com.smartcampus.security.Role.ADMIN && 
            currentUser.getRole() != com.smartcampus.security.Role.TECHNICIAN) {
            log.warn("Unauthorized delete attempt by user {} for ticket {}", currentUser.getEmail(), id);
            throw new org.springframework.security.access.AccessDeniedException("Only admins or technicians can delete a ticket");
        }

        ticketRepository.delete(ticket);
        mongoTicketSyncService.deleteTicket(id);
        log.info("Ticket {} deleted successfully", id);
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        return convertToResponseDTO(ticket);
    }

    public org.springframework.core.io.Resource loadTicketImage(String fileName) {
        return fileStorageService.loadFileAsResource(fileName);
    }

    private void notifyAdminsAboutTicket(Ticket ticket) {
        try {
            List<User> admins = userRepository.findByRole(Role.ADMIN);
            for (User admin : admins) {
                String title = "New Support Ticket from " + ticket.getUser().getName();
                String description = ticket.getTitle() + " (" + ticket.getCategory() + ")";
                notificationService.createNotification(
                    admin,
                    title,
                    description,
                    Notification.NotificationType.TICKET,
                    Notification.NotificationSeverity.INFO
                );
            }
            log.info("Created ticket notifications for {} admins", admins.size());
        } catch (Exception e) {
            log.error("Error creating ticket notification", e);
        }
    }

    public TicketResponseDTO convertToResponseDTO(Ticket ticket) {
        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .category(ticket.getCategory())
                .location(ticket.getLocation())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .contactDetails(ticket.getContactDetails())
                .resourceId(ticket.getResource() != null ? ticket.getResource().getId() : null)
                .resourceName(ticket.getResource() != null ? ticket.getResource().getName() : null)
                .userId(ticket.getUser().getId())
                .userName(ticket.getUser().getName())
                .assignedToId(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getId() : null)
                .assignedToName(ticket.getAssignedTo() != null ? ticket.getAssignedTo().getName() : null)
                .resolutionNotes(ticket.getResolutionNotes())
                .resolvedAt(ticket.getResolvedAt())
                .firstReplyAt(ticket.getFirstReplyAt())
                .slaLimit(ticket.getSlaLimit())
                .closedAt(ticket.getClosedAt())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .imageUrls(ticket.getAttachments().stream()
                        .map(attachment -> "/api/tickets/images/" + attachment.getFilePath())
                        .collect(Collectors.toList()))
                .attachments(ticket.getAttachments().stream()
                        .map(a -> new TicketResponseDTO.AttachmentDTO(a.getId(), "/api/tickets/images/" + a.getFilePath(), a.getFileName()))
                        .collect(Collectors.toList()))
                .build();
    }
}
