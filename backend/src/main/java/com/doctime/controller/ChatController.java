package com.doctime.controller;

import com.doctime.dto.MessageDto;
import com.doctime.model.Message;
import com.doctime.repository.AppointmentRepository;
import com.doctime.repository.MessageRepository;
import com.doctime.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Chat and messaging APIs")
public class ChatController {
    
    private final MessageRepository messageRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    
    @MessageMapping("/chat.sendMessage/{appointmentId}")
    @SendTo("/topic/chat/{appointmentId}")
    public MessageDto sendMessage(@DestinationVariable Long appointmentId, MessageDto messageDto) {
        Message message = Message.builder()
                .appointment(appointmentRepository.findById(appointmentId).orElseThrow())
                .sender(userRepository.findById(messageDto.getSenderId()).orElseThrow())
                .type(messageDto.getType())
                .content(messageDto.getContent())
                .fileUrl(messageDto.getFileUrl())
                .fileName(messageDto.getFileName())
                .isRead(false)
                .build();
        
        message = messageRepository.save(message);
        return convertToDto(message);
    }
    
    @GetMapping("/api/chat/{appointmentId}/messages")
    @ResponseBody
    @Operation(summary = "Get chat messages for appointment")
    public List<MessageDto> getMessages(@PathVariable Long appointmentId) {
        return messageRepository.findByAppointmentIdOrderBySentAtAsc(appointmentId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private MessageDto convertToDto(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .appointmentId(message.getAppointment().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .senderImage(message.getSender().getProfileImage())
                .type(message.getType())
                .content(message.getContent())
                .fileUrl(message.getFileUrl())
                .fileName(message.getFileName())
                .isRead(message.getIsRead())
                .sentAt(message.getSentAt())
                .build();
    }
}
