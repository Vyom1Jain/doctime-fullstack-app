package com.doctime.service;

import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.MedicalReport;
import com.doctime.model.Patient;
import com.doctime.model.enums.ReportType;
import com.doctime.repository.MedicalReportRepository;
import com.doctime.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final MedicalReportRepository reportRepository;
    private final PatientRepository patientRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public List<MedicalReport> getByPatient(Long patientId) {
        return reportRepository.findByPatientId(patientId);
    }

    public MedicalReport getById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
    }

    @Transactional
    public MedicalReport uploadReport(Long patientId, MultipartFile file, String title, String type)
            throws IOException {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Path uploadPath = Paths.get(uploadDir, "reports");
        Files.createDirectories(uploadPath);

        String originalName = file.getOriginalFilename();
        String storedName = UUID.randomUUID() + "_" + originalName;
        Path filePath = uploadPath.resolve(storedName);
        Files.copy(file.getInputStream(), filePath);

        ReportType reportType;
        try {
            reportType = ReportType.valueOf(type);
        } catch (IllegalArgumentException e) {
            reportType = ReportType.LAB_REPORT;
        }

        MedicalReport report = MedicalReport.builder()
                .patient(patient)
                .title(title)
                .type(reportType)
                .fileUrl("/uploads/reports/" + storedName)
                .fileName(originalName)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .reportDate(LocalDateTime.now())
                .build();

        return reportRepository.save(report);
    }

    @Transactional
    public MedicalReport translate(Long reportId, String language) {
        MedicalReport report = getById(reportId);
        String translated = "[" + language.toUpperCase() + "] " + report.getDescription();
        report.setTranslatedText(translated);
        return reportRepository.save(report);
    }
}
