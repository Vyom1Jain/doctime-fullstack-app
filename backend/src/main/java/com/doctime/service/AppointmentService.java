package com.doctime.service;

import com.doctime.dto.AppointmentDTO;
import com.doctime.dto.AppointmentRequest;
import com.doctime.model.Appointment;
import com.doctime.model.Doctor;
import com.doctime.model.Patient;
import com.doctime.model.enums.AppointmentStatus;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.DoctorRepository;
import com.doctime.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    
    @Transactional
    public AppointmentDTO createAppointment(Long patientId, AppointmentRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        String channelName = "doctime_" + UUID.randomUUID().toString().substring(0, 8);
        
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDateTime(request.getAppointmentDateTime())
                .type(request.getType())
                .status(AppointmentStatus.SCHEDULED)
                .symptoms(request.getSymptoms())
                .agoraChannelName(channelName)
                .build();
        
        appointment = appointmentRepository.save(appointment);
        return convertToDTO(appointment);
    }
    
    public List<AppointmentDTO> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateTimeDesc(patientId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<AppointmentDTO> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateTimeDesc(doctorId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Page<AppointmentDTO> getAppointmentsByStatus(Long userId, String role, AppointmentStatus status, Pageable pageable) {
        if ("PATIENT".equals(role)) {
            return appointmentRepository.findByPatientIdAndStatus(userId, status, pageable)
                    .map(this::convertToDTO);
        } else {
            return appointmentRepository.findByDoctorIdAndStatus(userId, status, pageable)
                    .map(this::convertToDTO);
        }
    }
    
    @Transactional
    public AppointmentDTO updateAppointmentStatus(Long appointmentId, AppointmentStatus status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setStatus(status);
        appointment = appointmentRepository.save(appointment);
        return convertToDTO(appointment);
    }
    
    private AppointmentDTO convertToDTO(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setPatientName(appointment.getPatient().getUser().getName());
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setDoctorName(appointment.getDoctor().getUser().getName());
        dto.setDoctorSpecialty(appointment.getDoctor().getSpecialty().name());
        dto.setDoctorImage(appointment.getDoctor().getUser().getProfileImage());
        dto.setAppointmentDateTime(appointment.getAppointmentDateTime());
        dto.setType(appointment.getType());
        dto.setStatus(appointment.getStatus());
        dto.setSymptoms(appointment.getSymptoms());
        dto.setAgoraChannelName(appointment.getAgoraChannelName());
        return dto;
    }
}
