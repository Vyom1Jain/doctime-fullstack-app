package com.doctime.controller;

import com.doctime.model.Doctor;
import com.doctime.model.Patient;
import com.doctime.model.enums.Specialty;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.DoctorRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctors", description = "Doctor management APIs")
public class DoctorController {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    @GetMapping
    @Operation(summary = "Get all doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID")
    public ResponseEntity<Doctor> getDoctor(@PathVariable Long id) {
        return doctorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/specialty/{specialty}")
    @Operation(summary = "Get doctors by specialty")
    public ResponseEntity<List<Doctor>> getDoctorsBySpecialty(@PathVariable Specialty specialty) {
        return ResponseEntity.ok(doctorRepository.findAvailableDoctorsBySpecialty(specialty));
    }

    @GetMapping("/search")
    @Operation(summary = "Search doctors by fee")
    public ResponseEntity<List<Doctor>> searchDoctorsByFee(@RequestParam Double maxFee) {
        return ResponseEntity.ok(doctorRepository.findByMaxFee(maxFee));
    }

    @GetMapping("/{doctorId}/patients")
    @Operation(summary = "Get patients for a doctor")
    public ResponseEntity<List<Patient>> getDoctorPatients(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentRepository.findDistinctPatientsByDoctorId(doctorId));
    }
}
