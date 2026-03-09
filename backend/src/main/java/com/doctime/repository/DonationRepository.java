package com.doctime.repository;

import com.doctime.model.Donation;
import com.doctime.model.enums.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByStatusOrderByCreatedAtDesc(DonationStatus status);
}
