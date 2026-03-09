package com.doctime.repository;

import com.doctime.model.MedicalReport;
import com.doctime.model.enums.ReportType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalReportRepository extends JpaRepository<MedicalReport, Long> {
    List<MedicalReport> findByPatientIdOrderByUploadedAtDesc(Long patientId);
    Page<MedicalReport> findByPatientId(Long patientId, Pageable pageable);
    List<MedicalReport> findByPatientIdAndType(Long patientId, ReportType type);
}
