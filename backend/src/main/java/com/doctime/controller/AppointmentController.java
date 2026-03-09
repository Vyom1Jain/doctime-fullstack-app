package com.doctime.controller;

import com.doctime.dto.AppointmentRequest;
import com.doctime.model.Appointment;
import com.doctime.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment management APIs")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get appointments by patient")
    public ResponseEntity<List<Appointment>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get appointments by doctor")
    public ResponseEntity<List<Appointment>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getByDoctor(doctorId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single appointment")
    public ResponseEntity<Appointment> getById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getById(id));
    }

    @PostMapping
    @Operation(summary = "Book a new appointment")
    public ResponseEntity<Appointment> book(@RequestBody AppointmentRequest request) {
        return ResponseEntity.ok(appointmentService.book(request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update appointment status")
    public ResponseEntity<Appointment> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(appointmentService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel appointment")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        appointmentService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
