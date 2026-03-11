package com.doctime.controller;

import com.doctime.dto.PatientUpdateRequest;
import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.Patient;
import com.doctime.repository.PatientRepository;
import com.doctime.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Patient management APIs")
public class PatientController {

    private final PatientRepository patientRepository;
    private final SecurityUtils securityUtils;

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get patient by ID")
    public ResponseEntity<Patient> getPatient(@PathVariable Long id) {
        if (!securityUtils.isCurrentUser(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Update patient profile")
    public ResponseEntity<Patient> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientUpdateRequest request) {
        if (!securityUtils.isCurrentUser(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (request.getDateOfBirth() != null)
            patient.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null)
            patient.setGender(request.getGender());
        if (request.getBloodGroup() != null)
            patient.setBloodGroup(request.getBloodGroup());
        if (request.getAddress() != null)
            patient.setAddress(request.getAddress());
        if (request.getCity() != null)
            patient.setCity(request.getCity());
        if (request.getState() != null)
            patient.setState(request.getState());
        if (request.getCountry() != null)
            patient.setCountry(request.getCountry());
        if (request.getPincode() != null)
            patient.setPincode(request.getPincode());
        if (request.getMedicalHistory() != null)
            patient.setMedicalHistory(request.getMedicalHistory());
        if (request.getAllergies() != null)
            patient.setAllergies(request.getAllergies());
        if (request.getHeight() != null)
            patient.setHeight(request.getHeight());
        if (request.getWeight() != null)
            patient.setWeight(request.getWeight());

        patientRepository.save(patient);
        return ResponseEntity.ok(patient);
    }
}
