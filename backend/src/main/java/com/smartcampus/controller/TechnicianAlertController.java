package com.smartcampus.controller;

import com.smartcampus.model.TechnicianAlert;
import com.smartcampus.service.TechnicianAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technician-alerts")
@RequiredArgsConstructor
public class TechnicianAlertController {

    private final TechnicianAlertService alertService;

    @GetMapping
    public ResponseEntity<List<TechnicianAlert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<?> createAlert(@RequestBody TechnicianAlert alert) {
        try {
            return ResponseEntity.ok(alertService.createAlert(alert));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Database Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<?> updateAlert(@PathVariable String id, @RequestBody TechnicianAlert alert) {
        try {
            return ResponseEntity.ok(alertService.updateAlert(id, alert));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating alert: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<Void> deleteAlert(@PathVariable String id) {
        alertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }
}
