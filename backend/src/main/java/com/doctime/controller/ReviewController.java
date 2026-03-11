package com.doctime.controller;

import com.doctime.dto.ReviewDTO;
import com.doctime.dto.ReviewRequest;
import com.doctime.model.Review;
import com.doctime.security.SecurityUtils;
import com.doctime.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Doctor review & rating APIs")
public class ReviewController {

    private final ReviewService reviewService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Submit a review for a completed appointment")
    public ResponseEntity<ReviewDTO> createReview(@Valid @RequestBody ReviewRequest request) {
        Long patientId = securityUtils.getCurrentUserId();
        Review review = reviewService.createReview(patientId, request);
        return ResponseEntity.ok(ReviewDTO.from(review));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get all reviews for a doctor")
    public ResponseEntity<List<ReviewDTO>> getDoctorReviews(@PathVariable Long doctorId) {
        List<ReviewDTO> dtos = reviewService.getByDoctor(doctorId).stream()
                .map(ReviewDTO::from).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/check/{appointmentId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Check if an appointment has been reviewed")
    public ResponseEntity<Boolean> hasReviewed(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(reviewService.hasReviewed(appointmentId));
    }
}
