package com.smartcampus.repository;

import com.smartcampus.model.Resource;
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
    List<Resource> findByStatus(Resource.ResourceStatus status);

    /**
     * Find active resources by type and capacity
     */
    @Query("SELECT r FROM Resource r WHERE r.status = com.smartcampus.model.Resource$ResourceStatus.ACTIVE AND r.type = :type AND r.capacity >= :capacity")
    List<Resource> findAvailableByTypeAndCapacity(@Param("type") String type, @Param("capacity") Integer capacity);

    /**
     * Find resources with capacity greater than or equal to specified value
     */
    List<Resource> findByCapacityGreaterThanEqualAndStatus(Integer capacity, Resource.ResourceStatus status);

    /**
     * Find active resources by type and location
     */
    List<Resource> findByTypeAndLocationAndStatus(String type, String location, Resource.ResourceStatus status);

    /**
     * Search resources by name or description (like)
     */
    @Query("SELECT r FROM Resource r WHERE r.name LIKE CONCAT('%', :search, '%') OR r.location LIKE CONCAT('%', :search, '%') OR r.description LIKE CONCAT('%', :search, '%')")
    List<Resource> searchResources(@Param("search") String search);

    /**
     * Find by status and type
     */
    List<Resource> findByStatusAndType(Resource.ResourceStatus status, String type);

    /**
     * Count resources by type
     */
    Long countByType(String type);

    /**
     * Count active resources
     */
    Long countByStatus(Resource.ResourceStatus status);
}
