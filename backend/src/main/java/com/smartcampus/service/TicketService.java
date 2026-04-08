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
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketResponseDTO updateTicketStatus(Long id, TicketStatus status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        log.info("Updating ticket {} status from {} to {}", id, ticket.getStatus(), status);
        
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

    @Transactional(readOnly = true)
    public TicketResponseDTO getTicketById(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
        return convertToResponseDTO(ticket);
    }

    private TicketResponseDTO convertToResponseDTO(Ticket ticket) {
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
