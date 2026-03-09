package com.doctime.service;

import com.doctime.dto.DoctorDTO;
import com.doctime.model.Doctor;
import com.doctime.model.enums.Specialty;
import com.doctime.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findByAvailableForConsultation(true)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DoctorDTO getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        return convertToDTO(doctor);
    }

    public List<DoctorDTO> searchDoctors(Specialty specialty, Double minFee, Double maxFee) {
        List<Doctor> doctors = specialty != null
                ? doctorRepository.findBySpecialty(specialty)
                : doctorRepository.findByAvailableForConsultation(true);

        return doctors.stream()
                .filter(d -> (minFee == null || d.getConsultationFee() >= minFee) &&
                        (maxFee == null || d.getConsultationFee() <= maxFee))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DoctorDTO> getDoctorsBySpecialty(Specialty specialty) {
        return doctorRepository.findBySpecialty(specialty)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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
        dto.setBio(doctor.getBio());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setLanguages(doctor.getLanguages());
        dto.setRating(doctor.getRating());
        dto.setTotalReviews(doctor.getTotalReviews());
        dto.setAvailableForConsultation(doctor.getAvailableForConsultation());
        return dto;
    }
}
