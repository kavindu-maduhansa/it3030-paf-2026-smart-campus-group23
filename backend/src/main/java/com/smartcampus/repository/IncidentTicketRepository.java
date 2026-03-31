package com.smartcampus.repository;

import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {
    List<IncidentTicket> findByReporter(User reporter);
    List<IncidentTicket> findByAssignedTechnician(User technician);
    List<IncidentTicket> findByStatus(IncidentTicket.TicketStatus status);
}
