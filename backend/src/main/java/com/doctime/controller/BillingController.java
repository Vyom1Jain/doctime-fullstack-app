package com.doctime.controller;

import com.doctime.model.Transaction;
import com.doctime.security.SecurityUtils;
import com.doctime.service.BillingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Billing and transactions APIs")
public class BillingController {

    private final BillingService billingService;
    private final SecurityUtils securityUtils;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get billing history for patient")
    public ResponseEntity<List<Transaction>> getPatientBilling(@PathVariable Long patientId) {
        if (!securityUtils.isCurrentUser(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(billingService.getPatientTransactions(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get billing history for doctor")
    public ResponseEntity<List<Transaction>> getDoctorBilling(@PathVariable Long doctorId) {
        if (!securityUtils.isCurrentUser(doctorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(billingService.getDoctorTransactions(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/range")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get doctor earnings filtered by date range")
    public ResponseEntity<List<Transaction>> getDoctorBillingByRange(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (!securityUtils.isCurrentUser(doctorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(billingService.getDoctorTransactionsByDateRange(
                doctorId, from.atStartOfDay(), to.atTime(LocalTime.MAX)));
    }
}
