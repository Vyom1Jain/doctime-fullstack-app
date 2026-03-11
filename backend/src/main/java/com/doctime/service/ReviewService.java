package com.doctime.service;

import com.doctime.dto.ReviewRequest;
import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.*;
import com.doctime.model.enums.AppointmentStatus;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.DoctorRepository;
import com.doctime.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @Transactional
    public Review createReview(Long patientId, ReviewRequest request) {
        Appointment appointment = appointmentRepository.findByIdWithRelations(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Can only review completed appointments");
        }
        if (!appointment.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("You can only review your own appointments");
        }
        if (reviewRepository.existsByAppointmentId(request.getAppointmentId())) {
            throw new IllegalArgumentException("You have already reviewed this appointment");
        }

        Review review = Review.builder()
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .appointment(appointment)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
        Review saved = reviewRepository.save(review);

        // Update doctor's average rating
        Double avgRating = reviewRepository.getAverageRatingByDoctorId(appointment.getDoctor().getId());
        Integer totalReviews = reviewRepository.countByDoctorId(appointment.getDoctor().getId());
        Doctor doctor = appointment.getDoctor();
        doctor.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        doctor.setTotalReviews(totalReviews != null ? totalReviews : 0);
        doctorRepository.save(doctor);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Review> getByDoctor(Long doctorId) {
        return reviewRepository.findByDoctorId(doctorId);
    }

    @Transactional(readOnly = true)
    public boolean hasReviewed(Long appointmentId) {
        return reviewRepository.existsByAppointmentId(appointmentId);
    }
}
