package com.doctime.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class PrescriptionRequest {
    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String generalAdvice;
    private String nextVisit;

    @NotEmpty(message = "At least one medicine is required")
    @Valid
    private List<MedicineRequest> medicines;
}
