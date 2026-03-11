package com.doctime.service;

import com.doctime.dto.DoctorDTO;
import com.doctime.dto.DoctorUpdateRequest;
import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.Doctor;
import com.doctime.model.enums.Specialty;
import com.doctime.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    @Transactional(readOnly = true)
    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DoctorDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return convertToDTO(doctor);
    }

    @Transactional(readOnly = true)
    public List<DoctorDTO> searchDoctors(Specialty specialty, Double minFee, Double maxFee, String name) {
        List<Doctor> doctors;
        if (specialty != null) {
            doctors = doctorRepository.findBySpecialty(specialty);
        } else {
            doctors = doctorRepository.findAll();
        }

        return doctors.stream()
                .filter(d -> (minFee == null || d.getConsultationFee() >= minFee))
                .filter(d -> (maxFee == null || d.getConsultationFee() <= maxFee))
                .filter(d -> (name == null || name.isBlank() ||
                        d.getUser().getName().toLowerCase().contains(name.toLowerCase())))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DoctorDTO> getDoctorsBySpecialty(Specialty specialty) {
        return doctorRepository.findBySpecialty(specialty)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DoctorDTO updateDoctor(Long id, DoctorUpdateRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (request.getSpecialty() != null)
            doctor.setSpecialty(request.getSpecialty());
        if (request.getGender() != null)
            doctor.setGender(request.getGender());
        if (request.getExperienceYears() != null)
            doctor.setExperienceYears(request.getExperienceYears());
        if (request.getQualification() != null)
            doctor.setQualification(request.getQualification());
        if (request.getRegistrationNumber() != null)
            doctor.setRegistrationNumber(request.getRegistrationNumber());
        if (request.getBio() != null)
            doctor.setBio(request.getBio());
        if (request.getConsultationFee() != null)
            doctor.setConsultationFee(request.getConsultationFee());
        if (request.getLanguages() != null)
            doctor.setLanguages(request.getLanguages());
        if (request.getAvailableForConsultation() != null)
            doctor.setAvailableForConsultation(request.getAvailableForConsultation());
        if (request.getAvailability() != null)
            doctor.setAvailability(request.getAvailability());

        doctorRepository.save(doctor);
        return convertToDTO(doctor);
    }

    private DoctorDTO convertToDTO(Doctor doctor) {
        DoctorDTO dto = new DoctorDTO();
        dto.setId(doctor.getId());
        dto.setName(doctor.getUser().getName());
        dto.setEmail(doctor.getUser().getEmail());
        dto.setPhone(doctor.getUser().getPhone());
        dto.setProfileImage(doctor.getUser().getProfileImage());
        dto.setSpecialty(doctor.getSpecialty());
        dto.setGender(doctor.getGender());
        dto.setExperienceYears(doctor.getExperienceYears());
        dto.setQualification(doctor.getQualification());
        dto.setRegistrationNumber(doctor.getRegistrationNumber());
        dto.setBio(doctor.getBio());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setLanguages(doctor.getLanguages());
        dto.setRating(doctor.getRating());
        dto.setTotalReviews(doctor.getTotalReviews());
        dto.setAvailableForConsultation(doctor.getAvailableForConsultation());
        dto.setAvailability(doctor.getAvailability());
        return dto;
    }
}
