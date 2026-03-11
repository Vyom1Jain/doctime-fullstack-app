package com.doctime.service;

import com.doctime.model.Transaction;
import com.doctime.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<Transaction> getPatientTransactions(Long patientId) {
        return transactionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getDoctorTransactions(Long doctorId) {
        return transactionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getDoctorTransactionsByDateRange(Long doctorId, LocalDateTime from, LocalDateTime to) {
        return transactionRepository.findByDoctorIdAndCreatedAtBetween(doctorId, from, to);
    }
}
