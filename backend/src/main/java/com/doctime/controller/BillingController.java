package com.doctime.controller;

import com.doctime.model.Transaction;
import com.doctime.repository.TransactionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@Tag(name = "Billing", description = "Billing and transactions APIs")
public class BillingController {

    private final TransactionRepository transactionRepository;

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get billing history for patient")
    public ResponseEntity<List<Transaction>> getPatientBilling(@PathVariable Long patientId) {
        return ResponseEntity.ok(transactionRepository.findByPatientIdOrderByCreatedAtDesc(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get billing history for doctor")
    public ResponseEntity<List<Transaction>> getDoctorBilling(@PathVariable Long doctorId) {
        return ResponseEntity.ok(transactionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId));
    }
}
