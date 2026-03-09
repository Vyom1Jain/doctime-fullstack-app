package com.doctime.controller;

import com.doctime.dto.ApiResponse;
import com.doctime.dto.AppointmentDTO;
import com.doctime.dto.AppointmentRequest;
import com.doctime.model.User;
import com.doctime.model.enums.AppointmentStatus;
import com.doctime.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    
    private final AppointmentService appointmentService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDTO>> createAppointment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AppointmentRequest request) {
        AppointmentDTO appointment = appointmentService.createAppointment(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Appointment booked successfully", appointment));
    }
    
    @GetMapping("/patient")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getPatientAppointments(
            @AuthenticationPrincipal User user) {
        List<AppointmentDTO> appointments = appointmentService.getPatientAppointments(user.getId());
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }
    
    @GetMapping("/doctor")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getDoctorAppointments(
            @AuthenticationPrincipal User user) {
        List<AppointmentDTO> appointments = appointmentService.getDoctorAppointments(user.getId());
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<Page<AppointmentDTO>>> getAppointmentsByStatus(
            @AuthenticationPrincipal User user,
            @PathVariable AppointmentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<AppointmentDTO> appointments = appointmentService.getAppointmentsByStatus(
                user.getId(), user.getRole().name(), status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        AppointmentDTO appointment = appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated", appointment));
    }
}
