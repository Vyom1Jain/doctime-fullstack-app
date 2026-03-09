package com.doctime.dto;

import com.doctime.model.enums.Gender;
import com.doctime.model.enums.Specialty;
import lombok.Data;

import java.util.List;

@Data
public class DoctorDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String profileImage;
    private Specialty specialty;
    private Gender gender;
    private Integer experienceYears;
    private String qualification;
    private String bio;
    private Double consultationFee;
    private List<String> languages;
    private Double rating;
    private Integer totalReviews;
    private Boolean availableForConsultation;
}
