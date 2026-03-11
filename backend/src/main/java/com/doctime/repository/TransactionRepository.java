package com.doctime.repository;

import com.doctime.model.Transaction;
import com.doctime.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT t FROM Transaction t JOIN FETCH t.patient p JOIN FETCH p.user LEFT JOIN FETCH t.doctor d LEFT JOIN FETCH d.user WHERE t.patient.id = :patientId ORDER BY t.createdAt DESC")
    List<Transaction> findByPatientIdOrderByCreatedAtDesc(@Param("patientId") Long patientId);

    @Query("SELECT t FROM Transaction t JOIN FETCH t.patient p JOIN FETCH p.user LEFT JOIN FETCH t.doctor d LEFT JOIN FETCH d.user WHERE t.doctor.id = :doctorId ORDER BY t.createdAt DESC")
    List<Transaction> findByDoctorIdOrderByCreatedAtDesc(@Param("doctorId") Long doctorId);

    @Query("SELECT t FROM Transaction t JOIN FETCH t.patient p JOIN FETCH p.user LEFT JOIN FETCH t.doctor d LEFT JOIN FETCH d.user WHERE t.doctor.id = :doctorId AND t.createdAt BETWEEN :from AND :to ORDER BY t.createdAt DESC")
    List<Transaction> findByDoctorIdAndCreatedAtBetween(@Param("doctorId") Long doctorId,
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT t FROM Transaction t WHERE t.patient.id = :patientId AND t.doctor.id = :doctorId AND t.status = :status ORDER BY t.createdAt DESC")
    List<Transaction> findByPatientIdAndDoctorIdAndStatus(@Param("patientId") Long patientId,
            @Param("doctorId") Long doctorId, @Param("status") PaymentStatus status);
}
