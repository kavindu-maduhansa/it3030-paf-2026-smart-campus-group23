package com.smartcampus.service;

import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.User;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.IncidentTicketRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class IncidentTicketServiceImpl implements IncidentTicketService {

    @Autowired
    private IncidentTicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Override
    public IncidentTicket createTicket(IncidentTicket ticket, Long reporterId, Long resourceId) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));
        
        ticket.setReporter(reporter);
        ticket.setStatus(IncidentTicket.TicketStatus.OPEN);
        
        if (resourceId != null) {
            Resource resource = resourceRepository.findById(resourceId)
                    .orElseThrow(() -> new RuntimeException("Resource not found"));
            ticket.setResource(resource);
        }
        
        return ticketRepository.save(ticket);
    }

    @Override
    public List<IncidentTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    @Override
    public IncidentTicket getTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    @Override
    public IncidentTicket updateTicketStatus(Long id, IncidentTicket.TicketStatus status, String reason, Long userId) {
        IncidentTicket ticket = getTicketById(id);
        
        // Simple role-based transition logic can be added here
        // For now, focus on CRUD
        ticket.setStatus(status);
        if (status == IncidentTicket.TicketStatus.REJECTED) {
            ticket.setRejectionReason(reason);
        }
        
        return ticketRepository.save(ticket);
    }

    @Override
    public IncidentTicket updateTicket(Long id, IncidentTicket ticketDetails) {
        IncidentTicket ticket = getTicketById(id);
        
        ticket.setCategory(ticketDetails.getCategory());
        ticket.setDescription(ticketDetails.getDescription());
        ticket.setPriority(ticketDetails.getPriority());
        ticket.setPreferredContact(ticketDetails.getPreferredContact());
        
        return ticketRepository.save(ticket);
    }

    @Override
    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    @Override
    public List<IncidentTicket> getTicketsByReporter(Long reporterId) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));
        return ticketRepository.findByReporter(reporter);
    }

    @Override
    public List<IncidentTicket> getTicketsByTechnician(Long technicianId) {
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        return ticketRepository.findByAssignedTechnician(technician);
    }

    @Override
    public IncidentTicket assignTechnician(Long ticketId, Long technicianId) {
        IncidentTicket ticket = getTicketById(ticketId);
        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));
        
        ticket.setAssignedTechnician(technician);
        ticket.setStatus(IncidentTicket.TicketStatus.IN_PROGRESS);
        
        return ticketRepository.save(ticket);
    }
}
