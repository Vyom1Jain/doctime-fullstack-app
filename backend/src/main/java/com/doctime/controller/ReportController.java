package com.doctime.controller;

import com.doctime.model.MedicalReport;
import com.doctime.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Medical report APIs")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get reports for patient")
    public ResponseEntity<List<MedicalReport>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(reportService.getByPatient(patientId));
    }

    @PostMapping("/{reportId}/translate")
    @Operation(summary = "Translate a report")
    public ResponseEntity<MedicalReport> translate(
            @PathVariable Long reportId,
            @RequestParam String language) {
        return ResponseEntity.ok(reportService.translate(reportId, language));
    }
}
