package com.doctime.model;

import com.doctime.model.enums.BloodGroup;
import com.doctime.model.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {
    
    @Id
    private Long id;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    @Enumerated(EnumType.STRING)
    private BloodGroup bloodGroup;
    
    @Column(length = 500)
    private String address;
    
    private String city;
    private String state;
    private String country;
    private String pincode;
    
    @Column(length = 1000)
    private String medicalHistory;
    
    @Column(length = 500)
    private String allergies;
    
    private Double height; // in cm
    private Double weight; // in kg
    
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();
    
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<MedicalReport> medicalReports = new ArrayList<>();
    
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    private List<Transaction> transactions = new ArrayList<>();
}
