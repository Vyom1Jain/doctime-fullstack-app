package com.doctime.repository;

import com.doctime.model.Donation;
import com.doctime.model.enums.DonationStatus;
import com.doctime.model.enums.Urgency;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByStatusOrderByCreatedAtDesc(DonationStatus status);
    Page<Donation> findByStatus(DonationStatus status, Pageable pageable);
    List<Donation> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    Page<Donation> findByVerifiedTrue(Pageable pageable);
    List<Donation> findByUrgencyAndStatusOrderByCreatedAtDesc(Urgency urgency, DonationStatus status);
}
