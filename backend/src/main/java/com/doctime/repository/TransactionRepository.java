package com.doctime.repository;

import com.doctime.model.Transaction;
import com.doctime.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionId(String transactionId);
    List<Transaction> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Transaction> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    
    Page<Transaction> findByPatientId(Long patientId, Pageable pageable);
    Page<Transaction> findByDoctorId(Long doctorId, Pageable pageable);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.doctor.id = :doctorId " +
           "AND t.status = 'COMPLETED' " +
           "AND t.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateDoctorEarnings(
        @Param("doctorId") Long doctorId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    List<Transaction> findByDoctorIdAndStatus(Long doctorId, PaymentStatus status);
}
