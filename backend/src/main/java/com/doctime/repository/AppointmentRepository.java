package com.doctime.repository;

import com.doctime.model.Appointment;
import com.doctime.model.Patient;
import com.doctime.model.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

        @Query("SELECT a FROM Appointment a JOIN FETCH a.patient p JOIN FETCH p.user JOIN FETCH a.doctor d JOIN FETCH d.user WHERE a.patient.id = :patientId ORDER BY a.appointmentDateTime DESC")
        List<Appointment> findByPatientIdOrderByAppointmentDateTimeDesc(@Param("patientId") Long patientId);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.patient p JOIN FETCH p.user JOIN FETCH a.doctor d JOIN FETCH d.user WHERE a.doctor.id = :doctorId ORDER BY a.appointmentDateTime DESC")
        List<Appointment> findByDoctorIdOrderByAppointmentDateTimeDesc(@Param("doctorId") Long doctorId);

        @Query("SELECT a FROM Appointment a JOIN FETCH a.patient p JOIN FETCH p.user JOIN FETCH a.doctor d JOIN FETCH d.user WHERE a.id = :id")
        java.util.Optional<Appointment> findByIdWithRelations(@Param("id") Long id);

        List<Appointment> findByStatus(AppointmentStatus status);

        @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.status = :status")
        List<Appointment> findByPatientIdAndStatus(@Param("patientId") Long patientId,
                        @Param("status") AppointmentStatus status);

        @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = :status")
        List<Appointment> findByDoctorIdAndStatus(@Param("doctorId") Long doctorId,
                        @Param("status") AppointmentStatus status);

        @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDateTime BETWEEN :start AND :end")
        List<Appointment> findByDoctorIdAndDateRange(@Param("doctorId") Long doctorId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT DISTINCT a.patient FROM Appointment a JOIN FETCH a.patient.user WHERE a.doctor.id = :doctorId")
        List<Patient> findDistinctPatientsByDoctorId(@Param("doctorId") Long doctorId);

        @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
                        "AND a.status NOT IN (com.doctime.model.enums.AppointmentStatus.CANCELLED) " +
                        "AND a.appointmentDateTime < :proposedEnd " +
                        "AND FUNCTION('TIMESTAMPADD', MINUTE, a.durationMinutes, a.appointmentDateTime) > :proposedStart")
        List<Appointment> findOverlapping(@Param("doctorId") Long doctorId,
                        @Param("proposedStart") LocalDateTime proposedStart,
                        @Param("proposedEnd") LocalDateTime proposedEnd);

        @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.patient.id = :patientId " +
                        "AND a.status IN (com.doctime.model.enums.AppointmentStatus.COMPLETED)")
        List<Appointment> findCompletedByDoctorAndPatient(@Param("doctorId") Long doctorId,
                        @Param("patientId") Long patientId);
}
