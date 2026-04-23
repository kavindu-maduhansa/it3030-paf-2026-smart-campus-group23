package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Find bookings by resource
     */
    List<Booking> findByResourceId(Long resourceId);

    /**
     * Find bookings by user
     */
    List<Booking> findByUserId(Long userId);

    /**
     * Find bookings by status
     */
    List<Booking> findByStatus(String status);
    /**
     * Count bookings by status
     */
    long countByStatus(String status);

    /**
     * Find bookings by date range
     */
    List<Booking> findByBookingDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Find bookings by resource and date
     */
    List<Booking> findByResourceIdAndBookingDate(Long resourceId, LocalDate bookingDate);

    /**
     * Top resources by booking count (all time)
     */
    @Query(value = "SELECT r.id, r.name, r.type, r.location, COUNT(b.id) as booking_count " +
            "FROM resources r LEFT JOIN bookings b ON r.id = b.resource_id " +
            "WHERE b.status IN ('APPROVED', 'COMPLETED') " +
            "GROUP BY r.id, r.name, r.type, r.location " +
            "ORDER BY booking_count DESC ", nativeQuery = true)
    List<Object[]> findTopResourcesByBookingCount();

    /**
     * Top resources by booking count (within date range)
     */
    @Query(value = "SELECT r.id, r.name, r.type, r.location, COUNT(b.id) as booking_count " +
            "FROM resources r LEFT JOIN bookings b ON r.id = b.resource_id " +
            "WHERE b.booking_date BETWEEN :startDate AND :endDate " +
            "AND b.status IN ('APPROVED', 'COMPLETED') " +
            "GROUP BY r.id, r.name, r.type, r.location " +
            "ORDER BY booking_count DESC", nativeQuery = true)
    List<Object[]> findTopResourcesByBookingCountInRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Peak booking hours (count of bookings per hour)
     */
    @Query(value = "SELECT HOUR(b.start_time) as hour, COUNT(b.id) as booking_count " +
            "FROM bookings b " +
            "WHERE b.status IN ('APPROVED', 'COMPLETED') " +
            "GROUP BY HOUR(b.start_time) " +
            "ORDER BY hour ASC", nativeQuery = true)
    List<Object[]> findPeakBookingHours();

    /**
     * Peak booking hours within date range
     */
    @Query(value = "SELECT HOUR(b.start_time) as hour, COUNT(b.id) as booking_count " +
            "FROM bookings b " +
            "WHERE b.booking_date BETWEEN :startDate AND :endDate " +
            "AND b.status IN ('APPROVED', 'COMPLETED') " +
            "GROUP BY HOUR(b.start_time) " +
            "ORDER BY hour ASC", nativeQuery = true)
    List<Object[]> findPeakBookingHoursInRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Total bookings by type
     */
    @Query(value = "SELECT r.type, COUNT(b.id) as booking_count " +
            "FROM resources r LEFT JOIN bookings b ON r.id = b.resource_id " +
            "WHERE b.status IN ('APPROVED', 'COMPLETED') " +
            "GROUP BY r.type " +
            "ORDER BY booking_count DESC", nativeQuery = true)
    List<Object[]> findBookingsByResourceType();

    /**
     * Booking utilization rate by resource
     */
    @Query(value = "SELECT r.id, r.name, " +
            "COUNT(DISTINCT b.booking_date) as days_used, " +
            "COUNT(b.id) as total_bookings, " +
            "DATEDIFF(CURDATE(), MIN(b.created_at)) as days_tracked " +
            "FROM resources r LEFT JOIN bookings b ON r.id = b.resource_id " +
            "WHERE b.status IN ('APPROVED', 'COMPLETED') " +
            "GROUP BY r.id, r.name " +
            "ORDER BY total_bookings DESC", nativeQuery = true)
    List<Object[]> findResourceUtilization();
}
