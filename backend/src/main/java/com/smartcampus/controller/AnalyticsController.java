package com.smartcampus.controller;

import com.smartcampus.service.AnalyticsService;
import com.smartcampus.dto.analytics.TopResourceDTO;
import com.smartcampus.dto.analytics.PeakHourDTO;
import com.smartcampus.dto.analytics.BookingsByTypeDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Analytics Controller
 * Provides analytics endpoints for admin dashboard
 * Shows booking statistics, peak hours, top resources, etc.
 */
@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * GET: Top resources by booking count
     * Query param: limit (default 10)
     * HTTP: 200 OK
     */
    @GetMapping("/top-resources")
    public ResponseEntity<List<TopResourceDTO>> getTopResources(
            @RequestParam(defaultValue = "10") int limit) {
        List<TopResourceDTO> topResources = analyticsService.getTopResources(limit);
        return ResponseEntity.ok(topResources);
    }

    /**
     * GET: Top resources by booking count within date range
     * Query params: startDate, endDate, limit (default 10)
     * Date format: yyyy-MM-dd
     * HTTP: 200 OK
     */
    @GetMapping("/top-resources/range")
    public ResponseEntity<List<TopResourceDTO>> getTopResourcesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "10") int limit) {
        List<TopResourceDTO> topResources = analyticsService.getTopResourcesByDateRange(startDate, endDate, limit);
        return ResponseEntity.ok(topResources);
    }

    /**
     * GET: Peak booking hours (busiest hours of the day)
     * Returns all 24 hours with booking counts
     * HTTP: 200 OK
     */
    @GetMapping("/peak-hours")
    public ResponseEntity<List<PeakHourDTO>> getPeakBookingHours() {
        List<PeakHourDTO> peakHours = analyticsService.getPeakBookingHours();
        return ResponseEntity.ok(peakHours);
    }

    /**
     * GET: Peak booking hours within date range
     * Query params: startDate, endDate
     * Date format: yyyy-MM-dd
     * HTTP: 200 OK
     */
    @GetMapping("/peak-hours/range")
    public ResponseEntity<List<PeakHourDTO>> getPeakBookingHoursByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PeakHourDTO> peakHours = analyticsService.getPeakBookingHoursByDateRange(startDate, endDate);
        return ResponseEntity.ok(peakHours);
    }

    /**
     * GET: Bookings by resource type
     * Shows which resource types are most booked
     * HTTP: 200 OK
     */
    @GetMapping("/by-type")
    public ResponseEntity<List<BookingsByTypeDTO>> getBookingsByResourceType() {
        List<BookingsByTypeDTO> bookingsByType = analyticsService.getBookingsByResourceType();
        return ResponseEntity.ok(bookingsByType);
    }

    /**
     * GET: Resource utilization metrics
     * Shows total bookings per resource
     * HTTP: 200 OK
     */
    @GetMapping("/resource-utilization")
    public ResponseEntity<List<TopResourceDTO>> getResourceUtilization() {
        List<TopResourceDTO> utilization = analyticsService.getResourceUtilization();
        return ResponseEntity.ok(utilization);
    }
}
