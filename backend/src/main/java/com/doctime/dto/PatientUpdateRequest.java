package com.doctime.dto;

import com.doctime.model.enums.BloodGroup;
import com.doctime.model.enums.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientUpdateRequest {
    private LocalDate dateOfBirth;
    private Gender gender;
    private BloodGroup bloodGroup;
    private String address;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private String medicalHistory;
    private String allergies;
    private Double height;
    private Double weight;
}
