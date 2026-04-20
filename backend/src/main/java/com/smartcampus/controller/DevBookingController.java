package com.smartcampus.controller;

import com.smartcampus.entity.User;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Random;

/**
 * Dev Controller for Booking
 * Development-only endpoints for creating sample booking data
 * Only available when spring.profiles.active=dev
 */
@RestController
@RequestMapping("/api/dev/bookings")
public class DevBookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    private static final Random random = new Random();

    /**
     * POST: Create sample bookings for testing
     * Generates realistic booking data across multiple resources and users
     */
    @PostMapping("/create-samples")
    public ResponseEntity<?> createSampleBookings() {
        try {
            List<Resource> resources = resourceRepository.findAll();
            List<User> users = userRepository.findAll();

            if (resources.isEmpty() || users.isEmpty()) {
                return ResponseEntity.badRequest().body("Need at least 1 resource and 1 user");
            }

            int count = 0;

            // Generate bookings for the next 30 days
            for (int dayOffset = 0; dayOffset < 30; dayOffset++) {
                LocalDate bookingDate = LocalDate.now().plusDays(dayOffset);

                // Generate 3-5 bookings per day
                int bookingsPerDay = 3 + random.nextInt(3);

                for (int i = 0; i < bookingsPerDay; i++) {
                    // Random resource
                    Resource resource = resources.get(random.nextInt(resources.size()));

                    // Random user
                    User user = users.get(random.nextInt(users.size()));

                    // Random time slot (08:00 - 18:00)
                    int startHour = 8 + random.nextInt(10);
                    int duration = 1 + random.nextInt(3); // 1-3 hours
                    LocalTime startTime = LocalTime.of(startHour, 0);
                    LocalTime endTime = startTime.plusHours(duration);

                    // Create booking
                    Booking booking = new Booking();
                    booking.setResource(resource);
                    booking.setUser(user);
                    booking.setBookingDate(bookingDate);
                    booking.setStartTime(startTime);
                    booking.setEndTime(endTime);
                    booking.setPurpose(generateRandomPurpose());
                    booking.setExpectedAttendees(5 + random.nextInt(50));

                    // 80% approved, 10% pending, 10% rejected
                    int statusRand = random.nextInt(100);
                    if (statusRand < 80) {
                        booking.setStatus("APPROVED");
                    } else if (statusRand < 90) {
                        booking.setStatus("PENDING");
                    } else {
                        booking.setStatus("REJECTED");
                    }

                    bookingRepository.save(booking);
                    count++;
                }
            }

            return ResponseEntity.ok().body(String.format("Created %d sample bookings", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating sample bookings: " + e.getMessage());
        }
    }

    /**
     * POST: Create single booking
     */
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(
            @RequestParam Long resourceId,
            @RequestParam Long userId,
            @RequestParam String bookingDate,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam(required = false) String purpose) {
        try {
            Resource resource = resourceRepository.findById(resourceId).orElse(null);
            User user = userRepository.findById(userId).orElse(null);

            if (resource == null || user == null) {
                return ResponseEntity.badRequest().body("Resource or User not found");
            }

            Booking booking = new Booking();
            booking.setResource(resource);
            booking.setUser(user);
            booking.setBookingDate(LocalDate.parse(bookingDate));
            booking.setStartTime(LocalTime.parse(startTime));
            booking.setEndTime(LocalTime.parse(endTime));
            booking.setPurpose(purpose != null ? purpose : "Meeting");
            booking.setExpectedAttendees(10);
            booking.setStatus("APPROVED");

            Booking saved = bookingRepository.save(booking);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating booking: " + e.getMessage());
        }
    }

    private String generateRandomPurpose() {
        String[] purposes = {
            "Team meeting",
            "Project presentation",
            "Workshop",
            "Training session",
            "Exam",
            "Guest lecture",
            "Lab session",
            "Study group",
            "Client meeting",
            "Department meeting",
            "Research seminar",
            "Student conference"
        };
        return purposes[random.nextInt(purposes.length)];
    }
}
