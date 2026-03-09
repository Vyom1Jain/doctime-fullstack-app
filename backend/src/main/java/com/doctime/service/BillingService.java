package com.doctime.service;

import com.doctime.model.Transaction;
import com.doctime.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final TransactionRepository transactionRepository;

    public List<Transaction> getPatientTransactions(Long patientId) {
        return transactionRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    public List<Transaction> getDoctorTransactions(Long doctorId) {
        return transactionRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
    }
}
