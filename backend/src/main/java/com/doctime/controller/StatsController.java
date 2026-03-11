package com.doctime.controller;

import com.doctime.model.enums.AppointmentStatus;
import com.doctime.model.enums.Specialty;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        long doctorCount = doctorRepository.count();
        int specialtyCount = Specialty.values().length;
        long completedAppointments = appointmentRepository
                .findByStatus(AppointmentStatus.COMPLETED).size();

        return ResponseEntity.ok(Map.of(
                "doctorCount", doctorCount,
                "specialtyCount", specialtyCount,
                "completedAppointments", completedAppointments));
    }
}
