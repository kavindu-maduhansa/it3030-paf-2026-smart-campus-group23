package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    // MODULE A: Facilities & Assets Catalogue

    /**
     * Find resources by type
     */
    List<Resource> findByType(String type);

    /**
     * Find resources by location
     */
    List<Resource> findByLocation(String location);

    /**
     * Find resources by status
     */
    List<Resource> findByStatus(ResourceStatus status);

    /**
     * Find resources by type and capacity
     */
    @Query("SELECT r FROM Resource r WHERE r.type = :type AND r.capacity >= :capacity")
    List<Resource> findAvailableByTypeAndCapacity(@Param("type") String type, @Param("capacity") Integer capacity);

    /**
     * Find resources with capacity greater than or equal to specified value
     */
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    /**
     * Find resources by type and location
     */
    List<Resource> findByTypeAndLocation(String type, String location);

    /**
     * Search resources by name or description (like)
     */
    @Query("SELECT r FROM Resource r WHERE r.name LIKE CONCAT('%', :search, '%') OR r.location LIKE CONCAT('%', :search, '%') OR r.description LIKE CONCAT('%', :search, '%')")
    List<Resource> searchResources(@Param("search") String search);

    /**
     * Count resources by type
     */
    Long countByType(String type);


}
