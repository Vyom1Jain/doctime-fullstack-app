package com.doctime.repository;

import com.doctime.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Optional<Prescription> findByAppointmentId(Long appointmentId);
    List<Prescription> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    
    @Query("SELECT p FROM Prescription p WHERE p.appointment.patient.id = :patientId " +
           "ORDER BY p.createdAt DESC")
    List<Prescription> findByPatientId(@Param("patientId") Long patientId);
}
