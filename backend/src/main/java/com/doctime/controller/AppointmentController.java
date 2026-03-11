package com.doctime.controller;

import com.doctime.dto.AppointmentDTO;
import com.doctime.dto.AppointmentRequest;
import com.doctime.model.Appointment;
import com.doctime.security.SecurityUtils;
import com.doctime.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment management APIs")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final SecurityUtils securityUtils;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get appointments by patient")
    public ResponseEntity<List<AppointmentDTO>> getByPatient(@PathVariable Long patientId) {
        if (!securityUtils.isCurrentUser(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        List<AppointmentDTO> dtos = appointmentService.getByPatient(patientId).stream()
                .map(AppointmentDTO::from).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get appointments by doctor")
    public ResponseEntity<List<AppointmentDTO>> getByDoctor(@PathVariable Long doctorId) {
        if (!securityUtils.isCurrentUser(doctorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        List<AppointmentDTO> dtos = appointmentService.getByDoctor(doctorId).stream()
                .map(AppointmentDTO::from).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get single appointment")
    public ResponseEntity<AppointmentDTO> getById(@PathVariable Long id) {
        Appointment appt = appointmentService.getById(id);
        Long currentUserId = securityUtils.getCurrentUserId();
        if (!appt.getPatient().getId().equals(currentUserId) && !appt.getDoctor().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(AppointmentDTO.from(appt));
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Book a new appointment")
    public ResponseEntity<AppointmentDTO> book(@Valid @RequestBody AppointmentRequest request) {
        if (!securityUtils.isCurrentUser(request.getPatientId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        Appointment appt = appointmentService.book(request);
        return ResponseEntity.ok(AppointmentDTO.from(appt));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update appointment status")
    public ResponseEntity<AppointmentDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Appointment appt = appointmentService.getById(id);
        if (!securityUtils.isCurrentUser(appt.getDoctor().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        Appointment updated = appointmentService.updateStatus(id, status);
        return ResponseEntity.ok(AppointmentDTO.from(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel appointment")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        Appointment appt = appointmentService.getById(id);
        Long currentUserId = securityUtils.getCurrentUserId();
        if (!appt.getPatient().getId().equals(currentUserId) && !appt.getDoctor().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        appointmentService.cancel(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reschedule")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Reschedule an appointment")
    public ResponseEntity<AppointmentDTO> reschedule(
            @PathVariable Long id,
            @RequestParam String newDateTime,
            @RequestParam(required = false) Integer durationMinutes) {
        Appointment appt = appointmentService.getById(id);
        Long currentUserId = securityUtils.getCurrentUserId();
        if (!appt.getPatient().getId().equals(currentUserId) && !appt.getDoctor().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        LocalDateTime dt = LocalDateTime.parse(newDateTime);
        Appointment updated = appointmentService.reschedule(id, dt, durationMinutes);
        return ResponseEntity.ok(AppointmentDTO.from(updated));
    }
}
