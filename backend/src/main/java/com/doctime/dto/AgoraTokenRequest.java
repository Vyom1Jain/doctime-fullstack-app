package com.doctime.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AgoraTokenRequest {
    
    @NotBlank(message = "Channel name is required")
    private String channelName;
    
    private Long appointmentId;
    
    private Integer uid = 0;
}
