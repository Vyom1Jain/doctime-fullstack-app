package com.doctime.dto;

import com.doctime.model.Review;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private Long appointmentId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    public static ReviewDTO from(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(review.getCreatedAt());
        dto.setAppointmentId(review.getAppointment().getId());
        if (review.getPatient() != null) {
            dto.setPatientId(review.getPatient().getId());
            if (review.getPatient().getUser() != null) {
                dto.setPatientName(review.getPatient().getUser().getName());
            }
        }
        if (review.getDoctor() != null) {
            dto.setDoctorId(review.getDoctor().getId());
        }
        return dto;
    }
}
