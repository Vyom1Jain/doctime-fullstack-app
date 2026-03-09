package com.doctime.controller;

import com.doctime.dto.MessageDTO;
import com.doctime.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {
    
    private final SimpMessageSendingOperations messagingTemplate;
    
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload MessageDTO message) {
        message.setSentAt(LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/appointment." + message.getAppointmentId(), message);
    }
    
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload MessageDTO message) {
        messagingTemplate.convertAndSend("/topic/appointment." + message.getAppointmentId() + ".typing", message);
    }
}

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
class MessageController {
    
    @GetMapping("/appointment/{appointmentId}")
    public List<MessageDTO> getAppointmentMessages(@PathVariable Long appointmentId) {
        // This would fetch from MessageRepository in real implementation
        return new ArrayList<>();
    }
}
