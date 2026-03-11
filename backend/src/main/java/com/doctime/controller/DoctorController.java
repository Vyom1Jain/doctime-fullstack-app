package com.doctime.controller;

import com.doctime.dto.DoctorDTO;
import com.doctime.dto.DoctorUpdateRequest;
import com.doctime.dto.PatientDTO;
import com.doctime.model.enums.Specialty;
import com.doctime.repository.AppointmentRepository;
import com.doctime.security.SecurityUtils;
import com.doctime.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor management APIs")
public class DoctorController {

    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get all available doctors")
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID")
    public ResponseEntity<DoctorDTO> getDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/specialty/{specialty}")
    @Operation(summary = "Get doctors by specialty")
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialty(@PathVariable Specialty specialty) {
        return ResponseEntity.ok(doctorService.getDoctorsBySpecialty(specialty));
    }

    @GetMapping("/search")
    @Operation(summary = "Search doctors with filters")
    public ResponseEntity<List<DoctorDTO>> searchDoctors(
            @RequestParam(required = false) Specialty specialty,
            @RequestParam(required = false) Double minFee,
            @RequestParam(required = false) Double maxFee,
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(doctorService.searchDoctors(specialty, minFee, maxFee, name));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update doctor profile")
    public ResponseEntity<DoctorDTO> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorUpdateRequest request) {
        if (!securityUtils.isCurrentUser(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return ResponseEntity.ok(doctorService.updateDoctor(id, request));
    }

    @GetMapping("/{doctorId}/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get patients for a doctor")
    public ResponseEntity<List<PatientDTO>> getDoctorPatients(@PathVariable Long doctorId) {
        if (!securityUtils.isCurrentUser(doctorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        List<PatientDTO> patients = appointmentRepository.findDistinctPatientsByDoctorId(doctorId)
                .stream().map(PatientDTO::from).toList();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/specialties")
    @Operation(summary = "Get all available specialties")
    public ResponseEntity<Specialty[]> getSpecialties() {
        return ResponseEntity.ok(Specialty.values());
    }
}
