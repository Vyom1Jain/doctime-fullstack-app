package com.doctime.model;

import com.doctime.model.enums.Gender;
import com.doctime.model.enums.Specialty;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {
    
    @Id
    private Long id;
    
    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Specialty specialty;
    
    @Enumerated(EnumType.STRING)
    private Gender gender;
    
    @Column(nullable = false)
    private Integer experienceYears;
    
    @Column(nullable = false)
    private String qualification;
    
    private String registrationNumber;
    
    @Column(length = 1000)
    private String bio;
    
    @Column(nullable = false)
    private Double consultationFee;
    
    @ElementCollection
    @CollectionTable(name = "doctor_languages", joinColumns = @JoinColumn(name = "doctor_id"))
    @Column(name = "language")
    private List<String> languages = new ArrayList<>();
    
    @Column(nullable = false)
    private Double rating = 0.0;
    
    private Integer totalReviews = 0;
    
    @Column(nullable = false)
    private Boolean availableForConsultation = true;
    
    // Availability JSON stored as text
    @Column(length = 2000)
    private String availability;
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<Appointment> appointments = new ArrayList<>();
    
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    private List<Prescription> prescriptions = new ArrayList<>();
}
