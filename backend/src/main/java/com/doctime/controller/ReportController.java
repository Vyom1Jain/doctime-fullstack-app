package com.doctime.controller;

import com.doctime.model.MedicalReport;
import com.doctime.repository.MedicalReportRepository;
import com.doctime.service.TranslationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Medical report management APIs")
public class ReportController {
    
    private final MedicalReportRepository reportRepository;
    private final TranslationService translationService;
    
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get patient reports")
    public ResponseEntity<List<MedicalReport>> getPatientReports(@PathVariable Long patientId) {
        return ResponseEntity.ok(reportRepository.findByPatientIdOrderByUploadedAtDesc(patientId));
    }
    
    @PostMapping("/{reportId}/translate")
    @Operation(summary = "Translate medical report")
    public ResponseEntity<MedicalReport> translateReport(
            @PathVariable Long reportId,
            @RequestParam String language) {
        return reportRepository.findById(reportId)
                .map(report -> {
                    String translated = translationService.translateText(report.getDescription(), language);
                    report.setTranslatedText(translated);
                    report.setTranslatedLanguage(language);
                    return ResponseEntity.ok(reportRepository.save(report));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Upload medical report")
    public ResponseEntity<MedicalReport> uploadReport(@RequestBody MedicalReport report) {
        return ResponseEntity.ok(reportRepository.save(report));
    }
}
