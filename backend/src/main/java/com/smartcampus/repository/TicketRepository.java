package com.smartcampus.repository;

import com.smartcampus.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUserId(Long userId);
    List<Ticket> findByStatus(Ticket.TicketStatus status);
    List<Ticket> findByAssignedToId(Long technicianId);
    List<Ticket> findByResourceId(Long resourceId);
    List<Ticket> findByPriority(Ticket.TicketPriority priority);
}