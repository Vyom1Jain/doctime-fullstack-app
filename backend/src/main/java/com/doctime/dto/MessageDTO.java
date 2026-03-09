package com.doctime.dto;

import com.doctime.model.enums.MessageType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private Long appointmentId;
    private Long senderId;
    private String senderName;
    private MessageType type;
    private String content;
    private String fileUrl;
    private String fileName;
    private Boolean isRead;
    private LocalDateTime sentAt;
}
