package com.doctime.controller;

import com.doctime.dto.DonationRequest;
import com.doctime.model.Donation;
import com.doctime.security.SecurityUtils;
import com.doctime.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@Tag(name = "Donations", description = "Patient support & donations APIs")
public class DonationController {

    private final DonationService donationService;
    private final SecurityUtils securityUtils;

    @GetMapping("/active")
    @Operation(summary = "Get active verified donation requests")
    public ResponseEntity<List<Donation>> getActiveDonations() {
        return ResponseEntity.ok(donationService.getActiveDonations());
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Create a new donation request")
    public ResponseEntity<Donation> createDonation(
            @RequestParam Long patientId,
            @Valid @RequestBody DonationRequest request) {
        return ResponseEntity.ok(donationService.createDonation(patientId, request));
    }

    @PatchMapping("/{id}/contribute")
    @Operation(summary = "Contribute to a donation")
    public ResponseEntity<Donation> contribute(
            @PathVariable Long id,
            @RequestBody Map<String, BigDecimal> body) {
        BigDecimal amount = body.get("amount");
        return ResponseEntity.ok(donationService.contribute(id, amount));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get pending donations for doctor's patients")
    public ResponseEntity<List<Donation>> getPendingDonations() {
        Long doctorId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(donationService.getPendingForDoctor(doctorId));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Verify/approve a donation request")
    public ResponseEntity<Donation> verifyDonation(@PathVariable Long id) {
        Long doctorId = securityUtils.getCurrentUserId();
        return ResponseEntity.ok(donationService.verifyDonation(id, doctorId));
    }
}
