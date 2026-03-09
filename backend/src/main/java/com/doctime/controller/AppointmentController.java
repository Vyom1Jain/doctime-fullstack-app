package com.doctime.controller;

import com.doctime.model.Appointment;
import com.doctime.model.enums.AppointmentStatus;
import com.doctime.repository.AppointmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment management APIs")
public class AppointmentController {
    
    private final AppointmentRepository appointmentRepository;
    
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get patient appointments")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentRepository.findByPatientIdOrderByAppointmentDateTimeDesc(patientId));
    }
    
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor appointments")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentRepository.findByDoctorIdOrderByAppointmentDateTimeDesc(doctorId));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<Appointment> getAppointment(@PathVariable Long id) {
        return appointmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Create new appointment")
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }
    
    @PutMapping("/{id}/status")
    @Operation(summary = "Update appointment status")
    public ResponseEntity<Appointment> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        return appointmentRepository.findById(id)
                .map(appointment -> {
                    appointment.setStatus(status);
                    return ResponseEntity.ok(appointmentRepository.save(appointment));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
