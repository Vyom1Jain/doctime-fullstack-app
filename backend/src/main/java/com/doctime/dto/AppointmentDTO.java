package com.doctime.dto;

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
    private AppointmentType type;
    private AppointmentStatus status;
    private String symptoms;
    private String agoraChannelName;
}
