package com.doctime.controller;

import com.doctime.dto.ApiResponse;
import com.doctime.dto.DoctorDTO;
import com.doctime.model.enums.Specialty;
import com.doctime.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {
    
    private final DoctorService doctorService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getAllDoctors() {
        List<DoctorDTO> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO>> getDoctorById(@PathVariable Long id) {
        DoctorDTO doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(doctor));
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<DoctorDTO>>> searchDoctors(
            @RequestParam(required = false) Specialty specialty,
            @RequestParam(required = false) Double minFee,
            @RequestParam(required = false) Double maxFee,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<DoctorDTO> doctors = doctorService.searchDoctors(specialty, minFee, maxFee, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }
    
    @GetMapping("/specialty/{specialty}")
    public ResponseEntity<ApiResponse<List<DoctorDTO>>> getDoctorsBySpecialty(@PathVariable Specialty specialty) {
        List<DoctorDTO> doctors = doctorService.getDoctorsBySpecialty(specialty);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }
}
