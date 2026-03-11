package com.doctime.model;

import com.doctime.model.enums.Gender;
import com.doctime.model.enums.Specialty;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"user", "appointments", "prescriptions"})
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

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "doctor_languages", joinColumns = @JoinColumn(name = "doctor_id"))
    @Column(name = "language")
    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Double rating = 0.0;

    @Builder.Default
    private Integer totalReviews = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean availableForConsultation = true;

    @Column(length = 2000)
    private String availability;

    @JsonIgnore
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Appointment> appointments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Prescription> prescriptions = new ArrayList<>();
}
