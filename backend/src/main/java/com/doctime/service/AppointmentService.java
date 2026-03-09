package com.doctime.service;

import com.doctime.dto.AppointmentRequest;
import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.Appointment;
import com.doctime.model.Doctor;
import com.doctime.model.Patient;
import com.doctime.model.enums.AppointmentStatus;
import com.doctime.model.enums.AppointmentType;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.DoctorRepository;
import com.doctime.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public List<Appointment> getByPatient(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateTimeDesc(patientId);
    }

    public List<Appointment> getByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateTimeDesc(doctorId);
    }

    public Appointment getById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    @Transactional
    public Appointment book(AppointmentRequest req) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Appointment appt = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDateTime(req.getAppointmentDateTime())
                .type(AppointmentType.valueOf(req.getType()))
                .status(AppointmentStatus.PENDING)
                .notes(req.getNotes())
                .build();
        return appointmentRepository.save(appt);
    }

    @Transactional
    public Appointment updateStatus(Long id, String status) {
        Appointment appt = getById(id);
        appt.setStatus(AppointmentStatus.valueOf(status));
        return appointmentRepository.save(appt);
    }

    @Transactional
    public void cancel(Long id) {
        Appointment appt = getById(id);
        appt.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appt);
    }
}
