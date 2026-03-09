package com.doctime.controller;

import com.doctime.dto.ApiResponse;
import com.doctime.dto.PrescriptionRequest;
import com.doctime.model.Prescription;
import com.doctime.model.User;
import com.doctime.service.PrescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {
    
    private final PrescriptionService prescriptionService;
    
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Prescription>> createPrescription(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PrescriptionRequest request) {
        Prescription prescription = prescriptionService.createPrescription(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Prescription created", prescription));
    }
    
    @GetMapping("/patient")
    public ResponseEntity<ApiResponse<List<Prescription>>> getPatientPrescriptions(
            @AuthenticationPrincipal User user) {
        List<Prescription> prescriptions = prescriptionService.getPatientPrescriptions(user.getId());
        return ResponseEntity.ok(ApiResponse.success(prescriptions));
    }
    
    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<Prescription>>> getDoctorPrescriptions(
            @AuthenticationPrincipal User user) {
        List<Prescription> prescriptions = prescriptionService.getDoctorPrescriptions(user.getId());
        return ResponseEntity.ok(ApiResponse.success(prescriptions));
    }
}
