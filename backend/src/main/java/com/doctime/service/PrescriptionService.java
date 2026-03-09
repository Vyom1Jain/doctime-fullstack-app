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
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new RuntimeException("Unauthorized");
        }

        Prescription prescription = Prescription.builder()
                .doctor(appointment.getDoctor())
                .appointment(appointment)
                .diagnosis(request.getDiagnosis())
                .generalAdvice(request.getGeneralAdvice())
                .nextVisit(request.getNextVisit())
                .build();

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

        prescription.setMedicines(medicines);
        return prescriptionRepository.save(prescription);
    }

    public List<Prescription> getPatientPrescriptions(Long patientId) {
        return prescriptionRepository.findByAppointment_Patient_Id(patientId);
    }

    public List<Prescription> getDoctorPrescriptions(Long doctorId) {
        return prescriptionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }
}
