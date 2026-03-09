package com.doctime.controller;

import com.doctime.dto.MedicineRequest;
import com.doctime.dto.PrescriptionRequest;
import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.Appointment;
import com.doctime.model.Medicine;
import com.doctime.model.Prescription;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.PrescriptionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
@Tag(name = "Prescriptions", description = "Prescription management APIs")
public class PrescriptionController {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;

    @PostMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Create prescription for appointment")
    public ResponseEntity<Prescription> createPrescription(
            @PathVariable Long appointmentId,
            @RequestBody PrescriptionRequest request
    ) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        Prescription prescription = Prescription.builder()
                .appointment(appt)
                .doctor(appt.getDoctor())
                .diagnosis(request.getDiagnosis())
                .generalAdvice(request.getGeneralAdvice())
                .nextVisit(request.getNextVisit())
                .build();

        List<Medicine> meds = new ArrayList<>();
        if (request.getMedicines() != null) {
            for (MedicineRequest mr : request.getMedicines()) {
                Medicine m = Medicine.builder()
                        .prescription(prescription)
                        .name(mr.getName())
                        .dosage(mr.getDosage())
                        .frequency(mr.getFrequency())
                        .duration(mr.getDuration())
                        .instructions(mr.getInstructions())
                        .build();
                meds.add(m);
            }
        }
        prescription.setMedicines(meds);

        Prescription saved = prescriptionRepository.save(prescription);
        return ResponseEntity.ok(saved);
    }
}
