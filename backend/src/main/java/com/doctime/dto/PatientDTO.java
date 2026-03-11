package com.doctime.dto;

import com.doctime.model.Patient;
import com.doctime.model.enums.BloodGroup;
import com.doctime.model.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
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

    public static PatientDTO from(Patient patient) {
        return PatientDTO.builder()
                .id(patient.getId())
                .name(patient.getUser() != null ? patient.getUser().getName() : null)
                .email(patient.getUser() != null ? patient.getUser().getEmail() : null)
                .phone(patient.getUser() != null ? patient.getUser().getPhone() : null)
                .dateOfBirth(patient.getDateOfBirth())
                .gender(patient.getGender())
                .bloodGroup(patient.getBloodGroup())
                .address(patient.getAddress())
                .city(patient.getCity())
                .state(patient.getState())
                .country(patient.getCountry())
                .pincode(patient.getPincode())
                .medicalHistory(patient.getMedicalHistory())
                .allergies(patient.getAllergies())
                .height(patient.getHeight())
                .weight(patient.getWeight())
                .build();
    }
}
