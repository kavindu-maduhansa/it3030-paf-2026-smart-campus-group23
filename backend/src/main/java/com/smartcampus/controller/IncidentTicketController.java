package com.smartcampus.controller;

import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.service.FileStorageService;
import com.smartcampus.service.IncidentTicketService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class IncidentTicketController {

    @Autowired
    private IncidentTicketService ticketService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * POST: Create a new incident ticket with optional image attachments
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidentTicket> createTicket(
            @RequestPart("ticket") String ticketJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestParam("reporterId") Long reporterId,
            @RequestParam(value = "resourceId", required = false) Long resourceId) {
        try {
            IncidentTicket ticket = objectMapper.readValue(ticketJson, IncidentTicket.class);
            
            if (images != null && !images.isEmpty()) {
                List<String> urls = new ArrayList<>();
                for (MultipartFile file : images.subList(0, Math.min(images.size(), 3))) {
                    String filename = fileStorageService.save(file);
                    urls.add(filename);
                }
                ticket.setAttachmentUrls(urls);
            }
            
            IncidentTicket created = ticketService.createTicket(ticket, reporterId, resourceId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * GET: Retrieve all tickets
     */
    @GetMapping
    public ResponseEntity<List<IncidentTicket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    /**
     * GET: Retrieve ticket by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    /**
     * PUT: Update ticket details
     */
    @PutMapping("/{id}")
    public ResponseEntity<IncidentTicket> updateTicket(
            @PathVariable Long id,
            @RequestBody IncidentTicket ticketDetails) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticketDetails));
    }

    /**
     * DELETE: Delete ticket
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH: Update ticket status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentTicket> updateStatus(
            @PathVariable Long id,
            @RequestParam IncidentTicket.TicketStatus status,
            @RequestParam(required = false) String reason,
            @RequestParam Long userId) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, reason, userId));
    }

    /**
     * PATCH: Assign technician to ticket
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<IncidentTicket> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, technicianId));
    }

    /**
     * GET: Retrieve tickets by reporter
     */
    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<List<IncidentTicket>> getTicketsByReporter(@PathVariable Long reporterId) {
        return ResponseEntity.ok(ticketService.getTicketsByReporter(reporterId));
    }
}
