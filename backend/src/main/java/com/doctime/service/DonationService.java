package com.doctime.service;

import com.doctime.model.Donation;
import com.doctime.model.enums.DonationStatus;
import com.doctime.repository.DonationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;

    public List<Donation> getActiveDonations() {
        return donationRepository.findByStatusOrderByCreatedAtDesc(DonationStatus.ACTIVE);
    }

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }
}
