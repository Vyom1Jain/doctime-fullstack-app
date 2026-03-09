package com.doctime.model;

import com.doctime.model.enums.DonationStatus;
import com.doctime.model.enums.DonationType;
import com.doctime.model.enums.Urgency;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Donation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 2000, nullable = false)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationType type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Urgency urgency;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal targetAmount;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal raisedAmount = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status;
    
    @Column(nullable = false)
    private Boolean verified = false;
    
    private LocalDateTime verifiedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_doctor_id")
    private Doctor verifiedBy;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
