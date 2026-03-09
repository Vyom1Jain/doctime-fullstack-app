package com.doctime.repository;

import com.doctime.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Transaction> findByDoctorIdOrderByCreatedAtDesc(Long doctorId);
}
