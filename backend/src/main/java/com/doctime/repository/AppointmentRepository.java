package com.doctime.repository;

import com.doctime.model.Appointment;
import com.doctime.model.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByAppointmentDateTimeDesc(Long patientId);
    List<Appointment> findByDoctorIdOrderByAppointmentDateTimeDesc(Long doctorId);
    
    Page<Appointment> findByPatientIdAndStatus(Long patientId, AppointmentStatus status, Pageable pageable);
    Page<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status, Pageable pageable);
    
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.appointmentDateTime BETWEEN :startDate AND :endDate " +
           "AND a.status IN :statuses")
    List<Appointment> findDoctorAppointmentsBetween(
        @Param("doctorId") Long doctorId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        @Param("statuses") List<AppointmentStatus> statuses
    );
    
    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId " +
           "AND a.status = 'COMPLETED'")
    Long countCompletedAppointmentsByDoctor(@Param("doctorId") Long doctorId);
}
