package com.doctime.dto;

import lombok.Data;

@Data
public class VideoTokenRequest {
    private String channelName;
    private Long appointmentId;
    private Integer uid;
}
