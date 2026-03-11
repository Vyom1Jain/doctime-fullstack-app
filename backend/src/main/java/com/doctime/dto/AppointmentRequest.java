package com.doctime.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Appointment date/time is required")
    @Future(message = "Appointment must be in the future")
    private LocalDateTime appointmentDateTime;

    @NotBlank(message = "Appointment type is required")
    @Pattern(regexp = "^(ONLINE|IN_PERSON)$", message = "Type must be ONLINE or IN_PERSON")
    private String type;

    private Integer durationMinutes;

    private String notes;
}
