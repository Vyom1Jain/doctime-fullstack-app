package com.doctime.dto;

import com.doctime.model.enums.DonationType;
import com.doctime.model.enums.Urgency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DonationRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Donation type is required")
    private DonationType type;

    @NotNull(message = "Urgency level is required")
    private Urgency urgency;

    private BigDecimal targetAmount;

    private Long requestedDoctorId;

    // Type-specific fields
    private String bloodType;
    private Integer unitsNeeded;
    private String medicineList;
}
