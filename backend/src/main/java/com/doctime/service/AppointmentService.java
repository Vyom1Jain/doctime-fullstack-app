package com.doctime.service;

import com.doctime.dto.AppointmentRequest;
import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.Appointment;
import com.doctime.model.Doctor;
import com.doctime.model.Patient;
import com.doctime.model.Transaction;
import com.doctime.model.enums.AppointmentStatus;
import com.doctime.model.enums.AppointmentType;
import com.doctime.model.enums.PaymentMethod;
import com.doctime.model.enums.PaymentStatus;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.DoctorRepository;
import com.doctime.repository.PatientRepository;
import com.doctime.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public List<Appointment> getByPatient(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateTimeDesc(patientId);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateTimeDesc(doctorId);
    }

    @Transactional(readOnly = true)
    public Appointment getById(Long id) {
        return appointmentRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    @Transactional
    public Appointment book(AppointmentRequest req) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        int duration = req.getDurationMinutes() != null ? req.getDurationMinutes() : 30;
        LocalDateTime start = req.getAppointmentDateTime();
        LocalDateTime end = start.plusMinutes(duration);

        // Check for overlapping appointments
        List<Appointment> overlapping = appointmentRepository.findOverlapping(
                req.getDoctorId(), start, end);
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException(
                    "This time slot conflicts with an existing appointment. Please choose a different time.");
        }

        // Validate against doctor availability schedule
        validateDoctorAvailability(doctor, start, end);

        Appointment appt = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDateTime(req.getAppointmentDateTime())
                .durationMinutes(duration)
                .type(AppointmentType.valueOf(req.getType()))
                .status(AppointmentStatus.PENDING)
                .notes(req.getNotes())
                .build();
        Appointment saved = appointmentRepository.save(appt);

        // Create a billing transaction for this appointment
        Transaction transaction = Transaction.builder()
                .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .patient(patient)
                .doctor(doctor)
                .amount(BigDecimal.valueOf(doctor.getConsultationFee()))
                .paymentMethod(PaymentMethod.UPI)
                .status(PaymentStatus.PENDING)
                .description("Consultation with Dr. " + doctor.getUser().getName()
                        + " on " + req.getAppointmentDateTime().toLocalDate())
                .build();
        transactionRepository.save(transaction);

        return saved;
    }

    @Transactional
    public Appointment updateStatus(Long id, String status) {
        Appointment appt = getById(id);
        AppointmentStatus newStatus = AppointmentStatus.valueOf(status);
        appt.setStatus(newStatus);
        Appointment saved = appointmentRepository.save(appt);

        // When appointment is completed, mark the associated transaction as COMPLETED
        if (newStatus == AppointmentStatus.COMPLETED) {
            List<Transaction> pendingTxns = transactionRepository
                    .findByPatientIdAndDoctorIdAndStatus(
                            appt.getPatient().getId(),
                            appt.getDoctor().getId(),
                            PaymentStatus.PENDING);
            for (Transaction txn : pendingTxns) {
                txn.setStatus(PaymentStatus.COMPLETED);
                transactionRepository.save(txn);
            }
        }

        return saved;
    }

    @Transactional
    public void cancel(Long id) {
        Appointment appt = getById(id);
        appt.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appt);
    }

    @Transactional
    public Appointment reschedule(Long id, LocalDateTime newDateTime, Integer durationMinutes) {
        Appointment appt = getById(id);
        if (appt.getStatus() != AppointmentStatus.PENDING && appt.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalArgumentException("Only PENDING or CONFIRMED appointments can be rescheduled");
        }
        int duration = durationMinutes != null ? durationMinutes : appt.getDurationMinutes();
        LocalDateTime end = newDateTime.plusMinutes(duration);

        List<Appointment> overlapping = appointmentRepository.findOverlapping(
                appt.getDoctor().getId(), newDateTime, end);
        overlapping.removeIf(a -> a.getId().equals(id));
        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException(
                    "This time slot conflicts with an existing appointment. Please choose a different time.");
        }

        appt.setAppointmentDateTime(newDateTime);
        appt.setDurationMinutes(duration);
        return appointmentRepository.save(appt);
    }

    private void validateDoctorAvailability(Doctor doctor, LocalDateTime start, LocalDateTime end) {
        if (doctor.getAvailability() == null || doctor.getAvailability().isBlank()) {
            return; // No schedule set, allow any time
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(doctor.getAvailability());
            String dayName = start.getDayOfWeek().getDisplayName(java.time.format.TextStyle.FULL,
                    java.util.Locale.ENGLISH);
            com.fasterxml.jackson.databind.JsonNode dayNode = root.get(dayName);
            if (dayNode == null || !dayNode.has("enabled") || !dayNode.get("enabled").asBoolean()) {
                throw new IllegalArgumentException(
                        "Doctor is not available on " + dayName + ". Please choose a different day.");
            }
            java.time.LocalTime slotStart = java.time.LocalTime.parse(dayNode.get("start").asText());
            java.time.LocalTime slotEnd = java.time.LocalTime.parse(dayNode.get("end").asText());
            java.time.LocalTime apptStart = start.toLocalTime();
            java.time.LocalTime apptEnd = end.toLocalTime();
            if (apptStart.isBefore(slotStart) || apptEnd.isAfter(slotEnd)) {
                throw new IllegalArgumentException(
                        "Appointment time is outside doctor's available hours (" + slotStart + " - " + slotEnd
                                + "). Please choose a time within available hours.");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            // If availability JSON is malformed, allow the booking
        }
    }
}
