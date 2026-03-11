package com.doctime.controller;

import com.doctime.dto.PrescriptionRequest;
import com.doctime.model.Prescription;
import com.doctime.security.SecurityUtils;
import com.doctime.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescriptions", description = "Prescription management APIs")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final SecurityUtils securityUtils;

    @PostMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Create prescription for appointment")
    public ResponseEntity<Prescription> createPrescription(
            @PathVariable Long appointmentId,
            @Valid @RequestBody PrescriptionRequest request) {
        Long doctorId = securityUtils.getCurrentUserId();
        if (doctorId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        Prescription saved = prescriptionService.createPrescription(doctorId, appointmentId, request);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get prescriptions for a patient")
    public ResponseEntity<List<Prescription>> getPatientPrescriptions(@PathVariable Long patientId) {
        if (!securityUtils.isCurrentUser(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(prescriptionService.getPatientPrescriptions(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get prescriptions written by a doctor")
    public ResponseEntity<List<Prescription>> getDoctorPrescriptions(@PathVariable Long doctorId) {
        if (!securityUtils.isCurrentUser(doctorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(prescriptionService.getDoctorPrescriptions(doctorId));
    }
}
