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
    @Query("SELECT DISTINCT p FROM Prescription p JOIN FETCH p.doctor d JOIN FETCH d.user LEFT JOIN FETCH p.medicines WHERE p.doctor.id = :doctorId ORDER BY p.createdAt DESC")
    List<Prescription> findByDoctorIdOrderByCreatedAtDesc(@Param("doctorId") Long doctorId);

    Optional<Prescription> findByAppointmentId(Long appointmentId);

    @Query("SELECT DISTINCT p FROM Prescription p JOIN FETCH p.doctor d JOIN FETCH d.user LEFT JOIN FETCH p.medicines WHERE p.appointment.patient.id = :patientId")
    List<Prescription> findByAppointment_Patient_Id(@Param("patientId") Long patientId);
}
