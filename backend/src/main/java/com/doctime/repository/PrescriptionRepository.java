package com.doctime.repository;

import com.doctime.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);

    Optional<Prescription> findByAppointmentId(Long appointmentId);

    List<Prescription> findByAppointment_Patient_Id(Long patientId);
}
