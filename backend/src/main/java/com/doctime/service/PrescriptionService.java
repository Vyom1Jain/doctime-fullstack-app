package com.doctime.service;

import com.doctime.dto.PrescriptionRequest;
import com.doctime.model.Appointment;
import com.doctime.model.Medicine;
import com.doctime.model.Prescription;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public Prescription createPrescription(Long doctorId, Long appointmentId, PrescriptionRequest request) {
        Appointment appointment = appointmentRepository.findByIdWithRelations(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Update existing prescription if one already exists for this appointment
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElse(Prescription.builder()
                        .doctor(appointment.getDoctor())
                        .appointment(appointment)
                        .build());

        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setGeneralAdvice(request.getGeneralAdvice());
        prescription.setNextVisit(request.getNextVisit());

        // Clear old medicines and add new ones
        prescription.getMedicines().clear();

        List<Medicine> medicines = request.getMedicines().stream()
                .map(dto -> Medicine.builder()
                        .prescription(prescription)
                        .name(dto.getName())
                        .dosage(dto.getDosage())
                        .frequency(dto.getFrequency())
                        .duration(dto.getDuration())
                        .instructions(dto.getInstructions())
                        .build())
                .collect(Collectors.toList());

        prescription.getMedicines().addAll(medicines);
        return prescriptionRepository.save(prescription);
    }

    @Transactional(readOnly = true)
    public List<Prescription> getPatientPrescriptions(Long patientId) {
        return prescriptionRepository.findByAppointment_Patient_Id(patientId);
    }

    @Transactional(readOnly = true)
    public List<Prescription> getDoctorPrescriptions(Long doctorId) {
        return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }
}
