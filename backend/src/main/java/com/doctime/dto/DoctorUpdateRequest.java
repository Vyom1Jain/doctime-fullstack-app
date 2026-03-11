package com.doctime.dto;

import com.doctime.model.enums.Gender;
import com.doctime.model.enums.Specialty;
import lombok.Data;

import java.util.List;

@Data
public class DoctorUpdateRequest {
    private Specialty specialty;
    private Gender gender;
    private Integer experienceYears;
    private String qualification;
    private String registrationNumber;
    private String bio;
    private Double consultationFee;
    private List<String> languages;
    private Boolean availableForConsultation;
    private String availability; // JSON string for schedule
}
