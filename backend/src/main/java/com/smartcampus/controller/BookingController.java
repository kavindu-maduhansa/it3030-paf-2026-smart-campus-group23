package com.smartcampus.controller;

import com.smartcampus.dto.BookingListItemDTO;
import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.SessionUser;
import com.smartcampus.entity.User;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.Role;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.MongoBookingSyncService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final MongoBookingSyncService mongoBookingSyncService;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<BookingListItemDTO>> getBookings() {
        return ResponseEntity.ok(bookingService.listAllBookings());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpSession session) {
        User currentUser = resolveCurrentUser(oauth2User, session);
        if (currentUser == null || currentUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (!isAdmin(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can approve bookings");
        }
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
        }
        if (!"PENDING".equalsIgnoreCase(booking.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Only pending bookings can be approved");
        }
        booking.setStatus("APPROVED");
        booking.setAdminComment(null);
        Booking saved = bookingRepository.save(booking);
        mongoBookingSyncService.upsertBooking(saved);
        BookingListItemDTO dto = bookingService.getBookingListItem(saved.getId());
        return ResponseEntity.ok(dto != null ? dto : BookingListItemDTO.fromBooking(saved));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody(required = false) Map<String, String> body,
            HttpSession session) {
        User currentUser = resolveCurrentUser(oauth2User, session);
        if (currentUser == null || currentUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (!isAdmin(currentUser)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can reject bookings");
        }
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
        }
        if (!"PENDING".equalsIgnoreCase(booking.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Only pending bookings can be rejected");
        }
        String reason = body != null ? body.get("reason") : null;
        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Reject reason is required");
        }
        booking.setStatus("REJECTED");
        booking.setAdminComment(reason.trim());
        Booking saved = bookingRepository.save(booking);
        mongoBookingSyncService.upsertBooking(saved);
        BookingListItemDTO dto = bookingService.getBookingListItem(saved.getId());
        return ResponseEntity.ok(dto != null ? dto : BookingListItemDTO.fromBooking(saved));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpSession session) {
        User currentUser = resolveCurrentUser(oauth2User, session);
        if (currentUser == null || currentUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        List<BookingListItemDTO> rows = bookingService.listBookingsForUser(currentUser.getId());
        return ResponseEntity.ok(rows);
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody BookingRequestDTO request,
            HttpSession session) {
        User currentUser = resolveCurrentUser(oauth2User, session);
        if (currentUser == null || currentUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (request == null || request.getResourceId() == null) {
            return ResponseEntity.badRequest().body("Resource is required");
        }

        Resource resource = resourceRepository.findById(request.getResourceId()).orElse(null);
        if (resource == null) {
            return ResponseEntity.badRequest().body("Invalid resource");
        }

        try {
            LocalDate bookingDate = LocalDate.parse(request.getBookingDate());
            LocalTime startTime = LocalTime.parse(request.getStartTime());
            LocalTime endTime = LocalTime.parse(request.getEndTime());
            if (!endTime.isAfter(startTime)) {
                return ResponseEntity.badRequest().body("End time must be after start time");
            }
            if (bookingRepository.existsOverlappingBooking(
                    resource.getId(), bookingDate, startTime, endTime)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Scheduling conflict: this resource is already booked for the selected time range");
            }

            Booking booking = new Booking();
            booking.setResource(resource);
            booking.setUser(currentUser);
            booking.setBookingDate(bookingDate);
            booking.setStartTime(startTime);
            booking.setEndTime(endTime);
            booking.setPurpose(request.getPurpose());
            booking.setExpectedAttendees(request.getExpectedAttendees());
            booking.setStatus("PENDING");

            Booking saved = bookingRepository.save(booking);
            mongoBookingSyncService.upsertBooking(saved);
            BookingListItemDTO dto = bookingService.getBookingListItem(saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(dto != null ? dto : BookingListItemDTO.fromBooking(saved));
        } catch (DateTimeParseException ex) {
            return ResponseEntity.badRequest().body("Invalid date or time format");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            @RequestBody BookingRequestDTO request,
            HttpSession session) {
        User currentUser = resolveCurrentUser(oauth2User, session);
        if (currentUser == null || currentUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Booking booking = bookingRepository.findByIdAndUserId(id, currentUser.getId()).orElse(null);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
        }
        if (!"PENDING".equalsIgnoreCase(booking.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Only pending bookings can be edited");
        }
        if (request == null || request.getResourceId() == null) {
            return ResponseEntity.badRequest().body("Resource is required");
        }
        Resource resource = resourceRepository.findById(request.getResourceId()).orElse(null);
        if (resource == null) {
            return ResponseEntity.badRequest().body("Invalid resource");
        }
        try {
            LocalDate bookingDate = LocalDate.parse(request.getBookingDate());
            LocalTime startTime = LocalTime.parse(request.getStartTime());
            LocalTime endTime = LocalTime.parse(request.getEndTime());
            if (!endTime.isAfter(startTime)) {
                return ResponseEntity.badRequest().body("End time must be after start time");
            }
            if (bookingRepository.existsOverlappingBookingExcludingId(
                    booking.getId(), resource.getId(), bookingDate, startTime, endTime)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Scheduling conflict: this resource is already booked for the selected time range");
            }
            booking.setResource(resource);
            booking.setBookingDate(bookingDate);
            booking.setStartTime(startTime);
            booking.setEndTime(endTime);
            booking.setPurpose(request.getPurpose());
            booking.setExpectedAttendees(request.getExpectedAttendees());
            Booking saved = bookingRepository.save(booking);
            mongoBookingSyncService.upsertBooking(saved);
            BookingListItemDTO dto = bookingService.getBookingListItem(saved.getId());
            return ResponseEntity.ok(dto != null ? dto : BookingListItemDTO.fromBooking(saved));
        } catch (DateTimeParseException ex) {
            return ResponseEntity.badRequest().body("Invalid date or time format");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpSession session) {
        User currentUser = resolveCurrentUser(oauth2User, session);
        if (currentUser == null || currentUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Booking booking = bookingRepository.findByIdAndUserId(id, currentUser.getId()).orElse(null);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
        }
        if (!"PENDING".equalsIgnoreCase(booking.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Only pending bookings can be deleted");
        }
        bookingRepository.delete(booking);
        mongoBookingSyncService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal OAuth2User oauth2User,
            HttpSession session) {
        User currentUser = resolveCurrentUser(oauth2User, session);
        if (currentUser == null || currentUser.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        Booking booking = bookingRepository.findByIdAndUserId(id, currentUser.getId()).orElse(null);
        if (booking == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Booking not found");
        }
        if (!"APPROVED".equalsIgnoreCase(booking.getStatus()) && !"PENDING".equalsIgnoreCase(booking.getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Booking cannot be cancelled");
        }
        booking.setStatus("CANCELLED");
        Booking saved = bookingRepository.save(booking);
        mongoBookingSyncService.upsertBooking(saved);
        BookingListItemDTO dto = bookingService.getBookingListItem(saved.getId());
        return ResponseEntity.ok(dto != null ? dto : BookingListItemDTO.fromBooking(saved));
    }

    private User resolveCurrentUser(OAuth2User oauth2User, HttpSession session) {
        String email = null;

        if (oauth2User != null) {
            email = oauth2User.getAttribute("email");
        }
        if (email == null && session != null) {
            Object attr = session.getAttribute("user");
            if (attr instanceof SessionUser su) {
                email = su.getEmail();
            } else if (attr instanceof User legacyUser) {
                email = legacyUser.getEmail();
            }
        }
        if (email == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof OAuth2User principalOAuth) {
                    email = principalOAuth.getAttribute("email");
                } else if (principal instanceof SessionUser su) {
                    email = su.getEmail();
                } else if (principal instanceof String principalName && !"anonymousUser".equals(principalName)) {
                    email = principalName;
                }
            }
        }
        if (email == null || email.isBlank()) {
            return null;
        }
        return userRepository.findByEmail(email).orElse(null);
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN;
    }
}
