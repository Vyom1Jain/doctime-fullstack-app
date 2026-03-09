package com.doctime.service;

import com.doctime.exception.ResourceNotFoundException;
import com.doctime.model.Appointment;
import com.doctime.model.Message;
import com.doctime.model.User;
import com.doctime.model.enums.MessageType;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.MessageRepository;
import com.doctime.repository.UserRepository;
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
    private final UserRepository userRepository;

    public List<Message> getMessages(Long appointmentId) {
        return messageRepository.findByAppointmentIdOrderBySentAtAsc(appointmentId);
    }

    @Transactional
    public Message save(Long appointmentId, Long senderId, String content, MessageType type) {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Message msg = Message.builder()
                .appointment(appt)
                .sender(sender)
                .content(content)
                .type(type)
                .sentAt(LocalDateTime.now())
                .build();
        return messageRepository.save(msg);
    }
}
