package com.doctime.dto;

import com.doctime.model.enums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private Long appointmentId;
    private Long senderId;
    private String senderName;
    private String senderImage;
    private MessageType type;
    private String content;
    private String fileUrl;
    private String fileName;
    private Boolean isRead;
    private LocalDateTime sentAt;
}
