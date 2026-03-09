package com.doctime.service;

import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.VideoNote;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.VideoNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoNoteRepository videoNoteRepository;
    private final AppointmentRepository appointmentRepository;

    public Optional<VideoNote> getNote(Long appointmentId) {
        return videoNoteRepository.findByAppointmentId(appointmentId);
    }

    @Transactional
    public VideoNote saveNote(Long appointmentId, String content) {
        var appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        VideoNote note = videoNoteRepository.findByAppointmentId(appointmentId)
                .orElse(VideoNote.builder().appointment(appt).build());
        note.setContent(content);
        note.setUpdatedAt(LocalDateTime.now());
        return videoNoteRepository.save(note);
    }
}
