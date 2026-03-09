package com.doctime.controller;

import com.doctime.model.Donation;
import com.doctime.model.enums.DonationStatus;
import com.doctime.repository.DonationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@Tag(name = "Donations", description = "Patient support & donations APIs")
public class DonationController {

    private final DonationRepository donationRepository;

    @GetMapping("/active")
    @Operation(summary = "Get active verified donation requests")
    public ResponseEntity<List<Donation>> getActiveDonations() {
        return ResponseEntity.ok(donationRepository.findByStatusOrderByCreatedAtDesc(DonationStatus.ACTIVE));
    }
}
