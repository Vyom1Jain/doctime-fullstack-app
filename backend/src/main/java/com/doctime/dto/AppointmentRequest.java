package com.doctime.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    private Long patientId;
    private Long doctorId;
    private LocalDateTime appointmentDateTime;
    private String type; // ONLINE / IN_PERSON
    private String notes;
}
