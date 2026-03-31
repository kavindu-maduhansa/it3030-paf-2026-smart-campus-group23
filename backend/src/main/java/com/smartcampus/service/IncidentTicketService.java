package com.smartcampus.service;

import com.smartcampus.entity.IncidentTicket;
import com.smartcampus.entity.User;

import java.util.List;

public interface IncidentTicketService {
    IncidentTicket createTicket(IncidentTicket ticket, Long reporterId, Long resourceId);
    List<IncidentTicket> getAllTickets();
    IncidentTicket getTicketById(Long id);
    IncidentTicket updateTicketStatus(Long id, IncidentTicket.TicketStatus status, String reason, Long userId);
    IncidentTicket updateTicket(Long id, IncidentTicket ticketDetails);
    void deleteTicket(Long id);
    List<IncidentTicket> getTicketsByReporter(Long reporterId);
    List<IncidentTicket> getTicketsByTechnician(Long technicianId);
    IncidentTicket assignTechnician(Long ticketId, Long technicianId);
}
