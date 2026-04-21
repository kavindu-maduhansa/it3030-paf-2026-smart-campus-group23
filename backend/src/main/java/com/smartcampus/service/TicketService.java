package com.smartcampus.service;

import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.Attachment;
import com.smartcampus.model.Ticket.TicketPriority;
import com.smartcampus.model.Ticket.TicketStatus;
import com.smartcampus.repository.AttachmentRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
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

        Ticket ticket = new Ticket();
        ticket.setTitle(dto.getTitle());
        ticket.setDescription(dto.getDescription());
        ticket.setCategory(dto.getCategory());
        ticket.setContactDetails(dto.getContactDetails());
        ticket.setPriority(TicketPriority.valueOf(dto.getPriority().toUpperCase()));
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setResource(resource);
        ticket.setUser(user);
        
        if (resource != null) {
            ticket.setLocation(resource.getLocation());
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Day 3: Handle attachments
        if (images != null && images.length > 0) {
            for (org.springframework.web.multipart.MultipartFile image : images) {
                if (image != null && !image.isEmpty()) {
                    String fileName = fileStorageService.storeFile(image);
                    
                    Attachment attachment = new Attachment();
                    attachment.setTicket(savedTicket);
                    attachment.setFileName(image.getOriginalFilename());
                    attachment.setFilePath(fileName);
                    attachment.setFileType(image.getContentType());
                    attachment.setFileSize(image.getSize());
                    
                    attachmentRepository.save(attachment);
                }
            }
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

        if (status == TicketStatus.CLOSED && currentUser.getRole() != com.smartcampus.security.Role.ADMIN && 
            !ticket.getUser().getId().equals(currentUser.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Only admins or the ticket owner can close a ticket");
        }

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(status);

        if (status == TicketStatus.RESOLVED && oldStatus != TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (status == TicketStatus.CLOSED && oldStatus != TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        Ticket updatedTicket = ticketRepository.save(ticket);
        return convertToResponseDTO(updatedTicket);
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
        return convertToResponseDTO(updatedTicket);
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        return convertToResponseDTO(ticket);
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
                .closedAt(ticket.getClosedAt())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .build();
    }
}
