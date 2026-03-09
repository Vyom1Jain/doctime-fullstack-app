package com.doctime.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private Long appointmentId;
    private Long senderId;
    private String senderName;
    private String type; // TEXT / IMAGE / FILE
    private String content;
    private String sentAt;
}
