package com.doctime.service;

import com.doctime.dto.DonationRequest;
import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.Donation;
import com.doctime.model.Doctor;
import com.doctime.model.Patient;
import com.doctime.model.enums.DonationStatus;
import com.doctime.repository.DonationRepository;
import com.doctime.repository.DoctorRepository;
import com.doctime.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public List<Donation> getActiveDonations() {
        return donationRepository.findActiveWithDoctors();
    }

    @Transactional(readOnly = true)
    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    @Transactional
    public Donation createDonation(Long patientId, DonationRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Doctor requestedDoctor = null;
        if (request.getRequestedDoctorId() != null) {
            requestedDoctor = doctorRepository.findById(request.getRequestedDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Requested doctor not found"));
        }

        Donation donation = Donation.builder()
                .patient(patient)
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .urgency(request.getUrgency())
                .targetAmount(request.getTargetAmount())
                .bloodType(request.getBloodType())
                .unitsNeeded(request.getUnitsNeeded())
                .medicineList(request.getMedicineList())
                .requestedDoctor(requestedDoctor)
                .status(DonationStatus.PENDING_VERIFICATION)
                .build();

        return donationRepository.save(donation);
    }

    @Transactional(readOnly = true)
    public List<Donation> getPendingForDoctor(Long doctorId) {
        return donationRepository.findPendingForDoctor(doctorId);
    }

    @Transactional
    public Donation verifyDonation(Long donationId, Long doctorId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));
        if (donation.getStatus() != DonationStatus.PENDING_VERIFICATION) {
            throw new IllegalArgumentException("Donation is not pending verification");
        }
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        donation.setVerified(true);
        donation.setVerifiedAt(LocalDateTime.now());
        donation.setVerifiedBy(doctor);
        donation.setStatus(DonationStatus.ACTIVE);
        return donationRepository.save(donation);
    }

    @Transactional
    public Donation contribute(Long donationId, BigDecimal amount) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        BigDecimal newRaised = donation.getRaisedAmount().add(amount);
        donation.setRaisedAmount(newRaised);

        if (donation.getTargetAmount() != null && newRaised.compareTo(donation.getTargetAmount()) >= 0) {
            donation.setStatus(DonationStatus.FULFILLED);
        }

        return donationRepository.save(donation);
    }
}
