package com.doctime.dto;

import com.doctime.model.Appointment;
import com.doctime.model.enums.AppointmentStatus;
import com.doctime.model.enums.AppointmentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private String doctorImage;
    private LocalDateTime appointmentDateTime;
    private Integer durationMinutes;
    private AppointmentType type;
    private AppointmentStatus status;
    private String symptoms;
    private String notes;
    private String agoraChannelName;
    private LocalDateTime createdAt;
    private String patientMedicalHistory;
    private String patientAllergies;

    public static AppointmentDTO from(Appointment appt) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appt.getId());
        dto.setAppointmentDateTime(appt.getAppointmentDateTime());
        dto.setDurationMinutes(appt.getDurationMinutes());
        dto.setType(appt.getType());
        dto.setStatus(appt.getStatus());
        dto.setSymptoms(appt.getSymptoms());
        dto.setNotes(appt.getNotes());
        dto.setAgoraChannelName(appt.getAgoraChannelName());
        dto.setCreatedAt(appt.getCreatedAt());

        if (appt.getPatient() != null) {
            dto.setPatientId(appt.getPatient().getId());
            if (appt.getPatient().getUser() != null) {
                dto.setPatientName(appt.getPatient().getUser().getName());
            }
            dto.setPatientMedicalHistory(appt.getPatient().getMedicalHistory());
            dto.setPatientAllergies(appt.getPatient().getAllergies());
        }
        if (appt.getDoctor() != null) {
            dto.setDoctorId(appt.getDoctor().getId());
            if (appt.getDoctor().getUser() != null) {
                dto.setDoctorName(appt.getDoctor().getUser().getName());
                dto.setDoctorImage(appt.getDoctor().getUser().getProfileImage());
            }
            dto.setDoctorSpecialty(appt.getDoctor().getSpecialty() != null
                    ? appt.getDoctor().getSpecialty().name()
                    : null);
        }
        return dto;
    }
}
