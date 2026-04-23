package com.smartcampus.controller;

import com.smartcampus.dto.SessionUser;
import com.smartcampus.dto.TicketRequestDTO;
import com.smartcampus.dto.TicketResponseDTO;
import com.smartcampus.entity.User;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Ticket.TicketPriority;
import com.smartcampus.model.Ticket.TicketStatus;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.service.TicketService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<TicketResponseDTO> createTicket(
            @Valid @RequestPart("ticket") TicketRequestDTO ticketRequestDTO,
            @RequestPart(value = "images", required = false) org.springframework.web.multipart.MultipartFile[] images,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        TicketResponseDTO response = ticketService.createTicket(ticketRequestDTO, currentUser, images);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority) {
        
        List<TicketResponseDTO> tickets = ticketService.getAllTickets(status, priority);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponseDTO>> getMyTickets(
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        return ResponseEntity.ok(ticketService.getMyTickets(currentUser));
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<TicketResponseDTO>> getAssignedTickets(
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        return ResponseEntity.ok(ticketService.getAssignedTickets(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketResponseDTO> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        TicketResponseDTO response = ticketService.updateTicketStatus(id, status, currentUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> updateTicket(
            @PathVariable Long id,
            @Valid @RequestPart("ticket") TicketRequestDTO ticketRequestDTO,
            @RequestPart(value = "images", required = false) org.springframework.web.multipart.MultipartFile[] images,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        TicketResponseDTO response = ticketService.updateTicket(id, ticketRequestDTO, currentUser, images);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketResponseDTO> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        TicketResponseDTO response = ticketService.assignTechnician(id, technicianId, currentUser);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/self-assign")
    public ResponseEntity<TicketResponseDTO> selfAssign(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        TicketResponseDTO response = ticketService.assignTechnician(id, currentUser.getId(), currentUser);
        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{id}/unassign")
    public ResponseEntity<TicketResponseDTO> unassignTechnician(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        TicketResponseDTO response = ticketService.unassignTechnician(id, currentUser);
        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpServletRequest request) {
        
        User currentUser = resolveUser(oauth2User, request);
        ticketService.deleteTicket(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getTicketImage(@PathVariable String filename) {
        org.springframework.core.io.Resource file = ticketService.loadTicketImage(filename);
        
        String contentType = "application/octet-stream";
        try {
            if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (filename.toLowerCase().endsWith(".png")) {
                contentType = "image/png";
            } else if (filename.toLowerCase().endsWith(".gif")) {
                contentType = "image/gif";
            }
        } catch (Exception e) {
            // Fallback to octet-stream
        }

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    /**
     * Resolves the User entity from the current authentication context (OAuth2 or Session)
     */
    private User resolveUser(OAuth2User oauth2User, HttpServletRequest request) {
        String email = null;

        // Try OAuth2 principal first
        if (oauth2User != null) {
            email = oauth2User.getAttribute("email");
        }

        // Fallback to SessionUser if OAuth2 is not present
        if (email == null) {
            HttpSession session = request.getSession(false);
            if (session != null && session.getAttribute("user") != null) {
                SessionUser sessionUser = (SessionUser) session.getAttribute("user");
                email = sessionUser.getEmail();
            }
        }

        if (email == null) {
            throw new ResourceNotFoundException("No authenticated user found in context");
        }

        final String finalEmail = email;
        return userRepository.findByEmail(finalEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + finalEmail));
    }
}
