package com.doctime.controller;

import com.doctime.model.MedicalReport;
import com.doctime.repository.AppointmentRepository;
import com.doctime.security.SecurityUtils;
import com.doctime.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Medical report APIs")
public class ReportController {

    private final ReportService reportService;
    private final SecurityUtils securityUtils;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get reports for patient")
    public ResponseEntity<List<MedicalReport>> getByPatient(@PathVariable Long patientId) {
        if (!securityUtils.isCurrentUser(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(reportService.getByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get reports for all patients of a doctor")
    public ResponseEntity<List<MedicalReport>> getByDoctor(@PathVariable Long doctorId) {
        if (!securityUtils.isCurrentUser(doctorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        List<Long> patientIds = appointmentRepository.findByDoctorIdOrderByAppointmentDateTimeDesc(doctorId)
                .stream()
                .map(a -> a.getPatient().getId())
                .distinct()
                .toList();
        List<MedicalReport> reports = patientIds.stream()
                .flatMap(pid -> reportService.getByPatient(pid).stream())
                .toList();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/download/{reportId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR')")
    @Operation(summary = "Download a medical report file")
    public ResponseEntity<Resource> downloadReport(@PathVariable Long reportId) throws IOException {
        MedicalReport report = reportService.getById(reportId);
        Path filePath = Paths.get(report.getFileUrl().replaceFirst("^/", ""));
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
        }

        String contentType = report.getFileType() != null ? report.getFileType() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + report.getFileName() + "\"")
                .body(resource);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Upload a medical report")
    public ResponseEntity<MedicalReport> uploadReport(
            @RequestParam Long patientId,
            @RequestParam MultipartFile file,
            @RequestParam String title,
            @RequestParam(defaultValue = "LAB_REPORT") String type) throws IOException {
        if (!securityUtils.isCurrentUser(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(reportService.uploadReport(patientId, file, title, type));
    }

    @PostMapping("/{reportId}/translate")
    @Operation(summary = "Translate a report")
    public ResponseEntity<MedicalReport> translate(
            @PathVariable Long reportId,
            @RequestParam String language) {
        return ResponseEntity.ok(reportService.translate(reportId, language));
    }
}
