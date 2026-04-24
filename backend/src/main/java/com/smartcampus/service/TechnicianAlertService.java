package com.smartcampus.service;

import com.smartcampus.model.TechnicianAlert;
import com.smartcampus.repository.TechnicianAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TechnicianAlertService {

    private final TechnicianAlertRepository repository;

    public List<TechnicianAlert> getAllAlerts() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    public TechnicianAlert createAlert(TechnicianAlert alert) {
        if (alert.getCreatedAt() == null) {
            alert.setCreatedAt(LocalDateTime.now());
        }
        return repository.save(alert);
    }

    public TechnicianAlert updateAlert(String id, TechnicianAlert alertDetails) {
        TechnicianAlert alert = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found with id: " + id));
        
        alert.setTitle(alertDetails.getTitle());
        alert.setMessage(alertDetails.getMessage());
        alert.setType(alertDetails.getType());
        alert.setTargetRoles(alertDetails.getTargetRoles());
        
        return repository.save(alert);
    }

    public void deleteAlert(String id) {
        repository.deleteById(id);
    }
}
