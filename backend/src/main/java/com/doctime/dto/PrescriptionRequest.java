package com.doctime.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PrescriptionRequest {
    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;
    
    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;
    
    @Valid
    private List<MedicineDTO> medicines;
    
    private String generalAdvice;
    private String nextVisit;
}
