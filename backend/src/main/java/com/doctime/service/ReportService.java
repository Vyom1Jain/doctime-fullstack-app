package com.doctime.service;

import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.MedicalReport;
import com.doctime.repository.MedicalReportRepository;
import com.doctime.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final MedicalReportRepository reportRepository;
    private final PatientRepository patientRepository;

    public List<MedicalReport> getByPatient(Long patientId) {
        return reportRepository.findByPatientId(patientId);
    }

    public MedicalReport getById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
    }

    @Transactional
    public MedicalReport translate(Long reportId, String language) {
        MedicalReport report = getById(reportId);
        // Stub translation – replace with LibreTranslate / Google Translate API call
        String translated = "[" + language.toUpperCase() + "] " + report.getDescription();
        report.setTranslatedText(translated);
        return reportRepository.save(report);
    }
}
