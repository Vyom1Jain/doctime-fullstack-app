package com.doctime.service;

import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.Appointment;
import com.doctime.model.Message;
import com.doctime.model.enums.MessageType;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final AppointmentRepository appointmentRepository;

    public List<Message> getMessages(Long appointmentId) {
        return messageRepository.findByAppointmentIdOrderBySentAtAsc(appointmentId);
    }

    @Transactional
    public Message save(Long appointmentId, Long senderId, String content, MessageType type) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        Message msg = Message.builder()
                .appointment(appt)
                .senderId(senderId)
                .content(content)
                .type(type)
                .sentAt(LocalDateTime.now())
                .build();
        return messageRepository.save(msg);
    }
}
