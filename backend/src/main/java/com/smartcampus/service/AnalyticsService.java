package com.smartcampus.service;

import com.smartcampus.dto.analytics.TopResourceDTO;
import com.smartcampus.dto.analytics.PeakHourDTO;
import com.smartcampus.dto.analytics.BookingsByTypeDTO;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.dto.AdminStatsDTO;
import com.smartcampus.model.Ticket;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Analytics Service
 * Provides aggregated analytics data for admin dashboard
 */
@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    /**
     * Get summary stats for admin dashboard
     */
    public AdminStatsDTO getAdminStats() {
        return AdminStatsDTO.builder()
                .totalUsers(userRepository.count())
                .pendingBookings(bookingRepository.countByStatus("PENDING"))
                .openTickets(ticketRepository.countByStatus(Ticket.TicketStatus.OPEN))
                .activeResources(resourceRepository.count())
                .build();
    }

    /**
     * Get top N resources by booking count
     */
    public List<TopResourceDTO> getTopResources(int limit) {
        List<Object[]> results = bookingRepository.findTopResourcesByBookingCount();
        return convertToTopResourceDTO(results).stream()
                .limit(limit)
                .toList();
    }

    /**
     * Get top N resources by booking count within date range
     */
    public List<TopResourceDTO> getTopResourcesByDateRange(LocalDate startDate, LocalDate endDate, int limit) {
        List<Object[]> results = bookingRepository.findTopResourcesByBookingCountInRange(startDate, endDate);
        return convertToTopResourceDTO(results).stream()
                .limit(limit)
                .toList();
    }

    /**
     * Get peak booking hours (which hours are most booked)
     */
    public List<PeakHourDTO> getPeakBookingHours() {
        List<Object[]> results = bookingRepository.findPeakBookingHours();
        return convertToPeakHourDTO(results);
    }

    /**
     * Get peak booking hours within date range
     */
    public List<PeakHourDTO> getPeakBookingHoursByDateRange(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = bookingRepository.findPeakBookingHoursInRange(startDate, endDate);
        return convertToPeakHourDTO(results);
    }

    /**
     * Get bookings by resource type
     */
    public List<BookingsByTypeDTO> getBookingsByResourceType() {
        List<Object[]> results = bookingRepository.findBookingsByResourceType();
        List<BookingsByTypeDTO> dtos = new ArrayList<>();
        for (Object[] row : results) {
            BookingsByTypeDTO dto = new BookingsByTypeDTO();
            dto.setType((String) row[0]);
            dto.setBookingCount(((Number) row[1]).longValue());
            dtos.add(dto);
        }
        return dtos;
    }

    /**
     * Get resource utilization metrics
     */
    public List<TopResourceDTO> getResourceUtilization() {
        List<Object[]> results = bookingRepository.findResourceUtilization();
        List<TopResourceDTO> dtos = new ArrayList<>();
        for (Object[] row : results) {
            TopResourceDTO dto = new TopResourceDTO();
            dto.setResourceId(((Number) row[0]).longValue());
            dto.setResourceName((String) row[1]);
            dto.setBookingCount(((Number) row[3]).longValue());
            dtos.add(dto);
        }
        return dtos;
    }

    private List<TopResourceDTO> convertToTopResourceDTO(List<Object[]> results) {
        List<TopResourceDTO> dtos = new ArrayList<>();
        for (Object[] row : results) {
            TopResourceDTO dto = new TopResourceDTO();
            dto.setResourceId(((Number) row[0]).longValue());
            dto.setResourceName((String) row[1]);
            dto.setResourceType((String) row[2]);
            dto.setLocation((String) row[3]);
            dto.setBookingCount(((Number) row[4]).longValue());
            dtos.add(dto);
        }
        return dtos;
    }

    private List<PeakHourDTO> convertToPeakHourDTO(List<Object[]> results) {
        List<PeakHourDTO> dtos = new ArrayList<>();
        for (Object[] row : results) {
            PeakHourDTO dto = new PeakHourDTO();
            dto.setHour(((Number) row[0]).intValue());
            dto.setBookingCount(((Number) row[1]).longValue());
            dto.setTimeLabel(String.format("%02d:00 - %02d:00", dto.getHour(), dto.getHour() + 1));
            dtos.add(dto);
        }
        return dtos;
    }
}
