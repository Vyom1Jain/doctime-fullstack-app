package com.doctime.controller;

import com.doctime.dto.ChatMessageDto;
import com.doctime.model.Message;
import com.doctime.model.enums.MessageType;
import com.doctime.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Real-time chat APIs")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/api/chat/{appointmentId}/messages")
    @Operation(summary = "Get chat history for appointment")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(chatService.getMessages(appointmentId));
    }

    @MessageMapping("/chat.sendMessage/{appointmentId}")
    public void sendMessage(
            @DestinationVariable Long appointmentId,
            @Payload ChatMessageDto dto) {
        Message saved = chatService.save(
                appointmentId,
                dto.getSenderId(),
                dto.getContent(),
                dto.getType() != null ? MessageType.valueOf(dto.getType()) : MessageType.TEXT);
        dto.setSentAt(saved.getSentAt().toString());
        messagingTemplate.convertAndSend("/topic/chat/" + appointmentId, dto);
    }
}
