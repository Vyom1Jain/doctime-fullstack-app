package com.doctime.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VideoTokenResponse {
    private String token;
    private String channelName;
    private Integer uid;
    private String appId;
}
