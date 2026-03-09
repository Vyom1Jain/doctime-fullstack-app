package com.doctime.repository;

import com.doctime.model.Transaction;
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
    
    List<Transaction> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Transaction> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
    Optional<Transaction> findByTransactionId(String transactionId);
    
    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.doctor.id = :doctorId AND t.createdAt BETWEEN :start AND :end")
    BigDecimal calculateEarnings(@Param("doctorId") Long doctorId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
