package com.doctime.model;

import com.doctime.model.enums.ReportType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "medical_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class MedicalReport {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @Column(nullable = false)
    private String title;
    
    @Enumerated(EnumType.STRING)
    private ReportType type;
    
    @Column(nullable = false)
    private String fileUrl;
    
    private String fileName;
    private String fileType;
    private Long fileSize;
    
    @Column(length = 5000)
    private String description;
    
    private LocalDateTime reportDate;
    
    @Column(length = 5000)
    private String translatedText;
    
    private String translatedLanguage;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime uploadedAt;
}
